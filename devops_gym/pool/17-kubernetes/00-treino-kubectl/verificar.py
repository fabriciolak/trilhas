# Treino de kubectl: nós, namespace, deployment + service pelo arquivo, endpoints,
# autocorreção e rollout.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina, k8s.
import json


def ler(nome: str) -> str:
    arquivo = oficina / nome
    return arquivo.read_text(encoding="utf-8", errors="replace") if arquivo.exists() else ""


checar("1. nos.txt tem o nó pronto", "Ready" in ler("nos.txt"), "gym kubectl get nodes > nos.txt")
rc, _ = k8s("get", "namespace", "treino")
checar("2. o namespace treino existe", rc == 0, "gym kubectl create namespace treino")
texto = ler("k8s/web.yaml")
checar("3. k8s/web.yaml tem o Deployment e o Service", "kind: Deployment" in texto and "kind: Service" in texto,
       "dois objetos no mesmo arquivo, separados por ---")
rc, saida = k8s("get", "deployment", "web", "-n", "treino", "-o", "json")
d = json.loads(saida) if rc == 0 else {"spec": {}, "status": {}}
checar("3. o deployment web tem 3 réplicas prontas", d["spec"].get("replicas") == 3 and d["status"].get("readyReplicas") == 3,
       "replicas: 3; gym kubectl get pods -n treino")
checar("3. os pods têm a label app: web", d["spec"].get("template", {}).get("metadata", {}).get("labels", {}).get("app") == "web",
       "spec.template.metadata.labels: app: web")
rc, saida = k8s("get", "service", "web", "-n", "treino", "-o", "json")
s = json.loads(saida) if rc == 0 else {"spec": {}}
checar("3. o service web escolhe app: web na porta 80",
       s["spec"].get("selector", {}).get("app") == "web" and any(p.get("port") == 80 for p in s["spec"].get("ports", [])),
       "spec.selector: app: web; ports: - port: 80")
rc, saida = k8s("get", "endpoints", "web", "-n", "treino", "-o", "json")
enderecos = sum(len(x.get("addresses", [])) for x in json.loads(saida).get("subsets", [])) if rc == 0 else 0
checar(f"4. o service tem 3 pods como destino ({enderecos})", enderecos == 3, "o selector casa com as labels dos pods?")
checar("4. endpoints.txt tem os endpoints", "web" in ler("endpoints.txt") and ":80" in ler("endpoints.txt"),
       "gym kubectl get endpoints web -n treino > endpoints.txt")
checar("5. pods.txt mostra 3 pods web", ler("pods.txt").count("web-") >= 3, "apague um pod e liste de novo: o deployment cria outro")
env = {e["name"]: e.get("value") for c in d["spec"].get("template", {}).get("spec", {}).get("containers", []) for e in c.get("env", [])}
checar("6. o deployment tem VERSAO=2", env.get("VERSAO") == "2", "gym kubectl set env deployment/web VERSAO=2 -n treino")
h = ler("historico.txt")
checar("6. historico.txt mostra pelo menos duas revisões", "REVISION" in h and len([l for l in h.splitlines() if l.strip()[:1].isdigit()]) >= 2,
       "gym kubectl rollout history deployment/web -n treino > historico.txt")
