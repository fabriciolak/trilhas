# Treino de cron: uma solução possível.
cd ~/treinos/cron
( crontab -l 2>/dev/null; echo '* * * * * /home/aluno/treinos/cron/marca.sh >> /home/aluno/treinos/cron/marca.log 2>&1' ) | crontab -
crontab -l
printf '30 2 * * *\n0 18 * * 1-5\n*/15 * * * *\n0 0 1 * *\n' > expressoes.txt
echo '0 3 * * 0 root /usr/bin/find /tmp -name "*.treino" -mtime +7 -delete' | sudo tee /etc/cron.d/limpeza-treino
sudo tee /etc/systemd/system/treino-backup.service > /dev/null <<'UNIT'
[Unit]
Description=Backup do treino de cron

[Service]
Type=oneshot
ExecStart=/usr/bin/tar -czf /var/backups/treino.tar.gz /home/aluno/treinos/cron
UNIT
sudo tee /etc/systemd/system/treino-backup.timer > /dev/null <<'UNIT'
[Unit]
Description=Backup do treino, todo dia às 04:00

[Timer]
OnCalendar=*-*-* 04:00:00
Persistent=true

[Install]
WantedBy=timers.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now treino-backup.timer
systemctl list-timers --no-pager | grep treino
# O cron roda no minuto cheio: espera a primeira marca.
for i in $(seq 1 75); do grep -q marca marca.log 2>/dev/null && break; sleep 1; done
cat marca.log
