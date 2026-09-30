p=$CASA/pacotes.txt

checar "o jq está instalado" "sudo apt update && sudo apt install jq" command -v jq
checar "o repositório antigo está desativado" "o arquivo em /etc/apt/sources.list.d: renomeie (sem .list) ou comente com #" \
  sh -c "! cat /etc/apt/sources.list /etc/apt/sources.list.d/*.list /etc/apt/sources.list.d/*.sources 2>/dev/null | grep -v '^[[:space:]]*#' | grep -q pinguim-antigo"
checar "o repositório antigo não foi apagado (renomeado ou comentado)" "desative sem apagar: fica o histórico" \
  sh -c "grep -rqs pinguim-antigo /etc/apt/"
checar "o deploy rodou com sucesso" "sudo deploy-loja" grep -qs '2026.09.30-1' /var/lib/loja/deploys.log
checar "~/pacotes.txt existe" "junte as respostas com >>" test -s "$p"
checar "diz de qual pacote veio o ss (iproute2)" "dpkg -S procura no banco do dpkg; se não achar /usr/bin/ss, lembre que /bin é atalho para /usr/bin" contem "$p" "iproute2"
checar "diz a versão do nginx instalada" "dpkg-query -W nginx, ou apt policy nginx" contem "$p" "$(dpkg-query -W -f='${Version}' nginx)"
checar "o nginx está travado" "sudo apt-mark hold nginx; confira com apt-mark showhold" sh -c "apt-mark showhold | grep -qx nginx"
