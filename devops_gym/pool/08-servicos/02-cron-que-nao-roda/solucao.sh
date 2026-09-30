# Cron que não roda: uma solução possível.

# 1. O cron está vivo? O que ele diz? Aparece algo como:
#    "Error: bad username; while reading /etc/cron.d/relatorio-vendas"
systemctl status cron --no-pager | head -n 5
journalctl -u cron --no-pager -n 20
cat /etc/cron.d/relatorio-vendas

# 2. Problemas:
#    a) Em /etc/cron.d, depois dos 5 campos de tempo vem o USUÁRIO (no crontab -e, não).
#    b) No cron, % é especial (vira quebra de linha): date +%F precisa ser date +\%F.
#    c) O programa não tem permissão de execução (rodando na mão: "Permission denied").
#    d) /var/relatorios não existe ("No such file or directory" no redirecionamento).
#    E sem 2>&1 os erros vão para um e-mail que ninguém lê ("No MTA installed").
/usr/local/bin/relatorio-vendas || true           # reproduzir como o cron faria
sudo chmod 755 /usr/local/bin/relatorio-vendas
sudo mkdir -p /var/relatorios
sudo tee /etc/cron.d/relatorio-vendas > /dev/null <<'EOF'
# Relatório de vendas. Em produção é diário; neste servidor de testes, a cada minuto.
* * * * * root /usr/local/bin/relatorio-vendas > /var/relatorios/vendas-$(date +\%F).txt 2>&1
EOF

{
  echo "faltava o campo de usuário (root) na linha de /etc/cron.d"
  echo "o % do date precisava de barra (\\%): o cron trata % como quebra de linha"
  echo "o programa não tinha permissão de execução (chmod 755)"
  echo "a pasta /var/relatorios não existia"
} > ~/cron.txt

# 3. Esperar o cron (ele relê /etc/cron.d a cada minuto) e conferir.
for _ in $(seq 1 30); do
  [ -s "/var/relatorios/vendas-$(date +%F).txt" ] && break
  sleep 5
done
ls -l /var/relatorios; cat "/var/relatorios/vendas-$(date +%F).txt"
journalctl -u cron --no-pager -n 5
