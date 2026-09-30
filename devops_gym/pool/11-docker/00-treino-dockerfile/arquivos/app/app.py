"""App do treino de Dockerfile: responde a SAUDACAO na porta 8000 (só biblioteca padrão)."""
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

SAUDACAO = os.environ.get("SAUDACAO", "(sem SAUDACAO)")


class App(BaseHTTPRequestHandler):
    def do_GET(self):
        dados = f"{SAUDACAO} (uid {os.getuid()})\n".encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)


print(f"app: ouvindo na 8000; SAUDACAO={SAUDACAO}", flush=True)
HTTPServer(("0.0.0.0", 8000), App).serve_forever()
