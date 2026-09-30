#!/usr/bin/env bash
# Servidor em chamas (chefe do mês 3): o checkout (unit do systemd, desabilitada) cai em
# cascata. 1) pedidos.db restaurado como root; 2) a partição cheia por um arquivo apagado
# que o exportador travado ainda segura; 3) escuta em 127.0.0.1:8030 em vez de 0.0.0.0:8300.
# E não tem Restart=. O boot.sh monta a partição e deixa o exportador travado.
set -euo pipefail

id checkout >/dev/null 2>&1 || useradd -r -M -d /var/lib/checkout -s /usr/sbin/nologin checkout
install -d /opt/checkout/semente /etc/checkout /var/lib/checkout

cat > /opt/checkout/checkout.py <<'PY'
#!/usr/bin/env python3
"""Checkout da Pinguim Store (simulado para o DevOps Gym)."""
import json
import os
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

DADOS = "/var/lib/checkout"
endereco = os.environ.get("ENDERECO", "127.0.0.1")
porta = int(os.environ.get("PORTA", "8300"))


def fatal(mensagem):
    print(f"FATAL checkout: {mensagem}", file=sys.stderr, flush=True)
    sys.exit(73)


try:
    with open(f"{DADOS}/pedidos.db") as f:
        pedidos = sum(1 for _ in f)
except OSError as erro:
    fatal(f"não consigo ler os pedidos: {erro}")
try:
    with open(f"{DADOS}/estado.json", "w") as f:
        json.dump({"iniciado_em": time.time(), "pid": os.getpid(), "pedidos": pedidos}, f)
except OSError as erro:
    fatal(f"não consigo gravar o estado: {erro}")


class Checkout(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/saude":
            corpo, codigo = {"status": "ok", "servico": "checkout", "pedidos": pedidos}, 200
        else:
            corpo, codigo = {"erro": "não encontrado"}, 404
        dados = json.dumps(corpo).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(dados)

    def log_message(self, formato, *args):
        print("checkout:", formato % args, flush=True)


print(f"checkout: {pedidos} pedidos carregados; ouvindo em {endereco}:{porta}", flush=True)
HTTPServer((endereco, porta), Checkout).serve_forever()
PY
chmod 755 /opt/checkout/checkout.py

# Os pedidos do fim de semana (o boot.sh copia para a partição, como root: o "restore").
RANDOM=13
for i in $(seq 1 480); do
  printf '2026-09-%02d %02d:%02d:%02d pedido=%06d valor=%d.%02d status=pago\n' \
    $((26 + i / 120)) $((i % 24)) $((i % 60)) $((i * 7 % 60)) $((300000 + i)) $((RANDOM % 600 + 10)) $((RANDOM % 100))
done > /opt/checkout/semente/pedidos.db

printf 'ENDERECO=127.0.0.1\nPORTA=8030\n' > /etc/checkout/checkout.env

cat > /etc/systemd/system/checkout.service <<'UNIT'
[Unit]
Description=Checkout da Pinguim Store
After=network.target

[Service]
User=checkout
Group=checkout
EnvironmentFile=/etc/checkout/checkout.env
ExecStart=/usr/bin/python3 /opt/checkout/checkout.py

[Install]
WantedBy=multi-user.target
UNIT

cat > /usr/local/bin/exportar-pedidos <<'SH'
#!/bin/bash
# exportar-pedidos: monta a exportação dos pedidos e envia para o ERP.
# Uso: exportar-pedidos [--sim]      (sem --sim, pede confirmação antes de enviar)
dados=/var/lib/checkout
tmp=$dados/tmp/exportacao-$$.bin
exec 3> "$tmp"
rm -f "$tmp"                                  # "o temporário não fica no disco"
head -c 8M /dev/zero >&3 2>/dev/null          # monta a exportação
if [ "${1:-}" != "--sim" ]; then
  read -r -p "Enviar $(wc -l < $dados/pedidos.db) pedidos ao ERP? (s/n) " resposta
  [ "$resposta" = s ] || exit 1
fi
exec 3>&-                                     # enviado: fecha a exportação
echo "$(date -Is) exportação enviada ($(wc -l < $dados/pedidos.db) pedidos)" >> $dados/exportacoes.log
SH
chmod 755 /usr/local/bin/exportar-pedidos
