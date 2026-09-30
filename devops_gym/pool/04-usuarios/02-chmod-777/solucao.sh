# chmod 777: uma solução possível.
raiz=/srv/pagamentos

# 1. Evidência antes de tudo (sudo porque dados/ está fechada até para leitura).
sudo ls -lR "$raiz" > ~/permissoes-antes.txt
cat ~/permissoes-antes.txt

# 2. Dono e grupo, recursivo, num comando.
sudo chown -R pagamentos:pagamentos "$raiz"

# 3. Octal: cada dígito é dono/grupo/mundo; r=4, w=2, x=1.
# Pegadinha: em  sudo chmod 600 /srv/pagamentos/segredos/*  quem expande o * é o SEU
# shell, antes do sudo. Depois do chown, você não entra mais na pasta, o * não casa
# com nada e o chmod recebe o texto "segredos/*" literal. Saídas: find -exec (o find
# roda como root), ou sudo sh -c '...' (o * é expandido pelo shell do root).
sudo chmod 750 "$raiz" "$raiz/scripts"           # rwx r-x ---
sudo chmod 700 "$raiz/segredos"                   # pasta: só o dono entra
sudo find "$raiz/segredos" -type f -exec chmod 600 {} +   # arquivos: só o dono lê e escreve
sudo chmod 640 "$raiz/config.yml"                 # rw- r-- ---
sudo sh -c "chmod 750 $raiz/scripts/*.sh"         # rwx r-x --- (os dois de uma vez)
sudo chmod 2770 "$raiz/dados"                     # 2 = setgid: arquivos novos herdam o grupo
sudo chmod 660 "$raiz/dados/transacoes.csv"       # rw- rw- ---
# O mesmo em notação simbólica, para comparar:  chmod u=rw,g=r,o= config.yml

sudo find "$raiz" -perm -o+w                      # nada = ninguém de fora grava
sudo namei -l "$raiz/segredos/chave-api.pem"      # permissões de cada pasta do caminho

# 4. A conta de serviço não tem shell (nologin), então sudo -u roda um comando direto.
sudo -u pagamentos cat "$raiz/config.yml"
sudo -u pagamentos "$raiz/scripts/iniciar.sh"
sudo -u pagamentos touch "$raiz/dados/novo.csv" && sudo ls -l "$raiz/dados"   # grupo pagamentos herdado
sudo -u nobody cat "$raiz/segredos/chave-api.pem" || echo "nobody não lê: certo"
