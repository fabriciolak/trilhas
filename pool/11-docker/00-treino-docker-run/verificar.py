# Treino de docker run: o container web (porta, pasta, restart), exec, logs, --rm com -e,
# volume nomeado e limpeza.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json


def ler(nome: str) -> str:
    arquivo = oficina / nome
    return arquivo.read_text(encoding="utf-8", errors="replace") if arquivo.exists() else ""


rc, saida = docker("inspect", "treino-web")
c = json.loads(saida)[0] if rc == 0 else {}
checar("1. o treino-web existe e está rodando", c.get("State", {}).get("Running", False), "docker run -d --name treino-web ...")
checar("1. usa nginx:1.30-alpine", c.get("Config", {}).get("Image") == "nginx:1.30-alpine", "a imagem é nginx:1.30-alpine")
portas = (c.get("HostConfig", {}).get("PortBindings") or {}).get("80/tcp") or []
checar("1. a porta 8585 vai para a 80 do container", any(p.get("HostPort") == "8585" for p in portas), "-p 8585:80")
montagens = [m for m in c.get("Mounts", []) if m.get("Destination") == "/usr/share/nginx/html"]
checar("2. site/ montada em /usr/share/nginx/html, só leitura",
       bool(montagens) and montagens[0]["Type"] == "bind" and not montagens[0].get("RW", True),
       '-v "${PWD}/site:/usr/share/nginx/html:ro"')
status, corpo = http("http://localhost:8585/")
checar("2. http://localhost:8585 mostra a página da pasta", status == 200 and "Treino de Docker" in corpo, f"resposta: {status}")
checar("2. volta sozinho se o Docker reiniciar", c.get("HostConfig", {}).get("RestartPolicy", {}).get("Name") == "unless-stopped",
       "--restart unless-stopped")
checar("3. versao-nginx.txt tem a versão (nginx/1.30...)", "nginx/1.30" in ler("versao-nginx.txt"),
       "docker exec treino-web nginx -v 2> versao-nginx.txt")
checar("4. logs.txt tem linhas do log de acesso", "GET /" in ler("logs.txt"), "docker logs --tail 5 treino-web > logs.txt 2>&1")
checar("5. saudacao.txt diz oi", ler("saudacao.txt").strip() == "oi",
       "docker run --rm -e SAUDACAO=oi alpine:3.24 sh -c 'echo $SAUDACAO' > saudacao.txt")
rc, _ = docker("volume", "inspect", "treino-dados")
checar("6. o volume treino-dados existe", rc == 0, "docker volume create treino-dados")
rc, conteudo = docker("run", "--rm", "-v", "treino-dados:/dados:ro", "alpine:3.24", "cat", "/dados/prova.txt")
checar("6. o volume guarda /dados/prova.txt com 'persistiu'", rc == 0 and conteudo.strip() == "persistiu",
       "docker run --rm -v treino-dados:/dados alpine:3.24 sh -c 'echo persistiu > /dados/prova.txt'")
checar("6. volume.txt tem o que o segundo container leu", ler("volume.txt").strip() == "persistiu",
       "docker run --rm -v treino-dados:/dados alpine:3.24 cat /dados/prova.txt > volume.txt")
rc, _ = docker("inspect", "treino-velho")
checar("7. o treino-velho foi apagado", rc != 0, "docker ps -a; docker rm treino-velho")
