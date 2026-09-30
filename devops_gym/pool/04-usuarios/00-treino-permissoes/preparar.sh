#!/usr/bin/env bash
# Treino de permissões: três arquivos com permissões "de fábrica" para acertar.
set -euo pipefail
d=/home/aluno/treinos/permissoes
mkdir -p "$d"
printf '#!/bin/bash\necho "olá do script"\n' > "$d/script.sh"
echo "a senha do banco de testes" > "$d/segredo.txt"
echo "relatório da equipe de estudos" > "$d/relatorio.txt"
chown -R aluno:aluno /home/aluno/treinos
chmod 666 "$d/script.sh" "$d/segredo.txt"
chmod 644 "$d/relatorio.txt"
