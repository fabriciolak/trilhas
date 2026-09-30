# Treino de Compose: uma solução possível (roda na pasta da oficina do treino).
cat > compose.yaml <<'YAML'
name: treino-compose

services:
  web:
    image: nginx:1.30-alpine
    ports:
      - "8888:80"
    volumes:
      - ./site:/usr/share/nginx/html:ro
      - ./web/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api

  api:
    build: ./api
    environment:
      REDIS_HOST: cache
    depends_on:
      - cache

  cache:
    image: redis:8-alpine
    volumes:
      - dados:/data

volumes:
  dados:
YAML
docker compose config -q
docker compose up -d --build
sleep 2
curl -s http://localhost:8888/api/visita; curl -s http://localhost:8888/api/visita; echo
docker compose ps > estado.txt
docker compose logs api > logs-api.txt
docker compose down
docker compose up -d
sleep 2
docker compose exec -T cache redis-cli get visitas > visitas.txt
cat visitas.txt
