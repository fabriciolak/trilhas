#!/usr/bin/env bash
# Treino de PromQL: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
for i in $(seq 1 60); do curl -sf http://localhost:18000/metrics > metricas.txt && break; sleep 1; done
echo 'loja_carrinhos_abertos' > consultas/q1.promql
echo 'sum(rate(loja_pedidos_total[1m]))' > consultas/q2.promql
echo 'sum by (metodo) (rate(loja_pedidos_total[1m]))' > consultas/q3.promql
echo 'topk(1, sum by (metodo) (increase(loja_pedidos_total[5m])))' > consultas/q4.promql
echo 'histogram_quantile(0.95, sum by (le) (rate(loja_latencia_segundos_bucket[5m])))' > consultas/q5.promql
echo 'count(up == 1)' > consultas/q6.promql
sleep 25     # o rate precisa de pelo menos duas coletas (a cada 5 s)
curl -s 'http://localhost:19191/api/v1/query' --data-urlencode "query=$(cat consultas/q3.promql)"; echo
