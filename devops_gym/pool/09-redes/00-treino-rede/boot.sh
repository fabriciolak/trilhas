#!/usr/bin/env bash
# Treino de rede: liga os dois servidores.
runuser -u nobody -- setsid -f /usr/bin/python3 /opt/treino-rede/servidores.py >/dev/null 2>&1
exit 0
