# Treino de Dockerfile: imagem 1.0 bem feita (sem segredos, sem root), containers com e sem
# -e, e a 1.1 com duas tags.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json


def imagem(tag: str) -> dict:
    rc, saida = docker("image", "inspect", tag)
    return json.loads(saida)[0] if rc == 0 else {}


def env(info: dict) -> dict:
    return dict(e.split("=", 1) for e in info.get("Config", {}).get("Env") or [] if "=" in e)


dockerfile = oficina / "app" / "Dockerfile"
texto = dockerfile.read_text(encoding="utf-8") if dockerfile.exists() else ""
checar("1. app/Dockerfile existe e usa python:3.14-alpine", "FROM python:3.14-alpine" in texto, "FROM python:3.14-alpine")
checar("1. copia a pasta inteira (COPY . .)", any(l.split() == ["COPY", ".", "."] for l in texto.splitlines()), "COPY . .")
v10 = imagem("treino-app:1.0")
checar("3. a imagem treino-app:1.0 existe", bool(v10), "docker build -t treino-app:1.0 app/")
checar("1. /app é a pasta de trabalho", v10.get("Config", {}).get("WorkingDir") == "/app", "WORKDIR /app")
checar("1. SAUDACAO padrão 'Olá do container'", env(v10).get("SAUDACAO") == "Olá do container", 'ENV SAUDACAO="Olá do container"')
checar("1. a porta 8000 está documentada", "8000/tcp" in (v10.get("Config", {}).get("ExposedPorts") or {}), "EXPOSE 8000")
checar("1. roda como nobody", v10.get("Config", {}).get("User") == "nobody", "USER nobody")
checar("1. o comando é python -u app.py", v10.get("Config", {}).get("Cmd") == ["python", "-u", "app.py"], 'CMD ["python", "-u", "app.py"]')
if v10:
    rc, lista = docker("run", "--rm", "--entrypoint", "ls", "treino-app:1.0", "-A", "/app")
    arquivos = lista.split() if rc == 0 else []
    checar("2. a imagem tem o app.py", "app.py" in arquivos, "COPY . .")
    checar("2. segredos.env, rascunhos/ e Dockerfile ficaram fora da imagem",
           rc == 0 and not {"segredos.env", "rascunhos", "Dockerfile"} & set(arquivos),
           "app/.dockerignore com uma linha para cada um")
else:
    falha("2. a imagem 1.0 precisa existir para conferir o conteúdo", "docker build -t treino-app:1.0 app/")
status, corpo = http("http://localhost:8686/")
checar("4. treino-app responde na 8686 com a saudação padrão", status == 200 and corpo.startswith("Olá do container"),
       f"resposta: {status} {corpo[:60]}")
checar("4. e não roda como root", "(uid 0)" not in corpo and status == 200, "USER nobody")
status, corpo = http("http://localhost:8687/")
checar("5. treino-app-en responde na 8687 com Hello", status == 200 and corpo.startswith("Hello"),
       "docker run -d --name treino-app-en -p 8687:8000 -e SAUDACAO=Hello treino-app:1.0")
rc, saida = docker("inspect", "treino-app-en")
checar("5. treino-app-en usa a imagem 1.0", rc == 0 and json.loads(saida)[0]["Config"]["Image"] == "treino-app:1.0",
       "a mesma imagem; só a variável muda")
v11, estavel = imagem("treino-app:1.1"), imagem("treino-app:estavel")
checar("6. treino-app:1.1 tem a saudação nova", env(v11).get("SAUDACAO") == "Olá da versão 1.1", "mude o ENV e construa com -t treino-app:1.1")
checar("6. estavel e 1.1 são a mesma imagem", bool(v11) and v11.get("Id") == estavel.get("Id"), "docker tag treino-app:1.1 treino-app:estavel")
checar("6. a 1.0 continua com a saudação antiga", env(v10).get("SAUDACAO") == "Olá do container", "tags diferentes, imagens diferentes")
