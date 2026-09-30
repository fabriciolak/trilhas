# Treino de configuração: ConfigMap, Secret fora dos arquivos, env/volume, recursos, probes,
# rollout depois da mudança e a senha decodificada.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina, k8s.
import json

NS = ("-n", "treino-config")
SENHA = "s3nh4-do-treino"


def ler(nome: str) -> str:
    arquivo = oficina / nome
    return arquivo.read_text(encoding="utf-8", errors="replace") if arquivo.exists() else ""


rc, saida = k8s("get", "configmap", "app-config", *NS, "-o", "json")
dados = json.loads(saida).get("data", {}) if rc == 0 else {}
checar("1. o ConfigMap app-config tem a mensagem.txt", "Bem-vindo ao treino" in dados.get("mensagem.txt", ""),
       "data: mensagem.txt: | (bloco de texto)")
checar("6. a COR no ConfigMap é verde", dados.get("COR") == "verde", "troque no arquivo e aplique")
rc, saida = k8s("get", "secret", "app-segredo", *NS, "-o", "json")
checar("2. o Secret app-segredo tem a chave SENHA", rc == 0 and "SENHA" in json.loads(saida).get("data", {}),
       "gym kubectl create secret generic app-segredo -n treino-config --from-literal=SENHA=...")
arquivos = "\n".join(p.read_text(encoding="utf-8") for p in (oficina / "k8s").glob("*.y*ml"))
checar("2. a senha não está em nenhum arquivo de k8s/", SENHA not in arquivos, "o Secret nasce na linha de comando")
rc, saida = k8s("get", "deployment", "app", *NS, "-o", "json")
d = json.loads(saida) if rc == 0 else {"spec": {"template": {"spec": {"containers": [{}], "volumes": []}}}, "status": {}}
pod = d["spec"]["template"]["spec"]
c = pod["containers"][0]
env = {e["name"]: e.get("valueFrom", {}) for e in c.get("env", [])}
checar("3. COR vem do ConfigMap app-config", env.get("COR", {}).get("configMapKeyRef", {}) == {"name": "app-config", "key": "COR"},
       "valueFrom: configMapKeyRef: name: app-config, key: COR")
checar("3. SENHA vem do Secret app-segredo", env.get("SENHA", {}).get("secretKeyRef", {}) == {"name": "app-segredo", "key": "SENHA"},
       "valueFrom: secretKeyRef: name: app-segredo, key: SENHA")
volumes = {v["name"]: v.get("configMap", {}).get("name") for v in pod.get("volumes", [])}
montados = {m["name"]: m["mountPath"] for m in c.get("volumeMounts", [])}
checar("3. o ConfigMap app-config está montado em /config",
       any(volumes.get(nome) == "app-config" and caminho == "/config" for nome, caminho in montados.items()),
       "um volume configMap app-config e um volumeMount em /config")
r = c.get("resources", {})
checar("4. requests de CPU 50m e memória 32Mi", r.get("requests", {}).get("cpu") == "50m" and r.get("requests", {}).get("memory") == "32Mi",
       "resources: requests: cpu: 50m, memory: 32Mi")
checar("4. limits de memória 64Mi", r.get("limits", {}).get("memory") == "64Mi", "resources: limits: memory: 64Mi")
pronto, vivo = c.get("readinessProbe", {}).get("httpGet", {}), c.get("livenessProbe", {}).get("httpGet", {})
checar("5. readinessProbe em /pronto:8080", pronto.get("path") == "/pronto" and str(pronto.get("port")) == "8080", "")
checar("5. livenessProbe em /saude:8080", vivo.get("path") == "/saude" and str(vivo.get("port")) == "8080", "")
checar("5. o deployment está disponível", d["status"].get("availableReplicas", 0) >= 1, "gym kubectl describe pod -n treino-config")
rc, saida = k8s("get", "pods", *NS, "-l", "app=app", "-o", "json")
pods = [p["metadata"]["name"] for p in (json.loads(saida).get("items", []) if rc == 0 else [])
        if not p["metadata"].get("deletionTimestamp") and p["status"].get("phase") == "Running"]
cores, mensagens = [], []
for p in pods:
    rc, v = k8s("exec", *NS, p, "--", "printenv", "COR")
    cores.append(v.strip() if rc == 0 else "?")
    rc, v = k8s("exec", *NS, p, "--", "cat", "/config/mensagem.txt")
    mensagens.append(rc == 0 and "Bem-vindo" in v)
checar(f"6. os pods rodando usam a cor verde ({', '.join(cores) or 'nenhum pod'})", bool(cores) and set(cores) == {"verde"},
       "gym kubectl rollout restart deployment/app -n treino-config")
checar("3. /config/mensagem.txt existe dentro do pod", bool(mensagens) and all(mensagens), "o volume do ConfigMap")
checar("7. senha.txt tem a senha decodificada", ler("senha.txt").strip() == SENHA,
       "gym kubectl get secret app-segredo -n treino-config -o jsonpath='{.data.SENHA}' | base64 -d > senha.txt")
