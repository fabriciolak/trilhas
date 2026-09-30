"""API do treino de Compose: conta visitas no Redis (só biblioteca padrão)."""
import json
import os
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer

CACHE = os.environ.get("REDIS_HOST", "localhost")


def incr() -> int:
    with socket.create_connection((CACHE, 6379), timeout=2) as conexao:
        conexao.sendall(b"*2\r\n$4\r\nINCR\r\n$7\r\nvisitas\r\n")
        return int(conexao.recv(64).decode().strip().lstrip(":"))


class Api(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            corpo, codigo = {"visita": incr()}, 200
        except (OSError, ValueError) as erro:
            print(f"api: o cache ({CACHE}:6379) não respondeu: {erro}", flush=True)
            corpo, codigo = {"erro": f"cache ({CACHE}) fora: {erro}"}, 503
        dados = json.dumps(corpo).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)


print(f"api: ouvindo na 8000; cache em {CACHE}:6379", flush=True)
HTTPServer(("0.0.0.0", 8000), Api).serve_forever()
