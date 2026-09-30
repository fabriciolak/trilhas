# Treino de pacotes: uma solução possível.
cd ~/treinos/apt
sudo apt-get install -y ./pinguim-cli_1.0_all.deb
pinguim
dpkg -L pinguim-cli > arquivos.txt
{ dpkg -S /usr/bin/pinguim; dpkg -S '*/bin/ls'; } > donos.txt
sudo apt-get install -y ./pinguim-extra_1.0_all.deb || true   # recusa: depende de pinguim-cli (>= 1.1)
sudo apt-get install -y ./pinguim-cli_1.1_all.deb ./pinguim-extra_1.0_all.deb
sudo apt-mark hold pinguim-cli
sudo apt-get remove -y pinguim-extra
dpkg -l | grep pinguim                              # rc = removido, config ficou
grep pinguim /var/log/dpkg.log > historico.txt
cat donos.txt
