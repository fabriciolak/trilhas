---
mes: 1
semana: 4
palco: lab
tipo: treino
nivel: 2
conceitos: regex, grep -E, sed, sed -i.bak, awk, somas e agrupamentos, tar, gzip, zcat
---
# Treino: sed, awk e arquivos compactados

## AULA
**Expressões regulares (regex)**, o idioma dos padrões:

| regex | casa com |
|---|---|
| `^abc` / `abc$` | `abc` no começo / no fim da linha |
| `.` | qualquer caractere |
| `a*` / `a+` / `a?` | zero ou mais / um ou mais / zero ou um `a` (`+` e `?` precisam de `grep -E`) |
| `[0-9]` / `[^0-9]` | um dígito / qualquer coisa menos dígito |
| `a{2,4}` | de 2 a 4 `a` |
| `(gato\|rato)` | um ou outro |

    grep -E '^[0-9]{3}\.' arquivo           # linhas que começam com 3 dígitos e um ponto
    grep -Eo '[a-z]+@[a-z.]+' arquivo       # só o trecho que casou (e-mails, simplificado)

**sed: editar texto em fluxo.**

    sed 's/velho/novo/' arq          # troca a 1ª ocorrência de cada linha (só mostra)
    sed 's/velho/novo/g' arq         # todas as ocorrências
    sed -i.bak 's/a/b/' arq          # edita o arquivo de verdade e guarda arq.bak
    sed -n '10,15p' arq              # só imprime as linhas 10 a 15
    sed '/^#/d' arq                  # apaga as linhas que começam com #
    sed 's/^debug/# &/' arq          # & é "o que casou": comenta as linhas debug
    sed 's|/var/www|/srv/site|g' arq # outro separador quando o texto tem barras

**awk: colunas e contas.** Cada linha é quebrada em campos `$1`, `$2`... (`$0` é a linha
toda, `NF` é o número de campos, `NR` o número da linha).

    awk '{print $1, $3}' arq                         # colunas 1 e 3
    awk -F';' 'NR > 1 {print $2}' planilha.csv       # separador ; e pula o cabeçalho
    awk -F',' '{s += $3} END {print s}' vendas.csv   # soma a coluna 3
    awk -F',' '{t[$2] += $3} END {for (k in t) print k, t[k]}' vendas.csv   # total por grupo
    awk '$9 == 500' acessos.log                      # só as linhas com o campo 9 igual a 500

**Compactar e empacotar.** `gzip` comprime um arquivo; `tar` junta vários num só.

    tar -czf pacote.tar.gz pasta/      # c: criar · z: gzip · f: nome do arquivo
    tar -tzf pacote.tar.gz             # t: listar sem extrair
    tar -xzf pacote.tar.gz -C destino/ # x: extrair
    zcat log.gz | grep ERRO            # ler comprimido sem descomprimir (zgrep também)

## TICKET
Tudo em `~/treinos/texto`. Respostas em `respostas/` (crie). Nada de editor: só comandos.

1. Em `config.ini`, troque `ambiente = homologacao` por `ambiente = producao` com o
   `sed`, guardando o original em `config.ini.bak`.
2. Ainda em `config.ini`, comente (ponha `# ` na frente) todas as linhas que começam com
   `debug`.
3. Salve só as linhas 10 a 15 de `app.log` em `respostas/linhas-10-a-15.txt`.
4. Com o `awk`, some a coluna `valor` de `vendas.csv` (sem o cabeçalho). Só o número em
   `respostas/total.txt`.
5. Com o `awk`, o total por loja, do maior para o menor, em `respostas/por-loja.txt`
   (uma loja por linha: nome e total).
6. Todos os e-mails que aparecem em `app.log`, sem repetição, um por linha, em
   `respostas/emails.txt`.
7. Empacote a pasta `relatorios/` em `relatorios.tar.gz` e salve a lista do conteúdo do
   pacote (sem extrair) em `respostas/conteudo.txt`.
8. Conte as linhas com `ERROR` em `antigo.log.gz` sem descomprimir o arquivo. Só o número
   em `respostas/erros-antigos.txt`.

## COMANDOS
grep -E sed sed -i.bak sed -n awk -F sort tar gzip zcat zgrep

## PERGUNTAS
1. Por que `sed -i.bak` antes de mexer num arquivo de configuração de produção?
2. Quando você escolhe `cut` e quando escolhe `awk`?
3. Qual a diferença entre `.gz` e `.tar.gz`? Por que o `gzip` sozinho não empacota uma pasta?

## ESTUDE
- Aurélio Jargas, guia de expressões regulares: https://aurelio.net/regex/guia/
- LPI Linux Essentials, tópicos 3.1 (arquivamento) e 3.2: https://learning.lpi.org/pt/learning-materials/010-160/
- `man sed`, `man awk`, `man tar`
