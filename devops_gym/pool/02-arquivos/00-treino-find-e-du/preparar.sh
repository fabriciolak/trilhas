#!/usr/bin/env bash
# Treino de find e du: logs de várias idades (as datas são acertadas no boot.sh),
# arquivos grandes, temporários e um arquivo sem extensão.
set -euo pipefail
d=/home/aluno/treinos/arquivos
mkdir -p "$d"/logs/{api,web,worker} "$d/backup antigo" "$d/cache" "$d/misterio" "$d/relatorios"
for f in api/api-01.log api/api-02.log api/api-03.log web/web-01.log web/web-02.LOG web/web-03.log worker/worker-01.log; do
  printf '%s linha de log\n' "$f" > "$d/logs/$f"
done
head -c 2M /dev/urandom > "$d/backup antigo/banco.sql"
head -c 1536K /dev/urandom > "$d/backup antigo/fotos.tar"
for n in 1 2 3 4 5; do echo "sessão $n" > "$d/cache/sessao-$n.tmp"; done
echo "preferências" > "$d/cache/usuario.dat"
printf 'mes;vendas\nsetembro;1350\n' | gzip -c > "$d/misterio/dados"
printf 'loja;total\nnorte;900\n' > "$d/relatorios/setembro.csv"
chown -R aluno:aluno /home/aluno/treinos
