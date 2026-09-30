# Ferramenta sumida: uma solução possível.

# 1. O erro: "jq: command not found" (linha 4 do script).
sudo deploy-loja || true

# 2. O apt update reclama de pacotes.pinguim-antigo.invalid. Quem aponta para lá?
sudo apt-get update || true
grep -r pinguim-antigo /etc/apt/
# Desativar sem apagar: o apt só lê arquivos terminados em .list (ou .sources).
sudo mv /etc/apt/sources.list.d/pinguim-antigo.list /etc/apt/sources.list.d/pinguim-antigo.list.desativado
sudo apt-get update
sudo apt-get install -y jq

# 3. De novo.
sudo deploy-loja

# 4. dpkg -S: qual pacote instalou este caminho. Pegadinha do Ubuntu atual: /bin é um
#    atalho para /usr/bin (usrmerge). O command -v responde /usr/bin/ss, mas o pacote
#    registrou /bin/ss, e  dpkg -S /usr/bin/ss  não acha nada. Um padrão resolve:
command -v ss; ls -ld /bin
dpkg -S '*/bin/ss' > ~/pacotes.txt
dpkg-query -W nginx >> ~/pacotes.txt                     # nome e versão
{ echo "maiores (KB):"; dpkg-query -W -f='${Installed-Size}\t${Package}\n' | sort -rn | head -n 5; } >> ~/pacotes.txt
cat ~/pacotes.txt

# 5. hold: o apt upgrade passa a pular o pacote.
sudo apt-mark hold nginx
apt-mark showhold
