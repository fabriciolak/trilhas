# Treino de PromQL: sobe a loja e o Prometheus (projeto treino-obs), do zero.
compose = str(oficina / "obs" / "compose.yaml")
docker("compose", "-f", compose, "down", "-v", "--remove-orphans")
docker("compose", "-f", compose, "up", "-d")
