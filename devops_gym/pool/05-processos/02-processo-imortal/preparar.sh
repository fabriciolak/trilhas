#!/usr/bin/env bash
# Processo imortal: a sentinela ignora os sinais educados e tem um guardião que a
# ressuscita. O boot.sh liga o guardião.
set -euo pipefail

cat > /usr/local/bin/sentinela <<'EOF'
#!/bin/bash
# Captura os sinais educados e se recusa a morrer. Só o SIGKILL não pode ser capturado.
trap 'echo "$(date -Is) sentinela: recebi um sinal e me recuso a morrer" >> /var/log/sentinela.log' TERM INT HUP
while true; do
  sleep 1
done
EOF

cat > /usr/local/bin/sentinela-guardiao <<'EOF'
#!/bin/bash
# Se a sentinela morrer, ela volta.
while true; do
  /usr/local/bin/sentinela
  echo "$(date -Is) guardiao: a sentinela caiu; religando" >> /var/log/sentinela.log
  sleep 1
done
EOF
chmod 755 /usr/local/bin/sentinela /usr/local/bin/sentinela-guardiao
touch /var/log/sentinela.log
chmod 644 /var/log/sentinela.log
