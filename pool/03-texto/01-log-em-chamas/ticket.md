---
mes: 1
semana: 3
palco: lab
tipo: ticket
nivel: 2
conceitos: tail, grep, cut, awk, sort, uniq -c, ranking em pipe
---
# Log em chamas

## TICKET
Os pagamentos estão falhando e o atendimento está em chamas. O log de acesso do
site é `/var/log/loja/acesso.log`, e ele **continua crescendo**: o incidente está
acontecendo agora.

Investigue e escreva o relatório `~/incidente.txt`, seção por seção, sempre
**acrescentando** (não apague o que você mesmo já escreveu):

1. Acompanhe o log ao vivo por alguns segundos. Os erros 500 continuam saindo
   **agora**? Responda no relatório.
2. Quantas requisições há no total, e quantas deram status 500?
3. Qual endpoint (caminho da URL) produz os 500? Prove com uma contagem por
   endpoint, do maior para o menor.
4. Um IP de cliente está martelando o site muito mais que os outros. Monte um
   ranking de requisições por IP.
   Até aqui, tudo só com pipelines: nada de editor e nada de arquivo temporário.
5. Separe todas as linhas desse IP em `~/evidencias.log` para o time de abuso e
   registre no relatório quantas linhas são.

## COMANDOS
tail head cat grep cut awk sort uniq wc echo

## PERGUNTAS
1. O que o pipe `|` conecta, em termos de stdin, stdout e stderr? Se o primeiro comando morre no meio, o que o segundo vê?
2. Mostre a diferença entre `>`, `>>`, `2>` e `2>&1`. Por que `cmd > arq 2>&1` e `cmd 2>&1 > arq` se comportam diferente?
3. Seu log tem 200 GB e você precisa saber "quantos 500 na última hora". Por que passar por filtros funciona e abrir num editor é um erro? O que isso diz sobre como pipes usam memória?
4. Por que `uniq -c` só funciona direito depois de um `sort`?

## ESTUDE
- LPI Linux Essentials, tópico 3.2 (buscar e extrair dados de arquivos): https://learning.lpi.org/pt/learning-materials/010-160/
- Blau Araujo, Curso Shell GNU (aulas de redirecionamento e pipes): https://debxp.org/
- Aurélio Jargas, guia de expressões regulares (grátis, em português): https://aurelio.net/regex/guia/
