d=$CASA/treinos/processos
checar "1. pid-relogio.txt tem um PID que era do relogio" "pgrep -f relogio > pid-relogio.txt" \
  sh -c "grep -qE '^[0-9]+$' $d/pid-relogio.txt"
checar "2. pai.txt diz quem é o pai do sleep (vigia)" "ps -o ppid= -p \$(pgrep -f 'sleep 100000'); pstree -p" contem "$d/pai.txt" vigia
checar "3. o teimoso recarregou com cor = verde" "edite o arquivo e mande kill -HUP para o teimoso" \
  sh -c "grep -q 'recarregado: cor = verde' $d/teimoso.log && grep -qx 'cor = verde' $d/teimoso.conf"
checar "3b. o teimoso continua vivo (recarregar não é reiniciar)" "kill -HUP, não kill" pgrep -f treino-processos/teimoso
checar "4. o relogio foi encerrado" "kill PID (SIGTERM)" sem_processo treino-processos/relogio
checar "5. top5.txt tem cabeçalho e 5 processos" "ps aux --sort=-%mem | head -n 6" \
  sh -c "test \$(grep -c . $d/top5.txt) -ge 6 && head -n 1 $d/top5.txt | grep -qE 'PID|%MEM|RSS'"
familia_encerrada() { sem_processo treino-processos/vigia && sem_processo 'sleep 100000'; }
checar "6. nem o vigia nem o filho (sleep 100000) sobraram" "o filho órfão é adotado pelo PID 1 e continua: mate ele também" familia_encerrada
checar "7. um sleep 7777 do aluno está rodando" "nohup sleep 7777 &" pgrep -u aluno -f 'sleep 7777'
