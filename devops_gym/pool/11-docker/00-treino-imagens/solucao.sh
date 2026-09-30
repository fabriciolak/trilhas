# Treino de imagens: uma solução possível (roda na pasta da oficina do treino).
docker history python:3.14-alpine > camadas.txt
docker build -f go/Dockerfile.gordo -t treino-go:gordo go/
cat > go/Dockerfile <<'DOCKERFILE'
FROM golang:1.27-alpine AS construcao
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /servidor .

FROM alpine:3.24
COPY --from=construcao /servidor /servidor
USER nobody
EXPOSE 8080
CMD ["/servidor"]
DOCKERFILE
docker build -t treino-go:1.0 go/
docker run -d --name treino-go -p 8787:8080 treino-go:1.0
docker images treino-go > tamanhos.txt
docker save treino-go:1.0 -o treino-go.tar
sleep 1
cat tamanhos.txt; curl -s http://localhost:8787/
