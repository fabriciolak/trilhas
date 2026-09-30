#!/usr/bin/env bash
# Treino de processos: relogio (escreve a hora), vigia (pai de um sleep) e teimoso
# (recarrega a configuração no SIGHUP). O boot.sh liga os três como aluno.
set -euo pipefail
d=/home/aluno/treinos/processos
mkdir -p "$d" /opt/treino-processos
cat > /opt/treino-processos/relogio <<'SH'
#!/bin/bash
while true; do date +%T >> /home/aluno/treinos/processos/relogio.log; sleep 2; done
SH
cat > /opt/treino-processos/vigia <<'SH'
#!/bin/bash
sleep 100000 &
wait
SH
cat > /opt/treino-processos/teimoso <<'SH'
#!/bin/bash
d=/home/aluno/treinos/processos
carregar() { echo "$(date +%T) recarregado: $(grep '^cor' "$d/teimoso.conf")" >> "$d/teimoso.log"; }
trap carregar HUP
carregar
while true; do sleep 1; done
SH
chmod 755 /opt/treino-processos/*
echo "cor = azul" > "$d/teimoso.conf"
chown -R aluno:aluno /home/aluno/treinos
