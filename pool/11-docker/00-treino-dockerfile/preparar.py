# Treino de Dockerfile: começa sem os containers e as imagens do treino.
docker("rm", "-f", "treino-app", "treino-app-en")
docker("rmi", "-f", "treino-app:1.0", "treino-app:1.1", "treino-app:estavel")
