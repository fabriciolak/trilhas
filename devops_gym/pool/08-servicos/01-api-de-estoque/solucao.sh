# API de estoque: uma solução possível.

# 1. Estado, habilitação e histórico. --no-pager porque aqui é script (no terminal, tanto faz).
systemctl status estoque-api --no-pager || true      # activating (auto-restart), status=217/USER
systemctl is-enabled estoque-api
journalctl -u estoque-api --no-pager -n 20

# 2. Ao vivo seria:  journalctl -u estoque-api -f   (Ctrl+C para sair).
#    A reclamação: "Failed to determine user credentials: No such process" → 217/USER:
#    a unit manda rodar como User=estoque, e esse usuário não existe.
systemctl cat estoque-api
cat /etc/estoque/api.env
getent passwd estoque || echo "não existe"

# 3. Criar o usuário de sistema (UID baixo, sem home, sem shell de login).
sudo useradd --system --no-create-home --shell /usr/sbin/nologin estoque
sudo systemctl restart estoque-api; sleep 2

# 4. Segundo problema, no journal: "FATAL estoque-api: não consigo gravar
#    /var/lib/estoque/estado.json: Permission denied". A pasta é do root (755).
journalctl -u estoque-api --no-pager -n 5
ls -ld /var/lib/estoque
sudo chown estoque:estoque /var/lib/estoque
sudo systemctl restart estoque-api; sleep 3

# 5. Provas.
systemctl status estoque-api --no-pager > ~/estoque.txt
systemctl is-enabled estoque-api >> ~/estoque.txt
ss -tlnp | grep 8088 >> ~/estoque.txt
curl -s http://localhost:8088/saude >> ~/estoque.txt
cat ~/estoque.txt
