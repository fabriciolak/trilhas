#!/usr/bin/env bash
# Log em chamas: o tráfego ao vivo, como www-data (o usuário do servidor web).
runuser -u www-data -- setsid -f /usr/local/sbin/loja-trafego >/dev/null 2>&1
