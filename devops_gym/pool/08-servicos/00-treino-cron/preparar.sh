#!/usr/bin/env bash
# Treino de cron: um script que marca a hora.
set -euo pipefail
d=/home/aluno/treinos/cron
mkdir -p "$d"
printf '#!/bin/bash\necho "marca: $(date +%%T)"\n' > "$d/marca.sh"
chmod 755 "$d/marca.sh"
chown -R aluno:aluno /home/aluno/treinos
