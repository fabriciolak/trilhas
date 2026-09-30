s=$CASA/site.txt

checar "~/site.txt existe" "curl -I http://localhost > ~/site.txt" test -s "$s"
checar "a evidência mostra o site fora do ar" "curl mostra 'Connection refused' ou o 502 antes do conserto" \
  grep -qiE 'refused|recusad|failed to connect|502|bad gateway' "$s"
checar "a configuração do nginx é válida" "nginx -t" nginx -t
checar "o nginx está ativo" "systemctl status nginx" systemctl is-active --quiet nginx
checar "a página da loja abre" "curl http://localhost" sh -c 'curl -fsS --max-time 3 http://localhost/ | grep -q "Pinguim Store"'
checar "o código HTTP é 200" "curl -I http://localhost" \
  test "$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://localhost/)" = 200
checar "a prova final está em ~/site.txt" "acrescente o curl -I que deu 200" grep -qE 'HTTP/[0-9.]+ 200' "$s"
