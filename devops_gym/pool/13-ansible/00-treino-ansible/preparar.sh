#!/usr/bin/env bash
# Treino de Ansible: só a página; o resto é o aluno quem escreve.
set -euo pipefail
d=/home/aluno/treinos/ansible
mkdir -p "$d/files"
printf '<!doctype html>\n<meta charset="utf-8">\n<h1>App do treino de Ansible</h1>\n' > "$d/files/index.html"
chown -R aluno:aluno /home/aluno/treinos
