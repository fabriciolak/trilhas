#!/usr/bin/env bash
# Treino de shell script: fotos com nomes difíceis para o renomeia.sh.
set -euo pipefail
d=/home/aluno/treinos/bash/fotos
mkdir -p "$d"
for f in "praia 2026.jpeg" "festa da firma.jpeg" "serra.jpeg" "logo.png"; do echo "$f" > "$d/$f"; done
chown -R aluno:aluno /home/aluno/treinos
