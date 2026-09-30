---
mes: 4
semana: 14
palco: host
---
# Site da campanha

## TICKET
Agora o palco muda: este ticket roda no **seu computador**, com o Docker que você já
usa para o laboratório (no Windows, no PowerShell ou no terminal do WSL; no Linux e
no macOS, no terminal). Os arquivos estão na pasta da oficina que aparece abaixo.

O marketing precisa de uma página de campanha no ar em 10 minutos. A página está em
`site/`, e as variáveis da campanha estão em `campanha.env`.

1. Baixe a imagem oficial do nginx, versão estável **1.30**, variante **alpine**.
   Liste as imagens locais e confira.
2. Suba um container chamado `gym-campanha`:
   - em segundo plano;
   - publicado na porta **8181** do seu computador (o nginx escuta na 80 dentro dele);
   - servindo a pasta `site/` da oficina **sem copiar para dentro da imagem**, e só
     para leitura (o container não pode alterar os arquivos);
   - com as variáveis de `campanha.env`, sem digitar os valores na linha de comando;
   - que volte sozinho se o Docker reiniciar, a menos que você pare de propósito.
3. Abra `http://localhost:8181` no navegador.
4. Sem sair do seu terminal, rode comandos **dentro** do container: com qual usuário o
   processo principal roda? As variáveis da campanha chegaram lá?
5. Veja as últimas 10 linhas de log do container e descubra o IP interno dele.
6. Edite `site/index.html` no seu computador, trocando `(rascunho)` por
   `(no ar)`, e recarregue a página: mudou sem recriar o container? Por quê?

## COMANDOS
docker pull docker images docker run docker ps docker exec docker logs docker inspect docker stop docker rm

## PERGUNTAS
1. Imagem e container: qual a diferença? Quantos containers podem nascer da mesma imagem?
2. O que `-p 8181:80` faz, exatamente? O que aconteceria se outra coisa já usasse a 8181 no seu computador?
3. Bind mount e volume nomeado: qual a diferença, e quando usar cada um?
4. Por que passar segredos com `--env-file` é melhor do que `-e SENHA=...`, e por que ainda não é o ideal?
5. `--restart unless-stopped`, `always` e `on-failure`: quando cada um?

## ESTUDE
- Descomplicando o Docker (livro grátis, LINUXtips): capítulos de containers, imagens e volumes: https://livro.descomplicandodocker.com.br/
- GIRUS, labs "docker_fundamentos", "docker_gerenciamento-containers" e "docker_volumes": https://github.com/badtuxx/girus-cli
- Documentação oficial do Docker (inglês), "Get started": https://docs.docker.com/get-started/
