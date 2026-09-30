# Treino de Compose: três serviços, volume, proxy do web para a api, contagem persistente.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json
import re


def ler(nome: str) -> str:
    arquivo = oficina / nome
    return arquivo.read_text(encoding="utf-8", errors="replace") if arquivo.exists() else ""


arquivo = oficina / "compose.yaml"
rc, saida = docker("compose", "-f", str(arquivo), "config", "--format", "json")
checar("o compose.yaml existe e é válido", rc == 0, f"docker compose config: {saida[:160]}")
config = json.loads(saida) if rc == 0 else {}
servicos = config.get("services", {})
checar("o projeto se chama treino-compose", config.get("name") == "treino-compose", "name: treino-compose")


def conteiner(servico: str) -> dict:
    rc, ids = docker("ps", "-q", "--filter", "label=com.docker.compose.project=treino-compose",
                     "--filter", f"label=com.docker.compose.service={servico}")
    if rc != 0 or not ids:
        return {}
    rc, info = docker("inspect", ids.split()[0])
    return json.loads(info)[0] if rc == 0 else {}


web, cache, api = conteiner("web"), conteiner("cache"), conteiner("api")
checar("1. o web está rodando com nginx:1.30-alpine", web.get("Config", {}).get("Image") == "nginx:1.30-alpine", "docker compose ps")
status, corpo = http("http://localhost:8888/")
checar("1. http://localhost:8888 mostra a página da pasta site/", status == 200 and "Treino de Compose" in corpo, f"resposta: {status}")
site = [m for m in web.get("Mounts", []) if m.get("Destination") == "/usr/share/nginx/html"]
checar("1. site/ montada só para leitura", bool(site) and not site[0].get("RW", True), "- ./site:/usr/share/nginx/html:ro")
checar("2. o cache está rodando com redis:8-alpine", cache.get("Config", {}).get("Image") == "redis:8-alpine", "")
checar("2. /data do cache é o volume nomeado dados",
       any(m["Type"] == "volume" and m["Destination"] == "/data" and m.get("Name") == "treino-compose_dados" for m in cache.get("Mounts", [])),
       "volumes: - dados:/data (e declare o volume no fim do arquivo)")
checar("3. a api é construída de ./api", bool(servicos.get("api", {}).get("build")), "build: ./api")
env = dict(e.split("=", 1) for e in api.get("Config", {}).get("Env") or [] if "=" in e)
checar("3. a api acha o Redis pelo nome do serviço", env.get("REDIS_HOST") == "cache", "environment: REDIS_HOST: cache")
s1, c1 = http("http://localhost:8888/api/visita")
s2, c2 = http("http://localhost:8888/api/visita")
n1, n2 = re.search(r'"visita": (\d+)', c1), re.search(r'"visita": (\d+)', c2)
checar("4. /api/visita pelo web conta, e conta de 1 em 1", bool(n1 and n2) and int(n2.group(1)) == int(n1.group(1)) + 1,
       f"respostas: {s1} {c1[:60]} / {s2} {c2[:60]}")
checar("5. estado.txt tem os três serviços", all(s in ler("estado.txt") for s in ("web", "api", "cache")), "docker compose ps > estado.txt")
checar("5. logs-api.txt tem o log da api", "ouvindo na 8000" in ler("logs-api.txt"), "docker compose logs api > logs-api.txt")
v = ler("visitas.txt").strip()
checar("6. visitas.txt tem a contagem lida no Redis, depois de derrubar e subir", v.isdigit() and int(v) >= 2,
       "docker compose down; docker compose up -d; docker compose exec cache redis-cli get visitas > visitas.txt")
