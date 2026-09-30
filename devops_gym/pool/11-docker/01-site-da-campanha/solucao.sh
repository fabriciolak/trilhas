#!/usr/bin/env bash
# Site da campanha: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
docker rm -f gym-campanha >/dev/null 2>&1 || true
docker pull -q nginx:1.30-alpine >/dev/null 2>&1 || docker image inspect nginx:1.30-alpine >/dev/null
docker run -d --name gym-campanha -p 8181:80 \
  -v "$(pwd)/site:/usr/share/nginx/html:ro" \
  --env-file campanha.env --restart unless-stopped nginx:1.30-alpine
sed -i 's/(rascunho)/(no ar)/' site/index.html
sleep 2
docker exec gym-campanha env | grep CAMPANHA
curl -s http://localhost:8181/ | grep '<h1>'
