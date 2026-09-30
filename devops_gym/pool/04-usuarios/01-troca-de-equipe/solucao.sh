# Troca de equipe: uma solução possível.

# 1. Trancar: -L trava a senha; --expiredate 1 expira a conta (vale até para chave SSH).
sudo usermod -L --expiredate 1 terceirizado

# 2. Auditoria: find no sistema todo. -ls mostra dono e permissões. 2>/dev/null joga
#    fora os "Permission denied" (usamos sudo, mas /proc sempre reclama de algo).
sudo find / -user terceirizado -not -path '/proc/*' -ls 2>/dev/null > ~/auditoria.txt
cat ~/auditoria.txt

# 3. Joana: -m cria a home, -s define o shell, -G coloca no grupo devs.
sudo useradd -m -s /bin/bash -G devs joana
# chown dono:grupo; -R entra na pasta. O grupo devs continua.
sudo chown -R joana:devs /srv/projeto/api
ls -la /srv/projeto/api

# 4. O resto: tudo que ainda é do terceirizado FORA do projeto (que já passou para a joana)
#    e fora da home dele (que o userdel -r leva). Conferir antes, apagar depois.
sudo find / -xdev -user terceirizado -not -path '/home/terceirizado*' -not -path '/proc/*' 2>/dev/null
sudo find / -xdev -user terceirizado -not -path '/home/terceirizado*' -not -path '/proc/*' -not -path '/var/spool/cron/*' -delete 2>/dev/null
sudo crontab -r -u terceirizado        # o agendamento

# 5. userdel recusa apagar quem tem processo rodando ("user is currently used by process").
pgrep -u terceirizado -a || true
sudo pkill -u terceirizado; sleep 1
sudo userdel -r terceirizado
sudo find / -xdev \( -nouser -o -nogroup \) -not -path '/proc/*' 2>/dev/null   # nada = nenhum órfão

# 6. Virar a joana: su - joana (pede a senha dela, que não existe) ou sudo -iu joana.
#    Num script, o equivalente sem terminal interativo:
sudo -iu joana bash -c 'whoami; id; cat /srv/projeto/api/.env'
