d=/home/deploy

checar "ssh deploy-local hostname funciona sem senha" "ssh -v deploy-local para ver o cliente; journalctl -u ssh para ver o servidor" \
  sh -c "runuser -u aluno -- env HOME=$CASA ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 deploy-local hostname | grep -q devops-lab"
checar "o atalho deploy-local está no seu ~/.ssh/config" "Host deploy-local / HostName localhost / User deploy" \
  grep -qiE '^[[:space:]]*host[[:space:]]+.*deploy-local' "$CASA/.ssh/config"
checar "a configuração do servidor SSH é válida" "sshd -t" sshd -t
checar "o deploy foi incluído no AllowUsers" "AllowUsers em /etc/ssh/sshd_config.d/" sh -c "sshd -T | grep -i '^allowusers' | grep -qw deploy"
checar "quem já estava no AllowUsers continua (suporte e aluno)" "acrescente, não troque" \
  sh -c "sshd -T | grep -i '^allowusers' | grep -qw suporte && sshd -T | grep -i '^allowusers' | grep -qw aluno"
checar "login por senha continua desligado" "não abra o servidor" sh -c "sshd -T | grep -qi '^passwordauthentication no'"
checar "a pasta pessoal do deploy não é gravável por grupo e outros" "chmod 755 (ou 750) /home/deploy" \
  sh -c "[ -z \"\$(find $d -maxdepth 0 -perm /022)\" ]"
checar "~deploy/.ssh é 700 e do deploy" "chmod 700; chown deploy:deploy" \
  test "$(stat -c '%a %U' $d/.ssh)" = "700 deploy"
checar "authorized_keys é do deploy e não é gravável por outros" "chown deploy:deploy; chmod 600" \
  sh -c "[ \"\$(stat -c %U $d/.ssh/authorized_keys)\" = deploy ] && [ -z \"\$(find $d/.ssh/authorized_keys -perm /022)\" ]"
