# Treino de docker run: começa sem os containers e o volume do treino, e com um container
# parado para apagar.
docker("rm", "-f", "treino-web", "treino-velho")
docker("volume", "rm", "-f", "treino-dados")
docker("create", "--name", "treino-velho", "alpine:3.24", "true")
