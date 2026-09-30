r=$CASA/rede.txt
ip_servidor=$(hostname -I | awk '{print $1}')

checar "~/rede.txt existe" "junte as evidências com >>" test -s "$r"
checar "a evidência mostra o IP errado (10.20.30.40)" "getent hosts fretes.interno" contem "$r" "10.20.30.40"
resolvido=$(getent hosts fretes.interno | awk '{print $1; exit}')
checar "fretes.interno resolve para este servidor (127.0.0.1 ou $ip_servidor)" \
  "tire a linha errada do /etc/hosts; sed -i falha aqui, mas cp e tee escrevem no mesmo arquivo" \
  sh -c "[ '$resolvido' = 127.0.0.1 ] || [ '$resolvido' = '$ip_servidor' ]"
checar "o fretes-api escuta em todas as interfaces" "BIND=0.0.0.0 em /etc/fretes/fretes.env e systemctl restart fretes-api" \
  sh -c "ss -tlnH | awk '{print \$4}' | grep -qE '^(0\.0\.0\.0|\*|\[::\]):7070$'"
checar "o fretes-api continua rodando pelo systemd" "systemctl status fretes-api" systemctl is-active --quiet fretes-api
checar "responde pelo IP do servidor ($ip_servidor)" "curl http://$ip_servidor:7070/cotacao" \
  sh -c "curl -fsS --max-time 3 http://$ip_servidor:7070/cotacao | grep -q prazo_dias"
checar "checkout-cotacao funciona" "rode de novo depois dos consertos" sh -c 'checkout-cotacao | grep -q prazo_dias'
checar "a saída que funcionou está no relatório" "checkout-cotacao >> ~/rede.txt" contem "$r" "prazo_dias"
