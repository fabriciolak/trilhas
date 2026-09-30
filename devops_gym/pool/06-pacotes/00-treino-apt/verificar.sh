d=$CASA/treinos/apt
estado() { dpkg-query -W -f='${db:Status-Abbrev}${Version}' "$1" 2>/dev/null; }
checar "1. o pinguim-cli está instalado" "sudo apt install ./pinguim-cli_1.0_all.deb" sh -c "dpkg-query -W -f='\${Status}' pinguim-cli | grep -q 'ok installed'"
checar "2. arquivos.txt lista o que o pacote instalou" "dpkg -L pinguim-cli > arquivos.txt" \
  sh -c "grep -q /usr/bin/pinguim $d/arquivos.txt && grep -q /etc/pinguim.conf $d/arquivos.txt"
checar "3. donos.txt diz pinguim-cli e coreutils" "dpkg -S /usr/bin/pinguim; dpkg -S '*/bin/ls'" \
  sh -c "grep -q pinguim-cli $d/donos.txt && grep -q coreutils $d/donos.txt"
checar "4. o pinguim-cli está na 1.1" "sudo apt install ./pinguim-cli_1.1_all.deb" test "$(dpkg-query -W -f='${Version}' pinguim-cli 2>/dev/null)" = 1.1
checar "5. o pinguim-cli está travado" "sudo apt-mark hold pinguim-cli" sh -c "apt-mark showhold | grep -qx pinguim-cli"
checar "6. o pinguim-extra foi instalado e removido, mas a configuração ficou (estado rc)" "sudo apt remove pinguim-extra (não purge)" \
  sh -c "dpkg-query -W -f='\${db:Status-Abbrev}' pinguim-extra 2>/dev/null | grep -q '^rc' && test -f /etc/pinguim-extra.conf"
checar "7. historico.txt tem o rastro do dpkg" "grep pinguim /var/log/dpkg.log > historico.txt" \
  sh -c "grep -q 'install pinguim-cli' $d/historico.txt && grep -q 'remove pinguim-extra' $d/historico.txt"
