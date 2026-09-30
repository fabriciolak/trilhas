# Pod em CrashLoopBackOff: os dois deployments disponíveis, consertados nos arquivos.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina, k8s, k3s_ligar.
import json

rc, _ = k8s("get", "namespace", "vitrine")
checar("o cluster está ligado e o namespace vitrine existe", rc == 0, "gym k8s start; ou recomece o ticket com [r]")

def deployment(nome):
    rc, saida = k8s("get", "deployment", nome, "-n", "vitrine", "-o", "json")
    return json.loads(saida) if rc == 0 else None

for nome in ("vitrine", "catalogo"):
    d = deployment(nome)
    pronto = bool(d) and d["status"].get("availableReplicas", 0) >= d["spec"].get("replicas", 1)
    checar(f"o deployment {nome} está disponível", pronto,
           f"gym kubectl -n vitrine describe pod -l app={nome}  (eventos) e  logs --previous")

d = deployment("vitrine")
if d:
    imagem = d["spec"]["template"]["spec"]["containers"][0]["image"]
    checar(f"a vitrine usa uma imagem que existe ({imagem})", imagem == "nginx:1.30-alpine",
           "o evento Failed diz qual imagem não foi encontrada")
d = deployment("catalogo")
if d:
    env = {e["name"]: e.get("value", "") for e in d["spec"]["template"]["spec"]["containers"][0].get("env", [])}
    checar("o catálogo recebe BANCO_URL", env.get("BANCO_URL") == "postgres://catalogo@banco:5432/catalogo",
           "env: - name: BANCO_URL  value: ...  no container do Deployment")

k8s_dir = oficina / "k8s"
checar("o conserto da vitrine está no arquivo", "nginx:1.30-alpine" in (k8s_dir / "vitrine.yaml").read_text(encoding="utf-8"),
       "corrija k8s/vitrine.yaml e reaplique, em vez de editar direto no cluster")
checar("o conserto do catálogo está no arquivo", "BANCO_URL" in (k8s_dir / "catalogo.yaml").read_text(encoding="utf-8"),
       "corrija k8s/catalogo.yaml e reaplique")
relatorio = oficina / "relatorio.txt"
texto = relatorio.read_text(encoding="utf-8") if relatorio.exists() else ""
checar("relatorio.txt tem o motivo da vitrine (ImagePullBackOff/ErrImagePull)",
       "ImagePullBackOff" in texto or "ErrImagePull" in texto, "o STATUS do get pods e os eventos do describe")
checar("relatorio.txt tem o motivo do catálogo (CrashLoopBackOff e o erro do log)",
       "CrashLoopBackOff" in texto and "BANCO_URL" in texto, "kubectl logs --previous mostra o que o container disse ao morrer")
