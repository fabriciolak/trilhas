---
mes: 4
semana: 17
palco: host
---
# Loja no Compose

## TICKET
O time quer rodar a loja inteira na máquina de cada dev com um comando só. O Beto
começou um `compose.yaml` com três serviços (na pasta `loja/` da oficina):

- `web`: nginx na frente, publicado na porta **8282** do seu computador;
- `api`: a aplicação (Python), que conta as visitas;
- `cache`: um Redis, onde a contagem fica guardada.

Nada sobe. Faça subir, e do jeito certo:

1. Valide o arquivo com o próprio Compose antes de subir qualquer coisa. Leia as
   mensagens: são erros de escrita do YAML e dos nomes das opções.
2. Suba tudo em segundo plano. Se algum serviço não subir, leia o motivo.
3. Com tudo "de pé", `http://localhost:8282` ainda não funciona. São dois problemas
   diferentes: um entre o seu computador e o `web`, outro entre a `api` e o `cache`.
   Os logs de cada serviço contam a história. Lembre: dentro de um container,
   `localhost` é o próprio container.
4. Prove: a página mostra o número da visita, e ele aumenta a cada recarga.
5. Derrube tudo (sem apagar os volumes) e suba de novo: a contagem precisa continuar
   de onde parou.

## COMANDOS
docker compose config docker compose up docker compose ps docker compose logs docker compose down docker compose exec

## PERGUNTAS
1. Como os containers de um mesmo Compose se encontram pelo nome do serviço? O que é a rede padrão que o Compose cria?
2. Por que `localhost` dentro de um container não é o seu computador?
3. `depends_on` garante que o Redis está pronto para receber conexões? O que é um healthcheck e como ele entra nessa história?
4. `docker compose down` e `docker compose down -v`: qual a diferença, e qual deles já apagou o banco de alguém?
5. Compose em produção: quando serve, e quando é hora de Kubernetes?

## ESTUDE
- Descomplicando o Docker (LINUXtips), capítulo sobre Docker Compose: https://livro.descomplicandodocker.com.br/
- GIRUS, labs "docker_compose" e "docker_fundamentos-redes": https://github.com/badtuxx/girus-cli
- Documentação oficial (inglês), referência do arquivo Compose: https://docs.docker.com/reference/compose-file/
