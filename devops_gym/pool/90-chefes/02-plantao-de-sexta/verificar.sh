p=$CASA/plantao.txt
s=/usr/local/bin/fechamento
rels=/srv/relatorios
soma() { tail -q -n +2 "$1"/*.csv | tr -d '\r' | awk -F, '{ s += $3 } END { printf "%.2f", s }'; }
total25=$(soma /srv/vendas/2026-09-25)
total24=$(soma /srv/vendas/2026-09-24)

# 1. O processo.
checar "o reindexador não está mais rodando" "ps aux --sort=-%cpu; pgrep -a -f legado" sem_processo 'legado/reindexar'
checar "o índice terminou limpo" "SIGKILL não deixa o programa salvar: religue (sudo -u legado /opt/legado/reindexar &) e encerre com o sinal que ele trata" \
  grep -q '^limpo' /var/lib/legado/indice.estado

# 2. O script.
checar "o bc está instalado" "sudo apt-get install bc (se o apt reclamar de um repositório antigo, desative)" command -v bc
checar "a primeira linha do script é um shebang" "#!/bin/bash na linha 1" sh -c "head -n 1 $s | grep -q '^#!'"
checar "o script é executável" "chmod 755" test -x "$s"
checar "o script não tem erro de sintaxe" "bash -n $s" bash -n "$s"

rm -f "$rels/fechamento-2026-09-25.txt" "$rels/fechamento-2026-09-24.txt" "$rels/fechamento-2026-01-01.txt"
saida=$(cd / && fechamento 2026-09-25 2>&1); rc=$?
checar "sudo fechamento 2026-09-25 termina com sucesso" "rode e leia o erro: $saida" test "$rc" -eq 0
checar "o relatório do dia 25 tem o total das três planilhas (R\$ $total25)" \
  "aspas em \"\$arquivo\"; e o \\r do Windows: cat -A mostra ^M no fim da linha" \
  grep -qF "$total25" "$rels/fechamento-2026-09-25.txt"
(cd / && fechamento 2026-09-24 >/dev/null 2>&1)
checar "a data vem do argumento (dia 24: R\$ $total24)" "pasta=/srv/vendas/\$dia" grep -qF "$total24" "$rels/fechamento-2026-09-24.txt"

saida=$(cd / && fechamento 2026-01-01 2>/dev/null); rc=$?
erro=$(cd / && fechamento 2026-01-01 2>&1 >/dev/null)
checar "dia sem vendas: código de saída diferente de zero" "[ -d \"\$pasta\" ] || { echo ... >&2; exit 1; }" test "$rc" -ne 0
case "$saida" in
  *"fechamento ok"*) falha "dia sem vendas: não diz 'fechamento ok'" "o echo final só pode rodar se tudo deu certo" ;;
  *) ok "dia sem vendas: não diz 'fechamento ok'" ;;
esac
checar "dia sem vendas: mensagem na saída de erro" "echo 'fechamento: ...' >&2" test -n "$erro"
checar "dia sem vendas: nenhum relatório gravado" "teste a pasta antes de escrever qualquer coisa" test ! -e "$rels/fechamento-2026-01-01.txt"

# 3. O grupo.
checar "/srv/relatorios é do grupo financeiro" "sudo chgrp financeiro /srv/relatorios" test "$(stat -c %G $rels)" = financeiro
checar "/srv/relatorios tem setgid (relatórios novos herdam o grupo)" "chmod g+s (ou 2750)" test -g "$rels"
checar "o relatório novo é do grupo financeiro" "o setgid da pasta faz isso sozinho" \
  test "$(stat -c %G $rels/fechamento-2026-09-25.txt 2>/dev/null)" = financeiro
checar "o resto do mundo não lê o relatório" "tire o acesso de 'outros' da pasta (o-rwx)" \
  sh -c "! runuser -u nobody -- cat $rels/fechamento-2026-09-25.txt"

# 4. A Dani.
checar "a conta dani existe, com pasta pessoal e bash" "useradd -m -s /bin/bash ..." \
  sh -c "getent passwd dani | grep -q ':/home/dani:/bin/bash$' && test -d /home/dani"
checar "a dani está no grupo financeiro" "useradd -G financeiro, ou usermod -aG financeiro dani" sh -c "id -nG dani | grep -qw financeiro"
checar "a dani lê o relatório" "grupo com r-x na pasta e r no arquivo" runuser -u dani -- cat "$rels/fechamento-2026-09-25.txt"

# 5. O relatório do plantão.
checar "~/plantao.txt existe" "junte as respostas com >>" test -s "$p"
checar "o plantão diz de quem era o processo (legado) e o que ele era (reindexar)" "ps -o user,cmd -p PID" \
  sh -c "grep -qi legado '$p' && grep -qi reindexar '$p'"
checar "o plantão diz o sinal usado" "kill sem número manda SIGTERM" grep -qiE 'SIGTERM|TERM|-15' "$p"
checar "o plantão tem o total do dia 25" "o número do relatório" grep -qF "$total25" "$p"
