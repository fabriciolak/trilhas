"""Loja simulada: gera o próprio tráfego e expõe métricas no formato do Prometheus em :8000/metrics."""
import random
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

ROTAS = {"/": 0.01, "/produtos": 0.02, "/carrinho": 0.03, "/checkout": 0.35}  # chance de erro 500
contadores: dict[tuple[str, str], int] = {}
em_andamento = 0
trava = threading.Lock()


def trafego() -> None:
    global em_andamento
    while True:
        rota = random.choice(list(ROTAS))
        codigo = "500" if random.random() < ROTAS[rota] else "200"
        with trava:
            contadores[(rota, codigo)] = contadores.get((rota, codigo), 0) + 1
            em_andamento = random.randint(0, 12)
        time.sleep(0.05)


class Metricas(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/metrics":
            self.send_response(404)
            self.end_headers()
            return
        linhas = ["# HELP loja_requisicoes_total Requisições atendidas pela loja, por rota e código HTTP.",
                  "# TYPE loja_requisicoes_total counter"]
        with trava:
            for (rota, codigo), n in sorted(contadores.items()):
                linhas.append(f'loja_requisicoes_total{{rota="{rota}",codigo="{codigo}"}} {n}')
            linhas += ["# HELP loja_pedidos_em_andamento Pedidos sendo processados agora.",
                       "# TYPE loja_pedidos_em_andamento gauge",
                       f"loja_pedidos_em_andamento {em_andamento}"]
        corpo = ("\n".join(linhas) + "\n").encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; version=0.0.4")
        self.end_headers()
        self.wfile.write(corpo)

    def log_message(self, *args):
        pass


threading.Thread(target=trafego, daemon=True).start()
print("loja: métricas em :8000/metrics", flush=True)
HTTPServer(("0.0.0.0", 8000), Metricas).serve_forever()
