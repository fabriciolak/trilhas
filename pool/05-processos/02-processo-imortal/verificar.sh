r=$CASA/derrubada.txt
log=/var/log/sentinela.log

checar "~/derrubada.txt existe" "documente cada passo com >>" test -s "$r"
checar "o relatório fala do sinal educado (SIGTERM)" "kill sem número manda SIGTERM (15)" grep -qiE 'SIGTERM|TERM|-15' "$r"
checar "o relatório fala do sinal que não pode ser ignorado (SIGKILL)" "kill -9, kill -KILL" grep -qiE 'SIGKILL|KILL|-9' "$r"
checar "o relatório identifica o guardião" "pstree -p, ou o PPID da sentinela" contem "$r" "guardiao"
checar "o guardião foi derrubado" "sem o guardião, nada ressuscita a sentinela" sem_processo sentinela-guardiao
checar "a sentinela foi derrubada" "depois do guardião, a sentinela" sem_processo 'bin/sentinela$'
antes=$(stat -c %s "$log"); sleep 3; depois=$(stat -c %s "$log")
checar "o log parou" "tail -f não deveria mostrar nada novo" test "$antes" = "$depois"
