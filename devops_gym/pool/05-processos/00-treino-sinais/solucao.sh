# Treino de processos: uma solução possível.
cd ~/treinos/processos
pgrep -f treino-processos/relogio > pid-relogio.txt
pstree -p | grep -B1 -A1 'sleep' | head
pai=$(ps -o ppid= -p "$(pgrep -f 'sleep 100000')" | tr -d ' ')     # o ps alinha com espaços
ps -o comm= -p "$pai" > pai.txt
sed -i 's/^cor = azul$/cor = verde/' teimoso.conf
kill -HUP "$(pgrep -f treino-processos/teimoso)"; sleep 2
tail -n 2 teimoso.log
kill "$(cat pid-relogio.txt)"
ps aux --sort=-%mem | head -n 6 > top5.txt
kill "$(pgrep -f treino-processos/vigia)"; sleep 1
ps -o pid,ppid,cmd -p "$(pgrep -f 'sleep 100000')"     # órfão: o pai agora é o 1
kill "$(pgrep -f 'sleep 100000')"
nohup sleep 7777 > /dev/null 2>&1 &
