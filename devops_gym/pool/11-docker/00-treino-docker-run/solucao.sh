# Treino de docker run: uma solução possível (roda na pasta da oficina do treino).
docker run -d --name treino-web -p 8585:80 nginx:1.30-alpine
curl -s http://localhost:8585 | head -n 4
docker rm -f treino-web
docker run -d --name treino-web -p 8585:80 --restart unless-stopped \
  -v "${PWD}/site:/usr/share/nginx/html:ro" nginx:1.30-alpine
sleep 1
curl -s http://localhost:8585/ > /dev/null
docker exec treino-web nginx -v 2> versao-nginx.txt
docker logs --tail 5 treino-web > logs.txt 2>&1
docker run --rm -e SAUDACAO=oi alpine:3.24 sh -c 'echo $SAUDACAO' > saudacao.txt
docker volume create treino-dados
docker run --rm -v treino-dados:/dados alpine:3.24 sh -c 'echo persistiu > /dados/prova.txt'
docker run --rm -v treino-dados:/dados alpine:3.24 cat /dados/prova.txt > volume.txt
docker ps -a --filter name=treino
docker rm treino-velho
