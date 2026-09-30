---
mes: 5
semana: 19
palco: lab
---
# Playbook quebrado

## TICKET
O Beto começou a automatizar a configuração dos servidores com Ansible, e o primeiro
playbook, que sobe um painel de status da loja, nunca funcionou. Está em
`~/ansible/`: o inventário `inventario.ini`, o playbook `painel.yml` e as pastas
`templates/` e `files/`. O alvo é este próprio servidor.

A regra do time: **nada na mão no servidor**. Tudo que o painel precisa (usuário,
pasta, página, configuração, serviço) sai do playbook. Se você arrumar algo na mão,
a próxima máquina nasce quebrada.

1. Rode o playbook e leia o erro. Use a checagem de sintaxe do próprio Ansible antes
   de rodar de novo.
2. São vários problemas, um escondendo o outro. Conserte um de cada vez, sempre no
   playbook ou no inventário. Atenção: um dos problemas não dá erro, só faz o
   playbook não fazer nada. Leia os avisos.
3. Quando passar, rode **de novo**: a segunda execução não pode mudar nada
   (`changed=0`). Isso se chama idempotência.
4. Prove: `http://localhost:8090` mostra a página com o título do painel, e o serviço
   `painel` está ativo e habilitado no boot.

## COMANDOS
ansible ansible-playbook ansible-doc ansible-inventory cat curl systemctl

## PERGUNTAS
1. O que é idempotência e por que ela é o coração de ferramentas de configuração como o Ansible?
2. Qual a diferença entre `command`/`shell` e módulos como `user`, `file` e `template`? Por que preferir módulos?
3. Para que servem handlers? Por que reiniciar o serviço só quando a configuração muda?
4. O Ansible não tem agente: como ele chega nas máquinas? O que precisa existir do outro lado?
5. Ansible e Terraform: onde termina o trabalho de um e começa o do outro?

## ESTUDE
- LINUXtips, material "Descomplicando o Ansible" (em português, no GitHub): https://github.com/badtuxx/descomplicando-ansible-2020
- Documentação oficial (inglês), "Getting started": https://docs.ansible.com/ansible/latest/getting_started/index.html
- `ansible-doc ansible.builtin.template` (a documentação de cada módulo, no terminal)
