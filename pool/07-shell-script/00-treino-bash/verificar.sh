d=$CASA/treinos/bash
t=$(mktemp -d); chmod 755 "$t"
roda() { como_aluno "$@"; }
pronto() { head -n 1 "$d/$1" 2>/dev/null | grep -q '^#!' && test -x "$d/$1" && bash -n "$d/$1"; }

checar "1. ola.sh: shebang, executável e sem erro de sintaxe" "#!/bin/bash; chmod +x" pronto ola.sh
checar "1. ./ola.sh Ana → Olá, Ana! e sem argumento → Olá, mundo!" "\${1:-mundo}" \
  sh -c "test \"\$(runuser -u aluno -- $d/ola.sh Ana)\" = 'Olá, Ana!' && test \"\$(runuser -u aluno -- $d/ola.sh)\" = 'Olá, mundo!'"

mkdir -p "$t/p/sub"; touch "$t/p/a" "$t/p/b b" "$t/p/.c"
checar "2. conta.sh conta só os arquivos (3 aqui, com um oculto e um com espaço)" "find \"\$1\" -maxdepth 1 -type f | wc -l" \
  sh -c "test \"\$(runuser -u aluno -- $d/conta.sh $t/p | tr -d ' ')\" = 3"
roda "$d/conta.sh" /nao/existe >/dev/null 2>&1; rc=$?
erro=$(roda "$d/conta.sh" /nao/existe 2>&1 >/dev/null)
checar "2. conta.sh numa pasta inexistente: código 2 e mensagem na saída de erro" "echo ... >&2; exit 2" \
  test "$rc" -eq 2 -a -n "$erro"

checar "3. maior.sh 3 17 -2 9 → 17" "for n in \"\$@\"; do ...; done" sh -c "test \"\$(runuser -u aluno -- $d/maior.sh 3 17 -2 9)\" = 17"
checar "3. maior.sh 5 → 5" "" sh -c "test \"\$(runuser -u aluno -- $d/maior.sh 5)\" = 5"
roda "$d/maior.sh" >/dev/null 2>&1; rc=$?
erro=$(roda "$d/maior.sh" 2>&1 >/dev/null)
checar "3. maior.sh sem números: código 1 e uso na saída de erro" "[ \$# -eq 0 ]" test "$rc" -eq 1 -a -n "$erro"

mkdir -p "$t/f"; for f in "um dois.jpeg" "tres.jpeg" "quatro.png"; do touch "$t/f/$f"; done; chown -R aluno: "$t"
roda "$d/renomeia.sh" "$t/f" >/dev/null 2>&1
checar "4. renomeia.sh troca .jpeg por .jpg, inclusive com espaço" "for f in \"\$1\"/*.jpeg; do mv \"\$f\" \"\${f%.jpeg}.jpg\"; done" \
  sh -c "test -f '$t/f/um dois.jpg' && test -f '$t/f/tres.jpg' && test -f '$t/f/quatro.png' && ! ls $t/f | grep -q jpeg"

checar "5. servico.sh start/stop/status" "case \"\$1\" in start) ... ;; esac" \
  sh -c "test \"\$(runuser -u aluno -- $d/servico.sh start)\" = iniciando && test \"\$(runuser -u aluno -- $d/servico.sh stop)\" = parando && test \"\$(runuser -u aluno -- $d/servico.sh status)\" = rodando"
roda "$d/servico.sh" xyz >/dev/null 2>&1; rc=$?
erro=$(roda "$d/servico.sh" xyz 2>&1 >/dev/null)
uso_certo() { [ "$rc" -eq 1 ] && printf '%s' "$erro" | grep -qF 'uso: servico.sh {start|stop|status}'; }
checar "5. servico.sh com opção inválida: código 1 e o uso na saída de erro" "*) echo 'uso: ...' >&2; exit 1 ;;" uso_certo

checar "6. echo 30 | ./idade.sh → Daqui a 10 anos: 40" "read -r idade; somar_dez() { ...; }" \
  sh -c "test \"\$(echo 30 | runuser -u aluno -- $d/idade.sh)\" = 'Daqui a 10 anos: 40'"
checar "6. idade.sh tem a função somar_dez" "somar_dez() { echo \$(( \$1 + 10 )); }" grep -qE 'somar_dez *\(\)|function +somar_dez' "$d/idade.sh"
rm -rf "$t"
