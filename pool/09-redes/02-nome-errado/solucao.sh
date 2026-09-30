# Nome errado: uma solução possível.

# 1. Reproduzir: o curl espera e desiste (o IP não responde).
{ echo "1. antes:"; checkout-cotacao 2>&1; } > ~/rede.txt

# 2. getent pergunta do jeito que os programas perguntam (segue o /etc/nsswitch.conf:
#    "hosts: files dns", ou seja, primeiro /etc/hosts, depois DNS). dig pergunta direto
#    ao servidor DNS e ignora o /etc/hosts.
{ echo "2. getent (o que os programas veem):"; getent hosts fretes.interno; } >> ~/rede.txt
{ echo "   dig (só DNS):"; dig +short fretes.interno; echo "   (vazio: o DNS nem conhece o nome)"; } >> ~/rede.txt
grep hosts /etc/nsswitch.conf
grep -n fretes /etc/hosts                       # a linha errada veio daqui

# 3. Onde o serviço escuta de verdade.
{ echo "3. escuta:"; ss -tlnp | grep 7070; } >> ~/rede.txt

# 4. /etc/hosts num container é um arquivo montado pelo Docker (mount | grep hosts).
#    sed -i cria um arquivo novo e troca pelo antigo: "Device or resource busy".
#    cp escreve DENTRO do arquivo que já existe, e isso funciona.
sudo sed -i '/fretes.interno/d' /etc/hosts 2>&1 || true
grep -v 'fretes.interno' /etc/hosts > /tmp/hosts.novo
echo "127.0.0.1   fretes.interno" >> /tmp/hosts.novo
sudo cp /tmp/hosts.novo /etc/hosts
getent hosts fretes.interno

# 5. Escutar em todas as interfaces e reiniciar pelo systemd.
sudo sed -i 's/^BIND=.*/BIND=0.0.0.0/' /etc/fretes/fretes.env
sudo systemctl restart fretes-api; sleep 1
ss -tlnp | grep 7070
ip=$(hostname -I | awk '{print $1}')
{ echo "5. pelo IP $ip:"; curl -s "http://$ip:7070/cotacao"; echo; } >> ~/rede.txt

# 6. De novo.
{ echo "6. depois:"; checkout-cotacao; } >> ~/rede.txt
cat ~/rede.txt
