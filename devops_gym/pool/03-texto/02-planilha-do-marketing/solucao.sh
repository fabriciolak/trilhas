# Planilha do marketing: uma solução possível.
csv=/srv/exportacao/clientes.csv

# 1. file mostra "with CRLF line terminators"; cat -A mostra ^M$ no fim de cada linha;
#    od -c mostra os bytes \r \n.
file "$csv" > ~/diagnostico.txt
cat -A "$csv" | head -n 3 >> ~/diagnostico.txt
od -c "$csv" | head -n 2

# 2. Um pipeline: tira o \r, pega a 2ª coluna, pula o cabeçalho, joga fora linhas
#    vazias, passa para minúsculas e ordena sem repetir.
tr -d '\r' < "$csv" | cut -d';' -f2 | tail -n +2 | grep -v '^$' | tr '[:upper:]' '[:lower:]' | sort -u > ~/emails.txt
cat ~/emails.txt

# 3. Cidades: mesma limpeza, 3ª coluna. xargs -d '\n' usa só a quebra de linha como
#    separador, então "Porto Alegre" vira UM argumento. mkdir -p não reclama se existir.
mkdir -p ~/cidades
tr -d '\r' < "$csv" | cut -d';' -f3 | tail -n +2 | grep -v '^$' | sort -u | (cd ~/cidades && xargs -d '\n' mkdir -p)
ls -1 ~/cidades

# 4. wc -l < arquivo: o wc recebe bytes pela entrada padrão e nem sabe o nome do arquivo.
echo "e-mails: $(wc -l < ~/emails.txt)" >> ~/diagnostico.txt
cat ~/diagnostico.txt
