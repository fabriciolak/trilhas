#!/usr/bin/env bash
# Chave recusada: a chave do aluno está autorizada para o deploy, mas a pasta pessoal e o
# authorized_keys do deploy estão abertos demais, e o AllowUsers não inclui o deploy.
set -euo pipefail

install -d -m 700 -o aluno -g aluno /home/aluno/.ssh
runuser -u aluno -- ssh-keygen -q -t ed25519 -N '' -C "aluno@devops-lab" -f /home/aluno/.ssh/id_ed25519

useradd -m -s /bin/bash -c "Conta do pipeline de deploy" deploy
useradd -m -s /bin/bash -c "Suporte" suporte
install -d -o deploy -g deploy /home/deploy/.ssh
cp /home/aluno/.ssh/id_ed25519.pub /home/deploy/.ssh/authorized_keys
chown root:root /home/deploy/.ssh/authorized_keys
chmod 666 /home/deploy/.ssh/authorized_keys
chmod 777 /home/deploy/.ssh /home/deploy

cat > /etc/ssh/sshd_config.d/10-seguranca.conf <<'EOF'
# Política de segurança (auditoria de 2026-08)
PermitRootLogin no
PasswordAuthentication no
AllowUsers suporte aluno
EOF
