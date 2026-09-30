---
mes: 1
semana: 3
palco: lab
tipo: treino
nivel: 1
conceitos: stdin, stdout, stderr, redirecionamento, pipe, grep, sort, uniq, cut, tr, wc, tee
---
# Treino: pipes e redirecionamento

## AULA
**Três canais.** Todo programa nasce com três: entrada (0, `stdin`, o teclado), saída
(1, `stdout`, a tela) e erro (2, `stderr`, também a tela). Separar saída de erro é o que
permite guardar um e jogar o outro fora.

    comando > arquivo        # saída para o arquivo (apaga o que tinha)
    comando >> arquivo       # acrescenta no fim
    comando 2> erros.txt     # só o erro
    comando 2>/dev/null      # joga o erro fora (/dev/null é o "buraco negro")
    comando > tudo.txt 2>&1  # erro vai para onde a saída está indo (a ordem importa!)
    comando < entrada.txt    # entrada vem do arquivo

**Pipe `|`.** A saída de um vira a entrada do próximo. Cada programa faz uma coisa bem
feita; o pipe monta a linha de produção:

    cat acessos.log | grep " 404 " | wc -l            # quantos 404?
    cut -d' ' -f1 acessos.log | sort | uniq -c | sort -rn | head -n 5
    # ^ campo 1 (IP)  ^ agrupa  ^ conta repetidos ^ maior primeiro ^ os 5 primeiros

**As ferramentas.**

| comando | faz | opções que você mais usa |
|---|---|---|
| `grep padrão` | filtra linhas | `-i` ignora maiúsculas, `-v` inverte, `-c` conta, `-n` numera, `-o` só o trecho, `-E` regex estendida, `-r` recursivo |
| `wc` | conta | `-l` linhas, `-w` palavras, `-c` bytes |
| `head` / `tail` | começo / fim | `-n 20`; `tail -f` acompanha ao vivo; `tail -n +2` pula a primeira linha |
| `sort` | ordena | `-n` numérico, `-r` inverso, `-u` sem repetidos, `-t';' -k3` pelo campo 3 |
| `uniq` | junta repetidos **vizinhos** (por isso vem depois do `sort`) | `-c` conta |
| `cut` | recorta colunas | `-d';'` separador, `-f2,3` campos |
| `tr` | troca caracteres | `tr a-z A-Z`, `tr -d '\r'` |
| `tee` | grava num arquivo **e** passa adiante | `-a` acrescenta |

Monte o pipe um pedaço por vez: rode, olhe a saída, acrescente o próximo `|`.

## TICKET
Tudo em `~/treinos/pipes`. As respostas vão para `respostas/` (crie).

1. Quantas linhas tem `acessos.log`? Só o número em `respostas/linhas.txt`.
2. Quantas requisições terminaram com status **500**? Só o número em `respostas/erros500.txt`.
3. Os 3 IPs que mais acessaram, com a contagem, do maior para o menor, em
   `respostas/top-ips.txt`.
4. As cidades dos clientes (`clientes.csv`, separado por `;`), sem repetição, em ordem
   alfabética e **sem** o cabeçalho, em `respostas/cidades.txt`.
5. Os nomes dos clientes do plano `premium`, em MAIÚSCULAS, em `respostas/premium.txt`.
6. Rode `ls /etc/hostname /etc/nao-existe` guardando a saída normal em
   `respostas/saida.txt` e o erro em `respostas/erro.txt`.
7. Conte quantos arquivos `.conf` existem no sistema inteiro (`find /`), sem nenhuma
   mensagem de erro na tela. Só o número em `respostas/confs.txt`.
8. Com **um** pipe só: grave a lista de IPs distintos de `acessos.log` em
   `respostas/ips.txt` e, ao mesmo tempo, a quantidade deles em `respostas/total-ips.txt`.

## COMANDOS
> >> 2> 2>&1 /dev/null | grep wc head tail sort uniq cut tr tee

## PERGUNTAS
1. Por que `uniq` sozinho não resolve "contar repetidos"? O que o `sort` faz por ele?
2. `comando > arq 2>&1` e `comando 2>&1 > arq`: qual guarda o erro no arquivo, e por quê?
3. O que é `/dev/null`? Dê dois usos de verdade.

## ESTUDE
- LPI Linux Essentials, tópico 3.2 (buscar e extrair dados): https://learning.lpi.org/pt/learning-materials/010-160/
- Blau Araujo, Curso Shell GNU/Linux (aulas de redirecionamento e pipes): https://debxp.org/curso-shell-gnu-linux-ao-vivo/
