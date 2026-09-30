rel=/var/relatorios/vendas-$(date +%F).txt

checar "o cron está rodando" "systemctl status cron" systemctl is-active --quiet cron
checar "o agendamento continua em /etc/cron.d/relatorio-vendas" "conserte o arquivo, não mova para outro lugar" \
  test -f /etc/cron.d/relatorio-vendas
checar "a linha tem o campo de usuário" "em /etc/cron.d o 6º campo é o usuário: * * * * * root comando" \
  grep -qE '^[^#]*\*[[:space:]]+(root|[a-z_][a-z0-9_-]*)[[:space:]]+/usr/local/bin/relatorio-vendas' /etc/cron.d/relatorio-vendas
checar "o % está protegido" "no cron, % vira quebra de linha; escreva \\%" sh -c "! grep -v '^#' /etc/cron.d/relatorio-vendas | grep -qE '[^\\\\]%'"
checar "o programa é executável" "chmod +x" test -x /usr/local/bin/relatorio-vendas
checar "o relatório de hoje existe" "se acabou de consertar, espere o próximo minuto" test -s "$rel"
if [ -s "$rel" ]; then
  checar "o relatório foi gerado nos últimos 2 minutos (pelo cron)" "espere o cron rodar de novo" \
    test $(( $(date +%s) - $(stat -c %Y "$rel") )) -le 120
  checar "o relatório tem o conteúdo do programa" "o cron roda o programa e redireciona a saída" grep -q 'relatório de vendas' "$rel"
fi
checar "o cron registrou a execução no journal" "journalctl -u cron" \
  sh -c "journalctl -u cron --since '-3 min' --no-pager | grep -q 'relatorio-vendas'"
checar "~/cron.txt lista os problemas (3 ou mais linhas)" "uma linha por problema" test "$(grep -c . "$CASA/cron.txt" 2>/dev/null)" -ge 3
