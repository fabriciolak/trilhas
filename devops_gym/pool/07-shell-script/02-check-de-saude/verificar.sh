s=$CASA/bin/saude.sh

checar "~/bin/saude.sh existe" "mkdir -p ~/bin" test -f "$s"
checar "é executável" "chmod +x ~/bin/saude.sh" test -x "$s"
checar "começa com shebang" "#!/bin/bash" sh -c "head -n 1 '$s' | grep -q '^#!'"
checar "não tem erro de sintaxe" "bash -n ~/bin/saude.sh" bash -n "$s"

saida=$(como_aluno "$s" 100 2>/dev/null); rc=$?
checar "saude.sh 100 sai com 0" "com limite 100, o disco nunca passa" test "$rc" -eq 0
checar "linha 'disco: N%'" "df --output=pcent /" sh -c "printf '%s\n' \"\$1\" | grep -qE '^disco: [0-9]{1,3}%$'" _ "$saida"
checar "linha 'memoria: N%'" "free: usada / total * 100" sh -c "printf '%s\n' \"\$1\" | grep -qE '^memoria: [0-9]{1,3}%$'" _ "$saida"
checar "linha 'carga: X.XX'" "primeiro campo de /proc/loadavg" sh -c "printf '%s\n' \"\$1\" | grep -qE '^carga: [0-9]+([.,][0-9]+)?$'" _ "$saida"
real=$(df --output=pcent / | tail -n 1 | tr -dc '0-9')
checar "o disco informado é o uso real de / ($real%)" "df /, não outra partição" \
  sh -c "printf '%s\n' \"\$1\" | grep -qE '^disco: ($real|$((real - 1))|$((real + 1)))%$'" _ "$saida"

saida=$(como_aluno "$s" 0 2>/dev/null); rc=$?
checar "saude.sh 0 sai com 1" "uso do disco > limite → exit 1" test "$rc" -eq 1
checar "saude.sh 0 imprime ALERTA" "echo 'ALERTA: ...'" sh -c "printf '%s\n' \"\$1\" | grep -q '^ALERTA'" _ "$saida"

como_aluno "$s" abc >/dev/null 2>&1; rc=$?
checar "saude.sh abc sai com 2" "valide com case ou [[ =~ ^[0-9]+$ ]]" test "$rc" -eq 2
checar "saude.sh 150 sai com 2" "de 0 a 100" sh -c "runuser -u aluno -- '$s' 150 >/dev/null 2>&1; test \$? -eq 2"
erro=$(como_aluno "$s" abc 2>&1 >/dev/null)
checar "o uso vai para a saída de erro" "echo 'Uso: ...' >&2" test -n "$erro"
