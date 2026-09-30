#!/usr/bin/env bash
# API de estoque: uma unit do systemd que roda como um usuário que não existe e, depois
# de corrigido isso, precisa gravar numa pasta que só o root grava.
set -euo pipefail

install -d /opt/estoque /etc/estoque /var/lib/estoque
cat > /opt/estoque/api.py <<'EOF'
#!/usr/bin/env python3
"""API de estoque da Pinguim Store (simulada para o DevOps Gym)."""
import json
import os
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

porta = os.environ.get("PORTA")
if not porta:
    print("FATAL estoque-api: variável PORTA não definida", file=sys.stderr)
    sys.exit(78)

estado = "/var/lib/estoque/estado.json"
try:
    with open(estado, "w") as f:
        json.dump({"iniciado_em": time.time()}, f)
except OSError as erro:
    print(f"FATAL estoque-api: não consigo gravar {estado}: {erro}", file=sys.stderr)
    sys.exit(73)


class Api(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/saude":
            corpo, codigo = {"status": "ok", "servico": "estoque"}, 200
        else:
            corpo, codigo = {"erro": "não encontrado"}, 404
        dados = json.dumps(corpo).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(dados)

    def log_message(self, formato, *args):
        print("estoque-api:", formato % args, flush=True)


print(f"estoque-api: ouvindo na porta {porta}", flush=True)
HTTPServer(("0.0.0.0", int(porta)), Api).serve_forever()
EOF
chmod 755 /opt/estoque/api.py
echo "PORTA=8088" > /etc/estoque/api.env

cat > /etc/systemd/system/estoque-api.service <<'EOF'
[Unit]
Description=API de estoque da Pinguim Store
After=network.target

[Service]
User=estoque
Group=estoque
EnvironmentFile=/etc/estoque/api.env
ExecStart=/usr/bin/python3 /opt/estoque/api.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl enable estoque-api.service
