#!/usr/bin/env bash
# Treino de sed e awk: configuração, log com e-mails, planilha de vendas e um log antigo comprimido.
set -euo pipefail
d=/home/aluno/treinos/texto
mkdir -p "$d/relatorios"
cat > "$d/config.ini" <<'INI'
[loja]
nome = Pinguim Store
ambiente = homologacao
debug_sql = true
porta = 8080
debug_cache = true
# debug antigo, já comentado
cache_mb = 256
INI
emails=(ana@pinguim.local bruno@pinguim.local suporte@pinguim.local carla@cliente.com)
niveis=(INFO INFO INFO WARN ERROR)
RANDOM=21
for i in $(seq 1 40); do
  n=${niveis[RANDOM % 5]}
  if (( i % 4 == 0 )); then
    printf '2026-09-30 10:%02d %s pedido %d enviado para %s\n' "$i" "$n" $((5000 + i)) "${emails[RANDOM % 4]}"
  else
    printf '2026-09-30 10:%02d %s pedido %d processado\n' "$i" "$n" $((5000 + i))
  fi
done > "$d/app.log"
lojas=(norte sul centro online)
{
  echo "data,loja,valor"
  for i in $(seq 1 30); do printf '2026-09-%02d,%s,%d.%02d\n' $((i % 28 + 1)) "${lojas[RANDOM % 4]}" $((RANDOM % 900 + 50)) $((RANDOM % 100)); done
} > "$d/vendas.csv"
printf 'resumo de agosto\n' > "$d/relatorios/agosto.txt"
printf 'resumo de setembro\n' > "$d/relatorios/setembro.txt"
for i in $(seq 1 25); do
  if (( i % 3 == 0 )); then echo "2026-08-$((i % 28 + 1)) ERROR falha no pagamento $i"; else echo "2026-08-$((i % 28 + 1)) INFO ok $i"; fi
done | gzip -c > "$d/antigo.log.gz"
chown -R aluno:aluno /home/aluno/treinos
