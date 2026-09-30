#!/usr/bin/env bash
# Treino do terminal: uma pasta bagunçada para organizar.
set -euo pipefail
b=/home/aluno/treinos/terminal/bagunca
mkdir -p "$b/fotos"
head -c 20480 /dev/urandom > "$b/relatorio-final.txt"
head -c 5120  /dev/urandom > "$b/rascunho-velho.txt"
printf 'Leia antes de mexer: nada aqui tem backup.\n' > "$b/LEIA-ME.txt"
printf 'a senha do wi-fi é pinguim2026\n' > "$b/.escondido"
head -c 3000 /dev/urandom > "$b/fotos/praia.jpg"
head -c 3000 /dev/urandom > "$b/fotos/serra.jpg"
chown -R aluno:aluno /home/aluno/treinos
