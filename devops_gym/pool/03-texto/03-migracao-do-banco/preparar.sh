#!/usr/bin/env bash
# Migração do banco: dez configurações, uma já migrada, uma sem espaços ao redor do =,
# uma com um 5432 que não é porta, e um log de latência para o awk.
set -euo pipefail

dir=/etc/loja/servicos
mkdir -p "$dir"
for s in busca carrinho catalogo cupons estoque notificacoes pagamento usuarios; do
  cat > "$dir/$s.conf" <<EOF
# serviço: $s
# histórico: migrado para o db-antigo.interno em 2022
db_host = db-antigo.interno
db_port = 5432
db_nome = $s
cache_host = cache.interno
cache_port = 6379
EOF
done
echo "timeout_ms = 5432" >> "$dir/pagamento.conf"

cat > "$dir/frete.conf" <<'EOF'
# serviço: frete (escrito à mão pelo Beto)
# histórico: aponta para o db-antigo.interno desde 2023
db_host=db-antigo.interno
db_port=5432
db_nome=frete
EOF

cat > "$dir/relatorios.conf" <<'EOF'
# serviço: relatorios (já migrado)
db_host = db.pinguim.interno
db_port = 6432
db_nome = relatorios
EOF
chmod 644 "$dir"/*.conf

# Latência por serviço, com médias exatas (base ± variação simétrica).
mkdir -p /var/log/loja
declare -A base=([pagamento]=480 [frete]=310 [busca]=150 [catalogo]=90 [carrinho]=60)
{
  for rodada in $(seq 1 40); do
    for s in pagamento frete busca catalogo carrinho; do
      delta=$(( (rodada % 2 == 0) ? 20 : -20 ))
      printf '2026-09-29T10:%02d:%02d servico=%s ms=%d status=200\n' $((rodada % 60)) $((rodada * 7 % 60)) "$s" $((base[$s] + delta))
    done
  done
} > /var/log/loja/latencia.log
chmod 644 /var/log/loja/latencia.log
