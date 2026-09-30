---
mes: 4
semana: 15
palco: host
tipo: treino
nivel: 1
conceitos: Dockerfile, FROM, WORKDIR, COPY, ENV, EXPOSE, USER, CMD, build, tag, contexto, .dockerignore, camadas e cache
---
# Treino: escrever um Dockerfile

## AULA
O **Dockerfile** é a receita da imagem. Cada instrução gera uma **camada**; o Docker
guarda as camadas em cache e só refaz a partir da primeira que mudou.

    FROM python:3.14-alpine              # a base (sempre com versão)
    WORKDIR /app                         # pasta de trabalho (cria se não existir)
    COPY requisitos.txt .                # o que muda pouco primeiro...
    RUN pip install -r requisitos.txt    # ...para esta camada lenta ficar em cache
    COPY . .                             # o código, que muda sempre, por último
    ENV PORTA=8000                       # variável com valor padrão (o docker run -e troca)
    EXPOSE 8000                          # documenta a porta (não publica nada sozinho)
    USER nobody                          # daqui para baixo, sem root
    CMD ["python", "-u", "app.py"]       # o comando padrão (forma JSON: sem shell no meio)

**Construir e rodar.**

    docker build -t minha-app:1.0 .      # o "." é o CONTEXTO: a pasta enviada para o build
    docker images minha-app
    docker run -d --name app -p 8000:8000 minha-app:1.0
    docker run --rm -e PORTA=9000 minha-app:1.0 ...     # troca a variável só neste container

**O contexto e o `.dockerignore`.** Tudo que está na pasta do contexto vai para o
construtor, e um `COPY . .` põe tudo na imagem, inclusive segredos, `.git` e lixo. O
`.dockerignore` (mesma sintaxe do `.gitignore`) tira do contexto o que não deve entrar.

**CMD e ENTRYPOINT.** `CMD` é o comando padrão, fácil de trocar
(`docker run imagem outro-comando`). `ENTRYPOINT` fixa o programa, e o `CMD` vira os
argumentos padrão dele.

**Tags.** `minha-app:1.0`, `minha-app:1.1`... uma imagem pode ter várias tags
(`docker tag minha-app:1.1 minha-app:estavel`). Sem tag, o Docker assume `latest`, que
não diz nada sobre a versão: evite.

## TICKET
A pasta `app/` da oficina tem o programa (`app.py`), um arquivo de segredos e uma pasta
de rascunhos. Rode os comandos na pasta da oficina.

1. Escreva `app/Dockerfile`: base `python:3.14-alpine`, pasta de trabalho `/app`, copie
   a pasta **inteira** do contexto (`COPY . .`), variável `SAUDACAO` com o valor padrão
   `Olá do container`, porta 8000 documentada, rodando como `nobody`, comando
   `python -u app.py`.
2. Crie `app/.dockerignore` para que `segredos.env`, a pasta `rascunhos/` e o próprio
   `Dockerfile` não entrem na imagem.
3. Construa a imagem `treino-app:1.0` a partir de `app/`.
4. Rode o container `treino-app` com a porta **8686** do seu computador ligada à 8000.
5. Rode também o `treino-app-en`, da mesma imagem, na porta **8687**, trocando a
   saudação para `Hello` **sem** construir outra imagem.
6. Mude o valor padrão da saudação para `Olá da versão 1.1` e construa `treino-app:1.1`
   (a 1.0 continua existindo). Dê à 1.1 também a tag `treino-app:estavel`.

## COMANDOS
docker build -t docker images docker run -e docker tag docker image inspect docker history

## PERGUNTAS
1. Por que a ordem das instruções importa para o tempo de build?
2. Qual a diferença entre `ENV` no Dockerfile e `-e` no `docker run`? E entre `EXPOSE` e `-p`?
3. O que acontece se você esquecer o `.dockerignore` num projeto com `.env` e `.git`?

## ESTUDE
- Boas práticas de Dockerfile (oficial): https://docs.docker.com/build/building/best-practices/
- Descomplicando o Docker, capítulo de Dockerfile: https://livro.descomplicandodocker.com.br/
