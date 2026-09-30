# Treino de find e du: uma solução possível.
cd ~/treinos/arquivos
mkdir -p respostas
find . -iname "*.log" -type f | wc -l > respostas/logs.txt
find . -type f -size +1M > respostas/grandes.txt
find . -name "*.log" -type f -mtime +30 > respostas/velhos.txt
find . -name "*.tmp" -type f            # primeiro, só olhar
find . -name "*.tmp" -type f -delete
du -sh -- */ | sort -h
du -s -- */ | sort -n | tail -n 1 | cut -f2 > respostas/maior-pasta.txt
df -h /home > respostas/disco.txt
file misterio/dados                     # gzip compressed data
mv misterio/dados misterio/dados.gz
find . -name "*.log" -type f -mtime +30 -exec gzip {} \;
find logs -type f
