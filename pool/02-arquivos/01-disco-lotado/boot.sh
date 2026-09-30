#!/usr/bin/env bash
# Disco lotado: um sistema de arquivos pequeno (88 MB, em memória) montado em
# /var/lib/fotos a cada boot. O disco do container é enorme; sem um disco dedicado,
# o df nunca mostraria "quase cheio".
set -euo pipefail

raiz=/var/lib/fotos
mkdir -p "$raiz"
mountpoint -q "$raiz" || mount -t tmpfs -o size=88M,mode=755 fotos "$raiz"

mkdir -p "$raiz"/originais/{2025,2026}/{jan,fev,mar} "$raiz"/miniaturas/{p,m,g} \
         "$raiz"/exportacoes "$raiz"/backups "$raiz"/vm "$raiz"/originais/2025/.lixeira

# Os três vilões, em profundidades diferentes (um numa pasta escondida).
dd if=/dev/zero    of="$raiz/backups/fotos-antigas.tar"               bs=1M count=34 status=none
dd if=/dev/zero    of="$raiz/originais/2025/.lixeira/video-bruto.mov" bs=1M count=21 status=none
dd if=/dev/urandom of="$raiz/core.4412"                               bs=1M count=16 status=none

# Parece enorme, ocupa quase nada (arquivo esparso).
truncate -s 5G "$raiz/vm/disco-teste.img"

# Fotos de verdade (pequenas) e miniaturas.
for pasta in "$raiz"/originais/*/*/; do
  for n in 1 2 3; do head -c 20000 /dev/urandom > "${pasta}IMG_${n}.jpg"; done
done

# 300 temporários velhos espalhados pelas miniaturas e originais.
for pasta in "$raiz"/miniaturas/*/ "$raiz"/originais/2026/*/; do
  for n in $(seq 1 50); do printf 'sessao %s\n' "$n" > "${pasta}sessao-${n}.tmp"; done
done

# 15 exportações vazias (lixo) e 2 com conteúdo (ficam).
touch "$raiz"/exportacoes/relatorio-{001..015}.csv
printf 'mes;vendas\nagosto;1200\n'   > "$raiz/exportacoes/vendas-2026-08.csv"
printf 'mes;vendas\nsetembro;1350\n' > "$raiz/exportacoes/vendas-2026-09.csv"

# Diz que é texto; é um gzip.
printf 'fechamento de setembro: ok\n' | gzip -c > "$raiz/exportacoes/relatorio-final.txt"

# Nome com espaços e parênteses, porque o mundo real tem isso.
head -c 5000 /dev/urandom > "$raiz/exportacoes/foto da festa (cópia).jpg"

chmod -R a+rX "$raiz"
