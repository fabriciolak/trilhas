# Compose de produção: ao (re)começar, derruba o projeto de uma tentativa anterior,
# com volumes e redes.
rc, saida = docker("ps", "-aq", "--filter", "label=com.docker.compose.project=gym-producao")
if saida:
    docker("rm", "-f", *saida.split())
rc, saida = docker("network", "ls", "-q", "--filter", "label=com.docker.compose.project=gym-producao")
if saida:
    docker("network", "rm", *saida.split())
docker("volume", "rm", "-f", "gym-producao_dados")
