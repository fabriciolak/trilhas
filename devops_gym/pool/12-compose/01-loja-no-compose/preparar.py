# Loja no Compose: ao (re)começar, derruba o projeto de uma tentativa anterior,
# inclusive o volume (a contagem recomeça do zero).
rc, saida = docker("ps", "-aq", "--filter", "label=com.docker.compose.project=gym-loja")
if saida:
    docker("rm", "-f", *saida.split())
docker("volume", "rm", "-f", "gym-loja_dados-redis")
docker("network", "rm", "gym-loja_default")
