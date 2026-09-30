---
mes: 3
semana: 12
palco: lab
tipo: ticket
nivel: 2
conceitos: authorized_keys, permissões do .ssh, sshd_config, AllowUsers, ssh -v
---
# Chave recusada

## TICKET
O pipeline de deploy entra nos servidores como o usuário `deploy`, por SSH, com
chave. Neste servidor ele parou de entrar. Para testar sem depender do pipeline, a
sua chave (`~/.ssh/id_ed25519.pub`) já foi autorizada para o `deploy`. Mesmo assim,
`ssh deploy@localhost` é recusado.

1. Reproduza e peça ao cliente SSH para contar o que está fazendo, em detalhe.
   O cliente sozinho não diz o motivo.
2. Leia o lado do **servidor**: o log do serviço de SSH conta o motivo real. Pode
   haver mais de um, um de cada vez.
3. Conserte **sem abrir o servidor para todo mundo**: a política de segurança que
   existe deve continuar valendo para quem já estava nela. Valide a configuração do
   servidor SSH antes de aplicar.
4. Conserte as permissões no lado do `deploy`, do jeito que o servidor SSH exige.
5. Crie um atalho no **seu** `~/.ssh/config` chamado `deploy-local` (máquina
   localhost, usuário deploy, sua chave). No fim, `ssh deploy-local hostname` tem que
   funcionar sem pedir senha.

## COMANDOS
ssh ssh-keygen journalctl systemctl sshd ls chmod chown cat stat

## PERGUNTAS
1. Explique autenticação por chave pública: o que fica no cliente, o que fica no servidor, e o que nunca sai da sua máquina?
2. Por que o servidor SSH recusa uma chave quando a pasta pessoal ou o `authorized_keys` podem ser alterados por outras pessoas (StrictModes)?
3. O que é o `known_hosts` e que ataque ele evita? O que fazer quando aparece "REMOTE HOST IDENTIFICATION HAS CHANGED"?
4. Por que desligar senha e login de root no SSH é padrão em servidores de produção? Que outras camadas você colocaria (AllowUsers, firewall, fail2ban, bastion)?
5. Por que validar com `sshd -t` antes de recarregar é vital quando você está conectado por SSH na máquina?

## ESTUDE
- LPI Linux Essentials, tópico 4.4 (seu computador na rede) e 5.1 (segurança básica): https://learning.lpi.org/pt/learning-materials/010-160/
- Pro Git em português, "Git no Servidor: gerando sua chave pública SSH": https://git-scm.com/book/pt-br/v2
- `man ssh_config`, `man sshd_config` (procure StrictModes, AllowUsers)
