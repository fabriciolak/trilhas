# Loja no Compose: uma solução possível

Na pasta `loja/` da oficina (onde está o `compose.yaml`).

## 1. Validar

```
docker compose config
```

Dois erros de escrita, um de cada vez:

- `additional properties 'depends-on' not allowed`: o nome da opção é `depends_on`,
  com sublinhado.
- `volumes must be a array` (no serviço `cache`): em YAML, uma lista começa com `-`.
  O certo é `- dados-redis:/data`.

## 2. Subir

```
docker compose up -d
```

Falha ao baixar `redis:8-alpinee` ("not found"/"manifest unknown"): erro de digitação
na tag. O certo é `redis:8-alpine`.

## 3. De pé, mas não funciona

```
docker compose ps
curl -i http://localhost:8282        (ou o navegador)
```

**Problema A: seu computador → web.** A porta publicada é `8282:8080`, mas o nginx
escuta na **80** dentro do container (veja `web/nginx.conf`). O certo é `"8282:80"`.

**Problema B: api → cache.** A página dá erro 500, e o log conta:

```
docker compose logs api
```

`erro ao falar com o cache em localhost:6379: Connection refused`. Dentro do container
da api, `localhost` é **a própria api**. Os serviços se acham pelo nome, na rede que o
Compose cria: `REDIS_HOST: cache`.

O `compose.yaml` consertado:

```
name: gym-loja

services:
  web:
    image: nginx:1.30-alpine
    ports:
      - "8282:80"
    volumes:
      - ./web/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api

  api:
    build: ./api
    environment:
      REDIS_HOST: cache
      REDIS_PORT: "6379"
    depends_on:
      - cache

  cache:
    image: redis:8-alpine
    volumes:
      - dados-redis:/data

volumes:
  dados-redis:
```

```
docker compose up -d        (o Compose recria só o que mudou)
```

## 4. Provar

Recarregue `http://localhost:8282` algumas vezes: `visita número 1`, `2`, `3`...

## 5. Derrubar e subir de novo

```
docker compose down          (remove containers e rede; o volume fica)
docker compose up -d
```

A contagem continua: ela mora no volume `gym-loja_dados-redis`, não no container.
Com `docker compose down -v`, o volume iria junto (e a contagem, e num caso real, o banco).
