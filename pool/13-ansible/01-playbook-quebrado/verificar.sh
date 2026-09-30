base=$CASA/ansible

# Primeiro o estado que o aluno deixou; depois uma execução para medir idempotência.
checar "o serviço painel está ativo" "o último passo do playbook liga o serviço" systemctl is-active --quiet painel
checar "o serviço painel está habilitado no boot" "enabled: true" systemctl is-enabled --quiet painel
checar "http://localhost:8090 mostra o título do painel" "o título vem de uma variável no template" \
  sh -c 'curl -fsS --max-time 3 http://localhost:8090/ | grep -q "<h1>Painel da Pinguim Store</h1>"'
checar "o painel roda como o usuário painel" "User=painel na unit" sh -c "ps -o user= -C python3 | grep -qw painel"

saida=$(cd "$base" && como_aluno ansible-playbook -i inventario.ini painel.yml 2>&1); rc=$?
checar "o playbook roda sem erro" "rode você mesmo: cd ~/ansible && ansible-playbook -i inventario.ini painel.yml" test "$rc" -eq 0
if printf '%s\n' "$saida" | grep -qE 'skipping: no hosts matched|Could not match supplied host pattern'; then
  falha "o playbook encontra o servidor no inventário" "o grupo do playbook (hosts:) precisa existir no inventário"
else
  ok "o playbook encontra o servidor no inventário"
fi
checar "a execução é idempotente (changed=0)" "rode duas vezes; na segunda nada deveria mudar" \
  sh -c "printf '%s\n' \"\$1\" | grep -qE 'ok=[1-9][0-9]* +changed=0 +unreachable=0 +failed=0'" _ "$saida"
