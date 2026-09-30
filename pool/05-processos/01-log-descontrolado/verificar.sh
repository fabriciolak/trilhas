r=$CASA/processos.txt
log=/var/log/loja/debug.log

checar "~/processos.txt existe" "junte as evidências com >>" test -s "$r"
checar "o relatório identifica o escritor (cupom-debug)" "ps aux | grep, ou pgrep -a" contem "$r" "cupom-debug"
checar "o relatório mostra a cadeia (cupons-servico)" "pstree -p, ou ps -o pid,ppid,cmd seguindo os PPID" contem "$r" "cupons-servico"
checar "o relatório fala do zumbi" "a coluna STAT do ps mostra Z; o ps escreve <defunct>" grep -qiE 'zumbi|zombie|defunct' "$r"
checar "o escritor foi encerrado" "kill no PID do cupom-debug (matar só o pai não basta)" sem_processo cupom-debug
antes=$(stat -c %s "$log" 2>/dev/null || echo 0); sleep 3; depois=$(stat -c %s "$log" 2>/dev/null || echo 0)
checar "o log parou de crescer" "confira com ls -l duas vezes, ou tail -f" test "$antes" = "$depois"
checar "não sobrou nenhum zumbi" "zumbi não morre: quem precisa sair é o pai (veja o PPID)" \
  test "$(ps -eo stat= | grep -c '^Z')" -eq 0
