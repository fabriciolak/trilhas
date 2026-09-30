---
mes: 4
semana: 14
palco: host
tipo: treino
nivel: 1
conceitos: imagem, container, docker run, -d, --name, -p, -e, -v, bind mount, volume, exec, logs, restart, ciclo de vida
---
# Treino: containers com docker run

## AULA
**Imagem** é o molde (sistema de arquivos + o comando que roda), só leitura. **Container**
é uma imagem rodando, com uma camada gravável por cima. De uma imagem saem quantos
containers você quiser. Imagens vêm de um **registro** (o Docker Hub é o padrão):
`nginx:1.30-alpine` = repositório `nginx`, **tag** `1.30-alpine`.

    docker pull nginx:1.30-alpine
    docker run -d --name web -p 8080:80 nginx:1.30-alpine
    #          │    │         │          └ imagem
    #          │    │         └ porta 8080 do SEU computador → 80 do container
    #          │    └ nome (senão o Docker inventa um)
    #          └ em segundo plano (detached)

**Ciclo de vida.**

    docker ps                  # rodando        docker ps -a   # todos, inclusive parados
    docker stop web            # SIGTERM, espera, SIGKILL      docker start web
    docker rm web              # apaga (parado); docker rm -f web apaga mesmo rodando
    docker logs --tail 20 web  # o que o processo escreveu na saída (-f acompanha)
    docker exec -it web sh     # um terminal DENTRO do container (exit sai)
    docker exec web nginx -v   # um comando só
    docker inspect web         # tudo, em JSON (IP, montagens, variáveis, estado)

**Opções que você vai usar sempre.**

| opção | faz |
|---|---|
| `-e CHAVE=valor` / `--env-file arq` | variáveis de ambiente |
| `-v "${PWD}/site:/usr/share/nginx/html:ro"` | *bind mount*: uma pasta sua aparece dentro do container (`:ro`, só leitura) |
| `-v dados:/var/lib/app` | *volume* nomeado: o Docker guarda os dados, e eles sobrevivem ao container |
| `--rm` | apaga o container quando ele terminar (bom para comandos avulsos) |
| `--restart unless-stopped` | volta sozinho se cair ou se o Docker reiniciar, a menos que você o pare |
| `-it` | interativo com terminal (para `sh`, `bash`) |

Container é descartável: para mudar uma opção do `run` (porta, volume, restart), apague e
crie de novo. O que precisa sobreviver fica em volume ou na sua pasta.

`${PWD}` funciona igual no bash e no PowerShell. No Prompt de Comando antigo do Windows,
use `%cd%`.

## TICKET
Rode tudo na pasta da oficina deste treino (ela tem a pasta `site/`). Respostas também nela.

1. Suba o container `treino-web`: `nginx:1.30-alpine`, em segundo plano, com a porta
   **8585** do seu computador ligada à 80 do container. Abra `http://localhost:8585`.
2. Troque a página: recrie o `treino-web` servindo a pasta `site/` da oficina (só
   leitura) no lugar da página padrão, e que ele volte sozinho se o Docker reiniciar.
3. Descubra a versão do nginx **de dentro** do container e salve a mensagem em
   `versao-nginx.txt` (atenção: o `nginx -v` escreve na saída de erro).
4. Salve as últimas 5 linhas do log do `treino-web` em `logs.txt`.
5. Rode um container avulso de `alpine:3.24`, que se apaga sozinho ao terminar, com a
   variável `SAUDACAO=oi`, só para imprimir essa variável. Salve a saída em `saudacao.txt`.
6. Crie o volume `treino-dados`. Com um container avulso, grave `persistiu` em
   `/dados/prova.txt` dentro do volume. Com **outro** container avulso, leia o arquivo e
   salve a saída em `volume.txt`.
7. Existe um container parado chamado `treino-velho`. Apague.

## COMANDOS
docker pull run ps stop rm logs exec inspect volume create -d --name -p -e -v --rm --restart

## PERGUNTAS
1. Qual a diferença entre imagem e container? E entre bind mount e volume?
2. Por que não se "entra no container e muda a configuração na mão"?
3. O que acontece com os arquivos gravados dentro de um container quando ele é apagado?

## ESTUDE
- Descomplicando o Docker (livro): https://livro.descomplicandodocker.com.br/
- Documentação oficial, "Get started": https://docs.docker.com/get-started/
