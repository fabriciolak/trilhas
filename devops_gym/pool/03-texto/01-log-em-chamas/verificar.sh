r=$CASA/incidente.txt
e=$CASA/evidencias.log

checar "~/incidente.txt existe" "monte com echo e >>" test -s "$r"
checar "respondeu se os erros continuam ao vivo" "tail -f mostra as linhas chegando (Ctrl+C para sair)" grep -qiE 'sim|continua|ao vivo|agora' "$r"
checar "achou o endpoint dos 500 (/api/pagamento)" "filtre os 500 e conte por caminho: grep | cut/awk | sort | uniq -c | sort -rn" contem "$r" "/api/pagamento"
checar "achou o IP que martela o site" "conte por IP: primeiro campo da linha" contem "$r" "198.51.100.23"
checar "~/evidencias.log existe" "grep do IP, redirecionado" test -s "$e"
if [ -s "$e" ]; then
  checar "~/evidencias.log só tem linhas do IP suspeito" "cuidado: 198.51.100.23 também casa dentro de 198.51.100.230; ancore o início da linha" \
    test "$(grep -cv '^198\.51\.100\.23 ' "$e")" -eq 0
  checar "~/evidencias.log tem todas as linhas do IP (2000 ou mais)" "use o log inteiro, não só o tail" test "$(wc -l < "$e")" -ge 2000
  checar "o relatório diz quantas linhas a evidência tem" "wc -l < ~/evidencias.log" grep -qw "$(wc -l < "$e")" "$r"
fi
