# Container que morre: imagem 1.1 construída, container de pé, fuso configurado sem mexer
# na validação do script. Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json
import time

rc, _ = docker("image", "inspect", "gym-relogio:1.1")
checar("a imagem gym-relogio:1.1 existe", rc == 0, "docker build -t gym-relogio:1.1 relogio/")

script = (oficina / "relogio" / "relogio.sh").read_text(encoding="utf-8")
checar("o script continua validando a variável FUSO", "FUSO:?" in script,
       "o problema é de configuração: passe a variável, não tire a validação")

rc, saida = docker("inspect", "gym-relogio")
checar("o container gym-relogio existe", rc == 0, "docker run -d --name gym-relogio ...")
if rc == 0:
    c = json.loads(saida)[0]
    checar("usa a imagem gym-relogio:1.1", c["Config"]["Image"] == "gym-relogio:1.1", "remova o antigo e rode com a 1.1")
    checar("está rodando", c["State"]["Running"], "docker ps -a; docker logs gym-relogio")
    politica = c["HostConfig"]["RestartPolicy"]["Name"]
    checar(f"tem política de reinício ({politica or 'nenhuma'})", politica in ("on-failure", "always", "unless-stopped"),
           "--restart on-failure (ou unless-stopped)")
    checar("a variável FUSO chegou ao container", "FUSO=America/Sao_Paulo" in (c["Config"].get("Env") or []),
           "-e FUSO=America/Sao_Paulo (ou ENV no Dockerfile)")
    time.sleep(6)
    rc, saida = docker("inspect", "gym-relogio")
    c = json.loads(saida)[0] if rc == 0 else {"State": {"Running": False}, "RestartCount": 0}
    checar("continua de pé alguns segundos depois, sem reiniciar", c["State"]["Running"] and c.get("RestartCount", 0) == 0,
           "se o RestartCount sobe, ele está morrendo e voltando")
    rc, logs = docker("logs", "--tail", "5", "gym-relogio")
    checar("o log mostra o relógio com o fuso", "relógio da loja (America/Sao_Paulo)" in logs, f"log atual: {logs[-120:]}")
