# Processo imortal: uma solução possível.
# Num terminal de verdade, deixe outro aberto com:  tail -f /var/log/sentinela.log

# 1. Achar e mandar o SIGTERM (é o padrão do kill).
pgrep -a sentinela
alvo=$(pgrep -f 'bin/sentinela$')
sudo kill "$alvo"; sleep 2
{ echo "1. mandei SIGTERM (kill $alvo). A sentinela continuou viva e escreveu no log:"; tail -n 2 /var/log/sentinela.log; } > ~/derrubada.txt

# 2. Ela tem um trap para TERM, INT e HUP: o bash executa o trap em vez de morrer.
#    O SIGKILL (9) não é entregue ao processo: o kernel encerra direto, sem trap.
echo "2. sobrevive porque captura o sinal com trap. SIGKILL (kill -9) não pode ser capturado." >> ~/derrubada.txt
sudo kill -9 "$alvo"; sleep 3
{ echo "   depois do SIGKILL:"; pgrep -a -f 'bin/sentinela$'; tail -n 2 /var/log/sentinela.log; } >> ~/derrubada.txt

# 3. Quem é o pai da sentinela nova? pstree -s mostra os ancestrais.
{ echo "3. ancestralidade:"; pstree -p -s "$(pgrep -f 'bin/sentinela$')"; } >> ~/derrubada.txt
guardiao=$(pgrep -f sentinela-guardiao)
# Ordem: primeiro o guardião (senão ele religa a filha), depois a sentinela.
# O guardião não tem trap: o SIGTERM basta. A sentinela precisa de SIGKILL.
sudo kill "$guardiao"
sudo kill -9 "$(pgrep -f 'bin/sentinela$')"
echo "   matei o sentinela-guardiao ($guardiao) com SIGTERM e depois a sentinela com SIGKILL" >> ~/derrubada.txt

# 4. Provar a ausência: pgrep sai com código 1 quando não acha nada.
sleep 3
pgrep -f sentinela || echo "4. pgrep -f sentinela não achou nada (código de saída $?); log parado:" >> ~/derrubada.txt
a=$(stat -c %s /var/log/sentinela.log); sleep 3; b=$(stat -c %s /var/log/sentinela.log)
echo "   tamanho do log: $a e, 3 s depois, $b" >> ~/derrubada.txt
cat ~/derrubada.txt
