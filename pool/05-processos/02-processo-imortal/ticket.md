---
mes: 2
semana: 6
palco: lab
tipo: ticket
nivel: 2
conceitos: sinais, trap, SIGTERM x SIGKILL, processo guardião, pstree
---
# Processo imortal

## TICKET
Uma tal de "sentinela", instalada por um fornecedor que nem existe mais, roda neste
servidor. Toda tentativa do Beto de pará-la educadamente falhou: ela até deboche dele
em `/var/log/sentinela.log`. Pior: na única vez em que ela morreu, voltou segundos
depois, como se nada tivesse acontecido.

Derrube de vez e documente a sequência em `~/derrubada.txt`:

1. Ache a sentinela. Acompanhe o log dela ao vivo (num segundo terminal: rode
   `gym lab` de novo) enquanto manda o sinal padrão de término educado. Registre o
   que ela faz com ele.
2. Explique no relatório **como** um processo sobrevive a esse sinal, e diga qual é o
   sinal que nenhum processo consegue ignorar. Use. Registre o que acontece nos
   segundos seguintes.
3. Ela voltou. Descubra **por quê**: mapeie a ancestralidade, identifique o guardião
   e decida a ordem certa para acabar com os dois de uma vez.
4. Prove que o servidor está limpo: nenhuma sentinela, nenhum guardião, log parado.
   Registre também **como** você provou a ausência (e não só a presença).

## COMANDOS
ps pgrep pstree kill tail grep sleep

## PERGUNTAS
1. SIGTERM, SIGKILL e SIGHUP: o que cada um significa por convenção, quais um processo pode tratar, e por que orquestradores (Docker, Kubernetes, systemd) sempre mandam um, esperam, e depois mandam outro?
2. Por que `kill -9` como primeira opção é considerado má prática? Cite dois estragos que ele pode causar e o SIGTERM não.
3. Esse comportamento de "renascer" é exatamente o que um supervisor como o systemd faz de propósito. O que é o systemd, o que é uma unit, e como `systemctl` e `journalctl` teriam resolvido este ticket em dois comandos?
4. Como você pararia do jeito certo um serviço supervisionado pelo systemd? Por que matar o processo direto não funciona lá também?

## ESTUDE
- `man 7 signal` (tabela dos sinais e das ações padrão), `kill -l`
- LINUXtips no YouTube (vídeos sobre processos e systemd): https://www.youtube.com/@LINUXtips
- Descomplicando o Docker, capítulo sobre o ciclo de vida de containers (docker stop manda SIGTERM, espera e manda SIGKILL): https://livro.descomplicandodocker.com.br/
