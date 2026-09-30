f=$CASA/mapa.txt

checar "~/mapa.txt existe" "crie o arquivo com echo e >>" test -s "$f"
checar "programa: /usr/local/bin/vitrine" "onde o shell acha o comando vitrine? (command -v)" \
  grep -qE '^programa: */usr/local/bin/vitrine *$' "$f"
checar "configuracao: /etc/vitrine/vitrine.conf" "configuração do sistema mora em /etc" \
  grep -qE '^configuracao: */etc/vitrine(/vitrine\.conf)?/? *$' "$f"
checar "logs: /var/log/vitrine" "logs moram em /var/log" grep -qE '^logs: */var/log/vitrine(/vitrine\.log)?/? *$' "$f"
checar "dados: /var/lib/vitrine" "a configuração diz onde ficam os dados" grep -qE '^dados: */var/lib/vitrine/? *$' "$f"
checar "cache: /var/cache/vitrine" "a configuração diz onde fica o cache" grep -qE '^cache: */var/cache/vitrine/? *$' "$f"
checar "documentacao: /usr/share/doc/vitrine" "documentação de pacotes mora em /usr/share/doc" \
  grep -qE '^documentacao: */usr/share/doc/vitrine(/LEIAME)?/? *$' "$f"
checar "porta: 8180 (a da configuração em uso, não a da cópia velha)" "a cópia em /home/beto não vale" \
  grep -qE '^porta: *8180 *$' "$f"
checar "o último erro do log" "tail e grep; o último ERRO do arquivo, não o primeiro" contem "$f" "F-504"
checar "linha fhs: explicando as pastas" "LANG=pt_BR.UTF-8 man hier" grep -q '^fhs:' "$f"
