#!/usr/bin/env bash
# Nome errado: fretes-api escuta só em 127.0.0.1:7070, e o boot.sh põe no /etc/hosts
# um IP que não responde para fretes.interno. O dig não olha o /etc/hosts.
set -euo pipefail

install -d /opt/fretes /etc/fretes
cat > /opt/fretes/fretes.py <<'EOF'
#!/usr/bin/env python3
"""Serviço de fretes (simulado para o DevOps Gym)."""
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

ENDERECO = os.environ.get("BIND", "127.0.0.1")
PORTA = int(os.environ.get("PORTA", "7070"))


class Fretes(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/cotacao"):
            corpo, codigo = {"frete": 19.90, "prazo_dias": 3, "transportadora": "Pinguim Log"}, 200
        else:
            corpo, codigo = {"erro": "não encontrado"}, 404
        dados = json.dumps(corpo, ensure_ascii=False).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(dados)


print(f"fretes-api: ouvindo em {ENDERECO}:{PORTA}", flush=True)
HTTPServer((ENDERECO, PORTA), Fretes).serve_forever()
EOF

printf 'BIND=127.0.0.1\nPORTA=7070\n' > /etc/fretes/fretes.env

cat > /etc/systemd/system/fretes-api.service <<'EOF'
[Unit]
Description=Serviço de fretes da Pinguim Store
After=network.target

[Service]
User=www-data
EnvironmentFile=/etc/fretes/fretes.env
ExecStart=/usr/bin/python3 /opt/fretes/fretes.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
systemctl enable fretes-api.service

cat > /usr/local/bin/checkout-cotacao <<'EOF'
#!/bin/sh
# O que o checkout faz para cotar o frete.
curl -sS --max-time 4 "http://fretes.interno:7070/cotacao?cep=01001000"
echo
EOF
chmod 755 /usr/local/bin/checkout-cotacao
