#!/bin/bash
# Deploy de mentira: só para o lint ter o que conferir.
set -euo pipefail
versao=${1:?uso: deploy.sh VERSAO}
echo "publicando a versão $versao"
