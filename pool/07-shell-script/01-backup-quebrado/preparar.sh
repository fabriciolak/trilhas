#!/usr/bin/env bash
# Backup quebrado: o site numa pasta com espaços e um script sem shebang, sem permissão
# de execução, sem aspas, sem tratamento de erro e que sempre diz "backup ok".
set -euo pipefail

site="/srv/site da loja"
mkdir -p "$site/css"
printf '<h1>Pinguim Store</h1>\n'               > "$site/index.html"
printf '<h1>Promoção de Natal</h1>\n'           > "$site/promoção de natal.html"
printf 'body { font-family: sans-serif }\n'    > "$site/css/site.css"

cat > /usr/local/bin/backup-loja <<'EOF'
# backup-loja: copia o site para /var/backups/loja (escrito às pressas pelo Beto)
ORIGEM=/srv/site da loja
DESTINO=/var/backups/loja
DATA=$(date +%F)
tar -czf $DESTINO/site-$DATA.tar.gz $ORIGEM
echo "backup ok"
EOF
chmod 644 /usr/local/bin/backup-loja
