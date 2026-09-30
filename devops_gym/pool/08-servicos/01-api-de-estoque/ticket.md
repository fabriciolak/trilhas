---
mes: 3
semana: 9
palco: lab
tipo: ticket
nivel: 2
conceitos: systemctl, journalctl, unit, usuário de serviço, permissões, enable
---
# API de estoque

## TICKET
A API de estoque sumiu depois do deploy de ontem. Ela devia subir sozinha no boot e
responder na porta 8088, mas os clientes não conseguem falar com ela. A operação diz
que ela "tenta subir, some e tenta de novo".

Diagnostique e restaure **sem rodar o programa na mão**: quem cuida dele é o
supervisor do sistema.

1. Descubra o estado atual do serviço, se ele está habilitado no boot e o histórico
   recente de falhas.
2. Acompanhe os logs dele ao vivo durante pelo menos uma tentativa de reinício e
   identifique a reclamação exata.
3. Leia a definição do serviço (a unit) e o que ela referencia. Conserte a menor
   peça quebrada. **Não** troque o usuário do serviço para root: serviço não roda
   como root sem motivo. Reinicie pelo supervisor.
4. Pode haver mais de um problema, um atrás do outro. Repita o ciclo até ele ficar
   de pé.
5. Prove o conserto: continua ativo depois de alguns segundos, responde em
   `http://localhost:8088/saude` e está habilitado no boot. Salve as provas em
   `~/estoque.txt` usando redirecionamento, não editor.

## COMANDOS
systemctl journalctl cat ls stat grep useradd chown curl ss

## PERGUNTAS
1. Qual o papel do systemd como PID 1? Qual a diferença entre uma unit de serviço, um target e um timer?
2. Diferencie `start`, `restart`, `reload`, `enable` e `daemon-reload`. Qual mudança pede cada um, e quais afetam o boot e quais o processo atual?
3. Como os filtros do `journalctl` (`-u`, `-b`, `-p`, `-f`, `--since`) estreitam a linha do tempo de um incidente? Por que o journal é evidência melhor do que rodar o comando na mão?
4. Por que serviços rodam com usuários próprios, sem shell de login? O que muda para um invasor que explora esse serviço?
5. O que significa `status=217/USER`? E um código de saída 73?

## ESTUDE
- LINUXtips no YouTube, vídeos sobre systemd e serviços: https://www.youtube.com/@LINUXtips
- Documentação do Ubuntu Server (systemd e logs): https://documentation.ubuntu.com/server/
- `man systemd.service`, `man systemd.exec` (User=, EnvironmentFile=), `man journalctl`
