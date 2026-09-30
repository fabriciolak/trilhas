---
mes: 2
semana: 8
palco: lab
tipo: treino
nivel: 2
conceitos: shebang, variáveis, aspas, argumentos, código de saída, if, test, for, case, read, funções, stderr, set -euo pipefail
---
# Treino: shell script

## AULA
**Um script é uma lista de comandos num arquivo.**

    #!/bin/bash                 # shebang: quem interpreta (sempre na linha 1)
    set -euo pipefail           # pare no primeiro erro, em variável indefinida e em pipe quebrado
    nome="mundo"                # variável: SEM espaço em volta do =
    echo "Olá, $nome!"          # aspas duplas expandem variáveis; simples não: 'Olá, $nome'

Rodar: `chmod +x ola.sh` e depois `./ola.sh` (o `./` porque a pasta atual não está no
PATH).

**Argumentos.** `$1`, `$2`... são os argumentos; `$#` é quantos vieram; `"$@"` é todos, um
por um (com aspas!); `$0` é o nome do script. `${1:-padrão}` usa `padrão` se `$1` vier vazio.

**Código de saída.** Todo comando termina com um número: 0 é sucesso, qualquer outro é
falha. `$?` guarda o do último comando; `exit 2` sai do script com 2. Mensagens de erro
vão para a **saída de erro**: `echo "erro: ..." >&2`.

**Decisões.**

    if [ -d "$pasta" ]; then echo "é pasta"; elif [ -f "$pasta" ]; then echo "é arquivo"; else echo "não existe"; fi
    [ "$a" = "$b" ]     # texto igual        [ "$n" -gt 10 ]   # número maior (-eq -ne -lt -le -ge)
    [ -z "$x" ]         # vazio               [ -n "$x" ]       # não vazio
    comando && echo ok || echo falhou

    case "$1" in
      start) echo "iniciando" ;;
      stop|parar) echo "parando" ;;
      *) echo "uso: $0 {start|stop}" >&2; exit 1 ;;
    esac

**Repetições.**

    for arquivo in *.txt; do echo "$arquivo"; done       # aspas: nomes com espaço
    for n in "$@"; do echo "$n"; done
    while read -r linha; do echo "$linha"; done < arquivo.txt

**Ler do usuário e contar.** `read -r idade` lê uma linha da entrada. Conta de inteiros:
`$(( idade + 10 ))`. Resultado de comando dentro de variável: `hoje=$(date +%F)`.

**Funções.**

    dobro() { echo $(( $1 * 2 )); }
    resultado=$(dobro 21)

Antes de rodar, `bash -n script.sh` confere a sintaxe; `bash -x script.sh` mostra cada
passo. O ShellCheck (shellcheck.net) aponta as armadilhas.

## TICKET
Escreva os scripts em `~/treinos/bash/`, todos com shebang e executáveis.

1. `ola.sh`: `./ola.sh Ana` imprime `Olá, Ana!`; sem argumento, `Olá, mundo!`.
2. `conta.sh PASTA`: imprime só o número de **arquivos** (não pastas) que estão direto na
   pasta. Se a pasta não existir: mensagem na saída de erro e código de saída **2**.
3. `maior.sh N1 N2 ...`: imprime o maior dos números. Sem nenhum número: uma linha de uso
   na saída de erro e código **1**.
4. `renomeia.sh PASTA`: troca a extensão de todos os `.jpeg` da pasta para `.jpg`. Há
   nomes com espaço em `~/treinos/bash/fotos` para você testar.
5. `servico.sh`: com `start` imprime `iniciando`; com `stop`, `parando`; com `status`,
   `rodando`. Qualquer outra coisa: `uso: servico.sh {start|stop|status}` na saída de
   erro e código **1**. Use `case`.
6. `idade.sh`: lê a idade da entrada (`read`) e imprime `Daqui a 10 anos: N` (use uma
   função `somar_dez`). Teste com `echo 30 | ./idade.sh`.

## COMANDOS
#!/bin/bash chmod +x $1 $# "$@" ${1:-} $? exit >&2 if [ ] case for while read $(( )) bash -n

## PERGUNTAS
1. Qual a diferença entre `$@` e `"$@"`? Mostre um caso em que as aspas fazem diferença.
2. Por que `set -euo pipefail`? O que cada letra liga?
3. Por que um script de automação deve sair com código diferente de zero quando falha, mesmo que imprima "erro"?

## ESTUDE
- Blau Araujo, Curso Básico de Programação em Bash e o Curso Shell GNU/Linux: https://debxp.org/curso-shell-gnu-linux-ao-vivo/
- ShellCheck: https://www.shellcheck.net/
- LPI Linux Essentials, tópico 3.3 (scripts): https://learning.lpi.org/pt/learning-materials/010-160/
