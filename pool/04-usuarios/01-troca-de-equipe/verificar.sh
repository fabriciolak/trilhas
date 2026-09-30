a=$CASA/auditoria.txt

checar "~/auditoria.txt existe" "find / -user terceirizado ... 2>/dev/null > ~/auditoria.txt" test -s "$a"
checar "a auditoria achou a pasta escondida em /var/tmp" "find entra em pastas que começam com ponto" contem "$a" ".cache-terceirizado"
checar "a auditoria achou o gancho em /usr/local/lib" "procure no sistema inteiro, a partir de /" contem "$a" "notifica.sh"
checar "a auditoria tem dono e permissões" "find ... -ls, ou -exec ls -l {} +" grep -q 'terceirizado' "$a"
checar "a auditoria está limpa (sem 'Permission denied')" "2>/dev/null descarta a saída de erro" sh -c "! grep -qi 'permission denied\|permissão negada' '$a'"
checar "a conta terceirizado não existe mais" "userdel -r (ou deluser --remove-home)" sh -c '! id terceirizado'
checar "a pasta pessoal dele foi removida" "userdel -r" test ! -e /home/terceirizado
checar "nenhum processo dele continua rodando" "pkill -u (antes de apagar a conta)" sem_processo sincroniza.sh
checar "a joana existe" "useradd -m -s /bin/bash -G devs joana" id joana
checar "a joana tem pasta pessoal" "-m cria a home" test -d /home/joana
checar "o shell da joana é o bash" "-s /bin/bash" test "$(getent passwd joana | cut -d: -f7)" = /bin/bash
checar "a joana está no time devs" "-G devs ou usermod -aG devs joana" sh -c 'id -nG joana | grep -qw devs'
checar "o projeto é da joana, com grupo devs" "chown -R joana:devs /srv/projeto/api" \
  test -z "$(find /srv/projeto/api \( ! -user joana -o ! -group devs \) 2>/dev/null)"
checar "a joana lê o .env do projeto" "o arquivo é 640: dono lê e escreve, grupo lê" runuser -u joana -- cat /srv/projeto/api/.env
checar "as sobras foram apagadas" "gancho, rascunho, cache e relatório" \
  test ! -e /usr/local/lib/ganchos/notifica.sh -a ! -e /tmp/rascunho-terceirizado.txt -a ! -e /var/tmp/.cache-terceirizado -a ! -e /opt/relatorios/semana-38.csv
checar "o agendamento dele foi apagado" "crontab -r -u terceirizado (antes de apagar a conta), ou apague o arquivo do spool" \
  test ! -e /var/spool/cron/crontabs/terceirizado
checar "nenhum arquivo órfão no sistema" "find / -xdev \\( -nouser -o -nogroup \\)" \
  test -z "$(find / -xdev \( -nouser -o -nogroup \) -not -path '/proc/*' 2>/dev/null | head -n 1)"
