# Container que morre: uma solução possível

Na pasta da oficina.

## 1. Construir e rodar

```
docker build -t gym-relogio:1.0 relogio/
docker run -d --name gym-relogio gym-relogio:1.0
```

## 2. Investigar

```
docker ps -a --filter name=gym-relogio
docker inspect -f "{{.State.Status}} código={{.State.ExitCode}}" gym-relogio
docker logs gym-relogio
```

Estado `exited`, código **255** (o runtime nem conseguiu iniciar o processo), e a mensagem:
`exec ./relogio.sh: no such file or directory`. O arquivo existe (o `COPY` funcionou).
Quem não existe é o **interpretador** da primeira linha: `#!/bin/bash`. A imagem é
Alpine, que vem só com `sh` (BusyBox), sem bash. O kernel tenta executar `/bin/bash`,
não acha, e o erro fala do script. O mesmo erro aparece quando o script tem fim de linha
do Windows (`#!/bin/sh\r`).

## 3. Primeiro conserto

O script não usa nada específico do bash, então basta trocar a primeira linha para
`#!/bin/sh`. (Outra saída: instalar o bash na imagem com `RUN apk add --no-cache bash`,
que aumenta a imagem.)

```
docker build -t gym-relogio:1.1 relogio/
docker rm gym-relogio
docker run -d --name gym-relogio gym-relogio:1.1
docker logs gym-relogio
```

Agora morre com outro motivo: `FUSO: defina a variável FUSO...`. A validação
`${FUSO:?mensagem}` faz o script parar se a variável não existir. Ela está certa: o
problema é configuração.

## 4. e 5. Configuração e o container definitivo

```
docker rm gym-relogio
docker run -d --name gym-relogio -e FUSO=America/Sao_Paulo --restart on-failure gym-relogio:1.1
docker ps --filter name=gym-relogio
docker logs -f gym-relogio        (Ctrl+C para sair; o container continua)
```

A variável poderia ir para o Dockerfile (`ENV FUSO=America/Sao_Paulo`) como padrão,
mas configuração que muda por ambiente (fuso, endereços, senhas) é passada na hora de
rodar: a mesma imagem serve para todas as lojas.

## Limpeza

```
docker rm -f gym-relogio
docker rmi gym-relogio:1.0 gym-relogio:1.1
```
