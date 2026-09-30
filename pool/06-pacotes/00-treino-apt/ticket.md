---
mes: 2
semana: 7
palco: lab
tipo: treino
nivel: 1
conceitos: pacotes .deb, dependências, apt, dpkg, dpkg -L, dpkg -S, remove x purge, apt-mark hold, logs do dpkg
---
# Treino: pacotes

## AULA
**Pacote** é um arquivo (`.deb`, no Debian e no Ubuntu) com programas, configurações e
uma ficha: nome, versão e **dependências** (outros pacotes de que ele precisa). Quem
instala e registra é o `dpkg`; quem busca nos repositórios e resolve dependências é o `apt`.

    sudo apt update                 # baixa a lista de pacotes dos repositórios (não instala nada)
    apt search nginx                # procura
    apt show nginx                  # a ficha: versão, dependências, descrição
    sudo apt install nginx          # instala, com as dependências
    sudo apt install ./arquivo.deb  # instala um .deb local (o ./ diz "é um arquivo")
    sudo apt upgrade                # atualiza o que já está instalado
    sudo apt remove nginx           # remove, mas GUARDA a configuração
    sudo apt purge nginx            # remove tudo, inclusive a configuração
    sudo apt autoremove             # tira dependências que ninguém mais usa

**O dpkg, mais perto do chão.**

    dpkg -l | grep nginx            # instalados (ii = instalado; rc = removido com config)
    dpkg -s nginx                   # estado e versão de um pacote
    dpkg -L nginx                   # quais arquivos ele instalou
    dpkg -S /usr/sbin/nginx         # de qual pacote é este arquivo
    sudo dpkg -i arquivo.deb        # instala um .deb SEM resolver dependências

Se um `dpkg -i` deixar um pacote pela metade (dependência faltando), o `apt` passa a
recusar tudo até você resolver: `sudo apt --fix-broken install` instala o que falta ou
remove o que ficou quebrado. Prefira o `apt install ./arquivo.deb`, que confere antes.

**Travar versão.** `sudo apt-mark hold pacote` faz o `upgrade` pular o pacote;
`apt-mark showhold` lista; `unhold` solta.

**Rastro.** Tudo que o `dpkg` faz vai para `/var/log/dpkg.log`; o `apt`, para
`/var/log/apt/history.log`. É o primeiro lugar a olhar quando "alguém atualizou alguma
coisa e quebrou".

Este treino funciona sem internet: os pacotes estão em `~/treinos/apt/`.

## TICKET
Os pacotes da Pinguim estão em `~/treinos/apt/`. As respostas vão para a mesma pasta.

1. Instale o `pinguim-cli` na versão **1.0**, a partir do arquivo.
2. Salve em `arquivos.txt` a lista de arquivos que o pacote instalou.
3. Salve em `donos.txt` de qual pacote vem o `/usr/bin/pinguim` e de qual vem o `/usr/bin/ls`
   (pegadinha: no Ubuntu atual, `/bin` é atalho para `/usr/bin`, e o `dpkg` pode ter
   registrado o outro caminho).
4. Tente instalar o `pinguim-extra`. Leia o erro. Resolva do jeito certo: ele precisa
   de uma versão mais nova do `pinguim-cli`, que também está na pasta.
5. Trave o `pinguim-cli` na versão em que ele está.
6. Remova o `pinguim-extra` de um jeito que a configuração dele (`/etc/pinguim-extra.conf`)
   **fique** no sistema.
7. Salve em `historico.txt` as linhas do log do dpkg que falam de `pinguim`.

## COMANDOS
apt install ./ apt show dpkg -i dpkg -l dpkg -s dpkg -L dpkg -S apt remove apt purge apt-mark

## PERGUNTAS
1. Qual a diferença entre `apt remove` e `apt purge`? Quando cada um faz sentido?
2. Por que o `dpkg -i` às vezes deixa o sistema com dependências quebradas, e o `apt install ./x.deb` não?
3. Por que alguém trava a versão de um pacote? Qual o risco de esquecer o hold lá?

## ESTUDE
- LPI Linux Essentials, tópico 1.2 (gerenciamento de pacotes): https://learning.lpi.org/pt/learning-materials/010-160/
- `man apt`, `man dpkg`, `man apt-mark`
