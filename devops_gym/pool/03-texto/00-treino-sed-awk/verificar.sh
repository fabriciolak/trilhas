d=$CASA/treinos/texto
r=$d/respostas
checar "1. ambiente = producao, com o original em config.ini.bak" "sed -i.bak 's/^ambiente = homologacao/ambiente = producao/' config.ini" \
  sh -c "grep -qx 'ambiente = producao' $d/config.ini && grep -qx 'ambiente = homologacao' $d/config.ini.bak"
checar "2. as linhas debug estão comentadas (e o resto intacto)" "sed -i 's/^debug/# &/' config.ini" \
  sh -c "! grep -q '^debug' $d/config.ini && test \$(grep -c '^# debug_' $d/config.ini) -eq 2 && grep -qx 'porta = 8080' $d/config.ini"
checar "3. respostas/linhas-10-a-15.txt tem as linhas 10 a 15" "sed -n '10,15p' app.log" \
  test "$(cat $r/linhas-10-a-15.txt 2>/dev/null)" = "$(sed -n '10,15p' $d/app.log)"
total=$(awk -F',' 'NR > 1 {s += $3} END {printf "%.2f", s}' $d/vendas.csv)
checar "4. respostas/total.txt tem a soma ($total)" "awk -F',' 'NR > 1 {s += \$3} END {print s}' vendas.csv" \
  sh -c "awk -v e=$total '{d = \$1 - e; if (d < 0) d = -d; exit !(NF == 1 && d < 0.01)}' $r/total.txt"
campea=$(awk -F',' 'NR > 1 {t[$2] += $3} END {for (k in t) print t[k], k}' $d/vendas.csv | sort -rn | head -n 1 | awk '{print $2}')
checar "5. respostas/por-loja.txt tem as 4 lojas, com a campeã ($campea) em primeiro" "awk ... {t[\$2] += \$3} ... | sort -k2 -rn" \
  sh -c "test \$(grep -c . $r/por-loja.txt) -eq 4 && head -n 1 $r/por-loja.txt | grep -q $campea"
checar "6. respostas/emails.txt tem os e-mails, sem repetição" "grep -Eo '[a-z]+@[a-z.]+' app.log | sort -u" \
  test "$(sort $r/emails.txt 2>/dev/null)" = "$(grep -Eo '[a-z]+@[a-z.]+' $d/app.log | sort -u)"
checar "7. relatorios.tar.gz tem a pasta, e conteudo.txt a lista" "tar -czf relatorios.tar.gz relatorios/; tar -tzf ..." \
  sh -c "tar -tzf $d/relatorios.tar.gz | grep -q setembro.txt && grep -q setembro.txt $r/conteudo.txt && grep -q agosto.txt $r/conteudo.txt"
checar "8. respostas/erros-antigos.txt tem o número de ERROR do log comprimido" "zcat antigo.log.gz | grep -c ERROR" \
  sh -c "test \"\$(tr -d ' \n' < $r/erros-antigos.txt)\" = \"\$(zcat $d/antigo.log.gz | grep -c ERROR)\" && test -f $d/antigo.log.gz"
