# Treino de rede: uma solução possível.
cd ~/treinos/rede
ip -br a
hostname -I | awk '{print $1}' > ip.txt
ip route | awk '/^default/ {print $3; exit}' > gateway.txt
sudo ss -tlnp > portas.txt
grep -E ':71|:72' portas.txt           # 127.0.0.1:7171 e 0.0.0.0:7272
echo 7171 > so-local.txt
curl -sI http://localhost:7272/ > cabecalhos.txt
echo "127.0.0.1 pinguim.exemplo" | sudo tee -a /etc/hosts
getent hosts pinguim.exemplo > nome.txt
nc -zv localhost 7171 2> nc.txt
grep '^nameserver' /etc/resolv.conf | head -n 1 | awk '{print $2}' > dns.txt
head ./*.txt
