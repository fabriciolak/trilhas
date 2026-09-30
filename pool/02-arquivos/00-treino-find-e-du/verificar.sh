d=$CASA/treinos/arquivos
r=$d/respostas
velhos="api/api-01.log api/api-02.log web/web-01.log worker/worker-01.log"
checar "1. respostas/logs.txt tem o número de .log (7)" "find ... -iname \"*.log\" -type f | wc -l" \
  sh -c "test \"\$(tr -d ' \n' < $r/logs.txt 2>/dev/null)\" = 7"
checar "2. respostas/grandes.txt lista os dois arquivos grandes, e só eles" "find ... -type f -size +1M" \
  sh -c "grep -q banco.sql $r/grandes.txt && grep -q fotos.tar $r/grandes.txt && test \$(grep -c . $r/grandes.txt) -eq 2"
ok_velhos=1
for v in $velhos; do grep -q "$(basename $v)" "$r/velhos.txt" 2>/dev/null || ok_velhos=0; done
for n in api-03 web-02 web-03; do grep -q "$n" "$r/velhos.txt" 2>/dev/null && ok_velhos=0; done
checar "3. respostas/velhos.txt tem os 4 .log de mais de 30 dias, e só eles" "find ... -name \"*.log\" -mtime +30" test "$ok_velhos" = 1
checar "4. não sobrou nenhum .tmp (e o usuario.dat ficou)" "find ... -name \"*.tmp\" -type f -delete" \
  sh -c "test -z \"\$(find $d -name '*.tmp')\" && test -f $d/cache/usuario.dat"
checar "5. respostas/maior-pasta.txt diz a maior subpasta" "du -sh * | sort -h" grep -q "backup antigo" "$r/maior-pasta.txt"
checar "6. respostas/disco.txt tem o uso do disco do /home" "df -h /home > ..." grep -q '%' "$r/disco.txt"
checar "7. misterio/dados virou misterio/dados.gz" "file misterio/dados" \
  sh -c "test -f $d/misterio/dados.gz && test ! -e $d/misterio/dados && zcat $d/misterio/dados.gz | grep -q setembro"
ok_gz=1
for v in $velhos; do [ -f "$d/logs/$v.gz" ] && [ ! -e "$d/logs/$v" ] || ok_gz=0; done
for n in api/api-03.log web/web-02.LOG web/web-03.log; do [ -f "$d/logs/$n" ] || ok_gz=0; done
checar "8. só os .log velhos foram comprimidos" "find ... -name \"*.log\" -mtime +30 -exec gzip {} \;" test "$ok_gz" = 1
