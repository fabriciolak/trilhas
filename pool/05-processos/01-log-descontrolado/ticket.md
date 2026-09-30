---
mes: 2
semana: 6
palco: lab
---
# Log descontrolado

## TICKET
Alerta de disco de novo, mas desta vez não é arquivo velho. Algo neste servidor está
escrevendo lixo **agora mesmo** em `/var/log/loja/debug.log`, centenas de linhas por
minuto. Ninguém subiu versão de debug. E tem mais: alguém disse que uma entrada na
tabela de processos parece "morta-viva".

Relatório em `~/processos.txt`:

1. Confirme que a enxurrada está acontecendo e meça: quantas linhas chegam em 10
   segundos? Registre o método e o número.
2. Identifique o processo que escreve. Depois mapeie a **ancestralidade** inteira
   (quem iniciou quem), porque você vai precisar explicar a cadeia no post-mortem.
3. Encerre o escritor. Confirme que o log parou de crescer e registre a prova de antes
   e depois.
4. Cace o "morto-vivo": ache na tabela de processos, registre em que estado ele está,
   por que não dá para matá-lo diretamente e o que o faria sumir. Depois faça ele
   sumir, sem reiniciar o servidor.
5. Treino para o relatório: rode uma tarefa lenta em primeiro plano (`sleep 300`),
   suspenda, mande para segundo plano, liste seus jobs, traga de volta e mate.
   Anote qual tecla e qual comando fez cada passo.

## COMANDOS
ps pgrep pstree top kill wc tail sleep jobs fg bg

## PERGUNTAS
1. O que é um processo zumbi? Que recurso ele ainda ocupa, quem é responsável por limpar, e quando milhares de zumbis indicam bug na aplicação?
2. Explique a relação entre um processo, o pai dele e o PID 1. O que acontece com os filhos quando o pai morre?
3. O que o `&` no fim de um comando faz de verdade? Qual a diferença entre um job em segundo plano e um daemon?
4. `kill` mata processos? O que o nome esconde? (Dica: `kill -l`.)

## ESTUDE
- LPI Linux Essentials, tópico 4.3 (onde os dados são armazenados: processos e /proc): https://learning.lpi.org/pt/learning-materials/010-160/
- GIRUS, lab "linux_gerenciamento-processos": https://github.com/badtuxx/girus-cli
- `man ps` (procure STAT e PROCESS STATE CODES), `man pstree`, `help jobs`
