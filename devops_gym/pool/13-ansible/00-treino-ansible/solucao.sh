# Treino de Ansible: uma solução possível.
cd ~/treinos/ansible
printf '[local]\nlocalhost ansible_connection=local\n' > inventario.ini
ansible local -i inventario.ini -m ansible.builtin.ping
ansible local -i inventario.ini -m ansible.builtin.setup -a 'filter=ansible_distribution_version' > versao.txt
mkdir -p templates
echo 'porta = {{ porta }}' > templates/porta.conf.j2
cat > site.yml <<'YML'
- name: Configura a app do treino
  hosts: local
  become: true
  vars:
    porta: 8080
  tasks:
    - name: Pasta da app
      ansible.builtin.file:
        path: /srv/app
        state: directory
        owner: aluno
        mode: "0755"

    - name: Página
      ansible.builtin.copy:
        src: files/index.html
        dest: /srv/app/index.html
        mode: "0644"

    - name: Limite de conexões
      ansible.builtin.lineinfile:
        path: /etc/app.conf
        line: "max_conexoes = 100"
        create: true
        mode: "0644"

    - name: Porta da app
      ansible.builtin.template:
        src: templates/porta.conf.j2
        dest: /etc/app-porta.conf
        mode: "0644"
      notify: Registrar mudança

  handlers:
    - name: Registrar mudança
      ansible.builtin.shell: date >> /var/log/app-mudancas.log
YML
ansible-playbook -i inventario.ini site.yml --syntax-check
ansible-playbook -i inventario.ini site.yml
ansible-playbook -i inventario.ini site.yml | tail -n 3        # changed=0
ansible-playbook -i inventario.ini site.yml --check --diff -e porta=9090 > simulacao.txt
cat /etc/app-porta.conf
