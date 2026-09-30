#!/usr/bin/env bash
# Troca de equipe: arquivos do terceirizado espalhados pelo sistema, uma tarefa agendada
# e um processo dele ainda rodando (o boot.sh liga).
set -euo pipefail

groupadd devs
useradd -m -s /bin/bash -G devs -c "Terceirizado (contrato encerrado)" terceirizado

mkdir -p /srv/projeto/api /usr/local/lib/ganchos /opt/relatorios /var/tmp/.cache-terceirizado
printf 'from flask import Flask\napp = Flask(__name__)\n' > /srv/projeto/api/app.py
printf 'TOKEN_PAGAMENTO=tk-4471\n'                        > /srv/projeto/api/.env
printf '# API da loja\n'                                    > /srv/projeto/api/LEIAME.md
chown -R terceirizado:devs /srv/projeto/api
chmod 775 /srv/projeto/api
chmod 640 /srv/projeto/api/.env

printf '#!/bin/sh\ncurl -s https://hooks.exemplo.com/notifica\n' > /usr/local/lib/ganchos/notifica.sh
printf 'rascunho de senha: nao-usar\n'                          > /tmp/rascunho-terceirizado.txt
printf 'sessao antiga\n'                                        > /var/tmp/.cache-terceirizado/sessao.db
printf 'semana;vendas\n38;1200\n'                               > /opt/relatorios/semana-38.csv
chown terceirizado:terceirizado /usr/local/lib/ganchos/notifica.sh /tmp/rascunho-terceirizado.txt /opt/relatorios/semana-38.csv
chown -R terceirizado:terceirizado /var/tmp/.cache-terceirizado

# Um agendamento dele (cron do usuário).
echo '*/30 * * * * /usr/local/lib/ganchos/notifica.sh' | crontab -u terceirizado -

# Um processo que "ficou rodando" (ligado pelo boot.sh).
cat > /home/terceirizado/sincroniza.sh <<'EOF'
#!/bin/bash
while true; do sleep 60; done
EOF
chown terceirizado:terceirizado /home/terceirizado/sincroniza.sh
chmod 755 /home/terceirizado/sincroniza.sh
