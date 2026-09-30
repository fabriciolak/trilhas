---
mes: 2
semana: 6
palco: lab
tipo: treino
nivel: 1
conceitos: processos, PID e PPID, ps, pgrep, pstree, top, sinais, SIGHUP, SIGTERM, SIGKILL, órfãos, nohup
---
# Treino: processos e sinais

## AULA
**Processo** é um programa rodando. Cada um tem um número (**PID**), um pai (**PPID**), um
dono e um estado: `R` rodando, `S` dormindo (esperando algo), `D` esperando disco, `T`
parado, `Z` zumbi (morreu e o pai ainda não "recolheu").

    ps aux                          # todos os processos, formato BSD
    ps -ef                          # todos, com PPID
    ps -o pid,ppid,user,stat,cmd -p 1234
    ps aux --sort=-%mem | head      # os que mais usam memória
    pgrep -a nginx                  # PID e comando de quem casa com o nome
    pstree -p                       # a árvore: quem é pai de quem
    top                             # ao vivo (P ordena por CPU, M por memória, q sai)

**Sinais** são recados que o kernel entrega a um processo. `kill` só manda o sinal; o
nome engana.

| sinal | número | convenção | o processo pode tratar? |
|---|---|---|---|
| SIGHUP | 1 | "recarregue a configuração" (serviços) | sim |
| SIGINT | 2 | Ctrl+C | sim |
| SIGKILL | 9 | morte imediata, sem limpeza | **não** |
| SIGTERM | 15 | "termine, por favor" (o padrão do `kill`) | sim |
| SIGSTOP / SIGCONT | 19 / 18 | congelar / descongelar | não / sim |

    kill 1234            # SIGTERM: o jeito educado
    kill -HUP 1234       # recarregar
    kill -9 1234         # último recurso: sem salvar nada
    pkill -f padrão      # manda para todos que casam com o padrão

**Pais e filhos.** Se o pai morre, o filho vira **órfão** e é adotado pelo PID 1: ele
continua rodando. Por isso, para derrubar uma família de processos, olhe a árvore.

**Primeiro e segundo plano.** `comando &` roda em segundo plano; `jobs` lista; `fg`
traz para frente; `Ctrl+Z` suspende; `bg` continua em segundo plano. Um processo em
segundo plano morre quando a sessão fecha, a não ser que você use `nohup comando &`.

## TICKET
No laboratório rodam três processos de treino, todos seus (usuário `aluno`): `relogio`,
`vigia` (que tem um filho) e `teimoso`. As respostas vão para `~/treinos/processos/`.

1. Salve só o PID do `relogio` em `pid-relogio.txt`.
2. Descubra quem é o **pai** do processo `sleep 100000`. Salve o nome do pai em `pai.txt`.
3. O `teimoso` lê `~/treinos/processos/teimoso.conf` quando recebe o sinal de "recarregar".
   Troque `cor = azul` por `cor = verde` no arquivo e faça ele recarregar **sem** reiniciar.
   O log dele (`teimoso.log`) diz se deu certo.
4. Encerre o `relogio` do jeito educado.
5. Salve em `top5.txt` os 5 processos que mais usam memória (com cabeçalho).
6. Encerre o `vigia` e confira o filho dele: ele sobreviveu? Quem é o pai dele agora?
   Termine o serviço: nenhum dos dois pode sobrar.
7. Deixe rodando um `sleep 7777` que continue vivo mesmo depois que você sair do
   laboratório.

## COMANDOS
ps pgrep pstree top kill pkill jobs fg bg nohup sed

## PERGUNTAS
1. Por que o `kill` padrão é o SIGTERM e não o SIGKILL?
2. O que é um processo órfão e quem cuida dele? E um zumbi?
3. Por que serviços usam o SIGHUP para recarregar a configuração, em vez de reiniciar?

## ESTUDE
- `man 7 signal`, `man ps`, `kill -l`
- LPI Linux Essentials, tópico 4.3: https://learning.lpi.org/pt/learning-materials/010-160/
