---
mes: 1
semana: 1
palco: lab
tipo: treino
nivel: 1
conceitos: prompt, caminhos absolutos e relativos, ls, cd, mkdir, cp, mv, rm, man, histórico
---
# Treino: o terminal

## AULA
**O prompt.** `aluno@devops-lab:~$` quer dizer: usuário `aluno`, na máquina `devops-lab`,
na pasta `~` (a sua pasta pessoal, `/home/aluno`). O `$` diz que você é um usuário comum;
o root vê `#`.

**Um comando tem três partes:** o nome, as opções e os argumentos.

    ls -l -a /etc        # nome: ls · opções: -l e -a · argumento: /etc
    ls -la /etc          # opções curtas podem ser juntadas
    ls --all /etc        # opção longa (duas barras)

**Caminhos.** Absoluto começa na raiz `/` e vale de qualquer lugar (`/home/aluno/treinos`).
Relativo parte da pasta atual (`treinos/terminal`). Atalhos: `~` é a sua pasta pessoal,
`.` é a pasta atual, `..` é a pasta de cima e `cd -` volta para a pasta anterior.

    pwd                  # onde estou?
    cd /var/log          # absoluto
    cd ..                # sobe para /var
    cd ~/treinos         # a partir da sua pasta pessoal
    ls -la               # tudo, inclusive os ocultos (nome começando com ponto)

**Criar, copiar, mover, apagar.**

    mkdir -p a/b/c       # cria a árvore toda de uma vez (-p: "parents")
    touch nota.txt       # cria um arquivo vazio (ou atualiza a data de um existente)
    cp nota.txt a/       # copia para dentro de a/
    cp -r a copia-de-a   # pasta precisa de -r (recursivo)
    mv nota.txt n.txt    # renomear é mover para outro nome
    rm n.txt             # apaga. NÃO existe lixeira no terminal.
    rm -r copia-de-a     # apagar pasta: -r. Leia duas vezes antes de apertar Enter.

**Ler arquivos.** `cat` despeja tudo; `less` pagina (setas, `/texto` para buscar, `q`
para sair); `head` e `tail` mostram o começo e o fim.

**Pedir ajuda.** `man ls` abre o manual (em português, quando tem tradução); dentro dele,
`/palavra` busca e `q` sai. Quase todo comando aceita `--help`.

**Economizar dedo.** `Tab` completa nomes (dois `Tab` listam as opções). Seta para cima
repete comandos. `Ctrl+R` busca no histórico. `history` lista os últimos comandos.
`Ctrl+C` interrompe o que está rodando; `Ctrl+L` limpa a tela.

**Guardar a saída num arquivo.** O `>` manda o que apareceria na tela para um arquivo
(você vai ver isso a fundo na semana 3): `pwd > onde.txt`.

## TICKET
Tudo acontece em `~/treinos/terminal`. Verifique (`v`) a cada passo, se quiser.

1. Entre em `~/treinos/terminal` e salve o caminho **absoluto** dela em `onde.txt`,
   dentro dela mesma.
2. Com **um** comando só, crie `projeto/src`, `projeto/docs` e `projeto/testes`.
3. Crie o arquivo vazio `projeto/README.md`.
4. Copie `bagunca/relatorio-final.txt` para `projeto/docs/` (o original fica).
5. Copie a pasta `bagunca/fotos`, inteira, para dentro de `projeto/`.
6. Renomeie `bagunca/rascunho-velho.txt` para `bagunca/rascunho.txt`.
7. Tem um arquivo escondido em `bagunca/`. Copie para `projeto/segredo.txt`.
8. Apague a pasta `bagunca/fotos` (a cópia em `projeto/` fica).
9. Descubra no `man ls` como listar ordenando por tamanho, do maior para o menor, com
   tamanhos legíveis (K, M). Salve essa listagem de `bagunca/` em `tamanhos.txt`.
10. Salve seus últimos 30 comandos em `historico.txt`.

## COMANDOS
pwd cd ls mkdir touch cp mv rm cat less man history

## PERGUNTAS
1. Qual a diferença entre caminho absoluto e relativo? Dê um exemplo em que só o absoluto funciona.
2. Por que `rm -rf` é perigoso, e que hábitos evitam um desastre?
3. O que o `-p` do `mkdir` faz? E o `-r` do `cp`?

## ESTUDE
- LPI Linux Essentials, tópicos 2.1 (básico da linha de comando) e 2.4 (arquivos e pastas): https://learning.lpi.org/pt/learning-materials/010-160/
- `man ls`, `man cp`, `man mkdir` (dentro do laboratório, em português)
