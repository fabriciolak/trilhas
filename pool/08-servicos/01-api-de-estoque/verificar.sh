u=estoque-api

checar "o serviço está ativo" "systemctl status $u; journalctl -u $u" systemctl is-active --quiet $u
pid1=$(systemctl show -p MainPID --value $u); sleep 4; pid2=$(systemctl show -p MainPID --value $u)
checar "continua de pé (o mesmo processo depois de alguns segundos)" "se o PID muda, ele está caindo e voltando" \
  test "$pid1" != 0 -a "$pid1" = "$pid2"
checar "está habilitado no boot" "systemctl enable" systemctl is-enabled --quiet $u
checar "continua rodando como o usuário estoque (não como root)" "crie o usuário em vez de trocar a unit" \
  test "$(systemctl show -p User --value $u)" = estoque
checar "o usuário estoque é de sistema, sem shell de login" "useradd --system --shell /usr/sbin/nologin estoque" \
  sh -c 'uid=$(id -u estoque) && [ "$uid" -lt 1000 ] && getent passwd estoque | grep -qE "(nologin|false)$"'
checar "responde em /saude" "curl http://localhost:8088/saude" sh -c 'curl -fsS --max-time 3 http://localhost:8088/saude | grep -q ok'
checar "~/estoque.txt tem as provas" "systemctl status ... > ~/estoque.txt; curl ... >> ~/estoque.txt" \
  sh -c "grep -q 'active (running)' $CASA/estoque.txt && grep -q '\"ok\"' $CASA/estoque.txt"
