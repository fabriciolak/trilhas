#!/usr/bin/env bash
# Treino de systemd: um programa pronto, sem unit.
set -euo pipefail
install -d /opt/treino /home/aluno/treinos/systemd
cat > /opt/treino/saudacao.py <<'PY'
#!/usr/bin/env python3
"""Saudação: responde a MENSAGEM em HTTP na porta 8900 (treino do DevOps Gym)."""
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

MENSAGEM = os.environ.get("MENSAGEM", "Olá!")


class Saudacao(BaseHTTPRequestHandler):
    def do_GET(self):
        dados = (MENSAGEM + "\n").encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(dados)


print(f"saudacao: ouvindo na porta 8900; mensagem: {MENSAGEM}", flush=True)
HTTPServer(("0.0.0.0", 8900), Saudacao).serve_forever()
PY
chmod 755 /opt/treino/saudacao.py
chown -R aluno:aluno /home/aluno/treinos
