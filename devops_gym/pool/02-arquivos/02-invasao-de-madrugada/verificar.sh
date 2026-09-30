raiz=/srv/deploy/loja
t=$CASA/linha-do-tempo.txt
p=$CASA/plantados.txt

esperado=$(printf '%s\n' "$raiz/public/img/.cache/.sessao" "$raiz/public/img/banner-promo.png" "$raiz/scripts/.atualizar" | sort)

checar "~/linha-do-tempo.txt existe" "find com -printf ou stat, redirecionado para o arquivo" test -s "$t"
checar "a linha do tempo inclui os escondidos" "ls sem -a e o * escondem nomes com ponto; o find não" contem "$t" ".sessao"
checar "a linha do tempo inclui a rotina das 04:30" "todos os arquivos, não só os suspeitos" contem "$t" "rotacao.log"
checar "a linha do tempo tem data e hora" "stat -c '%y %n' ou find -printf '%TY-%Tm-%Td %TT %p'" grep -q '2026-09-13 03:12' "$t"
checar "~/plantados.txt existe" "um caminho por linha" test -s "$p"
if [ -s "$p" ] && [ "$(grep -v '^[[:space:]]*$' "$p" | sed 's#/$##' | sort)" = "$esperado" ]; then
  ok "~/plantados.txt tem exatamente os três arquivos da janela"
else
  falha "~/plantados.txt tem exatamente os três arquivos da janela" \
    "só arquivos (-type f), com caminho completo, entre 03:00 e 04:00; o das 02:55 e o das 04:30 ficam de fora"
fi
checar "provou que banner-promo.png é um script" "o comando file lê o conteúdo" grep -qi 'script' "$t"
checar "a evidência não foi alterada (mtime de banner-promo.png)" "ler não muda o mtime; touch, cp e editores mudam" \
  test "$(stat -c %Y "$raiz/public/img/banner-promo.png")" = "$(date -d '2026-09-13 03:12' +%s)"
checar "a evidência não foi alterada (mtime de .atualizar)" "ler não muda o mtime; touch, cp e editores mudam" \
  test "$(stat -c %Y "$raiz/scripts/.atualizar")" = "$(date -d '2026-09-13 03:41' +%s)"
