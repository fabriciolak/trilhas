# Migração do banco: uma solução possível.
cd /etc/loja/servicos

# 1. Só as linhas de configuração (que começam com db_host), com ou sem espaços no =.
#    -l mostra o nome do arquivo em vez da linha.
grep -lE '^db_host *= *db-antigo' *.conf > ~/migracao.txt
cat ~/migracao.txt

# 2 e 3. Um sed só, dois comandos, cada um com seu endereço (a linha precisa casar
#    com o padrão antes do s///). -i.bak guarda o original antes de reescrever.
#    O " *" aceita zero ou mais espaços antes do =: cobre "db_host = x" e "db_host=x".
sudo sed -i.bak \
  -e '/^db_host *=/s/db-antigo\.interno/db.pinguim.interno/' \
  -e '/^db_port *=/s/5432/6432/' \
  *.conf

diff carrinho.conf.bak carrinho.conf      # confira o que mudou
grep -H 'db_' *.conf

# 4. awk separa campos por espaço. Quebramos "servico=x" e "ms=y" no =,
#    somamos por serviço e dividimos no final. sort -k2 -rn: 2ª coluna, número, decrescente.
awk '{
  split($2, s, "="); split($3, t, "=")
  soma[s[2]] += t[2]; n[s[2]]++
} END {
  for (k in soma) printf "%s %d\n", k, soma[k] / n[k]
}' /var/log/loja/latencia.log | sort -k2 -rn > ~/latencia.txt
cat ~/latencia.txt
