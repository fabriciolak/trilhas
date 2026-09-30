s=/usr/local/bin/backup-loja
arq=/var/backups/loja/site-$(date +%F).tar.gz

checar "a primeira linha é um shebang" "#!/bin/bash na linha 1" sh -c "head -n 1 $s | grep -q '^#!'"
checar "o script é executável" "chmod +x (ou 755)" test -x "$s"
checar "o script não tem erro de sintaxe" "bash -n /usr/local/bin/backup-loja" bash -n "$s"

rm -rf /var/backups/loja
saida=$(cd / && backup-loja 2>&1); rc=$?
checar "sudo backup-loja funciona chamando pelo nome" "rode você mesmo e leia o erro: $saida" test "$rc" -eq 0
checar "criou a pasta de destino e o arquivo de hoje" "mkdir -p antes do tar; nome site-\$(date +%F).tar.gz" test -s "$arq"
checar "o arquivo tem o site (inclusive nome com espaço)" "aspas em volta de \$ORIGEM" \
  sh -c "tar -tzf '$arq' | grep -q 'promoção de natal.html'"

rm -rf "/tmp/pasta de teste"; mkdir -p "/tmp/pasta de teste"; echo teste > "/tmp/pasta de teste/arquivo teste.txt"
backup-loja "/tmp/pasta de teste" >/dev/null 2>&1
checar "aceita outra origem como argumento" "ORIGEM=\"\${1:-/srv/site da loja}\"" \
  sh -c "tar -tzf '$arq' 2>/dev/null | grep -q 'arquivo teste.txt'"
rm -rf "/tmp/pasta de teste"

saida=$(backup-loja /nao/existe 2>/dev/null); rc=$?
erro=$(backup-loja /nao/existe 2>&1 >/dev/null)
checar "origem inexistente: código de saída diferente de zero" "teste com [ -d \"\$ORIGEM\" ] e exit 1" test "$rc" -ne 0
case "$saida" in
  *"backup ok"*) falha "origem inexistente: não diz 'backup ok'" "o echo só pode rodar se tudo deu certo" ;;
  *) ok "origem inexistente: não diz 'backup ok'" ;;
esac
checar "origem inexistente: mensagem na saída de erro" "echo 'erro: ...' >&2" test -n "$erro"
