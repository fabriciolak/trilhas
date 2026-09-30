# Compose de produção: uma solução possível

Na pasta `producao/`, na oficina.

## 1. Os dois que caem

`docker compose up -d --build` sobe, mas `docker compose ps -a` mostra `web` e `api`
saindo. Os logs contam por quê:

- `web`: `"server" directive is not allowed here in /etc/nginx/nginx.conf`. O
  `loja.conf` é um bloco `server`, que vive **dentro** do `http` do arquivo principal.
  O lugar dele é `/etc/nginx/conf.d/default.conf` (o `nginx.conf` da imagem inclui
  `conf.d/*.conf`).
- `api`: `can't open file '/srv/app.py'`. O `WORKDIR` é `/srv`, mas o `COPY` mandou o
  arquivo para `/app/`. Um `WORKDIR /app` e `COPY app.py .` resolvem.

## 2 a 6. O compose de produção

```yaml
name: gym-producao

x-logs: &logs            # âncora YAML: define uma vez, usa nos três
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

services:
  web:
    image: nginx:1.30-alpine            # versão fixa
    ports:
      - "8383:80"                       # a única porta publicada
    volumes:
      - ./web/loja.conf:/etc/nginx/conf.d/default.conf:ro
    networks: [frente]
    depends_on:
      - api
    restart: unless-stopped
    logging: *logs

  api:
    build: ./api
    image: gym-producao-api:1.0         # a imagem construída também tem versão
    environment:
      REDIS_HOST: cache
      SENHA_ADMIN: ${SENHA_ADMIN:?defina SENHA_ADMIN no .env}
    networks: [frente, fundos]
    depends_on:
      cache:
        condition: service_healthy      # espera o healthcheck do cache
    mem_limit: 128m
    restart: unless-stopped
    logging: *logs

  cache:
    image: redis:8-alpine
    volumes:
      - dados:/data
    networks: [fundos]                  # o web não chega aqui
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
```

- `.env` ao lado do compose: `SENHA_ADMIN=<24 caracteres aleatórios>`. O Compose lê o
  `.env` da pasta do projeto sozinho, e o `${SENHA_ADMIN:?...}` faz o `config` falhar se
  ele faltar. No `.gitignore`: `.env`.
- No `Dockerfile` da api: `USER nobody` (um usuário que já existe na imagem).
- Subir e esperar ficar saudável: `docker compose up -d --build --wait`.
- Prova: `curl -H "X-Senha: $(sed -n 's/^SENHA_ADMIN=//p' .env)" http://localhost:8383/api/admin`
  responde 200; com `pinguim123`, 401.

A senha ainda aparece em `docker inspect`. O próximo passo é o `secrets:` do Compose
(arquivo montado em `/run/secrets/`), que exige que a aplicação leia de arquivo.
