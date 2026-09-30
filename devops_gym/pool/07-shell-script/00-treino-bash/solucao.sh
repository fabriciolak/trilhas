# Treino de shell script: uma solução possível.
cd ~/treinos/bash

cat > ola.sh <<'SH'
#!/bin/bash
echo "Olá, ${1:-mundo}!"
SH

cat > conta.sh <<'SH'
#!/bin/bash
set -euo pipefail
pasta=${1:-.}
if [ ! -d "$pasta" ]; then
  echo "conta.sh: '$pasta' não é uma pasta" >&2
  exit 2
fi
find "$pasta" -maxdepth 1 -type f | wc -l
SH

cat > maior.sh <<'SH'
#!/bin/bash
set -euo pipefail
if [ $# -eq 0 ]; then
  echo "uso: maior.sh N1 N2 ..." >&2
  exit 1
fi
maior=$1
for n in "$@"; do
  if [ "$n" -gt "$maior" ]; then maior=$n; fi
done
echo "$maior"
SH

cat > renomeia.sh <<'SH'
#!/bin/bash
set -euo pipefail
shopt -s nullglob
for f in "${1:-.}"/*.jpeg; do
  mv -- "$f" "${f%.jpeg}.jpg"
done
SH

cat > servico.sh <<'SH'
#!/bin/bash
case "${1:-}" in
  start) echo "iniciando" ;;
  stop) echo "parando" ;;
  status) echo "rodando" ;;
  *) echo "uso: servico.sh {start|stop|status}" >&2; exit 1 ;;
esac
SH

cat > idade.sh <<'SH'
#!/bin/bash
somar_dez() { echo $(( $1 + 10 )); }
read -r idade
echo "Daqui a 10 anos: $(somar_dez "$idade")"
SH

chmod +x ./*.sh
./ola.sh Ana; ./conta.sh fotos; ./maior.sh 3 17 9; ./renomeia.sh fotos; ls fotos
echo 30 | ./idade.sh
