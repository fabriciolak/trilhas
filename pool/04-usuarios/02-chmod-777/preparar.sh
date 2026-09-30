#!/usr/bin/env bash
# chmod 777: a árvore do serviço de pagamentos depois de um chown/chmod recursivo errado.
set -euo pipefail

groupadd --system pagamentos
useradd --system -g pagamentos -d /srv/pagamentos -s /usr/sbin/nologin -c "Serviço de pagamentos" pagamentos

raiz=/srv/pagamentos
mkdir -p "$raiz"/{segredos,scripts,dados}
printf -- '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC\n-----END PRIVATE KEY-----\n' > "$raiz/segredos/chave-api.pem"
printf 'gateway_token: gw-5521-xx\n'               > "$raiz/segredos/gateway.yml"
printf 'porta: 9090\nlog: info\n'                  > "$raiz/config.yml"
printf '#!/bin/sh\necho "pagamentos: iniciando"\n' > "$raiz/scripts/iniciar.sh"
printf '#!/bin/sh\necho "pagamentos: parando"\n'   > "$raiz/scripts/parar.sh"
printf 'id;valor\n1;99.90\n'                       > "$raiz/dados/transacoes.csv"

# O estrago: tudo do root e aberto para o mundo; dados/ fechada até para o serviço.
chown -R root:root "$raiz"
chmod -R 777 "$raiz"
chmod 700 "$raiz/dados"
