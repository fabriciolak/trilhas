d=$CASA/treinos/cron
e=$d/expressoes.txt
c=/etc/cron.d/limpeza-treino
checar "1. o crontab do aluno roda marca.sh a cada minuto, acrescentando em marca.log" "crontab -e: * * * * * /home/aluno/treinos/cron/marca.sh >> /home/aluno/treinos/cron/marca.log 2>&1" \
  sh -c "crontab -l -u aluno 2>/dev/null | grep -v '^#' | grep -E '^\* \* \* \* \* ' | grep 'marca.sh' | grep -q '>> *[^ ]*marca.log'"
checar "1. marca.log já tem pelo menos uma marca (espere um minuto)" "o cron está rodando? systemctl status cron" grep -q '^marca: ' "$d/marca.log"
linha() { sed -n "${1}p" "$e" 2>/dev/null | tr -s ' ' | sed 's/^ //; s/ $//'; }
checar "2a. todo dia às 02:30" "minuto primeiro: 30 2 * * *" test "$(linha 1)" = "30 2 * * *"
checar "2b. de segunda a sexta às 18:00" "0 18 * * 1-5" sh -c "echo '$(linha 2)' | grep -qE '^0 18 \* \* (1-5|mon-fri)$'"
checar "2c. a cada 15 minutos" "*/15 * * * *" sh -c "echo '$(linha 3)' | grep -qE '^(\*/15|0,15,30,45) \* \* \* \*$'"
checar "2d. dia 1 de cada mês, à meia-noite" "0 0 1 * *" test "$(linha 4)" = "0 0 1 * *"
checar "3. /etc/cron.d/limpeza-treino: domingo 03:00, como root, o find" "0 3 * * 0 root /usr/bin/find ..." \
  grep -qE '^0 3 \* \* (0|7|sun) +root +/usr/bin/find /tmp -name [^ ]*\.treino[^ ]* -mtime \+7 -delete' "$c"
checar "3. o arquivo é do root, ninguém mais escreve, e termina com quebra de linha" "sudo tee; chmod 644" \
  sh -c "test \"\$(stat -c %U $c)\" = root && test \$(( 0\$(stat -c %a $c) & 022 )) -eq 0 && test -z \"\$(tail -c 1 $c)\""
checar "4. o treino-backup.service roda o tar" "ExecStart=/usr/bin/tar -czf /var/backups/treino.tar.gz /home/aluno/treinos/cron" \
  sh -c "systemctl show -p ExecStart --value treino-backup.service | grep -q 'treino.tar.gz'"
checar "4. o timer está ativo e dispara às 04:00" "OnCalendar=*-*-* 04:00:00; sudo systemctl enable --now treino-backup.timer" \
  sh -c "systemctl is-active --quiet treino-backup.timer && systemctl is-enabled --quiet treino-backup.timer && systemctl cat treino-backup.timer | grep -qE '^OnCalendar=.*04:00'"
