#!/usr/bin/env bash
# Roda na construção da imagem (Dockerfile). Para cada ticket, em ordem:
#   preparar.sh  roda agora, como root: fabrica o estado quebrado dentro da imagem;
#   boot.sh      é instalado em /usr/local/lib/lab/boot.d e roda a cada boot (lab-inicio).
set -euo pipefail

pool=$1
while IFS= read -r ticket; do
  dir=$(dirname "$ticket")
  chave=${dir#"$pool"/}
  if [[ -f $dir/preparar.sh ]]; then
    echo "==> preparando $chave"
    (cd "$dir" && bash <(sed 's/\r$//' preparar.sh))
  fi
  if [[ -f $dir/boot.sh ]]; then
    mkdir -p /usr/local/lib/lab/boot.d
    sed 's/\r$//' "$dir/boot.sh" > "/usr/local/lib/lab/boot.d/${chave//\//__}.sh"
  fi
done < <(find "$pool" -name ticket.md | sort)
