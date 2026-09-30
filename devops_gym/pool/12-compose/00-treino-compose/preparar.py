# Treino de Compose: começa sem o projeto de uma tentativa anterior (volume incluído).
rc, saida = docker("ps", "-aq", "--filter", "label=com.docker.compose.project=treino-compose")
if saida:
    docker("rm", "-f", *saida.split())
docker("network", "rm", "treino-compose_default")
docker("volume", "rm", "-f", "treino-compose_dados")
