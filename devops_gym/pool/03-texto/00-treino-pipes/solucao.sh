# Treino de pipes: uma solução possível.
cd ~/treinos/pipes
mkdir -p respostas
wc -l < acessos.log > respostas/linhas.txt            # com < o wc não imprime o nome do arquivo
grep -c '" 500 ' acessos.log > respostas/erros500.txt
cut -d' ' -f1 acessos.log | sort | uniq -c | sort -rn | head -n 3 > respostas/top-ips.txt
tail -n +2 clientes.csv | cut -d';' -f3 | sort -u > respostas/cidades.txt
grep ';premium$' clientes.csv | cut -d';' -f2 | tr a-z A-Z > respostas/premium.txt
ls /etc/hostname /etc/nao-existe > respostas/saida.txt 2> respostas/erro.txt
find / -name "*.conf" 2>/dev/null | wc -l > respostas/confs.txt
cut -d' ' -f1 acessos.log | sort -u | tee respostas/ips.txt | wc -l > respostas/total-ips.txt
head respostas/*
