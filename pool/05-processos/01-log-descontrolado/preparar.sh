#!/usr/bin/env bash
# Log descontrolado: um escritor de debug escondido atrás de uma cadeia de scripts,
# e um processo que nunca recolhe o filho que morreu (zumbi). O boot.sh liga os dois.
set -euo pipefail

mkdir -p /var/log/loja
cat > /usr/local/bin/cupom-debug <<'EOF'
#!/bin/bash
while true; do
  for _ in $(seq 1 20); do
    echo "$(date -Is) DEBUG cupons: recalculando desconto do carrinho (nova tentativa)" >> /var/log/loja/debug.log
  done
  sleep 1
done
EOF
# A cadeia: o "true" no fim impede o shell de trocar a si mesmo pelo filho (exec),
# assim a ancestralidade fica visível na árvore de processos.
cat > /usr/local/bin/cupons-executor <<'EOF'
#!/bin/sh
/usr/local/bin/cupom-debug
true
EOF
cat > /usr/local/bin/cupons-servico <<'EOF'
#!/bin/sh
/usr/local/bin/cupons-executor
true
EOF

# O pai que nunca chama wait(): o filho que termina vira <defunct> para sempre.
cat > /usr/local/bin/relatorio-noturno <<'EOF'
#!/bin/bash
sleep 1 &
exec sleep infinity
EOF
chmod 755 /usr/local/bin/cupom-debug /usr/local/bin/cupons-executor /usr/local/bin/cupons-servico /usr/local/bin/relatorio-noturno
touch /var/log/loja/debug.log
chown www-data:www-data /var/log/loja /var/log/loja/debug.log
