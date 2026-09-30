---
mes: 2
semana: 5
palco: lab
---
# Troca de equipe

## TICKET
O RH encerrou agora o contrato do `terceirizado`, com efeito imediato. Hoje também
começa a Joana, no time `devs`. O compliance exige trilha de auditoria **antes** de
qualquer coisa ser destruída.

1. Primeiro, tranque a conta do `terceirizado`: ninguém mais entra com ela.
2. Auditoria: encontre **todo** arquivo do sistema que pertence ao `terceirizado`,
   onde quer que esteja, e salve a lista com dono e permissões em `~/auditoria.txt`.
   Mensagens de erro de pastas que você não pode ler não podem sujar o arquivo nem
   o terminal.
3. Crie a conta `joana` (com pasta pessoal, shell bash e no time `devs`) e passe
   para ela o projeto `/srv/projeto/api`, a pasta e tudo dentro, **mantendo o grupo
   `devs`**.
4. Todo o resto que era do terceirizado é descartável. Apague, inclusive tarefas
   agendadas.
5. Remova a conta e a pasta pessoal dele. O sistema pode reclamar de alguma coisa:
   leia a mensagem. Depois confirme que nenhum arquivo ficou **órfão** (sem dono).
6. Prove o acesso da Joana: vire a Joana, confira quem ela é e os grupos dela, e
   leia o `.env` do projeto.

## COMANDOS
passwd usermod useradd adduser userdel deluser id groups su sudo find chown chgrp ls stat ps pkill crontab

## PERGUNTAS
1. O que acontece com os processos e arquivos de um usuário quando você apaga a conta? Por que os roteiros de desligamento encerram sessões e passam arquivos adiante antes do `userdel`?
2. Grupo primário e grupos suplementares: qual a diferença? Quando um usuário cria um arquivo, qual grupo o arquivo recebe?
3. `su - joana` e `su joana`: o que o `-` muda? Quando pular o `-` já causou problema em produção?
4. Por que pastas de projeto compartilhado costumam usar o bit setgid? Que problema deste ticket ele evitaria?
5. Por que trancar a conta é o primeiro passo, e não o último?

## ESTUDE
- LPI Linux Essentials, tópicos 5.1 (tipos de usuários) e 5.2 (criando usuários e grupos): https://learning.lpi.org/pt/learning-materials/010-160/
- GIRUS (laboratório interativo em português): lab "linux_gerenciamento-usuarios": https://github.com/badtuxx/girus-cli
- `man useradd`, `man userdel`, `man find` (procure `-user`, `-nouser`)
