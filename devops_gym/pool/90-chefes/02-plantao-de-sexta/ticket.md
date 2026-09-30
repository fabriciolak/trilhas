---
mes: 2
semana: 8
palco: lab
tipo: chefe
nivel: 3
conceitos: processos, sinais, apt, shell script, aspas, código de saída, CRLF, grupos, setgid
---
# Plantão de sexta

## TICKET
Chefe do mês 2. Sexta, 17h45. O **fechamento financeiro** do dia 25 precisa sair hoje e
a Carla já foi embora, deixando só um bilhete: "o servidor está lento, o script do
fechamento não roda e a Dani, do financeiro, começa segunda e precisa ler os relatórios".

1. **O servidor está lento.** Descubra qual processo está comendo a CPU, de qual
   usuário ele é e o que ele faz (leia o programa antes de matar). Encerre do jeito que
   **não estraga** o trabalho dele: o estado do índice em
   `/var/lib/legado/indice.estado` tem de terminar `limpo`.
2. **O fechamento.** `/usr/local/bin/fechamento` soma a coluna `valor` de todas as
   planilhas de `/srv/vendas/AAAA-MM-DD/` e grava `/srv/relatorios/fechamento-AAAA-MM-DD.txt`.
   Conserte o script (no próprio arquivo) para que:
   - `sudo fechamento 2026-09-25` rode chamando só pelo nome e com as ferramentas que ele
     usa instaladas (o gerenciador de pacotes pode reclamar antes; você já viu isso);
   - o total some **todas** as planilhas do dia: uma tem espaço no nome e outra veio de
     um sistema Windows;
   - um dia sem pasta de vendas (`sudo fechamento 2026-01-01`) dê mensagem na **saída de
     erro**, código de saída diferente de zero, nenhum "fechamento ok" e **nenhum**
     relatório gravado.
3. **Relatório é confidencial.** `/srv/relatorios` e os relatórios que o fechamento
   gravar lá, inclusive os **futuros** (sem ninguém lembrar de rodar `chgrp`), são do
   grupo `financeiro`: o grupo lê, o resto do mundo não chega nem perto.
4. **A Dani.** Crie a conta `dani` (pasta pessoal, shell bash) no grupo `financeiro` e
   prove que ela lê o relatório e que um usuário qualquer (`nobody`) não lê.
5. Em `~/plantao.txt`: quem era o processo (usuário e programa), qual sinal você usou e
   por que não o `-9`, e o total do fechamento do dia 25.

## COMANDOS
top ps pgrep kill cat apt-get file cat -A bash -n chmod chgrp useradd id sudo -u

## PERGUNTAS
1. O que a opção `-9` teria feito com o índice? Em que situação ela é a única saída?
2. Por que `for f in $(ls ...)` quebra com nomes que têm espaço, e o que o shell faz com `"$pasta"/*.csv`?
3. Como você descobriu que uma planilha veio do Windows? O que é o `\r` e por que ele quebra ferramentas de linha de comando?
4. O que o bit setgid faz numa pasta? Qual a diferença entre ele e rodar `chgrp` num cron de hora em hora?
5. Por que o código de saída importa mais que a mensagem "fechamento ok" quando o script roda sozinho de madrugada?

## ESTUDE
- LPI Linux Essentials, tópicos 3.3 (scripts), 4.3 (onde os dados ficam: processos) e 5.3 (permissões): https://learning.lpi.org/pt/learning-materials/010-160/
- Guia Foca GNU/Linux, permissões e grupos: https://www.guiafoca.org/
- `man 7 signal`, `man bash` (seção Pathname Expansion), `man chmod` (setgid em pastas)
