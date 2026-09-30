---
mes: 3
semana: 13
palco: lab
tipo: chefe
nivel: 3
conceitos: systemd, journalctl, permissões, df x du, lsof, arquivo apagado aberto, ss, portas, Restart=, cron.d
---
# Servidor em chamas

## TICKET
Chefe do mês 3. Segunda, 8h. O **checkout** da loja está fora do ar desde a madrugada e o
balanceador não consegue falar com ele. O combinado com o balanceador: o checkout
responde em `http://<ip deste servidor>:8300/saude` para as **outras máquinas** da rede
(`hostname -I` mostra o IP). Quem cuida do programa é o systemd (`checkout.service`); os
dados ficam em `/var/lib/checkout`, uma partição só dele.

Ponha o checkout de pé **sem rodar o programa na mão**, sem trocar o usuário do serviço
e **sem perder os pedidos** que estão em `/var/lib/checkout/pedidos.db`. Os problemas
aparecem um atrás do outro: leia o log a cada tentativa.

Depois que ele subir:

1. Ele tem de voltar sozinho se o processo morrer (teste matando o processo principal)
   e tem de subir sozinho no boot.
2. Quem encheu o disco foi o `exportar-pedidos`, rodado na mão por alguém na sexta. A
   partir de agora ele só roda pelo cron: todo dia às 03:10, como o usuário `checkout`,
   no modo sem perguntas (`--sim`), num arquivo em `/etc/cron.d/`.
3. Em `~/incidente.txt`, a linha do tempo: cada causa que você achou, na ordem, com a
   evidência (o trecho do log, a linha do `lsof`, o que o `ss` mostrou...).

## COMANDOS
systemctl journalctl ls stat chown df du lsof ps kill ss curl hostname tee

## PERGUNTAS
1. Por que o `df` e o `du` discordaram? O que acontece com um arquivo apagado que ainda está aberto, e por que "reiniciar o serviço" às vezes resolve disco cheio?
2. Qual a diferença entre escutar em `127.0.0.1` e em `0.0.0.0`? Por que o padrão seguro costuma ser o primeiro?
3. Com `Restart=on-failure`, o serviço volta depois de um `kill -9`, mas não depois de um `systemctl stop`. Por quê?
4. Por que uma linha em `/etc/cron.d` tem o campo do usuário e precisa do caminho completo do comando? O que muda em relação ao `crontab -e`?
5. Escreva o post-mortem sem culpados: que mudança de processo impede alguém de rodar o exportador na mão de novo?

## ESTUDE
- `man systemd.service` (Restart=, RestartSec=) e `man systemd.exec` (User=, EnvironmentFile=)
- Guia Foca GNU/Linux (processos, cron, sistemas de arquivos): https://www.guiafoca.org/
- `man lsof` (a opção +L1), `man ss`, `man 5 crontab`
