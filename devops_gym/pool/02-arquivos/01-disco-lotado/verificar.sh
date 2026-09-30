f=$CASA/relatorio-disco.txt
raiz=/var/lib/fotos

linha_de() { grep -n -- "$1" "$f" 2>/dev/null | head -n 1 | cut -d: -f1; }

checar "~/relatorio-disco.txt existe" "junte as evidências com > e >>" test -s "$f"
checar "registrou a ocupação do disco" "df -h /var/lib/fotos" grep -q '/var/lib/fotos' "$f"

a=$(linha_de fotos-antigas.tar); b=$(linha_de video-bruto.mov); c=$(linha_de core.4412)
if [ -n "$a" ] && [ -n "$b" ] && [ -n "$c" ] && [ "$a" -lt "$b" ] && [ "$b" -lt "$c" ]; then
  ok "os três maiores, do maior para o menor"
else
  falha "os três maiores, do maior para o menor" "um deles está numa pasta que começa com ponto; ordene por tamanho (du, sort -h)"
fi
checar "explicou o arquivo que engana (disco-teste.img)" "compare ls -lh com du -h no mesmo arquivo" contem "$f" "disco-teste.img"
checar "registrou quantos arquivos iam ser apagados (315)" "conte com find ... | wc -l antes de apagar" grep -qw 315 "$f"
checar "nenhum .tmp sobrou" "find com -name e -delete" test "$(find "$raiz" -name '*.tmp' | wc -l)" -eq 0
checar "nenhum .csv vazio sobrou" "find tem um teste para arquivos vazios" test "$(find "$raiz" -name '*.csv' -empty | wc -l)" -eq 0
checar "os .csv com conteúdo continuam lá" "só os vazios deviam sair" \
  test -s "$raiz/exportacoes/vendas-2026-08.csv" -a -s "$raiz/exportacoes/vendas-2026-09.csv"
checar "descobriu o tipo real de relatorio-final.txt" "o comando file lê o conteúdo, não a extensão" contem "$f" "gzip"
checar "apagou 'foto da festa (cópia).jpg'" "aspas protegem espaços e parênteses do shell" \
  test ! -e "$raiz/exportacoes/foto da festa (cópia).jpg"
checar "os três grandes continuam lá (a decisão é do time)" "relatar não é apagar" \
  test -e "$raiz/backups/fotos-antigas.tar" -a -e "$raiz/originais/2025/.lixeira/video-bruto.mov" -a -e "$raiz/core.4412"
checar "as fotos de verdade continuam lá" "cuidado com apagar em massa" test "$(find "$raiz/originais" -name '*.jpg' | wc -l)" -eq 18
