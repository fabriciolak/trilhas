# Chave recusada: uma solução possível.

# 1. O cliente: -v mostra a negociação. Ele só diz "Permission denied (publickey)".
#    (-o BatchMode=yes: não pergunta nada; accept-new: aceita a chave do servidor na 1ª vez)
ssh -v -o BatchMode=yes -o StrictHostKeyChecking=accept-new deploy@localhost true 2>&1 | tail -n 5 || true

# 2. O servidor conta o motivo. Primeiro: "User deploy from 127.0.0.1 not allowed
#    because not listed in AllowUsers".
sudo journalctl -u ssh --no-pager -n 10
sudo grep -r AllowUsers /etc/ssh/

# 3. Acrescentar o deploy sem tirar ninguém, validar e aplicar.
sudo sed -i 's/^AllowUsers suporte aluno$/AllowUsers suporte aluno deploy/' /etc/ssh/sshd_config.d/10-seguranca.conf
sudo sshd -t && sudo systemctl restart ssh

# De novo: agora o servidor diz "Authentication refused: bad ownership or modes for
# directory /home/deploy". Com StrictModes (o padrão), o sshd recusa chaves se a home,
# o .ssh ou o authorized_keys puderem ser alterados por outra pessoa.
ssh -o BatchMode=yes deploy@localhost true 2>&1 || true
sudo journalctl -u ssh --no-pager -n 3

# 4. Permissões que o sshd aceita.
sudo chmod 755 /home/deploy
sudo chmod 700 /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# 5. O atalho no cliente. ~/.ssh/config precisa ser só seu (600).
cat >> ~/.ssh/config <<'EOF'
Host deploy-local
    HostName localhost
    User deploy
    IdentityFile ~/.ssh/id_ed25519
EOF
chmod 600 ~/.ssh/config
ssh -o BatchMode=yes deploy-local hostname
