d=$CASA/treinos/ssh
k=$CASA/.ssh/treino_ed25519
ak=$CASA/.ssh/authorized_keys
checar "1. a chave treino_ed25519 existe e é ed25519" "ssh-keygen -t ed25519 -f ~/.ssh/treino_ed25519 -N ''" \
  sh -c "test -f $k && ssh-keygen -lf $k.pub | grep -q ED25519"
autorizada() { [ -f "$k.pub" ] && grep -qF "$(cut -d' ' -f2 "$k.pub")" "$ak" 2>/dev/null; }
checar "2. a chave pública está no authorized_keys" "cat ~/.ssh/treino_ed25519.pub >> ~/.ssh/authorized_keys" autorizada
checar "2. ~/.ssh é 700 e o authorized_keys não é gravável por outros" "chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys" \
  sh -c "test \"\$(stat -c %a $CASA/.ssh)\" = 700 && test \$(( 0\$(stat -c %a $ak) & 022 )) -eq 0 && test \"\$(stat -c %U $ak)\" = aluno"
checar "3. conexao.txt tem o SSH_CONNECTION de uma sessão SSH" "ssh -i ~/.ssh/treino_ed25519 aluno@localhost 'echo \$SSH_CONNECTION > ~/treinos/ssh/conexao.txt'" \
  grep -qE '^[0-9a-f:.]+ [0-9]+ [0-9a-f:.]+ 22$' "$d/conexao.txt"
checar "4. ssh treino entra sem senha, com a chave do treino" "Host treino / HostName localhost / User aluno / IdentityFile ~/.ssh/treino_ed25519" \
  sh -c "runuser -u aluno -- ssh -G treino | grep -qi '^identityfile .*treino_ed25519' && runuser -u aluno -- ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 treino true"
checar "5. /tmp/relatorio-copiado.txt veio pelo scp" "scp ~/treinos/ssh/relatorio.txt treino:/tmp/relatorio-copiado.txt" \
  sh -c "cmp -s $d/relatorio.txt /tmp/relatorio-copiado.txt"
checar "6. fingerprint.txt tem a fingerprint da chave ed25519 do servidor" "ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub" \
  grep -qF "$(ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub | awk '{print $2}')" "$d/fingerprint.txt"
