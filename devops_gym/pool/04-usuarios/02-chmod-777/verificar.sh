raiz=/srv/pagamentos
modo() { stat -c %a "$1" 2>/dev/null; }

checar "~/permissoes-antes.txt existe e mostra o estrago" "ls -lR /srv/pagamentos > ~/permissoes-antes.txt, ANTES de mudar" \
  grep -q 'rwxrwxrwx' "$CASA/permissoes-antes.txt"
checar "tudo pertence a pagamentos:pagamentos" "chown -R pagamentos:pagamentos /srv/pagamentos" \
  test -z "$(find "$raiz" \( ! -user pagamentos -o ! -group pagamentos \) 2>/dev/null)"
checar "/srv/pagamentos e scripts/ são 750" "dono rwx, grupo r-x, mundo ---" \
  test "$(modo $raiz)" = 750 -a "$(modo $raiz/scripts)" = 750
checar "segredos/ é 700" "só o dono entra" test "$(modo $raiz/segredos)" = 700
checar "os arquivos de segredos/ são 600" "chmod 600 segredos/*" \
  test "$(modo $raiz/segredos/chave-api.pem)" = 600 -a "$(modo $raiz/segredos/gateway.yml)" = 600
checar "config.yml é 640" "dono rw, grupo r, mundo nada" test "$(modo $raiz/config.yml)" = 640
checar "os scripts são 750" "chmod 750 scripts/*.sh" \
  test "$(modo $raiz/scripts/iniciar.sh)" = 750 -a "$(modo $raiz/scripts/parar.sh)" = 750
checar "dados/ é 2770 (grupo grava e arquivos novos herdam o grupo)" "o 2 na frente é o setgid: chmod 2770, ou chmod g+s" \
  test "$(modo $raiz/dados)" = 2770
checar "o arquivo em dados/ é 660" "dono e grupo rw, mundo nada" test "$(modo $raiz/dados/transacoes.csv)" = 660
checar "nada gravável pelo mundo" "find /srv/pagamentos -perm -o+w" test -z "$(find "$raiz" -perm -o+w 2>/dev/null)"
checar "pagamentos lê a configuração" "o dono precisa de r no arquivo e x em cada pasta do caminho" \
  runuser -u pagamentos -- cat "$raiz/config.yml"
checar "pagamentos executa o script de início" "x no arquivo" runuser -u pagamentos -- "$raiz/scripts/iniciar.sh"
checar "pagamentos grava em dados/" "w e x na pasta" runuser -u pagamentos -- touch "$raiz/dados/.teste-verificacao"
rm -f "$raiz/dados/.teste-verificacao"
checar "nobody NÃO lê a chave" "o mundo não pode ter nada" sh -c "! runuser -u nobody -- cat $raiz/segredos/chave-api.pem"
