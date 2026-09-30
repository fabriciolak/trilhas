---
mes: 4
semana: 17
palco: host
tipo: chefe
nivel: 3
conceitos: compose, logs, Dockerfile, tags fixas, redes, ports, .env, usuário não root, restart, healthcheck, depends_on, limites
---
# Compose de produção

## TICKET
Chefe do mês 4. A loja vai para produção num servidor só, com o `compose.yaml` que veio
do desenvolvimento (pasta `producao/`, na oficina). A revisão de segurança travou o
deploy e devolveu uma lista. Deixe o projeto pronto e **no ar**:

1. **Subir.** `docker compose up -d --build` tem de terminar com os três serviços de pé,
   `http://localhost:8383/` abrindo a página da loja e `http://localhost:8383/api/saude`
   respondendo `ok` (o nginx repassa `/api/` para a api). Leia os logs de quem cair.
2. **Versões fixas.** Nenhuma imagem sem versão ou com `latest`, inclusive a que você
   constrói (dê a ela a tag `1.0`).
3. **Só a porta da frente.** Só o `web` publica porta no servidor. E o `web` **não
   enxerga** o `cache`: separe em duas redes, a da frente (web e api) e a dos fundos
   (api e cache).
4. **Senha fora do arquivo.** A senha de administração vazou no `compose.yaml`. Troque
   por uma nova, com pelo menos 12 caracteres, num arquivo `.env` ao lado do compose,
   que **não** vai para o Git. O `compose.yaml` não pode ter senha nenhuma. Prove com
   `curl -H "X-Senha: ..." http://localhost:8383/api/admin`.
5. **Nada como root.** A api não roda como root.
6. **Aguentar o tranco.** Todo serviço volta sozinho se cair (a não ser que alguém o
   pare de propósito); a api só sobe quando o cache estiver **saudável** (com um
   healthcheck de verdade no cache); a api tem limite de memória (até 256 MB); e o log
   de cada serviço tem tamanho máximo, para não encher o disco.

Valide com `docker compose config` antes de cada subida.

## COMANDOS
docker compose config | up -d --build | ps -a | logs | down, docker inspect, docker network ls, curl

## PERGUNTAS
1. Por que `latest` em produção é um problema, mesmo quando "sempre funcionou"? O que é um digest (`@sha256:...`)?
2. Qual a diferença entre publicar uma porta (`ports`) e dois containers conversarem numa rede?
3. `depends_on` sem condição garante o quê? E com `condition: service_healthy`?
4. O `.env` tira a senha do Git, mas ela continua visível em `docker inspect`. O que são os `secrets` do Compose e por que eles são melhores?
5. Com `restart: unless-stopped`, o que acontece depois de um reboot do servidor? E depois de um `docker compose stop`?

## ESTUDE
- Referência do arquivo do Compose (networks, healthcheck, depends_on, restart, logging): https://docs.docker.com/reference/compose-file/
- Descomplicando o Docker (LINUXtips): https://livro.descomplicandodocker.com.br/
- Boas práticas de Dockerfile: https://docs.docker.com/build/building/best-practices/
