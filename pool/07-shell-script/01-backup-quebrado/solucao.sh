# Backup quebrado: uma solução possível. Primeiro, ler e reproduzir.
cat /usr/local/bin/backup-loja
sudo backup-loja || true            # "command not found": não tem x nem shebang
sudo bash /usr/local/bin/backup-loja || true   # "da: command not found", e mesmo assim "backup ok"

# O script novo. set -euo pipefail: para no primeiro erro, variável indefinida é erro,
# e um pipe falha se qualquer parte falhar. Aspas em TODA expansão de variável.
sudo tee /usr/local/bin/backup-loja > /dev/null <<'EOF'
#!/bin/bash
# backup-loja: empacota o site em /var/backups/loja/site-AAAA-MM-DD.tar.gz
# Uso: backup-loja [pasta-de-origem]
set -euo pipefail

ORIGEM="${1:-/srv/site da loja}"
DESTINO=/var/backups/loja
ARQUIVO="$DESTINO/site-$(date +%F).tar.gz"

if [ ! -d "$ORIGEM" ]; then
  echo "backup-loja: erro: origem não existe: $ORIGEM" >&2
  exit 1
fi

mkdir -p "$DESTINO"
# -C entra na pasta antes de empacotar: o arquivo guarda caminhos relativos.
tar -czf "$ARQUIVO" -C "$ORIGEM" .
echo "backup ok: $ARQUIVO"
EOF
sudo chmod 755 /usr/local/bin/backup-loja

# Testes: sucesso, conteúdo e erro.
bash -n /usr/local/bin/backup-loja
sudo backup-loja
tar -tzf "/var/backups/loja/site-$(date +%F).tar.gz"
sudo backup-loja /nao/existe; echo "código de saída: $?"
