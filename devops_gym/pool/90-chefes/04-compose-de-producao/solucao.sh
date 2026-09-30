# Compose de produção: uma solução possível (veja também solucao.md).
cd producao
docker compose config -q && docker compose up -d --build     # sobe, mas web e api caem
docker compose ps -a
docker compose logs web | tail -n 3    # "server" directive is not allowed here
docker compose logs api | tail -n 3    # can't open file '/srv/app.py'

cat > api/Dockerfile <<'DOCKERFILE'
FROM python:3.14-alpine
WORKDIR /app
COPY app.py .
USER nobody
EXPOSE 8000
CMD ["python", "-u", "app.py"]
DOCKERFILE

# Senha nova no .env (o Compose lê sozinho da pasta do projeto) e fora do Git.
printf 'SENHA_ADMIN=%s\n' "$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 24)" > .env
echo ".env" >> .gitignore

cat > compose.yaml <<'YAML'
# Loja da Pinguim em produção: um servidor só, tudo no Compose.
name: gym-producao

x-logs: &logs
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

services:
  web:
    image: nginx:1.30-alpine
    ports:
      - "8383:80"
    volumes:
      - ./web/loja.conf:/etc/nginx/conf.d/default.conf:ro
    networks: [frente]
    depends_on:
      - api
    restart: unless-stopped
    logging: *logs

  api:
    build: ./api
    image: gym-producao-api:1.0
    environment:
      REDIS_HOST: cache
      SENHA_ADMIN: ${SENHA_ADMIN:?defina SENHA_ADMIN no .env}
    networks: [frente, fundos]
    depends_on:
      cache:
        condition: service_healthy
    mem_limit: 128m
    restart: unless-stopped
    logging: *logs

  cache:
    image: redis:8-alpine
    volumes:
      - dados:/data
    networks: [fundos]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 2s
      retries: 5
    restart: unless-stopped
    logging: *logs

networks:
  frente:
  fundos:

volumes:
  dados:
YAML

docker compose config -q
docker compose up -d --build --remove-orphans --wait
docker compose ps
curl -s http://localhost:8383/; curl -s http://localhost:8383/api/saude; echo
senha=$(sed -n 's/^SENHA_ADMIN=//p' .env)
curl -s -H "X-Senha: $senha" http://localhost:8383/api/admin; echo
curl -s -H "X-Senha: pinguim123" http://localhost:8383/api/admin; echo
