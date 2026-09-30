---
mes: 2
semana: 5
palco: lab
---
# chmod 777

## TICKET
Ontem à noite, um estagiário "resolveu" um problema de deploy do serviço de
pagamentos rodando uma troca recursiva de dono e de permissões em `/srv/pagamentos`.
Agora tudo lá pertence ao root e está aberto para o mundo, **segredos incluídos**.
E, de brinde, a conta de serviço `pagamentos` não entra mais na própria pasta `dados`,
então o serviço fica caindo.

Arrume e prove:

1. Antes de encostar em qualquer coisa, capture o estrago: uma listagem da árvore
   inteira com donos e permissões em `~/permissoes-antes.txt`.
2. Devolva a árvore toda ao usuário `pagamentos` e ao grupo `pagamentos`, num comando só.
3. Permissões certas:
   - `/srv/pagamentos` e `scripts/`: dono tudo; grupo entra e lê; o resto do mundo, nada.
   - `segredos/` e o que está dentro: só o dono (a pasta, o dono entra; os arquivos,
     o dono lê e escreve).
   - `config.yml`: dono lê e escreve, grupo só lê, mundo nada.
   - os dois scripts em `scripts/`: dono e grupo executam, mundo nada. Um comando só
     para os dois.
   - `dados/`: dono e grupo gravam; mundo nada; e arquivos novos lá dentro devem
     herdar o grupo da pasta. O arquivo que já está lá: dono e grupo leem e
     escrevem, mundo nada.
4. Prove como a própria conta de serviço: vire `pagamentos` e mostre que ela lê a
   configuração, executa o script de início e grava em `dados/`. E mostre que outro
   usuário qualquer (`nobody`) **não** lê a chave.

## COMANDOS
ls stat chmod chown chgrp find sudo sh id namei

## PERGUNTAS
1. Numa **pasta**, o que exatamente r, w e x permitem? Por que `x` sem `r` ainda funciona se você sabe o nome de um arquivo lá dentro?
2. Um arquivo 777 dentro de uma pasta 700 do root: um usuário comum lê o arquivo? Explique como o kernel avalia o caminho.
3. Por que um 777 recursivo é incidente de segurança, e não só desleixo? Cite dois ataques que ele permite nesta pasta.
4. O que é umask? E o que provavelmente era o problema original do deploy, que o 777 "resolveu"?
5. Notação octal (640) e simbólica (`u=rw,g=r,o=`): quando você prefere cada uma?
6. Por que `sudo chmod 600 /pasta/fechada/*` pode falhar com "No such file or directory" mesmo com sudo? Quem expande o `*`?

## ESTUDE
- LPI Linux Essentials, tópicos 5.3 (permissões e propriedade) e 5.4 (diretórios e arquivos especiais, setgid): https://learning.lpi.org/pt/learning-materials/010-160/
- GIRUS, lab "linux_permissoes-arquivos": https://github.com/badtuxx/girus-cli
- `man chmod`, `namei -l /srv/pagamentos/segredos/chave-api.pem` (mostra as permissões de cada pasta do caminho)
