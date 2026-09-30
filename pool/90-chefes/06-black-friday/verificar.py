# Black Friday: pods de pé com memória suficiente (sem mexer no cache), 3 réplicas prontas,
# readiness em /pronto, rollout sem perder capacidade, desconto 50 em todos os pods,
# PodDisruptionBudget que protege sem travar o dreno, e tudo isso nos arquivos.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina, k8s.
import json
import re

NS = ("-n", "blackfriday")
UNIDADES = {"Ki": 2**10, "Mi": 2**20, "Gi": 2**30, "K": 10**3, "M": 10**6, "G": 10**9, "": 1}


def bytes_de(valor) -> int:
    m = re.fullmatch(r"([0-9.]+)(Ki|Mi|Gi|K|M|G|)", str(valor or "").strip())
    return int(float(m.group(1)) * UNIDADES[m.group(2)]) if m else 0


rc, saida = k8s("get", "deployment", "loja", *NS, "-o", "json")
checar("o deployment loja existe", rc == 0, "gym k8s start; ou recomece o ticket com [r]")
d = json.loads(saida) if rc == 0 else {"spec": {"template": {"spec": {"containers": [{}]}}}, "status": {}}
spec = d["spec"]
c = spec["template"]["spec"]["containers"][0]
recursos = c.get("resources", {})
limite = bytes_de(recursos.get("limits", {}).get("memory"))
pedido = bytes_de(recursos.get("requests", {}).get("memory"))
env = {e["name"]: e for e in c.get("env", [])}

# 1. De pé.
checar("o CACHE_MB continua 48", env.get("CACHE_MB", {}).get("value") == "48", "o cache é obrigatório: aumente a memória, não diminua o cache")
checar("limite de memória suficiente e sem exagero (até 512 Mi)", 64 * 2**20 <= limite <= 512 * 2**20,
       f"limits.memory: {recursos.get('limits', {}).get('memory')}; o describe do pod diz por que ele morreu")
checar("requests de memória definido (e não maior que o limite)", 0 < pedido <= limite, "resources: requests: memory: ...")
checar("requests de CPU definido", bool(recursos.get("requests", {}).get("cpu")), "resources: requests: cpu: 100m")

# 2. Aguentar o tráfego.
checar("pelo menos 3 réplicas no deployment", spec.get("replicas", 0) >= 3, "spec.replicas")
checar("pelo menos 3 réplicas prontas", d["status"].get("readyReplicas", 0) >= 3, "gym kubectl get pods -n blackfriday")
pronto = c.get("readinessProbe", {}).get("httpGet", {})
checar("a readinessProbe olha /pronto", pronto.get("path") == "/pronto" and str(pronto.get("port")) in ("8080", "http"),
       "readinessProbe: httpGet: path: /pronto, port: 8080")
rolagem = spec.get("strategy", {}).get("rollingUpdate", {})
checar("o rollout nunca derruba réplica pronta (maxUnavailable: 0)", str(rolagem.get("maxUnavailable")) in ("0", "0%"),
       "strategy: rollingUpdate: maxUnavailable: 0, maxSurge: 1")

# 3. A promoção.
rc, saida = k8s("get", "configmap", "loja-config", *NS, "-o", "json")
checar("o ConfigMap tem DESCONTO 50", rc == 0 and json.loads(saida).get("data", {}).get("DESCONTO") == "50",
       "no arquivo e aplicado")
rc, saida = k8s("get", "pods", *NS, "-l", "app=loja", "-o", "json")
pods = [p for p in (json.loads(saida).get("items", []) if rc == 0 else [])
        if not p["metadata"].get("deletionTimestamp") and p["status"].get("phase") == "Running"]
descontos = []
for p in pods:
    rc, valor = k8s("exec", *NS, p["metadata"]["name"], "--", "printenv", "DESCONTO")
    descontos.append(valor.strip() if rc == 0 else "?")
checar(f"todos os pods vendem com 50% ({', '.join(descontos) or 'nenhum pod'})", bool(descontos) and set(descontos) == {"50"},
       "variável de ambiente só é lida quando o pod nasce: gym kubectl rollout restart deployment/loja -n blackfriday")
reinicios = sum(s.get("restartCount", 0) for p in pods for s in p["status"].get("containerStatuses", []))
checar("os pods de agora não estão morrendo", bool(pods) and reinicios == 0, f"{reinicios} reinício(s); describe pod: Last State")

# 4. Manutenção sem susto.
rc, saida = k8s("get", "pdb", *NS, "-o", "json")
pdbs = [p for p in (json.loads(saida).get("items", []) if rc == 0 else [])
        if p["spec"].get("selector", {}).get("matchLabels", {}).get("app") == "loja"]
checar("existe um PodDisruptionBudget para app=loja", bool(pdbs), "kind: PodDisruptionBudget (policy/v1)")
if pdbs:
    s, st = pdbs[0]["spec"], pdbs[0].get("status", {})
    uma_por_vez = str(s.get("maxUnavailable")) == "1" or (str(s.get("minAvailable", "")).isdigit()
                                                         and int(s["minAvailable"]) >= spec.get("replicas", 0) - 1)
    checar("no máximo uma réplica sai por vez", uma_por_vez, "maxUnavailable: 1 (ou minAvailable: réplicas - 1)")
    checar("o dreno consegue andar (o PDB permite ao menos uma saída)", st.get("disruptionsAllowed", 0) >= 1,
           f"disruptionsAllowed: {st.get('disruptionsAllowed')}; minAvailable igual às réplicas trava tudo")

# Nos arquivos (o que vai para o Git).
texto = "\n".join(p.read_text(encoding="utf-8") for p in sorted((oficina / "k8s").glob("*.y*ml")))
checar("os arquivos têm as réplicas", bool(re.search(r"^\s*replicas:\s*([3-9]|\d\d+)\s*$", texto, re.M)), "spec.replicas no loja.yaml")
checar("os arquivos têm a readinessProbe em /pronto", "readinessProbe" in texto and "/pronto" in texto, "")
checar("os arquivos têm o desconto 50", bool(re.search(r"DESCONTO:\s*[\"']?50[\"']?\s*$", texto, re.M)), "")
checar("os arquivos têm o maxUnavailable: 0", bool(re.search(r"maxUnavailable:\s*0\s*$", texto, re.M)), "")
checar("os arquivos têm o PodDisruptionBudget", "PodDisruptionBudget" in texto, "")
checar("os arquivos não têm mais o limite de 32Mi", not re.search(r"memory:\s*[\"']?32Mi", texto), "")

# O relatório.
r = oficina / "blackfriday.txt"
rel = r.read_text(encoding="utf-8") if r.exists() else ""
checar("blackfriday.txt diz o motivo (OOMKilled) e o código de saída (137)", "OOMKilled" in rel and "137" in rel,
       "gym kubectl describe pod: Last State, Reason, Exit Code")
