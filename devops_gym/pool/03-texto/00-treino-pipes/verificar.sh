d=$CASA/treinos/pipes
r=$d/respostas
so_numero() { tr -d ' \n' < "$1" 2>/dev/null; }
checar "1. respostas/linhas.txt tem o número de linhas" "wc -l < acessos.log" \
  test "$(so_numero $r/linhas.txt)" = "$(wc -l < $d/acessos.log)"
checar "2. respostas/erros500.txt tem o número de 500" "grep -c '\" 500 ' acessos.log" \
  test "$(so_numero $r/erros500.txt)" = "$(grep -c '" 500 ' $d/acessos.log)"
top=$(cut -d' ' -f1 $d/acessos.log | sort | uniq -c | sort -rn | head -n 1 | awk '{print $2}')
checar "3. respostas/top-ips.txt: 3 linhas, com o campeão ($top) na primeira" "cut -d' ' -f1 | sort | uniq -c | sort -rn | head -n 3" \
  sh -c "test \$(grep -c . $r/top-ips.txt) -eq 3 && head -n 1 $r/top-ips.txt | grep -q '$top' && head -n 1 $r/top-ips.txt | grep -q '[0-9] '"
esperado=$(tail -n +2 $d/clientes.csv | cut -d';' -f3 | sort -u)
checar "4. respostas/cidades.txt: cidades sem repetição, em ordem, sem cabeçalho" "tail -n +2 | cut -d';' -f3 | sort -u" \
  test "$(cat $r/cidades.txt 2>/dev/null)" = "$esperado"
checar "5. respostas/premium.txt: os premium em maiúsculas" "grep ';premium' | cut -d';' -f2 | tr a-z A-Z" \
  test "$(cat $r/premium.txt 2>/dev/null)" = "$(printf 'BRUNO LIMA\nDAVI ROCHA\nGABI NUNES')"
checar "6. saida.txt tem a saída e erro.txt tem o erro" "> para a saída, 2> para o erro" \
  sh -c "grep -q /etc/hostname $r/saida.txt && grep -q nao-existe $r/erro.txt && ! grep -q nao-existe $r/saida.txt"
checar "7. respostas/confs.txt tem um número (e só ele)" "find / -name '*.conf' 2>/dev/null | wc -l" \
  sh -c "so=\$(tr -d ' \n' < $r/confs.txt); test \"\$so\" -gt 20 2>/dev/null"
checar "8. ips.txt tem os IPs distintos e total-ips.txt a quantidade" "... | sort -u | tee respostas/ips.txt | wc -l > respostas/total-ips.txt" \
  sh -c "test \"\$(cat $r/ips.txt)\" = \"\$(cut -d' ' -f1 $d/acessos.log | sort -u)\" && test \"\$(tr -d ' \n' < $r/total-ips.txt)\" = \"\$(cut -d' ' -f1 $d/acessos.log | sort -u | wc -l)\""
