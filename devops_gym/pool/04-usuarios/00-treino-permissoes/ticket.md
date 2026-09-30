---
mes: 2
semana: 5
palco: lab
tipo: treino
nivel: 1
conceitos: usuários, grupos, id, useradd, usermod -aG, rwx, octal, chmod, chown, setgid, sudo -u
---
# Treino: usuários, grupos e permissões

## AULA
**Quem é quem.** Todo processo roda como um usuário, e todo usuário tem um grupo
principal e grupos extras. `id` mostra os seus; `id ana` os da Ana. As contas estão em
`/etc/passwd` e os grupos em `/etc/group`.

    sudo groupadd estudos                        # cria um grupo
    sudo useradd -m -s /bin/bash -G estudos ana  # -m cria a pasta pessoal, -s o shell, -G grupos extras
    sudo usermod -aG estudos aluno               # ACRESCENTA um grupo (sem -a, TROCA a lista toda!)
    sudo -u ana whoami                           # roda um comando como a Ana
    sudo -iu ana                                 # vira a Ana (exit para voltar)

Grupos novos só valem para sessões novas: depois do `usermod`, saia e entre de novo.

**Ler permissões.** `ls -l` mostra `-rwxr-x---  1 ana estudos ... script.sh`:

    -   rwx   r-x   ---
    │   │     │     └── outros (o resto do mundo)
    │   │     └──────── grupo (estudos)
    │   └────────────── dono (ana)
    └────────────────── tipo: - arquivo, d pasta, l link

Em **arquivo**: `r` lê, `w` altera, `x` executa. Em **pasta**: `r` lista os nomes, `w`
cria e apaga dentro, `x` **entra** (sem `x` na pasta, nada lá dentro é alcançável).

**Octal.** r = 4, w = 2, x = 1, e soma-se cada trio: `rwx` = 7, `r-x` = 5, `r--` = 4,
`---` = 0. Então `rwxr-x---` = **750**.

    chmod 640 segredo.txt        # rw- r-- ---
    chmod u+x,go-w script.sh     # simbólico: u dono, g grupo, o outros, a todos
    chmod -R g+rX pasta/         # X maiúsculo: x só em pastas (e no que já era executável)
    sudo chown ana:estudos arq   # dono e grupo de uma vez
    sudo chgrp estudos pasta     # só o grupo

**Bits especiais.** **setgid** numa pasta (`chmod g+s`, ou o 2 na frente: `2770`) faz tudo
que nascer lá dentro herdar o grupo da pasta: é o jeito certo de fazer pasta de equipe.
O **sticky bit** (`1777`, como o `/tmp`) deixa só o dono apagar o próprio arquivo.
`umask` define as permissões de quem nasce (022 → arquivos 644, pastas 755).

## TICKET
1. Crie o grupo `estudos`.
2. Crie a usuária `ana`, com pasta pessoal e shell bash, com `estudos` como grupo extra.
3. Coloque você (`aluno`) também no grupo `estudos`, sem tirar você de nenhum outro grupo.
4. Crie a pasta `/srv/estudos`, do grupo `estudos`: o dono (root) e o grupo leem e
   escrevem, o resto do mundo não entra, e arquivos novos lá dentro herdam o grupo.
5. `~/treinos/permissoes/script.sh`: o dono lê, escreve e executa; grupo e outros só leem.
6. `~/treinos/permissoes/segredo.txt`: só o dono lê e escreve; mais ninguém faz nada.
7. Como a `ana`, crie o arquivo `/srv/estudos/ana.txt` (confira de quem ele é e de qual
   grupo).
8. Passe `~/treinos/permissoes/relatorio.txt` para a `ana` e o grupo `estudos`.
9. Qual é o octal de `rwxr-x---`? Escreva só o número em `~/treinos/permissoes/octal.txt`.

## COMANDOS
id groupadd useradd usermod sudo -u ls -l chmod chown chgrp stat umask

## PERGUNTAS
1. O que acontece se você esquecer o `-a` do `usermod -aG`?
2. Por que uma pasta com `rw-` mas sem `x` é inútil? Teste.
3. Para que serve o setgid numa pasta compartilhada? E o sticky bit do `/tmp`?
4. Por que `chmod 777` "resolve" e mesmo assim é quase sempre errado?

## ESTUDE
- LPI Linux Essentials, tópicos 5.1 a 5.4 (segurança, usuários e permissões): https://learning.lpi.org/pt/learning-materials/010-160/
- `man chmod`, `man useradd`, `man usermod`
