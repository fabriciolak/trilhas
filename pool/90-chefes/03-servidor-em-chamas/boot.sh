#!/usr/bin/env bash
# Servidor em chamas: a partição do checkout (4 MB, em memória), os pedidos restaurados
# como root, o exportador travado na confirmação (segurando um arquivo apagado que enche
# a partição) e uma tentativa de subir o checkout, que falha e deixa rastro no journal.
set -euo pipefail

d=/var/lib/checkout
mkdir -p "$d"
mountpoint -q "$d" || mount -t tmpfs -o size=4M,mode=755 checkout "$d"
chown checkout:checkout "$d"
install -d -o checkout -g checkout "$d/tmp"
install -m 600 -o root -g root /opt/checkout/semente/pedidos.db "$d/pedidos.db"

# "Alguém rodou na mão e foi embora": o read espera para sempre (a fila aberta em
# leitura e escrita nunca chega ao fim).
[ -p /run/exportar-pedidos.fila ] || mkfifo -m 600 /run/exportar-pedidos.fila
setsid -f /usr/local/bin/exportar-pedidos <>/run/exportar-pedidos.fila >/dev/null 2>&1
sleep 1
systemctl start --no-block checkout.service || true
