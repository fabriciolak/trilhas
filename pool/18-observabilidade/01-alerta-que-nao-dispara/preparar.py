# Alerta que não dispara: sobe a loja e o Prometheus (projeto gym-obs), do zero.
compose = str(oficina / "observabilidade" / "compose.yaml")
docker("compose", "-f", compose, "down", "-v", "--remove-orphans")
docker("compose", "-f", compose, "up", "-d")
