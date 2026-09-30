# Alerta que não dispara: alvo coletado, regra carregada e disparando, PromQL da taxa de erro.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json

status, corpo = http("http://localhost:19090/api/v1/targets")
checar("o Prometheus está no ar em localhost:19090", status == 200, "docker compose -f observabilidade/compose.yaml up -d")
if status == 200:
    alvos = json.loads(corpo)["data"]["activeTargets"]
    loja = [a for a in alvos if a["labels"].get("job") == "loja"]
    checar("o Prometheus coleta as métricas da loja (alvo up)", loja and all(a["health"] == "up" for a in loja),
           "Status > Target health: o erro diz a porta que ele tentou; a loja escuta na 8000")

status, corpo = http("http://localhost:19090/api/v1/rules")
regras = []
if status == 200:
    for grupo in json.loads(corpo)["data"]["groups"]:
        regras += grupo["rules"]
alerta = next((r for r in regras if r.get("name") == "ErrosNoCheckout"), None)
checar("a regra ErrosNoCheckout foi carregada", alerta is not None,
       "rule_files precisa apontar para o arquivo que existe dentro do container")
if alerta:
    checar("a expressão usa a métrica que a loja expõe", "loja_requisicoes_total" in alerta.get("query", ""),
           "veja os nomes em http://localhost:19090 (autocompletar) ou no /metrics da loja")
    checar("a regra não tem erro de avaliação", alerta.get("health") == "ok", alerta.get("lastError", ""))
    checar(f"o alerta está disparando (estado: {alerta.get('state')})", alerta.get("state") == "firing",
           "espere o for: 30s depois de a condição ficar verdadeira (pending -> firing)")

respostas = oficina / "respostas.txt"
texto = respostas.read_text(encoding="utf-8") if respostas.exists() else ""
checar("respostas.txt tem a consulta da porcentagem de erro do checkout",
       "loja_requisicoes_total" in texto and "rate(" in texto and "checkout" in texto and "100" in texto,
       "algo como 100 * sum(rate(...codigo=\"500\"...[1m])) / sum(rate(...[1m])) no checkout")
