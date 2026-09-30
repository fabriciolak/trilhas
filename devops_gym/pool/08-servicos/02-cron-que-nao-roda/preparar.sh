#!/usr/bin/env bash
# Cron que não roda: faltam o campo de usuário e a barra antes do %, o programa não é
# executável e a pasta de destino não existe.
set -euo pipefail

cat > /usr/local/bin/relatorio-vendas <<'EOF'
#!/bin/bash
# Resumo das vendas (simulado para o DevOps Gym).
echo "relatório de vendas gerado em $(date -Is)"
echo "pedidos: $((RANDOM % 100 + 50))"
echo "ticket médio: R$ $((RANDOM % 80 + 40)),90"
EOF
chmod 644 /usr/local/bin/relatorio-vendas

cat > /etc/cron.d/relatorio-vendas <<'EOF'
# Relatório de vendas. Em produção é diário; neste servidor de testes, a cada minuto.
* * * * * /usr/local/bin/relatorio-vendas > /var/relatorios/vendas-$(date +%F).txt
EOF
chmod 644 /etc/cron.d/relatorio-vendas
systemctl enable cron
