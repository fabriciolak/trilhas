d=$CASA/treinos/terminal
checar "1. onde.txt tem o caminho absoluto da pasta" "cd ~/treinos/terminal && pwd > onde.txt" \
  sh -c "test \"\$(cat $d/onde.txt 2>/dev/null)\" = $d"
checar "2. projeto/src, projeto/docs e projeto/testes existem" "mkdir -p projeto/src projeto/docs projeto/testes" \
  test -d "$d/projeto/src" -a -d "$d/projeto/docs" -a -d "$d/projeto/testes"
checar "3. projeto/README.md existe" "touch" test -f "$d/projeto/README.md"
checar "4. o relatório está em projeto/docs e continua em bagunca" "cp (não mv)" \
  sh -c "cmp -s $d/bagunca/relatorio-final.txt $d/projeto/docs/relatorio-final.txt"
checar "5. projeto/fotos tem as duas fotos" "cp -r bagunca/fotos projeto/" \
  test -f "$d/projeto/fotos/praia.jpg" -a -f "$d/projeto/fotos/serra.jpg"
checar "6. rascunho-velho.txt virou rascunho.txt" "mv" test -f "$d/bagunca/rascunho.txt" -a ! -e "$d/bagunca/rascunho-velho.txt"
checar "7. projeto/segredo.txt é a cópia do arquivo escondido" "ls -a bagunca" \
  sh -c "cmp -s $d/bagunca/.escondido $d/projeto/segredo.txt"
checar "8. bagunca/fotos não existe mais" "rm -r bagunca/fotos" test ! -e "$d/bagunca/fotos"
checar "9. tamanhos.txt lista por tamanho, do maior ao menor, com K" "ls -lhS bagunca > tamanhos.txt" \
  sh -c "grep -q K $d/tamanhos.txt && grep -o 'relatorio-final.txt\|rascunho.txt\|LEIA-ME.txt' $d/tamanhos.txt | tr '\n' ' ' | grep -q '^relatorio-final.txt rascunho.txt LEIA-ME.txt'"
checar "10. historico.txt tem seus comandos" "history 30 > historico.txt" \
  sh -c "test \$(wc -l < $d/historico.txt) -ge 5"
