# Servidor em chamas: uma solução possível.
echo "Linha do tempo do incidente do checkout" > ~/incidente.txt

# 1. O estado e o log: Permission denied em pedidos.db.
systemctl status checkout --no-pager
journalctl -u checkout --no-pager -n 20
{ echo "1. $(journalctl -u checkout --no-pager | grep FATAL | tail -n 1)"; ls -l /var/lib/checkout/pedidos.db; } >> ~/incidente.txt
sudo chown checkout:checkout /var/lib/checkout/pedidos.db
echo "   causa: pedidos.db restaurado como root (600). Corrigido com chown checkout:checkout." >> ~/incidente.txt

# 2. De novo: agora "No space left on device". O df diz cheio; o du, quase nada.
sudo systemctl restart checkout; sleep 2
echo "2. $(journalctl -u checkout --no-pager | grep FATAL | tail -n 1)" >> ~/incidente.txt
df -h /var/lib/checkout; sudo du -sh /var/lib/checkout
{ echo "   df: $(df --output=pcent /var/lib/checkout | tail -n 1); du: $(sudo du -sh /var/lib/checkout | cut -f1). Arquivo apagado (deleted) ainda aberto:";
  sudo lsof -nP +L1 | grep /var/lib/checkout; } >> ~/incidente.txt
cat /usr/local/bin/exportar-pedidos     # travado no read, esperando alguém digitar "s"
sudo pkill -f 'bin/exportar-pedidos$'; sleep 1
df -h /var/lib/checkout
echo "   causa: o exportar-pedidos, rodado na mão, esperava confirmação segurando o arquivo apagado. Encerrado com SIGTERM." >> ~/incidente.txt

# 3. Sobe, mas escuta onde?
sudo systemctl restart checkout; sleep 2
sudo ss -tlnp | grep python
echo "3. escutava em 127.0.0.1:8030 (checkout.env); o combinado é 0.0.0.0:8300." >> ~/incidente.txt
sudo sed -i 's/^ENDERECO=.*/ENDERECO=0.0.0.0/; s/^PORTA=.*/PORTA=8300/' /etc/checkout/checkout.env

# 4. Voltar sozinho e subir no boot. Um drop-in (é o que o systemctl edit cria).
sudo mkdir -p /etc/systemd/system/checkout.service.d
printf '[Service]\nRestart=on-failure\nRestartSec=2\n' | sudo tee /etc/systemd/system/checkout.service.d/reinicio.conf
sudo systemctl daemon-reload
sudo systemctl enable checkout
sudo systemctl restart checkout; sleep 2
curl -s "http://$(hostname -I | awk '{print $1}'):8300/saude"; echo
sudo kill -9 "$(systemctl show -p MainPID --value checkout)"; sleep 4
systemctl is-active checkout
echo "4. Restart=on-failure (drop-in) e enable: voltou sozinho depois de kill -9." >> ~/incidente.txt

# 5. O cron: arquivo sem ponto no nome, campo do usuário, caminho completo.
echo '10 3 * * * checkout /usr/local/bin/exportar-pedidos --sim' | sudo tee /etc/cron.d/exportar-pedidos
sudo -u checkout /usr/local/bin/exportar-pedidos --sim && tail -n 1 /var/lib/checkout/exportacoes.log
echo "5. exportar-pedidos agendado em /etc/cron.d/exportar-pedidos (03:10, usuário checkout, --sim)." >> ~/incidente.txt
cat ~/incidente.txt
