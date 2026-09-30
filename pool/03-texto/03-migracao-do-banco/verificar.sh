dir=/etc/loja/servicos
m=$CASA/migracao.txt
l=$CASA/latencia.txt

checar "~/migracao.txt existe" "grep -l lista só os nomes dos arquivos" test -s "$m"
checar "~/migracao.txt lista frete.conf (o que escreve sem espaços)" "db_host=db-antigo também conta" contem "$m" "frete.conf"
checar "~/migracao.txt não lista relatorios.conf (já migrado)" "a busca deve ser pelo host antigo nas linhas de configuração, não em comentários" \
  sh -c "! grep -q relatorios.conf '$m'"
checar "nenhuma linha db_host aponta para o banco antigo" "sed com endereço: /^db_host/ ... ; e o espaço ao redor do = é opcional" \
  sh -c "! grep -E '^db_host *=' $dir/*.conf | grep -q db-antigo"
checar "todas as 10 linhas db_host apontam para o banco novo" "db.pinguim.interno" \
  test "$(grep -hE '^db_host *= *db\.pinguim\.interno$' $dir/*.conf | wc -l)" -eq 10
checar "os comentários com o histórico continuam intactos" "troque só nas linhas db_host, não o arquivo todo" \
  test "$(grep -h '^#.*db-antigo' $dir/*.conf | wc -l)" -eq 9
checar "todas as linhas db_port usam 6432" "sed '/^db_port/s/5432/6432/'" \
  test "$(grep -hE '^db_port *= *6432$' $dir/*.conf | wc -l)" -eq 10
checar "o timeout_ms = 5432 do pagamento não foi tocado" "um s/5432/6432/ sem endereço estraga outras linhas" \
  grep -qx 'timeout_ms = 5432' "$dir/pagamento.conf"
checar "existem as cópias .bak com o conteúdo original" "sed -i.bak" grep -q 'db-antigo' "$dir/carrinho.conf.bak"
checar "~/latencia.txt existe" 'awk com arrays: soma[servico] += ms; n[servico]++' test -s "$l"
if [ -s "$l" ]; then
  checar "~/latencia.txt tem uma linha por serviço (5)" "agrupe por serviço" test "$(grep -c . "$l")" -eq 5
  checar "o mais lento vem primeiro: pagamento 480" "ordene pela média, do maior para o menor (sort -k2 -rn)" \
    sh -c "head -n 1 '$l' | grep -qE '^(servico=)?pagamento[[:space:]]+480(\.0+)?$'"
  checar "o mais rápido vem por último: carrinho 60" "ordene pela média" \
    sh -c "tail -n 1 '$l' | grep -qE '^(servico=)?carrinho[[:space:]]+60(\.0+)?$'"
fi
