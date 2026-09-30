#!/usr/bin/env bash
# Imagem gigante: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
docker build -q -t gym-catalogo:gorda catalogo/
docker history gym-catalogo:gorda
printf 'dados/\ndocs/\n*.md\n.git\n.env\n' > catalogo/.dockerignore
cat > catalogo/Dockerfile <<'EOF'
FROM golang:1.27-alpine AS construcao
WORKDIR /src
COPY go.mod ./
COPY main.go ./
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /catalogo .

FROM alpine:3.24
RUN adduser -D -H -u 10001 catalogo
COPY --from=construcao /catalogo /usr/local/bin/catalogo
USER catalogo
EXPOSE 8080
CMD ["catalogo"]
EOF
docker build -q -t gym-catalogo:magra catalogo/
docker images gym-catalogo
