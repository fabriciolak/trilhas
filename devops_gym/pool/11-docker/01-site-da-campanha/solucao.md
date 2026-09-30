# Site da campanha: uma solução possível

Rode os comandos **dentro da pasta da oficina** (`cd` para ela antes).

## 1. Baixar e listar

```
docker pull nginx:1.30-alpine
docker images
```

`nginx` é o repositório, `1.30-alpine` é a tag: versão 1.30, montada sobre Alpine
Linux (bem menor que a variante Debian). Fixar a versão evita surpresa no próximo deploy.

## 2. Subir o container

Linux, macOS, WSL e Git Bash:

```
docker run -d --name gym-campanha \
  -p 8181:80 \
  -v "$(pwd)/site:/usr/share/nginx/html:ro" \
  --env-file campanha.env \
  --restart unless-stopped \
  nginx:1.30-alpine
```

PowerShell (no Windows, a crase ` continua a linha e `${PWD}` é a pasta atual):

```
docker run -d --name gym-campanha `
  -p 8181:80 `
  -v "${PWD}\site:/usr/share/nginx/html:ro" `
  --env-file campanha.env `
  --restart unless-stopped `
  nginx:1.30-alpine
```

- `-d`: segundo plano. `--name`: um nome para você não depender do ID.
- `-p 8181:80`: porta do seu computador : porta dentro do container.
- `-v origem:destino:ro`: bind mount de uma pasta sua, só leitura. Não é cópia: o
  container enxerga a pasta ao vivo.
- `--env-file`: carrega `CHAVE=valor` de um arquivo; o valor não fica no histórico do shell.
- `--restart unless-stopped`: volta se o Docker reiniciar, menos se você deu `docker stop`.

## 3. e 4. Conferir e olhar por dentro

```
docker ps
docker exec gym-campanha ps -o user,pid,comm
docker exec gym-campanha whoami
docker exec gym-campanha env
```

O processo mestre do nginx roda como `root` e os workers como `nginx`. `docker exec`
cria um processo novo dentro de um container que já está rodando. Uma shell interativa
seria `docker exec -it gym-campanha sh` (o Alpine não tem bash).

## 5. Logs e IP

```
docker logs --tail 10 gym-campanha
docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" gym-campanha
```

## 6. Editar ao vivo

Troque `(rascunho)` por `(no ar)` em `site/index.html`, com o editor que quiser, e
recarregue a página. Mudou na hora porque é bind mount: o container lê o mesmo arquivo
que você editou. Se o site tivesse sido copiado para a imagem (`COPY` num Dockerfile),
você teria que reconstruir a imagem e recriar o container.

## Limpeza (quando terminar o treino)

```
docker rm -f gym-campanha
```
