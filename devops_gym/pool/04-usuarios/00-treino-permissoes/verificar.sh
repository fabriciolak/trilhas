d=$CASA/treinos/permissoes
checar "1. o grupo estudos existe" "sudo groupadd estudos" getent group estudos
checar "2. ana existe, com pasta pessoal e bash, no grupo estudos" "sudo useradd -m -s /bin/bash -G estudos ana" \
  sh -c "getent passwd ana | grep -q ':/home/ana:/bin/bash$' && test -d /home/ana && id -nG ana | grep -qw estudos"
checar "3. aluno está no grupo estudos (e continua no grupo aluno)" "sudo usermod -aG estudos aluno" \
  sh -c "id -nG aluno | grep -qw estudos && id -nG aluno | grep -qw aluno"
checar "4. /srv/estudos: grupo estudos, 2770" "sudo chgrp estudos /srv/estudos; sudo chmod 2770 /srv/estudos" \
  sh -c "test \"\$(stat -c '%G %a' /srv/estudos 2>/dev/null)\" = 'estudos 2770'"
checar "5. script.sh com 744" "chmod 744 (ou u=rwx,go=r)" test "$(stat -c %a $d/script.sh)" = 744
checar "6. segredo.txt com 600" "chmod 600" test "$(stat -c %a $d/segredo.txt)" = 600
checar "7. /srv/estudos/ana.txt é da ana e do grupo estudos" "sudo -u ana touch /srv/estudos/ana.txt" \
  test "$(stat -c '%U %G' /srv/estudos/ana.txt 2>/dev/null)" = "ana estudos"
checar "8. relatorio.txt é da ana e do grupo estudos" "sudo chown ana:estudos" test "$(stat -c '%U %G' $d/relatorio.txt)" = "ana estudos"
checar "9. octal.txt diz 750" "r=4, w=2, x=1" test "$(tr -d ' \n' < $d/octal.txt 2>/dev/null)" = 750
