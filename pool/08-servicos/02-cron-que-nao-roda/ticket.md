---
mes: 3
semana: 10
palco: lab
---
# Cron que não roda

## TICKET
A diretoria recebe um relatório de vendas gerado automaticamente. Pelo menos era o
combinado: faz uma semana que a pasta `/var/relatorios` não recebe nada. O
agendamento está em `/etc/cron.d/relatorio-vendas` e o programa é
`/usr/local/bin/relatorio-vendas`. Neste servidor de testes ele deveria rodar
**a cada minuto** e gravar `/var/relatorios/vendas-AAAA-MM-DD.txt` (data de hoje).

1. Confirme que o serviço de agendamento está rodando e veja o que ele registrou
   sobre esse agendamento.
2. Existe mais de um problema, e alguns só aparecem quando você roda o comando do
   jeito que o cron roda. Ache e conserte **no próprio arquivo de agendamento**.
3. Espere o próximo minuto e prove que o relatório foi gerado pelo cron (não por
   você). Anote em `~/cron.txt` cada problema que achou, uma linha por problema.

Desafio extra (não verificado): reescreva o mesmo agendamento como um
**timer do systemd** e compare.

## COMANDOS
systemctl journalctl cat ls chmod mkdir crontab date sleep man

## PERGUNTAS
1. Explique os cinco campos de tempo do cron. Como ficaria "às 06:30, de segunda a sexta"?
2. Qual a diferença de formato entre `crontab -e` e um arquivo em `/etc/cron.d`? Por que o `%` precisa de barra no crontab?
3. O cron roda com um ambiente mínimo (PATH curto, sem suas variáveis). Que tipos de erro isso causa, e como você se protege?
4. Para onde vai a saída de um job do cron? Por que um job que falha em silêncio é perigoso, e como você monitora isso?
5. Timer do systemd ou cron: quais as vantagens de cada um?

## ESTUDE
- GIRUS, lab "linux_automacao-agendamento": https://github.com/badtuxx/girus-cli
- `man 5 crontab` (formato e o `%`), `man cron`, `man systemd.timer`
- crontab.guru (inglês, testa expressões de horário na hora): https://crontab.guru/
