# Treino de systemd: uma solução possível.
sudo tee /etc/systemd/system/saudacao.service > /dev/null <<'UNIT'
[Unit]
Description=Saudação do treino
After=network.target

[Service]
User=nobody
Environment="MENSAGEM=Bom dia, plantão!"
ExecStart=/usr/bin/python3 /opt/treino/saudacao.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now saudacao
sleep 1
curl -s localhost:8900
sudo kill -9 "$(systemctl show -p MainPID --value saudacao)"; sleep 2
systemctl status saudacao --no-pager | head -n 5
sudo journalctl -u saudacao -n 20 --no-pager > ~/treinos/systemd/log.txt
systemctl --failed --no-pager > ~/treinos/systemd/falhas.txt
