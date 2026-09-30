bare=/srv/git/vitrine.git
log=/srv/vitrine/deploys.log
no_ar() { curl -s --max-time 3 http://127.0.0.1:8600/versao; }
esperar_versao() {  # a versão no ar vira $1 em até 8 s?
  local i
  for i in $(seq 1 8); do
    [ "$(no_ar)" = "$1" ] && return 0
    sleep 1
  done
  return 1
}
gb() { como_aluno git -C "$bare" "$@"; }

tem_a_12() {
  local c
  for c in $(gb rev-list main 2>/dev/null); do
    [ "$(gb show "$c:VERSION" 2>/dev/null)" = 1.2 ] && return 0
  done
  return 1
}
testes_do_main() {
  local t rc
  t=$(mktemp -d); chown aluno: "$t"
  como_aluno sh -c "git -C $bare archive main | tar -x -C $t && cd $t && python3 -m unittest -q" >/dev/null 2>&1
  rc=$?; rm -rf "$t"; return $rc
}

main=$(gb rev-parse main 2>/dev/null)
versao_main=$(gb show main:VERSION 2>/dev/null)
checar "o post-receive é executável" "o Git ignora hook sem permissão de execução (e avisa no push)" test -x "$bare/hooks/post-receive"
checar "a 1.2 chegou ao main do servidor" "git push a partir do ~/vitrine" tem_a_12
checar "os testes passam no main do servidor" "python3 -m unittest no ~/vitrine; conserte o código, não o teste" testes_do_main
checar "o que está no ar é o main ($versao_main)" "o push publica? curl localhost:8600/versao; readlink /srv/vitrine/atual" \
  esperar_versao "$versao_main"
checar "no ar, o cupom PINGUIM10 dá 10% de desconto" "curl 'localhost:8600/cupom?valor=100&codigo=PINGUIM10' deve dar 90" \
  sh -c "curl -s --max-time 3 'http://127.0.0.1:8600/cupom?valor=100&codigo=PINGUIM10' | grep -q '\"valor\": 90'"

# A esteira, testada numa cópia do repositório (os hooks vão junto).
copia=$(mktemp -d /tmp/verificacao-XXXX); chown aluno: "$copia"
como_aluno cp -a "$bare" "$copia/vitrine.git"
como_aluno git clone -q "$copia/vitrine.git" "$copia/trabalho" >/dev/null 2>&1
gt() { como_aluno git -C "$copia/trabalho" -c user.name="Verificação do gym" -c user.email=gym@devops.local "$@"; }
gc() { como_aluno git -C "$copia/vitrine.git" "$@"; }
marca="verificacao-$(date +%s)"

# A. Um commit bom é publicado e registrado.
como_aluno sh -c "echo $marca > $copia/trabalho/VERSION"
gt commit -qam "verificação do gym: versão $marca"
sha_a=$(gt rev-parse HEAD | cut -c1-7)
gt push -q origin main >/dev/null 2>&1; rc=$?
checar "push de um commit bom é aceito" "leia a saída do git push" test "$rc" -eq 0
checar "o push publicou a versão nova ($marca)" "a esteira roda no push? Publicar de novo precisa trocar o link (ln -sfn / file com force)" \
  esperar_versao "$marca"
checar "deploys.log registra o deploy ($sha_a ... ok)" "uma linha por deploy: data, \${novo:0:7} e ok ou rollback" \
  sh -c "grep '$sha_a' $log 2>/dev/null | grep -qw ok"

# B. Teste falhando: push recusado, nada muda.
como_aluno sh -c "printf 'import unittest\n\n\nclass Quebrado(unittest.TestCase):\n    def test_quebrado(self):\n        self.assertEqual(1, 2)\n' > $copia/trabalho/test_verificacao.py"
gt add test_verificacao.py
gt commit -qm "verificação do gym: teste quebrado"
antes=$(gc rev-parse main)
gt push -q origin main >/dev/null 2>&1; rc=$?
checar "push com teste falhando é recusado" "um hook pre-receive roda os testes do commit novo e sai com 1 se falharem" test "$rc" -ne 0
checar "o main do servidor não mudou" "é o pre-receive que decide se o push entra" test "$(gc rev-parse main)" = "$antes"
checar "nada foi publicado" "o deploy só roda depois do portão" esperar_versao "$marca"
gt reset -q --hard HEAD~1

# C. Versão que não sobe: a esteira volta para a anterior.
como_aluno python3 - "$copia/trabalho/app.py" <<'PY'
import pathlib
import sys

p = pathlib.Path(sys.argv[1])
alvo = 'if __name__ == "__main__":\n'
p.write_text(p.read_text().replace(alvo, alvo + '    raise SystemExit("falha simulada no boot")\n', 1))
PY
como_aluno sh -c "echo $marca-quebrada > $copia/trabalho/VERSION"
gt commit -qam "verificação do gym: versão que não sobe"
sha_c=$(gt rev-parse HEAD | cut -c1-7)
gt push -q -f origin main >/dev/null 2>&1
checar "versão que não sobe: a esteira voltou sozinha para $marca" "depois do deploy, teste /saude; se falhar, volte o link e reinicie" \
  esperar_versao "$marca"
checar "deploys.log registra o rollback ($sha_c ... rollback)" "a linha do deploy que voltou diz rollback" \
  sh -c "grep '$sha_c' $log 2>/dev/null | grep -qi rollback"
rm -rf "$copia"

# D. Republica o main de verdade (a mesma versão de novo: o deploy precisa aguentar).
if [ -x "$bare/hooks/post-receive" ] && [ -n "$main" ]; then
  como_aluno sh -c "cd $bare && echo '$main $main refs/heads/main' | GIT_DIR=$bare hooks/post-receive" >/dev/null 2>&1
fi
checar "republicar o main (a mesma versão de novo) funciona: $versao_main no ar" "deploy repetido não pode quebrar" \
  esperar_versao "$versao_main"
