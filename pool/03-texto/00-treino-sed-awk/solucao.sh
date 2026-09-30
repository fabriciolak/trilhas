# Treino de sed e awk: uma solução possível.
cd ~/treinos/texto
mkdir -p respostas
sed -i.bak 's/^ambiente = homologacao$/ambiente = producao/' config.ini
sed -i 's/^debug/# &/' config.ini
diff config.ini.bak config.ini
sed -n '10,15p' app.log > respostas/linhas-10-a-15.txt
awk -F',' 'NR > 1 {s += $3} END {printf "%.2f\n", s}' vendas.csv > respostas/total.txt
awk -F',' 'NR > 1 {t[$2] += $3} END {for (k in t) printf "%s %.2f\n", k, t[k]}' vendas.csv | sort -k2 -rn > respostas/por-loja.txt
grep -Eo '[a-z]+@[a-z.]+' app.log | sort -u > respostas/emails.txt
tar -czf relatorios.tar.gz relatorios/
tar -tzf relatorios.tar.gz > respostas/conteudo.txt
zcat antigo.log.gz | grep -c ERROR > respostas/erros-antigos.txt
head respostas/*
