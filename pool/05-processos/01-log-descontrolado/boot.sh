#!/usr/bin/env bash
# Log descontrolado: o escritor (como www-data) e o fabricante de zumbi.
runuser -u www-data -- setsid -f /usr/local/bin/cupons-servico >/dev/null 2>&1
setsid -f /usr/local/bin/relatorio-noturno >/dev/null 2>&1
