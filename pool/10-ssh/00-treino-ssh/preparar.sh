#!/usr/bin/env bash
# Treino de SSH: um arquivo para copiar.
set -euo pipefail
mkdir -p /home/aluno/treinos/ssh
echo "relatório do treino de SSH" > /home/aluno/treinos/ssh/relatorio.txt
chown -R aluno:aluno /home/aluno/treinos
