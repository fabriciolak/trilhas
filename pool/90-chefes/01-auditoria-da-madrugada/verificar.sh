a=$CASA/auditoria.txt
dir=/var/log/pagamentos

total=$(zcat -f $dir/transacoes.log* | wc -l)
recusadas=$(zcat -f $dir/transacoes.log* | grep -c 'status=RECUSADA')
campeao=$(zcat -f $dir/transacoes.log* | grep 'status=RECUSADA' | grep -o 'cartao_bin=[0-9]*' | sort | uniq -c | sort -rn | head -n 1 | awk -F= '{print $2}')
segundo=$(zcat -f $dir/transacoes.log* | grep 'status=RECUSADA' | grep -o 'cartao_bin=[0-9]*' | sort | uniq -c | sort -rn | sed -n 2p | awk -F= '{print $2}')

checar "~/auditoria.txt existe" "junte tudo com >>" test -s "$a"
checar "o total de transações soma os quatro arquivos ($total)" "zcat -f lê comprimidos e não comprimidos" grep -qw "$total" "$a"
checar "o total de recusadas soma os quatro arquivos ($recusadas)" "os .gz também contam" grep -qw "$recusadas" "$a"
checar "o ranking tem o campeão ($campeao)" "sort | uniq -c | sort -rn | head -n 3" grep -qw "$campeao" "$a"
checar "o ranking tem o segundo colocado ($segundo)" "os 3 primeiros, com contagens" grep -qw "$segundo" "$a"
checar "o motivo mais comum do campeão está no relatório" "filtre o BIN campeão e conte os motivos" contem "$a" "suspeita_de_fraude"
checar "o BIN campeão foi bloqueado sem apagar os outros" "sed '/^bins_bloqueados/s/\$/,411111/'" \
  grep -qE "^bins_bloqueados = 400000,499999,$campeao\$" /etc/pagamentos/regras.conf
checar "o resto do regras.conf ficou igual" "só a linha bins_bloqueados muda" \
  sh -c "grep -q '^limite_por_transacao = 5000$' /etc/pagamentos/regras.conf && grep -q '^tentativas_por_minuto = 5$' /etc/pagamentos/regras.conf"
checar "existe regras.conf.bak com o original" "sed -i.bak" grep -q '^bins_bloqueados = 400000,499999$' /etc/pagamentos/regras.conf.bak
checar "~/evidencias.tar.gz tem os quatro logs" "tar -czf ~/evidencias.tar.gz ..." \
  test "$(tar -tzf $CASA/evidencias.tar.gz 2>/dev/null | grep -c 'transacoes.log')" -eq 4
