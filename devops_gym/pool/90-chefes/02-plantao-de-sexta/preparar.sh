#!/usr/bin/env bash
# Plantão de sexta (chefe do mês 2): um processo pesado que só salva o trabalho se sair
# pelo SIGTERM, um script de fechamento quebrado (sem shebang, sem permissão, dependência
# faltando, aspas, CRLF, erro engolido), a pasta de relatórios sem grupo e a analista
# nova sem conta. O repositório apt quebrado do ticket "ferramenta sumida" continua lá.
set -euo pipefail

# 1. O reindexador do sistema legado (o boot.sh liga). Trabalha em rajadas (~20% de uma CPU).
id legado >/dev/null 2>&1 || useradd -r -m -d /var/lib/legado -s /usr/sbin/nologin legado
mkdir -p /opt/legado
cat > /opt/legado/reindexar <<'PY'
#!/usr/bin/env python3
# Reindexador do sistema legado. Trabalha em rajadas e grava o estado do índice.
# SIGTERM ou SIGINT: termina a rodada, grava "limpo" e sai.
# SIGKILL não pode ser tratado: o índice fica "sujo".
import signal
import sys
import time

ESTADO = "/var/lib/legado/indice.estado"


def gravar(texto):
    with open(ESTADO, "w") as f:
        f.write(texto + "\n")


def sair(sinal, _quadro):
    gravar("limpo: índice salvo (saída pelo sinal %d)" % sinal)
    sys.exit(0)


signal.signal(signal.SIGTERM, sair)
signal.signal(signal.SIGINT, sair)
gravar("sujo: reindexando")
while True:
    fim = time.monotonic() + 0.02
    while time.monotonic() < fim:
        pass
    time.sleep(0.08)
PY
chmod 755 /opt/legado/reindexar
chown legado: /var/lib/legado

# 2. As vendas: uma planilha com espaço no nome e outras exportadas no Windows (CRLF).
produtos=(camiseta caneca adesivo moletom bone)
vendas() {  # vendas <semente> <linhas>
  local i
  RANDOM=$1
  echo "pedido,produto,valor"
  for i in $(seq 1 "$2"); do
    printf '%d,%s,%d.%02d\n' $((RANDOM % 90000 + 10000)) "${produtos[RANDOM % 5]}" \
      $((RANDOM % 400 + 5)) $((RANDOM % 100))
  done
}
mkdir -p /srv/vendas/2026-09-24 /srv/vendas/2026-09-25
vendas 1 40 > "/srv/vendas/2026-09-25/loja-norte.csv"
vendas 2 35 > "/srv/vendas/2026-09-25/loja centro.csv"
vendas 3 60 | sed 's/$/\r/' > "/srv/vendas/2026-09-25/e-commerce.csv"
vendas 4 30 > "/srv/vendas/2026-09-24/loja-norte.csv"
vendas 5 25 | sed 's/$/\r/' > "/srv/vendas/2026-09-24/e-commerce.csv"

cat > /usr/local/bin/fechamento <<'SH'
# fechamento: soma as vendas do dia de todas as lojas e grava o relatório
# em /srv/relatorios/fechamento-AAAA-MM-DD.txt.
# Uso: fechamento [AAAA-MM-DD]      (sem data: hoje)
dia=${1:-$(date +%F)}
pasta=/srv/vendas/$dia
total=0
for arquivo in $(ls $pasta/*.csv); do
  soma=$(tail -n +2 $arquivo | cut -d, -f3 | paste -sd+ | bc)
  total=$(echo "$total + $soma" | bc)
done
echo "fechamento de $dia: R\$ $total" > /srv/relatorios/fechamento-$dia.txt
echo "fechamento ok"
SH
chmod 644 /usr/local/bin/fechamento
apt-get remove -y --purge bc >/dev/null 2>&1 || true

# 3 e 4. A pasta dos relatórios (sem grupo) e o time do financeiro (sem a Dani).
mkdir -p /srv/relatorios
chown root:root /srv/relatorios
chmod 755 /srv/relatorios
getent group financeiro >/dev/null || groupadd financeiro
id edu >/dev/null 2>&1 || useradd -m -s /bin/bash -G financeiro edu
