# Disco lotado: uma solução possível.
cd /var/lib/fotos

# 1. Ocupação: df olha o sistema de arquivos inteiro.
{ echo "== antes"; df -h /var/lib/fotos; } > ~/relatorio-disco.txt

# 2. du mede o espaço REALMENTE ocupado. -a lista arquivos também, inclusive dentro de
#    pastas que começam com ponto (que o ls e o * escondem). sort -h entende K, M e G.
du -ah /var/lib/fotos | sort -rh | head -n 12     # pastas e arquivos misturados
# Só arquivos, com o espaço real em KB, do maior para o menor:
{ echo "== três maiores (espaço real, em KB)"; find /var/lib/fotos -type f -exec du -k {} + | sort -rn | head -n 3; } >> ~/relatorio-disco.txt
# Compare com o tamanho aparente (bytes): aqui o disco-teste.img aparece em primeiro.
find /var/lib/fotos -type f -printf '%s\t%p\n' | sort -rn | head -n 4

# 3. O arquivo que engana: ls mostra o tamanho aparente, du o espaço ocupado.
ls -lh vm/disco-teste.img; du -h vm/disco-teste.img
echo "disco-teste.img: arquivo esparso; ls mostra 5G (tamanho aparente), mas o disco só guarda os blocos escritos, e quase nenhum foi (du mostra ~0)" >> ~/relatorio-disco.txt

# 4. Contar antes de apagar. Os parênteses agrupam as duas condições do find.
total=$(find /var/lib/fotos \( -name '*.tmp' -o \( -name '*.csv' -empty \) \) | wc -l)
echo "apagando $total arquivos (.tmp e .csv vazios)" >> ~/relatorio-disco.txt
sudo find /var/lib/fotos \( -name '*.tmp' -o \( -name '*.csv' -empty \) \) -delete

# 5. file lê os primeiros bytes (o "número mágico"), não a extensão.
file exportacoes/relatorio-final.txt >> ~/relatorio-disco.txt
zcat exportacoes/relatorio-final.txt

# 6. Aspas fazem o nome inteiro virar um argumento só.
sudo rm "exportacoes/foto da festa (cópia).jpg"

# 7. Depois.
{ echo "== depois"; df -h /var/lib/fotos; } >> ~/relatorio-disco.txt
cat ~/relatorio-disco.txt
