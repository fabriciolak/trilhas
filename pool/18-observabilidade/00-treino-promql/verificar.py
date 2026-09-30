# Treino de PromQL: cada consulta do aluno é avaliada no mesmo instante que a de referência,
# e os resultados são comparados.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json
import time
import urllib.parse

API = "http://localhost:19191/api/v1/query"
instante = time.time() - 5


def consultar(q: str):
    status, corpo = http(f"{API}?{urllib.parse.urlencode({'query': q, 'time': f'{instante:.3f}'})}")
    if status != 200:
        return None
    dados = json.loads(corpo)["data"]
    if dados["resultType"] == "scalar":
        return {(): float(dados["result"][1])}
    return {tuple(sorted((k, v) for k, v in r["metric"].items() if k != "__name__")): float(r["value"][1])
            for r in dados["result"]}


def perto(a: float, b: float, tolerancia: float) -> bool:
    return abs(a - b) <= tolerancia * max(abs(b), 1e-9)


def ler(nome: str) -> str:
    arquivo = oficina / "consultas" / nome
    return arquivo.read_text(encoding="utf-8").strip() if arquivo.exists() else ""


status, _ = http("http://localhost:19191/-/ready")
checar("o Prometheus do treino está no ar", status == 200, "recomece o treino com [r]")
m = (oficina / "metricas.txt").read_text(encoding="utf-8") if (oficina / "metricas.txt").exists() else ""
checar("1. metricas.txt tem as métricas cruas", "# TYPE loja_pedidos_total counter" in m, "curl -s http://localhost:18000/metrics > metricas.txt")

casos = [
    ("2. q1: carrinhos abertos agora", "q1.promql", "loja_carrinhos_abertos", "valor", 0.001),
    ("3. q2: pedidos por segundo, todos os métodos (1m)", "q2.promql", "sum(rate(loja_pedidos_total[1m]))", "valor", 0.1),
    ("4. q3: pedidos por segundo, por método (1m)", "q3.promql", "sum by (metodo) (rate(loja_pedidos_total[1m]))", "series", 0.1),
    ("5. q4: o método com mais pedidos em 5m", "q4.promql", "topk(1, sum by (metodo) (increase(loja_pedidos_total[5m])))", "rotulos", 0),
    ("6. q5: p95 da latência (5m)", "q5.promql", "histogram_quantile(0.95, sum by (le) (rate(loja_latencia_segundos_bucket[5m])))", "valor", 0.1),
    ("7. q6: quantos alvos de pé", "q6.promql", "count(up == 1)", "valor", 0.001),
]
for titulo, arquivo, referencia, modo, tol in casos:
    q = ler(arquivo)
    if not q:
        falha(titulo, f"escreva a consulta em consultas/{arquivo}")
        continue
    aluno, certo = consultar(q), consultar(referencia)
    if aluno is None:
        falha(titulo, f"o Prometheus recusou a consulta de {arquivo}: teste na aba Query")
    elif modo == "valor":
        valores = list(aluno.values())
        checar(titulo, len(valores) == 1 and bool(certo) and perto(valores[0], list(certo.values())[0], tol),
               f"deu {valores[:3]}; esperado cerca de {[round(v, 3) for v in certo.values()]}")
    elif modo == "series":
        iguais = set(aluno) == set(certo) and all(perto(aluno[k], certo[k], tol) for k in certo)
        checar(titulo, iguais, f"séries do aluno: {[dict(k) for k in aluno][:4]}; esperado uma por método")
    else:
        rotulos = lambda r: {dict(k).get("metodo") for k in r}  # noqa: E731
        checar(titulo, len(aluno) == 1 and rotulos(aluno) == rotulos(certo), f"deu {[dict(k) for k in aluno][:3]}")
