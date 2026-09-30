#!/usr/bin/env bash
# Treino de pacotes: três .deb locais (pinguim-cli 1.0 e 1.1, pinguim-extra que exige 1.1).
set -euo pipefail
d=/home/aluno/treinos/apt
mkdir -p "$d"
tmp=$(mktemp -d)
pacote() {  # pacote <nome> <versão> <depends ou vazio>
  local raiz=$tmp/$1-$2
  mkdir -p "$raiz/DEBIAN" "$raiz/usr/share/doc/$1"
  {
    echo "Package: $1"; echo "Version: $2"; echo "Architecture: all"
    echo "Maintainer: Pinguim Store <ti@pinguim.local>"
    [ -n "$3" ] && echo "Depends: $3"
    echo "Description: ferramenta de treino da Pinguim Store"
  } > "$raiz/DEBIAN/control"
  echo "$1 $2: pacote de treino do DevOps Gym" > "$raiz/usr/share/doc/$1/README"
}
pacote pinguim-cli 1.0 ""
pacote pinguim-cli 1.1 ""
pacote pinguim-extra 1.0 "pinguim-cli (>= 1.1)"
for v in 1.0 1.1; do
  mkdir -p "$tmp/pinguim-cli-$v/usr/bin" "$tmp/pinguim-cli-$v/etc"
  printf '#!/bin/sh\necho "pinguim-cli %s"\n' "$v" > "$tmp/pinguim-cli-$v/usr/bin/pinguim"
  chmod 755 "$tmp/pinguim-cli-$v/usr/bin/pinguim"
  echo "servidor = api.pinguim.local" > "$tmp/pinguim-cli-$v/etc/pinguim.conf"
  echo /etc/pinguim.conf > "$tmp/pinguim-cli-$v/DEBIAN/conffiles"
done
mkdir -p "$tmp/pinguim-extra-1.0/etc"
echo "modo = turbo" > "$tmp/pinguim-extra-1.0/etc/pinguim-extra.conf"
echo /etc/pinguim-extra.conf > "$tmp/pinguim-extra-1.0/DEBIAN/conffiles"
dpkg-deb --root-owner-group -Zgzip --build "$tmp/pinguim-cli-1.0" "$d/pinguim-cli_1.0_all.deb" >/dev/null
dpkg-deb --root-owner-group -Zgzip --build "$tmp/pinguim-cli-1.1" "$d/pinguim-cli_1.1_all.deb" >/dev/null
dpkg-deb --root-owner-group -Zgzip --build "$tmp/pinguim-extra-1.0" "$d/pinguim-extra_1.0_all.deb" >/dev/null
rm -rf "$tmp"
chown -R aluno:aluno /home/aluno/treinos
