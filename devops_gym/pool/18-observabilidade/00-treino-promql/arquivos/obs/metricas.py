"""Loja simulada para o treino de PromQL: um contador, um gauge e um histograma em :8000/metrics."""
import bisect
import random
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

METODOS = {"pix": 0.6, "cartao": 0.3, "boleto": 0.1}
BALDES = [0.05, 0.1, 0.25, 0.5, 1.0]
pedidos = {m: 0 for m in METODOS}
baldes = [0] * (len(BALDES) + 1)
soma = 0.0
carrinhos = 0
trava = threading.Lock()


def trafego() -> None:
    global soma, carrinhos
    while True:
        metodo = random.choices(list(METODOS), weights=list(METODOS.values()))[0]
        latencia = random.expovariate(1 / 0.12)
        with trava:
            pedidos[metodo] += 1
            baldes[bisect.bisect_left(BALDES, latencia)] += 1
            soma += latencia
            carrinhos = random.randint(20, 40)
        time.sleep(0.05)


def texto() -> str:
    linhas = ["# HELP loja_pedidos_total Pedidos pagos, por método de pagamento.", "# TYPE loja_pedidos_total counter"]
    with trava:
        linhas += [f'loja_pedidos_total{{metodo="{m}"}} {n}' for m, n in pedidos.items()]
        linhas += ["# HELP loja_carrinhos_abertos Carrinhos abertos agora.", "# TYPE loja_carrinhos_abertos gauge",
                   f"loja_carrinhos_abertos {carrinhos}",
                   "# HELP loja_latencia_segundos Tempo para fechar um pedido.", "# TYPE loja_latencia_segundos histogram"]
        acumulado = 0
        for limite, n in zip(BALDES + ["+Inf"], baldes):
            acumulado += n
            linhas.append(f'loja_latencia_segundos_bucket{{le="{limite}"}} {acumulado}')
        linhas += [f"loja_latencia_segundos_sum {soma:.3f}", f"loja_latencia_segundos_count {acumulado}"]
    return "\n".join(linhas) + "\n"


class Metricas(BaseHTTPRequestHandler):
    def do_GET(self):
        corpo = texto().encode() if self.path == "/metrics" else b"veja /metrics\n"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; version=0.0.4")
        self.end_headers()
        self.wfile.write(corpo)

    def log_message(self, *args):
        pass


threading.Thread(target=trafego, daemon=True).start()
print("metricas: em :8000/metrics", flush=True)
HTTPServer(("0.0.0.0", 8000), Metricas).serve_forever()
