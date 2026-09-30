---
mes: 1
semana: 1
palco: lab
---
# Mapa do servidor

## TICKET
A Rafa, dev que acabou de chegar, vai mexer na `vitrine` (o site da loja) e
perguntou: "onde ficam as coisas dela neste servidor?". Ninguém documentou nada.
Existe uma cópia velha de configuração largada numa pasta pessoal. Não caia nela:
a configuração que vale é a que o sistema usa.

1. Monte `~/mapa.txt` com uma linha por item, no formato `item: caminho`:
   `programa`, `configuracao`, `logs`, `dados`, `cache` e `documentacao` da vitrine.
2. Na configuração de verdade está a porta em que a vitrine escuta. Acrescente
   `porta: <número>` ao mapa.
3. A Rafa quer saber qual foi o **último** erro registrado no log da vitrine.
   Acrescente a linha inteira desse erro ao mapa (sem abrir o log inteiro na tela:
   ele é grande).
4. Explique numa linha `fhs:` para que serve cada uma destas pastas: `/etc`, `/var`,
   `/usr/local`, `/opt`, `/tmp`. O manual do sistema descreve isso (e existe em português).

## COMANDOS
pwd cd ls ls -la tree cat less head tail grep find command -v type file man --help

## PERGUNTAS
1. Por que o Linux separa programa, configuração, dados e logs em pastas diferentes (`/usr`, `/etc`, `/var/lib`, `/var/log`)? O que isso facilita em backup, atualização e containers?
2. Caminho absoluto e relativo: qual a diferença, e o que significam `.`, `..` e `~`?
3. Diferença entre `/usr/bin` e `/usr/local/bin`. Onde um programa instalado à mão deveria ir?
4. Como você acharia a documentação de um comando que você nunca viu? Cite três formas.

## ESTUDE
- LPI Linux Essentials, tópicos 2.2 (obter ajuda) e 2.3 (diretórios e listagem): https://learning.lpi.org/pt/learning-materials/010-160/
- `man hier` em português: `LANG=pt_BR.UTF-8 man hier`
- Documentação oficial do padrão FHS (inglês, curta): https://refspecs.linuxfoundation.org/fhs.shtml
