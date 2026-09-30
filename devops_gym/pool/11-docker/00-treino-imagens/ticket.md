---
mes: 4
semana: 16
palco: host
tipo: treino
nivel: 2
conceitos: camadas, docker history, tamanho de imagem, multi-stage build, imagem base, usuário não root, tags, docker save
---
# Treino: imagens pequenas com multi-stage

## AULA
**Camadas.** Uma imagem é uma pilha de camadas, uma por instrução do Dockerfile. Arquivo
apagado numa camada de cima **continua ocupando espaço** na de baixo.

    docker history python:3.14-alpine        # as camadas, o tamanho de cada uma e quem criou
    docker images                            # o tamanho total de cada imagem
    docker image inspect -f '{{.Size}}' img  # em bytes

**Por que o tamanho importa:** cada deploy baixa a imagem; imagem grande é deploy lento e
mais coisa para ter falha de segurança (compilador, shell, gerenciador de pacotes).

**Multi-stage build.** Compile numa etapa com todas as ferramentas e copie **só o
resultado** para uma etapa final mínima:

    FROM golang:1.27-alpine AS construcao
    WORKDIR /src
    COPY . .
    RUN CGO_ENABLED=0 go build -o /servidor .     # binário estático, sem depender da libc

    FROM alpine:3.24                              # ou "scratch": imagem vazia
    COPY --from=construcao /servidor /servidor
    USER nobody                                   # no scratch não há usuários: USER 65534
    EXPOSE 8080
    CMD ["/servidor"]

O `docker build` constrói as etapas e só a última vira a imagem. `-f` escolhe um
Dockerfile com outro nome: `docker build -f go/Dockerfile.gordo -t app:gordo go/`.

**Bases comuns:** `alpine` (poucos MB, usa musl), `-slim` do Debian (glibc, maior),
`distroless` e `scratch` (sem shell: menor superfície, depuração mais difícil).

**Imagem sem registro.** `docker save img:tag -o img.tar` exporta para um arquivo;
`docker load -i img.tar` importa em outra máquina.

## TICKET
A pasta `go/` da oficina tem um servidor em Go e um `Dockerfile.gordo`. Respostas na
pasta da oficina.

1. Salve em `camadas.txt` as camadas da imagem `python:3.14-alpine`.
2. Construa a imagem `treino-go:gordo` com o `go/Dockerfile.gordo`.
3. Escreva `go/Dockerfile` em duas etapas (compilação e final mínima), rodando como um
   usuário que não seja root, e construa `treino-go:1.0`. Ela tem de ficar com **menos
   de 25 MB**.
4. Rode o container `treino-go`, da 1.0, com a porta **8787** ligada à 8080.
5. Salve em `tamanhos.txt` a listagem das imagens `treino-go` (com o tamanho de cada uma).
6. Exporte a `treino-go:1.0` para o arquivo `treino-go.tar`, na oficina.

## COMANDOS
docker history docker build -f -t docker images docker run docker save docker load

## PERGUNTAS
1. Por que apagar um arquivo numa instrução `RUN` posterior não diminui a imagem?
2. O que vai para a imagem final num multi-stage, e o que fica para trás?
3. Quais as vantagens e desvantagens de uma imagem sem shell (scratch, distroless)?

## ESTUDE
- Multi-stage builds (oficial): https://docs.docker.com/build/building/multi-stage/
- Descomplicando o Docker (imagens e Dockerfile): https://livro.descomplicandodocker.com.br/
