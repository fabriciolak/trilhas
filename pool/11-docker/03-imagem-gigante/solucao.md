# Imagem gigante: uma solução possível

Na pasta da oficina.

## 1. A gorda, e de onde vem o peso

```
docker build -t gym-catalogo:gorda catalogo/
docker images gym-catalogo
docker history gym-catalogo:gorda
```

O `docker history` mostra as camadas: a base `golang:1.27-alpine` (o compilador
inteiro, centenas de MB) e o `COPY . .`, que levou junto `dados/backup-catalogo.sql`
(~120 MB). Em produção não precisa de nenhum dos dois: só do binário.

## 2. O Dockerfile novo

`catalogo/.dockerignore` (o que NÃO vai para o contexto do build):

```
dados/
docs/
*.md
.git
.env
```

`catalogo/Dockerfile`:

```
# Etapa 1: compilar. Tem o Go inteiro, mas não vai para produção.
FROM golang:1.27-alpine AS construcao
WORKDIR /src
COPY go.mod ./
COPY main.go ./
# CGO_ENABLED=0 gera um binário estático (não depende de bibliotecas do sistema).
# -ldflags "-s -w" tira símbolos de depuração: o binário fica menor.
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /catalogo .

# Etapa 2: rodar. Só o binário, sobre uma base mínima.
FROM alpine:3.24
RUN adduser -D -H -u 10001 catalogo
COPY --from=construcao /catalogo /usr/local/bin/catalogo
USER catalogo
EXPOSE 8080
CMD ["catalogo"]
```

```
docker build -t gym-catalogo:magra catalogo/
```

Copiar primeiro o `go.mod` e depois o código aproveita o cache: se só o código mudar,
a camada de dependências não é refeita (num projeto com dependências, entraria aqui um
`RUN go mod download`).

Dá para ir além: `FROM scratch` (imagem vazia, só o binário: uns 6 MB, mas sem shell
para depurar) ou `gcr.io/distroless/static` (sem shell, com certificados e usuário
`nonroot`).

## 3. Provar

```
docker run -d --name gym-catalogo-teste -p 8080:8080 gym-catalogo:magra
curl http://localhost:8080/saude          (ou abra no navegador)
docker rm -f gym-catalogo-teste
```

## 4. Comparar

```
docker images gym-catalogo
```

De algumas centenas de MB para perto de 20 MB.
