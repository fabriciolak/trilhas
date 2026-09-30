d=$CASA/treinos/rede
valor() { tr -d ' \n' < "$d/$1" 2>/dev/null; }
ip_ok() { local v; v=$(valor ip.txt); [ -n "$v" ] && [ "$v" != 127.0.0.1 ] && hostname -I | tr ' ' '\n' | grep -qxF "$v"; }
checar "1. ip.txt tem um IP desta máquina (não o loopback)" "hostname -I, ou ip -br a" ip_ok
checar "2. gateway.txt tem o gateway" "ip route | grep default" test "$(valor gateway.txt)" = "$(ip route | awk '/^default/ {print $3; exit}')"
checar "3. portas.txt lista as portas escutando (7171 e 7272 incluídas)" "sudo ss -tlnp > portas.txt" \
  sh -c "grep -q ':7171' $d/portas.txt && grep -q ':7272' $d/portas.txt"
checar "4. so-local.txt diz 7171" "no ss, o endereço da 7171 é 127.0.0.1" test "$(valor so-local.txt)" = 7171
checar "5. cabecalhos.txt tem os cabeçalhos (inclusive o X-Treino)" "curl -I (ou -i) http://localhost:7272/" \
  sh -c "grep -q '^HTTP/' $d/cabecalhos.txt && grep -qi '^X-Treino: rede-ok' $d/cabecalhos.txt"
checar "6. pinguim.exemplo resolve para 127.0.0.1 e nome.txt tem a prova" "echo '127.0.0.1 pinguim.exemplo' | sudo tee -a /etc/hosts; getent hosts pinguim.exemplo" \
  sh -c "getent hosts pinguim.exemplo | grep -q '^127.0.0.1' && grep -q pinguim.exemplo $d/nome.txt"
checar "7. nc.txt tem a prova de que a 7171 aceita conexão" "nc -zv localhost 7171 2> nc.txt (a mensagem vem na saída de erro)" \
  grep -qiE 'succeeded|open' "$d/nc.txt"
checar "8. dns.txt tem o servidor DNS" "grep nameserver /etc/resolv.conf" \
  sh -c "grep '^nameserver' /etc/resolv.conf | awk '{print \$2}' | grep -qxF \"\$(tr -d ' \n' < $d/dns.txt)\""
