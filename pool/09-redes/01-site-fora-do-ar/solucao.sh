# Site fora do ar: uma solução possível.

# 1. Visão do cliente: ninguém escutando na porta 80.
curl -sSI --max-time 3 http://localhost > ~/site.txt 2>&1 || true
cat ~/site.txt                                   # Failed to connect ... Connection refused

# 2. Por que o nginx não sobe? status e journal apontam; nginx -t aponta a linha.
systemctl status nginx --no-pager || true
sudo nginx -t || true      # "invalid number of arguments in proxy_pass" / "unexpected }" em sites-enabled/loja
sudo cat -n /etc/nginx/sites-available/loja      # falta o ; no fim do proxy_pass
sudo sed -i 's#proxy_pass http://127.0.0.1:5000$#proxy_pass http://127.0.0.1:5000;#' /etc/nginx/sites-available/loja
sudo nginx -t && sudo systemctl start nginx

# 3. O erro mudou: 502 Bad Gateway. O log do site conta o motivo:
curl -sI http://localhost | head -n 1 >> ~/site.txt
sudo tail -n 3 /var/log/nginx/loja-erro.log      # connect() failed (111: Connection refused) ... upstream: "http://127.0.0.1:5000/"
sudo ss -tlnp | grep python                      # o backend escuta em 127.0.0.1:5001

# 4. Apontar para a porta certa, validar e recarregar (reload não derruba conexões).
sudo sed -i 's#127.0.0.1:5000;#127.0.0.1:5001;#' /etc/nginx/sites-available/loja
sudo nginx -t && sudo systemctl reload nginx
sleep 1      # o reload volta na hora; os processos novos assumem logo em seguida

# 5. Prova.
curl -sI http://localhost >> ~/site.txt
curl -s http://localhost | grep -o 'Pinguim Store' >> ~/site.txt
cat ~/site.txt
