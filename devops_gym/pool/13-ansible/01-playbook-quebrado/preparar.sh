#!/usr/bin/env bash
# Playbook quebrado: seis defeitos em fila (indentação, módulo com erro de digitação,
# grupo que não casa com o inventário, sem become, variável com nome errado e handler
# com nome diferente do notify).
set -euo pipefail

base=/home/aluno/ansible
mkdir -p "$base/templates" "$base/files"

cat > "$base/inventario.ini" <<'EOF'
[servidor]
localhost ansible_connection=local
EOF

cat > "$base/painel.yml" <<'EOF'
---
- name: Configura o painel de status da loja
  hosts: servidores
  become: false
  vars:
    painel_porta: 8090
    painel_titlo: Painel da Pinguim Store

  tasks:
    - name: Cria o usuário do serviço
      ansible.builtin.user:
        name: painel
        system: true
        shell: /usr/sbin/nologin
        create_home: false

    - name: Cria a pasta do site
      ansible.builtin.file:
        path: /srv/painel
        state: directory
        owner: painel
        group: painel
        mode: "0755"

    - name: Gera a página inicial
      ansible.builtin.template:
        src: templates/index.html.j2
        dest: /srv/painel/index.html
        owner: painel
        group: painel
        mode: "0644"

    - name: Gera a configuração do serviço
      ansible.builtin.template:
        src: templates/painel.env.j2
        dest: /etc/painel.env
        mode: "0644"
      notify: Reiniciar painel

   - name: Instala a unit do systemd
      ansible.builtin.copyy:
        src: files/painel.service
        dest: /etc/systemd/system/painel.service
        mode: "0644"
      notify: Reiniciar painel

    - name: Liga o painel e habilita no boot
      ansible.builtin.systemd_service:
        name: painel
        state: started
        enabled: true
        daemon_reload: true

  handlers:
    - name: reiniciar painel
      ansible.builtin.systemd_service:
        name: painel
        state: restarted
EOF

cat > "$base/templates/index.html.j2" <<'EOF'
<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>{{ painel_titulo }}</title></head>
<body>
  <h1>{{ painel_titulo }}</h1>
  <p>Servidor {{ ansible_facts['hostname'] }}, porta {{ painel_porta }}. Gerado pelo Ansible.</p>
</body>
</html>
EOF

cat > "$base/templates/painel.env.j2" <<'EOF'
PORTA={{ painel_porta }}
EOF

cat > "$base/files/painel.service" <<'EOF'
[Unit]
Description=Painel de status da Pinguim Store
After=network.target

[Service]
User=painel
EnvironmentFile=/etc/painel.env
ExecStart=/usr/bin/python3 -m http.server ${PORTA} --directory /srv/painel
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

chown -R aluno:aluno "$base"
