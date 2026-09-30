# Mapa do servidor: uma solução possível.

# O programa: o shell procura comandos nas pastas do PATH, em ordem.
command -v vitrine                       # /usr/local/bin/vitrine
vitrine                                  # o próprio programa conta onde está a configuração

# A configuração do sistema mora em /etc. A de /home/beto/antigo é uma cópia velha.
ls /etc/vitrine
cat /etc/vitrine/vitrine.conf            # porta, dados, cache e log estão aqui

# Documentação de pacotes: /usr/share/doc/<nome>
ls /usr/share/doc/vitrine

echo "programa: /usr/local/bin/vitrine"          >  ~/mapa.txt
echo "configuracao: /etc/vitrine/vitrine.conf"   >> ~/mapa.txt
echo "logs: /var/log/vitrine/vitrine.log"        >> ~/mapa.txt
echo "dados: /var/lib/vitrine"                   >> ~/mapa.txt
echo "cache: /var/cache/vitrine"                 >> ~/mapa.txt
echo "documentacao: /usr/share/doc/vitrine"      >> ~/mapa.txt

# A porta, direto da configuração (grep acha a linha, awk pega o 3º campo).
echo "porta: $(grep '^porta' /etc/vitrine/vitrine.conf | awk '{print $3}')" >> ~/mapa.txt

# O último erro: filtra os ERRO e fica só com a última linha.
wc -l /var/log/vitrine/vitrine.log                # grande demais para ler na tela
grep ERRO /var/log/vitrine/vitrine.log | tail -n 1 >> ~/mapa.txt

# man hier descreve a hierarquia de pastas (em português com LANG=pt_BR.UTF-8).
echo "fhs: /etc = configurações; /var = dados que mudam (logs, filas, estado); /usr/local = programas instalados à mão pelo administrador; /opt = pacotes de terceiros inteiros; /tmp = temporários, podem sumir no reboot" >> ~/mapa.txt

cat ~/mapa.txt
