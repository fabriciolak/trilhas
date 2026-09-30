---
mes: 1
semana: 4
palco: lab
tipo: ticket
nivel: 2
conceitos: regex, sed, awk, diff, trocas em massa com backup
---
# Migração do banco

## TICKET
O banco antigo, `db-antigo.interno` na porta `5432`, vai ser desligado hoje à noite.
O novo é `db.pinguim.interno` na porta `6432`. As configurações dos serviços da loja
estão em `/etc/loja/servicos/*.conf`, e ninguém quer editar arquivo por arquivo.

1. Liste em `~/migracao.txt` **só os arquivos** que ainda apontam para o banco antigo.
2. Troque o endereço nas linhas `db_host` de todos os arquivos de uma vez, guardando
   uma cópia de cada original com a extensão `.bak`. Os comentários que citam o
   banco antigo são histórico: devem continuar como estão. E cuidado: nem todo
   arquivo escreve `db_host` do mesmo jeito.
3. Troque a porta **só nas linhas `db_port`**. Existe outro `5432` num dos arquivos que
   não tem nada a ver com banco.
4. A diretoria quer saber quais serviços estão mais lentos antes da migração. O log
   `/var/log/loja/latencia.log` tem uma linha por requisição, com `servico=` e `ms=`.
   Gere `~/latencia.txt` com uma linha por serviço, no formato `servico media`
   (média inteira), do mais lento para o mais rápido.

## COMANDOS
grep sed awk sort ls diff cat head

## PERGUNTAS
1. O que o `-i` do sed faz de verdade com o arquivo (dica: inode)? Por que `sed -i.bak` é um hábito que salva empregos?
2. Explique um endereço no sed, como em `sed '/^db_port/s/5432/6432/'`. Por que um `s/5432/6432/g` global seria perigoso aqui?
3. Quando você usa `awk` e quando `cut`? O que `awk` faz que `cut` não faz?
4. Você precisa trocar um valor em 300 servidores, não em 10 arquivos. Por que isso deixa de ser trabalho de sed e vira trabalho de Ansible ou de um pipeline de deploy?

## ESTUDE
- LPI Linux Essentials, tópico 3.2: https://learning.lpi.org/pt/learning-materials/010-160/
- Aurélio Jargas, guia de expressões regulares (grátis): https://aurelio.net/regex/guia/
- Blau Araujo, Curso Shell GNU (aulas de sed e awk): https://debxp.org/
