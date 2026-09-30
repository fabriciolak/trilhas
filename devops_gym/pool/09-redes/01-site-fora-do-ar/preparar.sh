#!/usr/bin/env bash
# Site fora do ar: nginx com erro de sintaxe (não sobe) e, depois de corrigido,
# proxy_pass para a porta errada (502). O backend escuta em 127.0.0.1:5001.
set -euo pipefail

install -d /opt/vitrine-backend
cat > /opt/vitrine-backend/servidor.py <<'EOF'
#!/usr/bin/env python3
"""Backend da vitrine (simulado para o DevOps Gym)."""
from http.server import BaseHTTPRequestHandler, HTTPServer

PAGINA = """<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Pinguim Store</title></head>
<body><h1>Pinguim Store</h1><p>Vitrine no ar.</p></body></html>
""".encode()


class Vitrine(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(PAGINA)

    do_HEAD = do_GET


HTTPServer(("127.0.0.1", 5001), Vitrine).serve_forever()
EOF

cat > /etc/systemd/system/vitrine-backend.service <<'EOF'
[Unit]
Description=Backend da vitrine
After=network.target

[Service]
User=www-data
ExecStart=/usr/bin/python3 /opt/vitrine-backend/servidor.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
systemctl enable vitrine-backend.service

cat > /etc/nginx/sites-available/loja <<'EOF'
server {
    listen 80 default_server;
    server_name loja.pinguim.local;

    access_log /var/log/nginx/loja-acesso.log;
    error_log  /var/log/nginx/loja-erro.log;

    location / {
        proxy_pass http://127.0.0.1:5000
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/loja /etc/nginx/sites-enabled/loja
