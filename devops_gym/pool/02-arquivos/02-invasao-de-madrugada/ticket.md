---
mes: 1
semana: 2
palco: lab
tipo: ticket
nivel: 2
conceitos: find por data e dono, stat, arquivos ocultos, linha do tempo
---
# Invasão de madrugada

## TICKET
O time de segurança viu atividade estranha neste servidor entre **03:00 e 04:00
do dia 13/09/2026**. O alvo suspeito é a pasta de deploy da loja, `/srv/deploy/loja`.
O último deploy legítimo terminou antes da meia-noite, e uma rotina legítima de
logs gravou um arquivo depois das 04:00. Todo arquivo modificado dentro da janela
é hostil até prova em contrário.

Perícia, **sem alterar nenhuma evidência** (nem a data de modificação):

1. Monte a linha do tempo: todos os arquivos de `/srv/deploy/loja`, inclusive os
   escondidos, com data e hora exatas de modificação, em ordem cronológica, em
   `~/linha-do-tempo.txt`.
2. Isole os **arquivos** (não as pastas) modificados dentro da janela. Dica: dá
   para comparar datas direto na busca, ou fabricar arquivos de referência com a
   data que você quiser. Salve só os caminhos, um por linha, em `~/plantados.txt`.
3. Um dos arquivos plantados finge ser uma imagem. Prove o que ele é de verdade e
   acrescente essa prova ao fim de `~/linha-do-tempo.txt`.
4. Para o relatório ser reproduzível, monte também listas por nome (ex.: tudo que
   termina em `.png`), por tipo (só pastas; só arquivos) e por tamanho (arquivos
   com mais de 1 KB). Não precisa salvar: é treino de busca.

## COMANDOS
find ls stat file touch sort wc head cat

## PERGUNTAS
1. Qual a diferença entre mtime, ctime e atime? Por que a perícia desconfia de um arquivo com mtime antigo e ctime recente?
2. Por que `ls` e o `*` do shell escondem arquivos que começam com ponto? Como você lista uma árvore sem deixar nada escondido?
3. Um script chamado `banner.png`: o que decide se o Linux executa um arquivo? A extensão, o conteúdo ou outra coisa?
4. Por que a primeira regra da perícia é "não mexa na evidência"? Que comandos alteram datas sem você perceber?

## ESTUDE
- LPI Linux Essentials, tópicos 2.3 (listar arquivos, arquivos ocultos) e 5.4 (arquivos especiais): https://learning.lpi.org/pt/learning-materials/010-160/
- `man find` (procure `-newermt`, `-type`, `-printf`), `man stat`, `man file`
