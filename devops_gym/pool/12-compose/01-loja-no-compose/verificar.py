# Loja no Compose: arquivo válido, três serviços de pé, página contando e volume no cache.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json
import re

compose = str(oficina / "loja" / "compose.yaml")
rc, saida = docker("compose", "-f", compose, "config", "-q")
checar("o compose.yaml é válido", rc == 0, f"docker compose config: {saida[:160]}")

rc, saida = docker("ps", "--filter", "label=com.docker.compose.project=gym-loja",
                   "--format", '{{.Label "com.docker.compose.service"}}')
rodando = set(saida.split()) if rc == 0 else set()
for servico in ("web", "api", "cache"):
    checar(f"o serviço {servico} está rodando", servico in rodando, "docker compose ps; docker compose logs " + servico)

status1, corpo1 = http("http://localhost:8282/")
status2, corpo2 = http("http://localhost:8282/")
checar("http://localhost:8282 responde 200", status1 == 200, f"resposta: {status1} {corpo1[:120]}")
n1 = re.search(r"visita número (\d+)", corpo1)
n2 = re.search(r"visita número (\d+)", corpo2)
checar("a contagem aumenta a cada acesso", bool(n1 and n2 and int(n2.group(1)) == int(n1.group(1)) + 1),
       "a api guarda a contagem no cache (Redis)")

rc, saida = docker("ps", "-q", "--filter", "label=com.docker.compose.project=gym-loja",
                   "--filter", "label=com.docker.compose.service=api")
if saida:
    rc, info = docker("inspect", saida.split()[0])
    env = json.loads(info)[0]["Config"].get("Env") or [] if rc == 0 else []
    checar("a api encontra o cache pelo nome do serviço", "REDIS_HOST=cache" in env,
           "dentro do container, localhost é ele mesmo; o Redis é o serviço 'cache'")
rc, saida = docker("ps", "-q", "--filter", "label=com.docker.compose.project=gym-loja",
                   "--filter", "label=com.docker.compose.service=cache")
if saida:
    rc, info = docker("inspect", saida.split()[0])
    montagens = json.loads(info)[0].get("Mounts", []) if rc == 0 else []
    checar("o cache guarda /data num volume nomeado", any(m["Type"] == "volume" and m["Destination"] == "/data"
                                                           and m.get("Name") == "gym-loja_dados-redis" for m in montagens),
           "volumes: - dados-redis:/data (é uma lista: tem traço)")
