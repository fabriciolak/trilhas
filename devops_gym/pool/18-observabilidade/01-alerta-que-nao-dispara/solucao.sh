#!/usr/bin/env bash
# Alerta que não dispara: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
cd observabilidade
sleep 5
curl -s http://localhost:19090/api/v1/targets | head -c 300; echo
sed -i 's/"loja:9000"/"loja:8000"/; s#/etc/prometheus/alerta.yml#/etc/prometheus/alertas.yml#' prometheus/prometheus.yml
sed -i 's#expr: rate(http_requests_total{status="500"}\[1m\]) > 0.1#expr: sum(rate(loja_requisicoes_total{rota="/checkout",codigo="500"}[1m])) > 0.1#' prometheus/alertas.yml
curl -s -X POST http://localhost:19090/-/reload
q='100 * sum(rate(loja_requisicoes_total{rota="/checkout",codigo="500"}[1m])) / sum(rate(loja_requisicoes_total{rota="/checkout"}[1m]))'
for _ in $(seq 1 30); do
  curl -s http://localhost:19090/api/v1/rules | grep -q '"state":"firing"' && break
  sleep 5
done
valor=$(curl -s --get --data-urlencode "query=$q" http://localhost:19090/api/v1/query | python3 -c 'import json,sys; r=json.load(sys.stdin)["data"]["result"]; print(round(float(r[0]["value"][1]), 1) if r else "sem dados")')
printf '%s\nvalor: %s%%\n' "$q" "$valor" > ../respostas.txt
cat ../respostas.txt
