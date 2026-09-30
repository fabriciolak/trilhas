# ConfigMap, Secret e probes: pod pronto e estável, token vindo de Secret e fora do repositório.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina, k8s.
import json
import time

rc, saida = k8s("get", "deployment", "pagamento", "-n", "pagamento", "-o", "json")
checar("o deployment pagamento existe", rc == 0, "gym k8s start; ou recomece o ticket com [r]")
if rc == 0:
    d = json.loads(saida)
    c = d["spec"]["template"]["spec"]["containers"][0]
    env = {e["name"]: e.get("valueFrom", {}) for e in c.get("env", [])}
    checar("o deployment está disponível (pod pronto)", d["status"].get("availableReplicas", 0) >= 1,
           "describe pod: eventos de CreateContainerConfigError e de Readiness/Liveness probe failed")
    checar("GATEWAY_URL vem da chave certa do ConfigMap", env.get("GATEWAY_URL", {}).get("configMapKeyRef", {}).get("key") == "gateway_url",
           "a chave no ConfigMap se chama gateway_url")
    segredo = env.get("TOKEN_GATEWAY", {}).get("secretKeyRef", {})
    checar("TOKEN_GATEWAY vem do Secret pagamento-segredos (chave token)",
           segredo.get("name") == "pagamento-segredos" and segredo.get("key") == "token",
           "valueFrom: secretKeyRef: name: pagamento-segredos, key: token")
    checar("a readinessProbe olha /saude", c.get("readinessProbe", {}).get("httpGet", {}).get("path") == "/saude",
           "o app só tem /saude")
    viva = c.get("livenessProbe", {})
    checar("a livenessProbe olha a porta certa (8080)", str(viva.get("httpGet", {}).get("port")) == "8080",
           "o log do app diz a porta")
    def reinicios():  # pod vivo (sem os que estão terminando) -> quantas vezes reiniciou
        rc, saida = k8s("get", "pods", "-n", "pagamento", "-l", "app=pagamento", "-o", "json")
        pods = json.loads(saida).get("items", []) if rc == 0 else []
        return {p["metadata"]["name"]: sum(s.get("restartCount", 0) for s in p["status"].get("containerStatuses", []))
                for p in pods if not p["metadata"].get("deletionTimestamp")}
    antes = reinicios()
    time.sleep(8)
    depois = reinicios()
    comuns = set(antes) & set(depois)
    checar("sem reinícios novos (a liveness parou de matar o pod)",
           bool(comuns) and all(antes[n] == depois[n] for n in comuns),
           "uma liveness errada reinicia o container a cada poucos segundos")

rc, saida = k8s("get", "secret", "pagamento-segredos", "-n", "pagamento", "-o", "json")
checar("o Secret pagamento-segredos existe no cluster", rc == 0, "gym kubectl create secret generic pagamento-segredos -n pagamento --from-literal=token=...")
rc, saida = k8s("get", "configmap", "pagamento-config", "-n", "pagamento", "-o", "json")
checar("o token saiu do ConfigMap no cluster", rc == 0 and "token_gateway" not in json.loads(saida).get("data", {}),
       "tire a chave do arquivo e reaplique (o apply atualiza o ConfigMap)")
arquivos = "\n".join(p.read_text(encoding="utf-8") for p in (oficina / "k8s").glob("*.y*ml"))
checar("nenhum arquivo do repositório tem o token", "tk-live-8841" not in arquivos,
       "o Secret é criado pela linha de comando, sem arquivo versionado")
rc, saida = k8s("get", "endpoints", "pagamento", "-n", "pagamento", "-o", "json")
enderecos = sum(len(s.get("addresses", [])) for s in json.loads(saida).get("subsets", [])) if rc == 0 else 0
checar("o Service pagamento tem o pod como destino", enderecos >= 1, "só pods prontos (readiness ok) entram nos endpoints")
