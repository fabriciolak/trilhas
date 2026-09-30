# Treino de SSH: uma solução possível.
ssh-keygen -q -t ed25519 -N '' -C "treino@devops-lab" -f ~/.ssh/treino_ed25519
cat ~/.ssh/treino_ed25519.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
ssh -i ~/.ssh/treino_ed25519 -o StrictHostKeyChecking=accept-new aluno@localhost 'echo "$SSH_CONNECTION" > ~/treinos/ssh/conexao.txt'
cat >> ~/.ssh/config <<'CFG'
Host treino
    HostName localhost
    User aluno
    IdentityFile ~/.ssh/treino_ed25519
    IdentitiesOnly yes
CFG
chmod 600 ~/.ssh/config
ssh treino hostname
scp ~/treinos/ssh/relatorio.txt treino:/tmp/relatorio-copiado.txt
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub > ~/treinos/ssh/fingerprint.txt
cat ~/treinos/ssh/conexao.txt ~/treinos/ssh/fingerprint.txt
