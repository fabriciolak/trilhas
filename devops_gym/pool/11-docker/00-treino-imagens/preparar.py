# Treino de imagens: começa sem o container e as imagens do treino.
docker("rm", "-f", "treino-go")
docker("rmi", "-f", "treino-go:gordo", "treino-go:1.0")
