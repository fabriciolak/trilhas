#!/usr/bin/env bash
# Loja no Compose: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
cd loja
docker compose config -q || true
sed -i 's/^    depends-on:$/    depends_on:/' compose.yaml
sed -i 's|^      dados-redis:/data$|      - dados-redis:/data|' compose.yaml
sed -i 's/redis:8-alpinee/redis:8-alpine/' compose.yaml
sed -i 's/"8282:8080"/"8282:80"/' compose.yaml
sed -i 's/REDIS_HOST: localhost/REDIS_HOST: cache/' compose.yaml
docker compose config -q
docker compose up -d --build --quiet-pull 2>&1 | tail -n 3
for _ in $(seq 1 20); do curl -fs http://localhost:8282/ && break; sleep 1; done
docker compose down
docker compose up -d 2>&1 | tail -n 3
for _ in $(seq 1 20); do curl -fs http://localhost:8282/ && break; sleep 1; done
