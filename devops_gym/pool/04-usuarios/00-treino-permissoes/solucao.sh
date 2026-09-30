# Treino de permissões: uma solução possível.
sudo groupadd estudos
sudo useradd -m -s /bin/bash -G estudos ana
sudo usermod -aG estudos aluno
id aluno                       # o grupo novo só vale numa sessão nova
sudo mkdir -p /srv/estudos
sudo chgrp estudos /srv/estudos
sudo chmod 2770 /srv/estudos
cd ~/treinos/permissoes
chmod 744 script.sh
chmod 600 segredo.txt
sudo -u ana touch /srv/estudos/ana.txt
sudo ls -l /srv/estudos        # ana estudos: o setgid deu o grupo
sudo chown ana:estudos relatorio.txt
echo 750 > octal.txt
ls -l
