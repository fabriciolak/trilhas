---
mes: 1
semana: 2
palco: lab
tipo: treino
nivel: 1
conceitos: find, curingas, tamanho, datas, -exec, du, df, file
---
# Treino: achar e medir arquivos

## AULA
**Curingas (o shell expande antes do comando rodar).** `*` casa qualquer coisa, `?` um
caractere, `[abc]` um da lista. `ls *.log` lista os `.log` da pasta atual (só ela).

**find: procurar em qualquer profundidade.** A forma é `find ONDE TESTES AÇÃO`:

    find ~/treinos -name "*.log"            # nome (aspas! senão o shell expande antes)
    find ~/treinos -iname "*.log"           # sem diferenciar maiúsculas
    find / -type d -name nginx              # só pastas (-type f: só arquivos)
    find /var -size +10M                    # maiores que 10 MB (-size -1k: menores que 1 KB)
    find /var/log -mtime +7                 # modificados há MAIS de 7 dias (-mtime -1: menos de 1)
    find /tmp -user aluno                   # de um dono
    find . -name "*.tmp" -type f -delete    # ação: apagar o que achou
    find . -name "*.log" -exec gzip {} \;   # ação: rodar um comando para cada um ({} = o arquivo)
    find / -name "*.conf" 2>/dev/null       # esconde os "Permissão negada"

Testes seguidos valem juntos ("e"). `-o` é "ou". `-maxdepth 1` limita a profundidade.
Teste **sem** `-delete` antes, sempre: veja a lista, depois apague.

**Quanto ocupa.**

    du -sh pasta                 # total de uma pasta, legível (-s: só o total; -h: K, M, G)
    du -sh * | sort -h           # cada item da pasta atual, do menor ao maior
    df -h                        # espaço de cada disco (sistema de arquivos) montado
    df -h /home                  # só o disco onde /home está

`ls -l` mostra o tamanho que o arquivo **diz** ter; `du` mostra o que ele **ocupa** no
disco. Os dois podem discordar (arquivos esparsos, por exemplo).

**O que é esse arquivo?** A extensão é só parte do nome. `file arquivo` olha o conteúdo e
diz o tipo de verdade. `stat arquivo` mostra tamanho, dono e as datas.

**Nomes com espaço.** Use aspas (`"backup antigo"`) ou barra (`backup\ antigo`). O `Tab`
completa com a barra para você.

## TICKET
Tudo acontece em `~/treinos/arquivos`. As respostas vão para a pasta `respostas/` (crie).

1. Quantos arquivos `.log` existem ali dentro, em qualquer profundidade, **sem**
   diferenciar maiúsculas de minúsculas? Salve só o número em `respostas/logs.txt`.
2. Salve em `respostas/grandes.txt` a lista dos arquivos com mais de 1 MB.
3. Salve em `respostas/velhos.txt` a lista dos `.log` modificados há mais de 30 dias.
4. Apague todos os `.tmp`, de uma vez, com o próprio `find`.
5. Qual subpasta ocupa mais espaço? Salve o nome dela em `respostas/maior-pasta.txt`.
6. Salve em `respostas/disco.txt` o espaço usado e livre do disco onde fica o `/home`.
7. `misterio/dados` não tem extensão. Descubra o tipo real e renomeie com a extensão
   certa (`.gz`, `.png`, `.pdf` ou `.txt`).
8. Comprima com `gzip`, usando `find -exec`, os `.log` com mais de 30 dias (os outros
   ficam como estão).

## COMANDOS
find ls du df sort wc file stat gzip mkdir mv

## PERGUNTAS
1. Por que colocar aspas em `find . -name "*.log"`? O que acontece sem elas quando a pasta atual tem um `.log`?
2. `-mtime +30` e `-mtime -30`: qual pega o quê?
3. Quando o `du` e o `ls -l` discordam sobre o tamanho de um arquivo, em quem confiar para saber se o disco vai encher?

## ESTUDE
- LPI Linux Essentials, tópicos 2.4 e 3.1: https://learning.lpi.org/pt/learning-materials/010-160/
- `man find` (seção TESTS), `man du`, `man df`
