i=$CASA/incidente.txt
d=/var/lib/checkout
c=/etc/cron.d/exportar-pedidos
ip=$(hostname -I | awk '{print $1}')

# O disco e os dados.
checar "o exportador travado não está mais rodando" "lsof +L1: quem segura um arquivo apagado?" sem_processo 'bin/exportar-pedidos$'
checar "a partição do checkout tem espaço de novo" "df -h diz cheio e du diz vazio: arquivo apagado ainda aberto" \
  test "$(df --output=pcent $d | tail -n 1 | tr -dc 0-9)" -lt 50
checar "pedidos.db é do usuário do serviço" "journalctl -u checkout; ls -l $d" test "$(stat -c %U $d/pedidos.db)" = checkout
checar "os pedidos do fim de semana continuam lá" "conserte o dono, não recrie o arquivo" \
  sh -c "head -n 480 $d/pedidos.db | cmp -s - /opt/checkout/semente/pedidos.db"

# O serviço.
checar "o checkout está ativo" "systemctl status checkout; journalctl -u checkout -n 20" systemctl is-active --quiet checkout
checar "o checkout sobe no boot" "systemctl enable checkout" systemctl is-enabled --quiet checkout
checar "o serviço continua rodando como checkout" "não troque o usuário do serviço" \
  test "$(systemctl show -p User --value checkout)" = checkout
checar "escuta na porta 8300 em todas as interfaces" "ss -tlnp; /etc/checkout/checkout.env" \
  sh -c "ss -Htln | awk '{print \$4}' | grep -qE '^(0\.0\.0\.0|\*|\[::\]):8300$'"
checar "responde pela rede em http://$ip:8300/saude" "curl -s http://$ip:8300/saude" \
  sh -c "curl -sf --max-time 3 http://$ip:8300/saude | grep -q '\"ok\"'"

pid=$(systemctl show -p MainPID --value checkout 2>/dev/null)
if [ "${pid:-0}" -gt 0 ]; then
  kill -9 "$pid"; sleep 5
  novo=$(systemctl show -p MainPID --value checkout)
  if systemctl is-active --quiet checkout && [ "${novo:-0}" -gt 0 ] && [ "$novo" != "$pid" ]; then
    ok "o checkout voltou sozinho depois de um kill -9"
  else
    falha "o checkout voltou sozinho depois de um kill -9" "Restart=on-failure na seção [Service] (systemctl edit checkout) e daemon-reload"
  fi
else
  falha "o checkout voltou sozinho depois de um kill -9" "primeiro ele precisa estar rodando"
fi

# O cron.
checar "existe /etc/cron.d/exportar-pedidos" "arquivo em /etc/cron.d, sem ponto no nome" test -f "$c"
checar "o agendamento: 03:10 todo dia, como checkout, caminho completo, --sim" \
  "minuto hora dia mês dia-da-semana USUÁRIO comando; o cron tem um PATH mínimo" \
  grep -qE '^[[:space:]]*10[[:space:]]+0?3[[:space:]]+\*[[:space:]]+\*[[:space:]]+\*[[:space:]]+checkout[[:space:]]+/usr/local/bin/exportar-pedidos[[:space:]]+--sim' "$c"
checar "o arquivo do cron é do root e só ele escreve" "o cron ignora arquivos que outros podem alterar" \
  sh -c "test \"\$(stat -c %U $c)\" = root && test \$(( 0\$(stat -c %a $c) & 022 )) -eq 0"
checar "o arquivo do cron termina com quebra de linha" "a última linha sem \\n é ignorada" sh -c "test -z \"\$(tail -c 1 $c)\""
checar "o exportador roda como checkout, sem perguntar" "sudo -u checkout /usr/local/bin/exportar-pedidos --sim" \
  runuser -u checkout -- timeout 20 /usr/local/bin/exportar-pedidos --sim

# O relatório.
checar "~/incidente.txt existe" "a linha do tempo, com >>" test -s "$i"
checar "o incidente registra a permissão errada" "o primeiro erro do journal" grep -qiE 'permiss|chown' "$i"
checar "o incidente registra quem enchia o disco (arquivo apagado ainda aberto)" "lsof +L1 mostra (deleted)" \
  sh -c "grep -qi exportar-pedidos '$i' && grep -qiE 'deleted|apagad' '$i'"
checar "o incidente registra onde o checkout escutava" "ss -tlnp" grep -qE '8030|127\.0\.0\.1' "$i"
