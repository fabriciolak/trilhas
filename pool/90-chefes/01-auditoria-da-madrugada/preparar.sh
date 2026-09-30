#!/usr/bin/env bash
# Auditoria da madrugada: logs de pagamento com rotação (.log, .log.1, .log.2.gz, .log.3.gz).
# O campeão de recusas (411111) aparece quase só nos arquivos comprimidos: quem esquece
# os .gz acha outro BIN.
set -euo pipefail

dir=/var/log/pagamentos
mkdir -p "$dir" /etc/pagamentos
bins=(522222 530303 601100 650011 411111)
motivos=(saldo_insuficiente cartao_expirado suspeita_de_fraude cvv_invalido)

gerar() {  # gerar <dia> <linhas> <peso do 411111 nas recusas (0-100)> <semente>
  local dia=$1 n=$2 peso=$3 i bin status motivo
  RANDOM=$4
  for i in $(seq 1 "$n"); do
    bin=${bins[RANDOM % 4]}
    status=APROVADA; motivo=-
    if (( RANDOM % 100 < 30 )); then
      status=RECUSADA
      motivo=${motivos[RANDOM % 4]}
      if (( RANDOM % 100 < peso )); then bin=411111; motivo=suspeita_de_fraude; fi
    fi
    printf '%s %02d:%02d:%02d transacao=%06d cartao_bin=%s valor=%d.%02d status=%s motivo=%s\n' \
      "$dia" $((i % 24)) $((i % 60)) $((i * 7 % 60)) "$i" "$bin" $((RANDOM % 900 + 10)) $((RANDOM % 100)) "$status" "$motivo"
  done
}

gerar 2026-09-30 800 0  11 > "$dir/transacoes.log"
gerar 2026-09-29 900 5  22 > "$dir/transacoes.log.1"
gerar 2026-09-28 1200 70 33 | gzip -c > "$dir/transacoes.log.2.gz"
gerar 2026-09-27 1100 65 44 | gzip -c > "$dir/transacoes.log.3.gz"
chmod 644 "$dir"/*

cat > /etc/pagamentos/regras.conf <<'EOF'
# Regras do gateway de pagamentos
limite_por_transacao = 5000
bins_bloqueados = 400000,499999
tentativas_por_minuto = 5
EOF
chmod 644 /etc/pagamentos/regras.conf
