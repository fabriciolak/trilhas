#!/usr/bin/env bash
# Log em chamas: 6000 linhas de log de acesso, sempre iguais (semente fixa), com um IP
# dominante e os 500 concentrados em /api/pagamento. O boot.sh liga um gerador ao vivo.
set -euo pipefail

mkdir -p /var/log/loja
log=/var/log/loja/acesso.log
ips=(203.0.113.10 203.0.113.41 192.0.2.8 192.0.2.77 198.51.100.4 198.51.100.230)
caminhos=(/ /produtos /api/carrinho /api/pagamento /login /health)
RANDOM=42
for i in $(seq 1 6000); do
  if (( i % 3 == 0 )); then ip=198.51.100.23; else ip=${ips[RANDOM % 6]}; fi
  caminho=${caminhos[RANDOM % 6]}
  status=200
  (( RANDOM % 12 == 0 )) && status=404
  if [[ $caminho == /api/pagamento ]] && (( RANDOM % 3 == 0 )); then status=500; fi
  if [[ $caminho == /api/carrinho ]] && (( RANDOM % 40 == 0 )); then status=500; fi
  printf '%s - - [13/Sep/2026:%02d:%02d:%02d +0000] "GET %s HTTP/1.1" %s %d\n' \
    "$ip" $((8 + i / 1000)) $((i / 17 % 60)) $((i % 60)) "$caminho" "$status" $((RANDOM % 9000 + 200))
done > "$log"

cat > /usr/local/sbin/loja-trafego <<'EOF'
#!/bin/bash
# Tráfego ao vivo da loja (simulado): uma linha a cada 2 segundos.
while true; do
  if (( RANDOM % 3 == 0 )); then status=500; else status=200; fi
  printf '198.51.100.23 - - [%s] "GET /api/pagamento HTTP/1.1" %s 512\n' \
    "$(date -u '+%d/%b/%Y:%H:%M:%S +0000')" "$status" >> /var/log/loja/acesso.log
  sleep 2
done
EOF
chmod 755 /usr/local/sbin/loja-trafego
chown -R www-data:www-data /var/log/loja
chmod 755 /var/log/loja
chmod 644 "$log"
