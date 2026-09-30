# Treino de Dockerfile: uma solução possível (roda na pasta da oficina do treino).
cat > app/Dockerfile <<'DOCKERFILE'
FROM python:3.14-alpine
WORKDIR /app
COPY . .
ENV SAUDACAO="Olá do container"
EXPOSE 8000
USER nobody
CMD ["python", "-u", "app.py"]
DOCKERFILE
printf 'segredos.env\nrascunhos/\nDockerfile\n.dockerignore\n' > app/.dockerignore
docker build -t treino-app:1.0 app/
docker run --rm --entrypoint ls treino-app:1.0 -A /app
docker run -d --name treino-app -p 8686:8000 treino-app:1.0
docker run -d --name treino-app-en -p 8687:8000 -e SAUDACAO=Hello treino-app:1.0
sed -i 's/^ENV SAUDACAO=.*/ENV SAUDACAO="Olá da versão 1.1"/' app/Dockerfile
docker build -t treino-app:1.1 app/
docker tag treino-app:1.1 treino-app:estavel
docker images treino-app
sleep 1
curl -s http://localhost:8686/; curl -s http://localhost:8687/
