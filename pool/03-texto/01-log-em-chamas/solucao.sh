# Log em chamas: uma solução possível.
log=/var/log/loja/acesso.log

# 1. Ao vivo: no terminal você usaria  tail -f /var/log/loja/acesso.log  e sairia com Ctrl+C.
#    Num script, "olhar por alguns segundos" vira: ler as linhas novas depois de uma pausa.
antes=$(wc -l < "$log"); sleep 7
tail -n +"$((antes + 1))" "$log" | grep -c '" 500 ' || true
echo "1. ao vivo: sim, os 500 continuam saindo agora em /api/pagamento" > ~/incidente.txt

# 2. Totais. wc -l conta linhas; o status é o 9º campo separado por espaço.
echo "2. total de requisições: $(wc -l < "$log")" >> ~/incidente.txt
echo "   total de 500: $(awk '$9 == 500' "$log" | wc -l)" >> ~/incidente.txt

# 3. 500 por endpoint (o caminho é o 7º campo). uniq -c conta repetições VIZINHAS,
#    por isso o sort antes; sort -rn ordena pelo número, do maior para o menor.
{ echo "3. 500 por endpoint:"; awk '$9 == 500 {print $7}' "$log" | sort | uniq -c | sort -rn; } >> ~/incidente.txt
# (mesma coisa com grep e cut:  grep '" 500 ' "$log" | cut -d' ' -f7 | sort | uniq -c | sort -rn)

# 4. Requisições por IP (1º campo).
{ echo "4. requisições por IP:"; cut -d' ' -f1 "$log" | sort | uniq -c | sort -rn; } >> ~/incidente.txt

# 5. Evidências: ^ ancora no começo da linha e o espaço no fim impede casar 198.51.100.230.
grep '^198\.51\.100\.23 ' "$log" > ~/evidencias.log
echo "5. linhas do IP 198.51.100.23 em ~/evidencias.log: $(wc -l < ~/evidencias.log)" >> ~/incidente.txt

cat ~/incidente.txt
