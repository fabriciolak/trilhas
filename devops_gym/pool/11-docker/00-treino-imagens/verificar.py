# Treino de imagens: history, gorda x magra (multi-stage, não root), container, save.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json
import tarfile


def ler(nome: str) -> str:
    arquivo = oficina / nome
    return arquivo.read_text(encoding="utf-8", errors="replace") if arquivo.exists() else ""


def imagem(tag: str) -> dict:
    rc, saida = docker("image", "inspect", tag)
    return json.loads(saida)[0] if rc == 0 else {}


checar("1. camadas.txt tem o histórico da python:3.14-alpine", "CREATED" in ler("camadas.txt") and "CMD" in ler("camadas.txt"),
       "docker history python:3.14-alpine > camadas.txt")
gorda, magra = imagem("treino-go:gordo"), imagem("treino-go:1.0")
checar("2. treino-go:gordo existe", bool(gorda), "docker build -f go/Dockerfile.gordo -t treino-go:gordo go/")
texto = (oficina / "go" / "Dockerfile").read_text(encoding="utf-8") if (oficina / "go" / "Dockerfile").exists() else ""
checar("3. go/Dockerfile tem duas etapas", texto.upper().count("FROM ") >= 2 and "--from" in texto.lower(),
       "FROM golang... AS construcao / FROM alpine:3.24 / COPY --from=construcao")
tamanho = magra.get("Size", 0)
checar(f"3. treino-go:1.0 tem menos de 25 MB ({tamanho / 1e6:.1f} MB)", 0 < tamanho < 25_000_000,
       "só o binário vai para a etapa final")
checar("3. treino-go:1.0 não roda como root", magra.get("Config", {}).get("User", "") not in ("", "root", "0", "0:0"),
       "USER nobody (alpine) ou USER 65534 (scratch)")
status, corpo = http("http://localhost:8787/")
checar("4. treino-go responde na 8787", status == 200 and corpo.startswith("Olá do Go"), f"resposta: {status} {corpo[:60]}")
rc, saida = docker("inspect", "treino-go")
checar("4. o container treino-go usa a 1.0", rc == 0 and json.loads(saida)[0]["Config"]["Image"] == "treino-go:1.0",
       "docker run -d --name treino-go -p 8787:8080 treino-go:1.0")
t = ler("tamanhos.txt")
checar("5. tamanhos.txt lista as duas imagens com o tamanho", "gordo" in t and "1.0" in t and "MB" in t,
       "docker images treino-go > tamanhos.txt")
arquivo = oficina / "treino-go.tar"
try:
    with tarfile.open(arquivo) as tar:
        nomes = tar.getnames()
except (OSError, tarfile.TarError):
    nomes = []
checar("6. treino-go.tar é uma imagem exportada", "manifest.json" in nomes, "docker save treino-go:1.0 -o treino-go.tar")
