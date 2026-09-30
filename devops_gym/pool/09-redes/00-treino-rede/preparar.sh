#!/usr/bin/env bash
# Treino de rede: dois servidores (o boot.sh liga): um só no loopback (7171), outro HTTP
# em todas as interfaces (7272), com um cabeçalho próprio.
set -euo pipefail
install -d /opt/treino-rede /home/aluno/treinos/rede
cat > /opt/treino-rede/servidores.py <<'PY'
#!/usr/bin/env python3
"""Servidores do treino de rede (DevOps Gym)."""
import socketserver
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer


class Eco(socketserver.StreamRequestHandler):
    def handle(self):
        self.wfile.write(b"misterio: ola\n")


class Site(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("X-Treino", "rede-ok")
        self.end_headers()
        self.wfile.write("site do treino de rede\n".encode())

    do_HEAD = do_GET

    def log_message(self, *args):
        pass


socketserver.TCPServer.allow_reuse_address = True
eco = socketserver.TCPServer(("127.0.0.1", 7171), Eco)
threading.Thread(target=eco.serve_forever, daemon=True).start()
HTTPServer(("0.0.0.0", 7272), Site).serve_forever()
PY
chmod 755 /opt/treino-rede/servidores.py
chown -R aluno:aluno /home/aluno/treinos
