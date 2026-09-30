---
mes: 3
semana: 10
palco: lab
tipo: treino
nivel: 1
conceitos: cron, crontab, cron.d, expressões de agendamento, PATH do cron, systemd timers
---
# Treino: agendar tarefas

## AULA
**cron** roda comandos em horários marcados. Cada linha tem cinco campos de tempo e o
comando:

    ┌ minuto (0-59)
    │ ┌ hora (0-23)
    │ │ ┌ dia do mês (1-31)
    │ │ │ ┌ mês (1-12)
    │ │ │ │ ┌ dia da semana (0-7; 0 e 7 são domingo)
    * * * * *  comando

| exemplo | quando |
|---|---|
| `30 2 * * *` | todo dia às 02:30 |
| `*/15 * * * *` | a cada 15 minutos |
| `0 18 * * 1-5` | de segunda a sexta, às 18h |
| `0 0 1 * *` | dia 1 de cada mês, à meia-noite |
| `0 3 * * 0` | domingo, às 03:00 |

**Onde escrever.**

- `crontab -e`: o crontab do **seu** usuário (roda como você). `crontab -l` lista.
- `/etc/cron.d/arquivo`: tarefas do sistema. Tem um **sexto campo, o usuário**, antes do
  comando. O nome do arquivo não pode ter ponto, o arquivo é do root e não pode ser
  gravável por outros, e a última linha precisa terminar com quebra de linha.

**As armadilhas.** O cron roda com um `PATH` mínimo (`/usr/bin:/bin`): use caminhos
completos. Não tem terminal: redirecione a saída (`>> /var/log/x.log 2>&1`) ou ela se
perde. `%` é especial: escreva `\%` (em `date +\%F`). Para testar, agende "a cada
minuto" e olhe o resultado; depois ajuste o horário de verdade.

**Timers do systemd**, a alternativa moderna: um `.timer` dispara um `.service` e ganha
de brinde log no `journalctl`, dependências e `Persistent=true` (roda o que perdeu
enquanto a máquina estava desligada).

    # /etc/systemd/system/backup.timer
    [Timer]
    OnCalendar=*-*-* 03:00:00
    Persistent=true
    [Install]
    WantedBy=timers.target

`systemctl list-timers` mostra o próximo disparo de cada timer.

## TICKET
Respostas e scripts em `~/treinos/cron/`.

1. No **seu** crontab, agende `~/treinos/cron/marca.sh` (já existe) para rodar a cada
   minuto, acrescentando a saída em `~/treinos/cron/marca.log`. Espere um minuto e
   confira o log.
2. Em `expressoes.txt`, escreva as expressões (só os 5 campos), uma por linha, nesta
   ordem: (a) todo dia às 02:30; (b) de segunda a sexta às 18:00; (c) a cada 15 minutos;
   (d) no dia 1 de cada mês à meia-noite.
3. Crie `/etc/cron.d/limpeza-treino`: como root, todo domingo às 03:00, rode
   `/usr/bin/find /tmp -name "*.treino" -mtime +7 -delete`.
4. Crie um timer do systemd, `treino-backup.timer`, que dispara o `treino-backup.service`
   (que roda `/usr/bin/tar -czf /var/backups/treino.tar.gz /home/aluno/treinos/cron`)
   todo dia às 04:00. Ative o timer (não o serviço).

## COMANDOS
crontab -e crontab -l /etc/cron.d systemctl list-timers systemctl enable --now journalctl -u cron

## PERGUNTAS
1. Por que um script que funciona no terminal falha no cron? Cite duas causas.
2. Qual a diferença entre o `crontab -e` e um arquivo em `/etc/cron.d`?
3. O que um timer do systemd tem que o cron não tem?

## ESTUDE
- `man 5 crontab`, `man systemd.timer`
- crontab.guru (confere uma expressão em português claro): https://crontab.guru/
