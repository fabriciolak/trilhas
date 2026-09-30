"""API da loja em produção (simulada para o DevOps Gym, só biblioteca padrão).

GET /api/saude   o cache responde?
GET /api/visita  conta a visita no Redis
GET /api/admin   exige o cabeçalho X-Senha igual a SENHA_ADMIN
"""
import json
import os
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer

CACHE = os.environ.get("REDIS_HOST", "localhost")
SENHA = os.environ.get("SENHA_ADMIN", "")


def redis(*partes: str) -> str:
    comando = f"*{len(partes)}\r\n" + "".join(f"${len(p)}\r\n{p}\r\n" for p in partes)
    with socket.create_connection((CACHE, 6379), timeout=2) as conexao:
        conexao.sendall(comando.encode())
        return conexao.recv(128).decode().strip()


class Api(BaseHTTPRequestHandler):
    def responder(self, codigo: int, corpo: dict) -> None:
        dados = json.dumps(corpo, ensure_ascii=False).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        try:
            if self.path == "/api/saude":
                self.responder(200, {"status": "ok", "cache": redis("PING")})
            elif self.path == "/api/visita":
                self.responder(200, {"visita": int(redis("INCR", "visitas").lstrip(":"))})
            elif self.path == "/api/admin":
                if SENHA and self.headers.get("X-Senha") == SENHA:
                    self.responder(200, {"admin": "bem-vindo"})
                else:
                    self.responder(401, {"erro": "senha errada"})
            else:
                self.responder(404, {"erro": "não encontrado"})
        except OSError as erro:
            print(f"api: o cache ({CACHE}:6379) não respondeu: {erro}", flush=True)
            self.responder(503, {"erro": f"cache fora: {erro}"})


if not SENHA:
    print("api: AVISO: SENHA_ADMIN vazia; /api/admin sempre recusa", flush=True)
print(f"api: ouvindo na porta 8000 como uid {os.getuid()}; cache em {CACHE}:6379", flush=True)
HTTPServer(("0.0.0.0", 8000), Api).serve_forever()
