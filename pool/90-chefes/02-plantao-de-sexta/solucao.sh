# Plantão de sexta: uma solução possível.

# 1. Quem come a CPU? ps ordenado por CPU (ou top e a tecla P).
ps -eo pid,user,%cpu,cmd --sort=-%cpu | head -n 5
pid=$(pgrep -f legado/reindexar)
echo "1. culpado: $(ps -o user=,cmd= -p "$pid")" > ~/plantao.txt
cat /opt/legado/reindexar        # ler antes de matar: ele trata SIGTERM e salva o índice
sudo kill -TERM "$pid"; sleep 1
cat /var/lib/legado/indice.estado
echo "   encerrado com SIGTERM (kill -15): ele trata o sinal e salva o índice. Com -9 (SIGKILL) não dá para tratar: o índice ficaria sujo." >> ~/plantao.txt

# 2. O script. Primeiro, ler o erro de verdade.
sudo bash /usr/local/bin/fechamento 2026-09-25     # bc: command not found (e mais)
sudo apt-get update || true                       # o repositório antigo de novo
sudo mv /etc/apt/sources.list.d/pinguim-antigo.list /etc/apt/sources.list.d/pinguim-antigo.list.desativado
sudo apt-get update
sudo apt-get install -y bc
cat -A "/srv/vendas/2026-09-25/e-commerce.csv" | head -n 2    # ^M$ no fim: CRLF do Windows

sudo tee /usr/local/bin/fechamento > /dev/null <<'SH'
#!/bin/bash
# fechamento: soma as vendas do dia de todas as lojas e grava o relatório
# em /srv/relatorios/fechamento-AAAA-MM-DD.txt.
# Uso: fechamento [AAAA-MM-DD]      (sem data: hoje)
set -euo pipefail
dia=${1:-$(date +%F)}
pasta=/srv/vendas/$dia

if [ ! -d "$pasta" ]; then
  echo "fechamento: não existe $pasta" >&2
  exit 1
fi
total=0
for arquivo in "$pasta"/*.csv; do
  soma=$(tail -n +2 "$arquivo" | tr -d '\r' | cut -d, -f3 | paste -sd+ | bc)
  total=$(echo "$total + $soma" | bc)
done
echo "fechamento de $dia: R\$ $total" > "/srv/relatorios/fechamento-$dia.txt"
echo "fechamento ok"
SH
sudo chmod 755 /usr/local/bin/fechamento

# 3. Grupo e setgid: tudo o que nascer na pasta herda o grupo financeiro.
sudo chgrp financeiro /srv/relatorios
sudo chmod 2750 /srv/relatorios

# 4. A Dani.
sudo useradd -m -s /bin/bash -G financeiro dani

# Testes: sucesso, erro, acesso.
sudo fechamento 2026-09-25
sudo fechamento 2026-01-01; echo "código de saída: $?"
ls -l /srv/relatorios
sudo -u dani cat /srv/relatorios/fechamento-2026-09-25.txt
sudo -u nobody cat /srv/relatorios/fechamento-2026-09-25.txt || echo "nobody não lê: certo"

# 5.
echo "2. total do dia 25: $(sudo cat /srv/relatorios/fechamento-2026-09-25.txt)" >> ~/plantao.txt
cat ~/plantao.txt
