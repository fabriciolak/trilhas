# Site da campanha: confere o container gym-campanha pelo docker inspect e pelo HTTP.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json

rc, saida = docker("inspect", "gym-campanha")
checar("o container gym-campanha existe", rc == 0, "docker run ... --name gym-campanha ...")
if rc == 0:
    c = json.loads(saida)[0]
    imagem = c["Config"]["Image"]
    checar(f"usa nginx 1.30 alpine ({imagem})", "nginx" in imagem and "1.30" in imagem and "alpine" in imagem,
           "a imagem é nginx:1.30-alpine")
    checar("está rodando", c["State"]["Running"], "docker ps -a; docker logs gym-campanha")
    portas = (c["HostConfig"].get("PortBindings") or {}).get("80/tcp") or []
    checar("a porta 8181 do computador vai para a 80 do container", any(p.get("HostPort") == "8181" for p in portas),
           "-p 8181:80")
    montagens = [m for m in c.get("Mounts", []) if m.get("Destination") == "/usr/share/nginx/html"]
    checar("a pasta site/ está montada em /usr/share/nginx/html", montagens and montagens[0]["Type"] == "bind",
           "-v <caminho da oficina>/site:/usr/share/nginx/html:ro  (bind mount, não COPY)")
    checar("a montagem é só leitura", montagens and not montagens[0].get("RW", True), "acrescente :ro no fim do -v")
    checar("política de reinício unless-stopped", c["HostConfig"]["RestartPolicy"]["Name"] == "unless-stopped",
           "--restart unless-stopped")
    ambiente = c["Config"].get("Env") or []
    checar("as variáveis de campanha.env chegaram ao container", "CAMPANHA_CUPOM=PINGUIM50" in ambiente,
           "--env-file campanha.env")

status, corpo = http("http://localhost:8181/")
checar("http://localhost:8181 responde 200", status == 200, f"resposta: {status} {corpo[:80]}")
checar("a página mostra a campanha", "Black Friday Pinguim" in corpo, "a página vem de site/index.html")
checar("a edição no seu computador aparece no site: (no ar)", "(no ar)" in corpo,
       "edite site/index.html na oficina; com bind mount não precisa recriar o container")
