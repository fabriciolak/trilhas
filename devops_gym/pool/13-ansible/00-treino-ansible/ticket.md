---
mes: 5
semana: 19
palco: lab
tipo: treino
nivel: 1
conceitos: ansible, inventário, ad-hoc, módulos, playbook, become, variáveis, template, handler, idempotência, --check --diff
---
# Treino: Ansible do zero

## AULA
**Ansible** configura máquinas a partir de arquivos de texto: você descreve o **estado
desejado** ("este pacote instalado, este arquivo com este conteúdo") e ele faz só o que
falta. Não precisa de agente: entra por SSH (ou local, como aqui) e roda módulos em Python.

**Inventário**: quem são as máquinas.

    [web]
    servidor1 ansible_host=10.0.0.5
    [local]
    localhost ansible_connection=local

**Ad-hoc**: um módulo, uma vez, na linha de comando.

    ansible local -i inventario.ini -m ansible.builtin.ping
    ansible local -i inventario.ini -m ansible.builtin.setup -a 'filter=ansible_distribution*'
    ansible local -i inventario.ini -m ansible.builtin.command -a 'uptime'

**Playbook**: uma lista de tarefas, em YAML (indentação com espaços, sempre).

    - name: Configura a app
      hosts: local
      become: true                    # tarefas como root (sudo)
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
            src: files/index.html     # relativo ao playbook
            dest: /srv/app/index.html
        - name: Uma linha garantida num arquivo
          ansible.builtin.lineinfile:
            path: /etc/app.conf
            line: "max_conexoes = 100"
            create: true
        - name: Arquivo a partir de um modelo (Jinja2)
          ansible.builtin.template:
            src: templates/porta.conf.j2  # dentro dele: porta = {{ porta }}
            dest: /etc/app-porta.conf
          notify: Registrar mudança       # dispara o handler só quando MUDA
      handlers:
        - name: Registrar mudança
          ansible.builtin.shell: date >> /var/log/app-mudancas.log

**Idempotência**: rodar de novo não muda nada (`changed=0` no resumo). É o que permite
rodar o playbook a qualquer hora, sem medo. `command` e `shell` sempre dizem `changed`:
prefira módulos de verdade (`file`, `copy`, `template`, `lineinfile`, `apt`, `service`).

    ansible-playbook -i inventario.ini site.yml --syntax-check
    ansible-playbook -i inventario.ini site.yml --check --diff   # simula e mostra o que mudaria
    ansible-playbook -i inventario.ini site.yml -e porta=9090     # variável na linha de comando
    ansible-doc ansible.builtin.lineinfile                        # manual do módulo, no terminal

## TICKET
Tudo em `~/treinos/ansible/` (a página já está em `files/index.html`).

1. Escreva `inventario.ini` com o grupo `local`, contendo `localhost` com conexão local.
   Prove com o módulo `ping`.
2. Com um comando ad-hoc, descubra a versão do sistema (`ansible_distribution_version`)
   e salve a saída em `versao.txt`.
3. Escreva `site.yml` para o grupo `local` que:
   - cria `/srv/app`, do usuário `aluno`, com `0755`;
   - copia `files/index.html` para `/srv/app/index.html`;
   - garante a linha `max_conexoes = 100` em `/etc/app.conf` (criando o arquivo);
   - gera `/etc/app-porta.conf` a partir do modelo `templates/porta.conf.j2` (crie o
     modelo), com a variável `porta` valendo `8080`: o arquivo final diz `porta = 8080`;
   - quando o `app-porta.conf` mudar, um handler acrescenta a data em
     `/var/log/app-mudancas.log`.
4. Rode o playbook. Rode de novo: a segunda vez tem de dar `changed=0`.
5. Simule a porta `9090` sem mudar nada de verdade (modo de checagem, com as
   diferenças) e salve a saída em `simulacao.txt`.

## COMANDOS
ansible ansible-playbook --syntax-check --check --diff -e ansible-doc

## PERGUNTAS
1. O que é idempotência, e por que ela é a propriedade mais importante de um playbook?
2. Por que preferir `ansible.builtin.lineinfile` a um `shell: echo ... >> arquivo`?
3. Quando um handler roda? E se duas tarefas notificarem o mesmo handler?

## ESTUDE
- Descomplicando o Ansible (LINUXtips): https://github.com/badtuxx/descomplicando-ansible-2020
- Documentação oficial, "Getting started": https://docs.ansible.com/ansible/latest/getting_started/index.html
