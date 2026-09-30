---
mes: 2
semana: 8
palco: lab
tipo: ticket
nivel: 2
conceitos: shebang, permissão de execução, aspas, argumentos, código de saída, stderr
---
# Backup quebrado

## TICKET
O backup do site da loja "roda todo dia e sempre diz que deu certo", mas quando
precisaram restaurar ontem, não existia backup nenhum. O script é o
`/usr/local/bin/backup-loja`, escrito às pressas pelo Beto. Leia antes de mexer.

Conserte o script (no próprio arquivo) para ele cumprir o combinado:

1. Rodar chamando só pelo nome: `sudo backup-loja`.
2. Gerar `/var/backups/loja/site-AAAA-MM-DD.tar.gz` (data de hoje) com o conteúdo de
   `/srv/site da loja`. Sim, a pasta tem espaços no nome, e os arquivos também.
3. Criar a pasta de destino se ela não existir.
4. Aceitar uma pasta de origem diferente como primeiro argumento, opcional:
   `sudo backup-loja /outra/pasta`.
5. Se a origem não existir: mensagem de erro na **saída de erro**, código de saída
   diferente de zero, e nada de "backup ok".
6. Se qualquer passo falhar, nunca dizer "backup ok".

Teste os casos de sucesso e de erro antes de dar como resolvido, e confira o conteúdo
do arquivo gerado.

## COMANDOS
cat bash chmod head tar ls echo test mkdir date

## PERGUNTAS
1. Para que serve a primeira linha `#!/bin/bash` (shebang)? O que acontece quando ela falta e você executa o arquivo?
2. Por que `ORIGEM=/srv/site da loja` não guarda o caminho inteiro na variável? Por que `$ORIGEM` sem aspas quebra de novo mais adiante?
3. O que é código de saída? Como você lê o código do último comando, e como `set -e`, `set -u` e `set -o pipefail` mudam o comportamento de um script?
4. Por que um backup que "sempre diz que deu certo" é pior do que um backup que falha barulhento? Como você monitoraria isso?
5. `$1`, `${1:-padrão}`, `$#` e `$@`: o que cada um significa?

## ESTUDE
- LPI Linux Essentials, tópicos 3.1 (arquivamento: tar e gzip) e 3.3 (transformando comandos em script): https://learning.lpi.org/pt/learning-materials/010-160/
- Blau Araujo, Curso Básico de Programação em Bash e Curso Shell GNU (grátis): https://debxp.org/
- Julio Neves, "Papo de Botequim" (clássico e gratuito sobre shell): pesquise "Papo de Botequim Julio Neves"
- ShellCheck (acha erros de script; tem versão online): https://www.shellcheck.net/
