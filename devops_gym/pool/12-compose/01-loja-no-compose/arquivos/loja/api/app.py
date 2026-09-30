"""API da loja: conta as visitas no Redis (simulada para o DevOps Gym, só biblioteca padrão)."""
import os
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer

HOST = os.environ.get("REDIS_HOST", "localhost")
PORTA = int(os.environ.get("REDIS_PORT", "6379"))


def incrementar_visitas() -> int:
    # Fala o protocolo do Redis (RESP) direto: INCR visitas
    with socket.create_connection((HOST, PORTA), timeout=2) as conexao:
        conexao.sendall(b"*2\r\n$4\r\nINCR\r\n$7\r\nvisitas\r\n")
        resposta = conexao.recv(64).decode()
    if not resposta.startswith(":"):
        raise RuntimeError(resposta.strip())
    return int(resposta[1:].strip())


class Api(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            numero = incrementar_visitas()
            corpo, codigo = f"Pinguim Store: visita número {numero} (api {socket.gethostname()})\n", 200
        except Exception as erro:  # noqa: BLE001
            print(f"api: erro ao falar com o cache em {HOST}:{PORTA}: {erro}", flush=True)
            corpo, codigo = f"erro: o cache ({HOST}:{PORTA}) não respondeu: {erro}\n", 500
        dados = corpo.encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)


print(f"api: ouvindo na porta 8000; cache em {HOST}:{PORTA}", flush=True)
HTTPServer(("0.0.0.0", 8000), Api).serve_forever()
