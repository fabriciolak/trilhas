---
mes: 4
semana: 17
palco: host
tipo: treino
nivel: 1
conceitos: docker compose, serviços, build, ports, environment, volumes, rede padrão, nome do serviço como DNS, up, ps, logs, exec, down
---
# Treino: vários containers com o Compose

## AULA
Rodar três containers com `docker run` é digitar três comandos compridos, na ordem certa,
lembrando das redes e dos volumes. O **Compose** descreve tudo num arquivo
(`compose.yaml`) e sobe com um comando.

    name: minha-loja                  # nome do projeto (prefixo de containers, redes e volumes)

    services:
      web:
        image: nginx:1.30-alpine
        ports:
          - "8080:80"                 # como o -p
        volumes:
          - ./site:/usr/share/nginx/html:ro   # bind mount: caminho relativo ao compose.yaml
        depends_on:
          - api                       # sobe depois da api (não espera ela ficar pronta!)
      api:
        build: ./api                  # constrói a partir do Dockerfile de ./api
        environment:
          REDIS_HOST: cache           # o NOME DO SERVIÇO é o endereço na rede do projeto
      cache:
        image: redis:8-alpine
        volumes:
          - dados:/data               # volume nomeado (declarado lá embaixo)

    volumes:
      dados:

**A rede de graça.** O Compose cria uma rede para o projeto e cada serviço acha o outro
pelo nome (`cache`, `api`). Dentro de um container, `localhost` é **ele mesmo**, nunca o
vizinho.

**Os comandos** (na pasta do `compose.yaml`, ou com `-f caminho`):

    docker compose config             # valida e mostra o arquivo final (use sempre!)
    docker compose up -d --build      # sobe tudo, construindo o que tiver build
    docker compose ps                 # o estado de cada serviço
    docker compose logs -f api        # logs de um serviço
    docker compose exec cache redis-cli get visitas     # comando dentro de um serviço
    docker compose down               # derruba containers e rede (os volumes ficam)
    docker compose down -v            # ...e apaga os volumes (os dados!)

YAML: indentação com **espaços**, e listas com `-`. Um espaço fora do lugar muda o
significado, e o `docker compose config` é quem avisa.

## TICKET
Na pasta da oficina estão `site/`, `api/` (com Dockerfile) e `web/default.conf`. Escreva
o `compose.yaml` ali mesmo, com o nome de projeto `treino-compose`.

1. Serviço `web`: `nginx:1.30-alpine`, porta **8888** do computador na 80, servindo a
   pasta `site/` (só leitura). Suba e abra `http://localhost:8888`.
2. Serviço `cache`: `redis:8-alpine`, guardando `/data` num volume nomeado `dados`.
3. Serviço `api`: construído de `./api`, encontrando o Redis pela variável `REDIS_HOST`.
4. Faça o `web` repassar `/api/` para a api, montando `web/default.conf` em
   `/etc/nginx/conf.d/default.conf`. Prove: `http://localhost:8888/api/visita` conta.
5. Salve o estado dos serviços em `estado.txt` e os logs da api em `logs-api.txt`.
6. Derrube tudo **sem** apagar os volumes e suba de novo: a contagem continua de onde parou.
   Salve o valor de `visitas`, lido direto no Redis com `redis-cli`, em `visitas.txt`.

## COMANDOS
docker compose config up -d --build ps logs exec down down -v

## PERGUNTAS
1. Por que a api acha o Redis pelo nome `cache`? E por que `localhost` não funcionaria?
2. `depends_on` garante que o banco está pronto para receber conexões? O que garante?
3. Qual a diferença entre `docker compose down` e `docker compose down -v`?

## ESTUDE
- Referência do arquivo do Compose: https://docs.docker.com/reference/compose-file/
- Descomplicando o Docker (Compose): https://livro.descomplicandodocker.com.br/
