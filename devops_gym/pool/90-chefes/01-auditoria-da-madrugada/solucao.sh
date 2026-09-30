# Auditoria da madrugada: uma solução possível.
cd /var/log/pagamentos
ls -l                                   # o atual, o .1 e dois .gz

# zcat -f lê arquivos comprimidos e normais do mesmo jeito: um fluxo só, com os quatro.
todos() { zcat -f /var/log/pagamentos/transacoes.log*; }

# 1. Totais.
echo "total de transações: $(todos | wc -l)" > ~/auditoria.txt
echo "total de recusadas: $(todos | grep -c 'status=RECUSADA')" >> ~/auditoria.txt

# 2. Ranking: só recusadas, só o BIN, conta e ordena.
{ echo "ranking de recusas por BIN:"; todos | grep 'status=RECUSADA' | grep -o 'cartao_bin=[0-9]*' | sort | uniq -c | sort -rn | head -n 3; } >> ~/auditoria.txt
campeao=$(todos | grep 'status=RECUSADA' | grep -o 'cartao_bin=[0-9]*' | sort | uniq -c | sort -rn | head -n 1 | awk -F= '{print $2}')
# (Contando só o transacoes.log, o campeão seria outro: o 411111 está nos .gz.)

# 3. Motivo mais comum do campeão.
{ echo "motivo mais comum do $campeao:"; todos | grep "cartao_bin=$campeao" | grep 'status=RECUSADA' | grep -o 'motivo=[a-z_]*' | sort | uniq -c | sort -rn | head -n 1; } >> ~/auditoria.txt

# 4. Acrescenta no fim da linha, com backup. O endereço /^bins_bloqueados/ limita a troca.
sudo sed -i.bak "/^bins_bloqueados/s/\$/,$campeao/" /etc/pagamentos/regras.conf
diff /etc/pagamentos/regras.conf.bak /etc/pagamentos/regras.conf

# 5. Evidências.
tar -czf ~/evidencias.tar.gz -C /var/log pagamentos
tar -tzf ~/evidencias.tar.gz
cat ~/auditoria.txt
