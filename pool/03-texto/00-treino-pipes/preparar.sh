#!/usr/bin/env bash
# Treino de pipes: um log de acesso e uma planilha de clientes.
set -euo pipefail
d=/home/aluno/treinos/pipes
mkdir -p "$d"
ips=(10.0.0.5 10.0.0.5 10.0.0.5 10.0.0.5 172.16.0.9 172.16.0.9 172.16.0.9 192.168.1.20 192.168.1.20 10.0.0.77 203.0.113.4)
rotas=(/ /produtos /carrinho /checkout /api/frete)
status=(200 200 200 200 200 301 404 500)
RANDOM=7
for i in $(seq 1 300); do
  printf '%s - - [30/Sep/2026:10:%02d:%02d -0300] "GET %s HTTP/1.1" %s %d\n' \
    "${ips[RANDOM % 11]}" $((i % 60)) $((i * 7 % 60)) "${rotas[RANDOM % 5]}" "${status[RANDOM % 8]}" $((RANDOM % 5000 + 200))
done > "$d/acessos.log"
cat > "$d/clientes.csv" <<'CSV'
id;nome;cidade;plano
1;ana souza;Recife;basico
2;bruno lima;São Paulo;premium
3;carla dias;Curitiba;basico
4;davi rocha;Recife;premium
5;elis moura;Belém;basico
6;fabio reis;São Paulo;basico
7;gabi nunes;Curitiba;premium
8;hugo sales;Manaus;basico
CSV
chown -R aluno:aluno /home/aluno/treinos
