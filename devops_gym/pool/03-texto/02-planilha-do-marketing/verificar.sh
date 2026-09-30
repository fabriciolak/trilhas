d=$CASA/diagnostico.txt
e=$CASA/emails.txt

esperado='ana.souza@exemplo.com.br
bruno.lima@exemplo.com.br
carla.dias@exemplo.com.br
diego.alves@exemplo.com.br
elisa.rocha@exemplo.com.br
fabio.nunes@exemplo.com.br
gabi.costa@exemplo.com.br
heitor.melo@exemplo.com.br
iara.pinto@exemplo.com.br'

checar "~/diagnostico.txt existe" "salve a prova com >" test -s "$d"
checar "o diagnóstico prova o fim de linha do Windows" "file mostra 'CRLF'; cat -A mostra ^M; od -c mostra \\r" grep -qE 'CRLF|\^M|\\r' "$d"
checar "~/emails.txt existe" "um pipeline só, terminando em > ~/emails.txt" test -s "$e"
checar "~/emails.txt não tem \\r" "tr -d '\\r' remove o caractere" test "$(grep -c $'\r' "$e" 2>/dev/null)" = 0
if [ -s "$e" ] && [ "$(cat "$e")" = "$esperado" ]; then
  ok "~/emails.txt: minúsculas, sem cabeçalho, sem branco, sem repetição, em ordem"
else
  falha "~/emails.txt: minúsculas, sem cabeçalho, sem branco, sem repetição, em ordem" \
    "compare com: tr -d '\\r' | cut -d';' -f2 | tail -n +2 | grep -v '^\$' | tr A-Z a-z | sort -u"
fi
for cidade in Curitiba Manaus "Porto Alegre" Recife Salvador; do
  checar "~/cidades/$cidade existe" "xargs -d '\\n' ou -I{} tratam cada linha como um argumento" test -d "$CASA/cidades/$cidade"
done
checar "nenhuma pasta quebrada pelo espaço (Porto, Alegre)" "sem -d '\\n', o xargs separa por espaço" \
  test ! -e "$CASA/cidades/Porto" -a ! -e "$CASA/cidades/Alegre"
checar "nenhuma pasta com \\r ou cabeçalho" "limpe o \\r e o cabeçalho antes do xargs" \
  test "$(find "$CASA/cidades" -mindepth 1 -maxdepth 1 | wc -l)" -eq 5
checar "o diagnóstico tem a contagem (9)" "wc -l < ~/emails.txt >> ~/diagnostico.txt" grep -qw 9 "$d"
