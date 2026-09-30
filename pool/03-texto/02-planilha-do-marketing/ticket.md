---
mes: 1
semana: 3
palco: lab
---
# Planilha do marketing

## TICKET
O marketing exportou a base de clientes de uma ferramenta antiga de Windows, e o
novo sistema de e-mail rejeita o arquivo. Ele está em `/srv/exportacao/clientes.csv`.
Estragos conhecidos: fim de linha do Windows, ponto e vírgula no lugar de vírgula,
e-mails em CAIXA ALTA, linhas repetidas e linhas em branco. O sistema novo quer:
e-mails em minúsculas, um por linha, sem repetição, em ordem alfabética, sem
cabeçalho e sem linha em branco.

1. Prove, **sem abrir editor**, que o fim de linha está quebrado. Salve a prova em
   `~/diagnostico.txt`.
2. Gere `~/emails.txt` com **um único pipeline**.
3. O time de vendas quer uma pasta por cidade em `~/cidades/`, criadas de uma vez só
   alimentando a lista de cidades no comando que cria pastas: sem laço e sem digitar
   os nomes. Atenção: tem cidade com espaço no nome.
4. Confira quantos e-mails ficaram, passando `~/emails.txt` pela **entrada padrão**
   do contador (e não como argumento). Acrescente o número ao diagnóstico.

## COMANDOS
cat file od wc tr cut sort grep xargs mkdir echo head tail

## PERGUNTAS
1. O que é uma "linha" para as ferramentas Unix? O que são `\n` e `\r` em bytes, e por que um `\r` perdido faz `grep 'texto$'` falhar misteriosamente?
2. Compare `wc -l arquivo`, `wc -l < arquivo` e `cat arquivo | wc -l`. Quem recebe um nome de arquivo e quem recebe bytes na entrada padrão?
3. O `xargs` existe porque pipes ligam fluxos, não argumentos. Explique essa diferença. O que dá errado quando um nome tem espaço, e como você resolve?
4. Por que o Git tem uma configuração só para fim de linha (`core.autocrlf`)? Onde isso já pode ter te afetado, sem você saber?

## ESTUDE
- LPI Linux Essentials, tópico 3.2 (buscar e extrair dados): https://learning.lpi.org/pt/learning-materials/010-160/
- Pro Git em português, "Configurando o Git" (seção sobre `core.autocrlf`): https://git-scm.com/book/pt-br/v2
- `man tr`, `man xargs` (procure `-d` e `-0`), `man sort` (procure `-u` e `-f`)
