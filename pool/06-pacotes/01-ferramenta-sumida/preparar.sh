#!/usr/bin/env bash
# Ferramenta sumida: um script que depende do jq (não instalado) e um repositório
# antigo que não existe mais, quebrando o apt update.
set -euo pipefail

mkdir -p /etc/loja
cat > /etc/loja/deploy.json <<'EOF'
{"versao": "2026.09.30-1", "ambiente": "producao", "servicos": ["vitrine", "carrinho", "pagamento"]}
EOF

cat > /usr/local/bin/deploy-loja <<'EOF'
#!/bin/bash
# deploy-loja: lê a versão a publicar de /etc/loja/deploy.json e registra o deploy.
set -euo pipefail
versao=$(jq -r '.versao' /etc/loja/deploy.json)
ambiente=$(jq -r '.ambiente' /etc/loja/deploy.json)
mkdir -p /var/lib/loja
echo "$(date -Is) deploy da versão $versao em $ambiente" | tee -a /var/lib/loja/deploys.log
EOF
chmod 755 /usr/local/bin/deploy-loja

cat > /etc/apt/sources.list.d/pinguim-antigo.list <<'EOF'
# repositório interno da Pinguim (desativado em 2025, mas ninguém tirou daqui)
deb [trusted=yes] http://pacotes.pinguim-antigo.invalid/ubuntu noble main
EOF

apt-get remove -y --purge jq >/dev/null 2>&1 || true
