# Imagem gigante: magra < 30 MB, multi-stage, .dockerignore, usuário não-root e funcionando.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json
import time

rc, _ = docker("image", "inspect", "gym-catalogo:gorda")
checar("a imagem gym-catalogo:gorda foi construída (para comparar)", rc == 0, "docker build -t gym-catalogo:gorda catalogo/  (antes de mexer)")

dockerfile = (oficina / "catalogo" / "Dockerfile").read_text(encoding="utf-8")
etapas = [l for l in dockerfile.splitlines() if l.strip().upper().startswith("FROM ")]
checar(f"o Dockerfile tem mais de uma etapa ({len(etapas)} FROM)", len(etapas) >= 2, "multi-stage: FROM ... AS construcao / FROM ...")
ignore = oficina / "catalogo" / ".dockerignore"
checar("existe um .dockerignore que deixa dados/ de fora", ignore.exists() and "dados" in ignore.read_text(encoding="utf-8"),
       "crie catalogo/.dockerignore com a linha: dados/")

rc, saida = docker("image", "inspect", "gym-catalogo:magra")
checar("a imagem gym-catalogo:magra existe", rc == 0, "docker build -t gym-catalogo:magra catalogo/")
if rc == 0:
    img = json.loads(saida)[0]
    mb = img["Size"] / 1_000_000
    checar(f"a magra tem menos de 30 MB ({mb:.1f} MB)", mb < 30, "etapa final em alpine, scratch ou distroless, só com o binário")
    usuario = (img["Config"].get("User") or "").strip()
    checar(f"roda como usuário não-root ({usuario or 'root'})", usuario not in ("", "root", "0", "0:0", "root:root"),
           "USER no fim do Dockerfile (ex.: USER 10001, ou crie um usuário na etapa final)")
    docker("rm", "-f", "gym-catalogo-verificacao")
    rc, _ = docker("run", "-d", "--name", "gym-catalogo-verificacao", "-p", "18383:8080", "gym-catalogo:magra")
    status, corpo = 0, ""
    for _ in range(20):
        time.sleep(0.5)
        status, corpo = http("http://localhost:18383/saude")
        if status == 200:
            break
    checar("a magra funciona: /saude responde ok", status == 200 and '"ok"' in corpo, f"resposta: {status} {corpo[:80]}")
    docker("rm", "-f", "gym-catalogo-verificacao")
