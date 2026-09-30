# Log descontrolado: uma solução possível.
log=/var/log/loja/debug.log

# 1. Medir: contar linhas, esperar 10 s, contar de novo.
a=$(wc -l < "$log"); sleep 10; b=$(wc -l < "$log")
echo "1. método: wc -l antes e depois de 10 s. chegaram $((b - a)) linhas em 10 s" > ~/processos.txt

# 2. Quem escreve? pgrep -a mostra PID e comando. Depois, a árvore com PIDs.
{ echo "2. escritor e cadeia:"; pgrep -a -f cupom-debug; ps -eo pid,ppid,user,cmd | grep -E 'cupo[n]'; } >> ~/processos.txt
pstree -p -s "$(pgrep -f cupom-debug)" >> ~/processos.txt      # -s mostra os ancestrais
# (lsof também mostra quem está com o arquivo aberto:  sudo lsof /var/log/loja/debug.log)

# 3. Encerrar o escritor. Ele é do www-data, então precisa de sudo.
#    Matar só o cupons-servico não adianta: o filho continua (é adotado pelo PID 1).
s1=$(stat -c %s "$log")
sudo kill "$(pgrep -f cupom-debug)"      # SIGTERM, o educado
sleep 3; s2=$(stat -c %s "$log"); sleep 3; s3=$(stat -c %s "$log")
echo "3. tamanho: $s1 antes; $s2 e $s3 depois (parou)" >> ~/processos.txt

# 4. O zumbi: estado Z na coluna STAT; já morreu, só sobrou a entrada na tabela
#    esperando o pai ler o código de saída (wait). Não dá para matar o que já morreu:
#    quem precisa sair é o pai; aí o PID 1 adota o zumbi e recolhe.
{ echo "4. zumbi (defunct):"; ps -eo pid,ppid,stat,cmd | awk '$3 ~ /^Z/'; } >> ~/processos.txt
pai=$(ps -eo ppid=,stat= | awk '$2 ~ /^Z/ {print $1; exit}')
ps -o pid,cmd -p "$pai" >> ~/processos.txt                      # o pai: sleep infinity
sudo kill "$pai"
echo "   matei o pai ($pai); o PID 1 recolheu o zumbi" >> ~/processos.txt

# 5. No terminal:  sleep 300   → Ctrl+Z (suspende, SIGTSTP) → bg (continua em segundo plano)
#    → jobs (lista) → fg (volta) → Ctrl+C (SIGINT). Ou kill %1 com ele em segundo plano.
echo "5. Ctrl+Z suspende; bg continua em segundo plano; jobs lista; fg traz de volta; Ctrl+C ou kill %1 encerra" >> ~/processos.txt
cat ~/processos.txt
