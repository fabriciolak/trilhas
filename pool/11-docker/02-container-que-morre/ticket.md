---
mes: 4
semana: 15
palco: host
---
# Container que morre

## TICKET
O time de dados empacotou um "relógio da loja" num container (ele escreve a hora e o
fuso da loja a cada 5 segundos, e outro sistema lê esse log). Na máquina deles
"funcionava". Na sua, o container nasce e morre na hora. Os arquivos estão em
`relogio/`, na oficina.

1. Construa a imagem `gym-relogio:1.0` a partir de `relogio/` e rode um container
   chamado `gym-relogio`, em segundo plano. Ele vai morrer.
2. Investigue como alguém de plantão: qual o estado do container, qual o **código de
   saída** e o que ele disse antes de morrer?
3. São dois problemas, um escondendo o outro. Conserte o primeiro no lugar certo
   (Dockerfile ou script) e gere a imagem `gym-relogio:1.1`. Dica: a mensagem de erro
   do primeiro é famosa por enganar. Leia o script inteiro, inclusive a primeira linha,
   e pense em qual sistema a imagem é baseada.
4. O segundo problema é configuração, não código: **não mexa na validação do script**.
   O fuso da loja é `America/Sao_Paulo`.
5. Troque o container antigo por um novo `gym-relogio`, com a imagem 1.1, que volte
   sozinho se falhar. Prove que ele continua de pé depois de alguns segundos e que o log
   mostra a hora com o fuso.

## COMANDOS
docker build docker run docker ps docker logs docker inspect docker rm docker images docker history

## PERGUNTAS
1. Por que um container "morre" quando o processo principal (PID 1) termina? Qual a relação entre o CMD e a vida do container?
2. O que significam os códigos de saída 0, 1, 126, 127 e 137 num container?
3. Por que "exec ./script: no such file or directory" aparece quando o arquivo existe? Que outras causas dão essa mesma mensagem (dica: fim de linha do Windows)?
4. Configuração via variável de ambiente, arquivo montado ou imagem nova: quando usar cada uma? O que o "12-factor app" diz sobre isso?
5. Por que versionar imagens com tags (1.0, 1.1) em vez de sempre usar `latest`?

## ESTUDE
- Descomplicando o Docker (LINUXtips), capítulos sobre Dockerfile e troubleshooting: https://livro.descomplicandodocker.com.br/
- The Twelve-Factor App em português, fator III (configuração): https://12factor.net/pt_br/config
- GIRUS, lab "docker_fundamentos": https://github.com/badtuxx/girus-cli
