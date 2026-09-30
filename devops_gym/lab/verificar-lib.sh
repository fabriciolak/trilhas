# Funções para os verificar.sh dos tickets. O gym.py junta este arquivo com o
# verificar.sh do ticket e roda o resultado como root dentro do laboratório:
#   docker exec -i -u root devops-gym-lab bash -s  <  (verificar-lib.sh + verificar.sh)
#
# No verificar.sh:
#   checar "o que deveria ser verdade" "dica se falhar" comando args...
#   ok "mensagem" / falha "mensagem" "dica"      (para lógica própria)
#   como_aluno comando args...                   (roda como o usuário aluno)
# O gym.py chama _resumo no final: sai com 0 (tudo certo) ou 10 (algo falhou).
# Qualquer outro código significa que o próprio verificador quebrou no meio.

set -u
export LANG=C.UTF-8 LC_ALL=C.UTF-8   # nomes com acento aparecem como são (tar, ls, find)
ALUNO=aluno
CASA=/home/aluno

_ok=0
_falhas=0

ok() {
  printf '  \033[32m✔\033[0m %s\n' "$1"
  _ok=$((_ok + 1))
}

falha() {
  printf '  \033[31m✘\033[0m %s\n' "$1"
  if [ -n "${2:-}" ]; then
    printf '      \033[2m%s\033[0m\n' "$2"
  fi
  _falhas=$((_falhas + 1))
}

checar() {
  local msg=$1 dica=$2
  shift 2
  if "$@" >/dev/null 2>&1; then ok "$msg"; else falha "$msg" "$dica"; fi
}

como_aluno() {
  runuser -u "$ALUNO" -- env HOME="$CASA" "$@"
}

# Nenhum processo cuja linha de comando case com o padrão. Roda no próprio shell do
# verificador: um "sh -c 'pgrep -f x'" acharia o próprio sh, que tem x no comando.
sem_processo() {
  ! pgrep -f "$1" >/dev/null
}

# O arquivo existe e contém o texto (sem diferenciar maiúsculas).
contem() {
  [ -f "$1" ] && grep -qiF -- "$2" "$1"
}

_resumo() {
  local total=$((_ok + _falhas))
  echo
  if [ "$_falhas" -eq 0 ]; then
    printf '\033[32m✅ Tudo certo: %d de %d verificações passaram.\033[0m\n' "$_ok" "$total"
    exit 0
  fi
  printf '\033[31m❌ %d de %d verificações falharam.\033[0m\n' "$_falhas" "$total"
  exit 10
}
