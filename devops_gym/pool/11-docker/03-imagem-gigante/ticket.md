---
mes: 4
semana: 16
palco: host
tipo: ticket
nivel: 2
conceitos: camadas, multi-stage, .dockerignore, usuário não root, tamanho de imagem
---
# Imagem gigante

## TICKET
O serviço de catálogo é um programa pequeno em Go, mas a imagem dele tem centenas de
megabytes, e cada deploy demora uma eternidade para baixar nos servidores. O código
está em `catalogo/`, na oficina. Olhe tudo, inclusive o que tem lá e não devia ir
para a imagem.

1. Construa a imagem como está hoje, com a tag `gym-catalogo:gorda`. Anote o tamanho
   e descubra, camada por camada, de onde vem o peso.
2. Reescreva o `Dockerfile` (o próprio arquivo: é ele que o time usa) para gerar a
   imagem `gym-catalogo:magra`, com **menos de 30 MB**:
   - compile numa etapa e rode em outra (multi-stage build);
   - não mande para o build o que a imagem não precisa (existe um arquivo só para isso);
   - rode como um usuário **que não seja root**.
3. Prove que a magra funciona: rode com a porta 8080 do container publicada e acesse
   `/saude`.
4. Compare os tamanhos das duas imagens.

## COMANDOS
docker build docker images docker history docker run docker image inspect docker rm

## PERGUNTAS
1. Por que imagens grandes são um problema de verdade (deploy, custo, segurança, tempo de subida no Kubernetes)?
2. Como funciona o cache de camadas? Por que a ordem das instruções no Dockerfile muda o tempo de build?
3. O que o `.dockerignore` evita, além de tamanho? (Pense em `.env`, `.git` e chaves.)
4. `alpine`, `scratch` e `distroless`: quais as vantagens e desvantagens de cada base para a etapa final?
5. Por que rodar como root dentro do container é arriscado, se "é só um container"?

## ESTUDE
- Descomplicando o Docker (LINUXtips), capítulos sobre Dockerfile e boas práticas: https://livro.descomplicandodocker.com.br/
- GIRUS, lab "docker_multi-stage-builds": https://github.com/badtuxx/girus-cli
- Documentação oficial (inglês), "Multi-stage builds" e "Building best practices": https://docs.docker.com/build/building/multi-stage/
