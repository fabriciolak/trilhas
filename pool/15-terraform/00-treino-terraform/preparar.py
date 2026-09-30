# Treino de Terraform: começa sem os containers de uma tentativa anterior.
docker("rm", "-f", "treino-tf-web", "treino-tf-worker-a", "treino-tf-worker-b", "treino-tf-worker-c")
