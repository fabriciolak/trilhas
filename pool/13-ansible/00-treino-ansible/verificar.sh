d=$CASA/treinos/ansible
checar "1. o inventário tem localhost no grupo local, e o ping responde" "[local] / localhost ansible_connection=local" \
  sh -c "cd $d && runuser -u aluno -- env HOME=$CASA ansible local -i inventario.ini -m ansible.builtin.ping 2>&1 | grep -q SUCCESS"
checar "2. versao.txt tem a versão do sistema" "ansible local -i inventario.ini -m ansible.builtin.setup -a 'filter=ansible_distribution_version'" \
  grep -q '24.04' "$d/versao.txt"
checar "3. /srv/app é do aluno, 0755" "ansible.builtin.file" test "$(stat -c '%U %a' /srv/app 2>/dev/null)" = "aluno 755"
checar "3. /srv/app/index.html é a página" "ansible.builtin.copy" cmp -s "$d/files/index.html" /srv/app/index.html
checar "3. /etc/app.conf tem max_conexoes = 100" "ansible.builtin.lineinfile, create: true" grep -qx 'max_conexoes = 100' /etc/app.conf
checar "3. o modelo usa a variável porta" "templates/porta.conf.j2: porta = {{ porta }}" grep -q '{{ *porta *}}' "$d/templates/porta.conf.j2"
checar "3. /etc/app-porta.conf diz porta = 8080" "vars: porta: 8080" grep -qx 'porta = 8080' /etc/app-porta.conf
checar "3. o handler registrou a mudança" "notify + handlers" test -s /var/log/app-mudancas.log
antes=$(wc -l < /var/log/app-mudancas.log 2>/dev/null || echo 0)
saida=$(cd "$d" && runuser -u aluno -- env HOME=$CASA ansible-playbook -i inventario.ini site.yml 2>&1)
idempotente() { printf '%s\n' "$saida" | grep -q 'changed=0.*failed=0'; }
checar "4. rodar de novo não muda nada (changed=0, failed=0)" "troque command/shell por módulos que sabem se já está feito" idempotente
checar "4. sem mudança, o handler não roda" "handler só roda quando a tarefa muda" test "$(wc -l < /var/log/app-mudancas.log 2>/dev/null || echo 0)" = "$antes"
checar "5. simulacao.txt mostra a porta 9090 sem mudar o arquivo de verdade" "ansible-playbook ... --check --diff -e porta=9090 > simulacao.txt" \
  sh -c "grep -q 9090 $d/simulacao.txt && grep -qx 'porta = 8080' /etc/app-porta.conf"
