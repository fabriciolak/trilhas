---
mes: 3
semana: 11
palco: lab
tipo: treino
nivel: 1
conceitos: IP, rota padrão, DNS, /etc/hosts, portas, ss, curl, nc, 127.0.0.1 x 0.0.0.0
---
# Treino: rede na linha de comando

## AULA
**Endereço, rota e nome.** Toda máquina tem um ou mais **IPs** (um por interface). O
`127.0.0.1` (*loopback*) é a própria máquina, e só ela alcança. A **rota padrão**
(*gateway*) é para onde vai tudo que não é da rede local. O **DNS** traduz nomes em IPs.

    ip -br a                     # interfaces e IPs, resumido (ip a: completo)
    hostname -I                  # só os IPs
    ip route                     # rotas; "default via X" é o gateway
    cat /etc/resolv.conf         # quem é o servidor DNS
    getent hosts exemplo.com     # resolve do jeito que os programas resolvem (hosts + DNS)
    dig exemplo.com +short       # pergunta direto ao DNS

`/etc/hosts` responde **antes** do DNS: é o jeito de apontar um nome só nesta máquina.
Dentro de container, o `/etc/hosts` é montado pelo Docker: `sed -i` falha nele; acrescente
com `echo "127.0.0.1 nome" | sudo tee -a /etc/hosts`.

**Portas.** Um IP é o prédio; a **porta** é o apartamento. Um serviço **escuta** numa
porta, em um endereço: `127.0.0.1:5432` só atende a própria máquina; `0.0.0.0:80`
atende qualquer interface.

    sudo ss -tlnp                # t: TCP · l: escutando · n: números · p: qual programa
    sudo ss -ulnp                # o mesmo para UDP
    nc -zv localhost 22          # a porta aceita conexão? (a resposta vem na saída de erro)

**HTTP com o curl.**

    curl http://localhost:8080/         # o corpo da resposta
    curl -i http://localhost:8080/      # cabeçalhos + corpo
    curl -I http://localhost:8080/      # só os cabeçalhos (método HEAD)
    curl -v http://localhost:8080/      # a conversa inteira (DNS, conexão, envio, resposta)
    curl -s -o /dev/null -w '%{http_code}\n' http://localhost/   # só o código

**Alcançar.** `ping -c 3 host` testa se responde (muita rede bloqueia ping: silêncio não
prova nada). `tracepath host` mostra o caminho.

## TICKET
Neste laboratório rodam dois serviços de treino, um na 7171 e outro na 7272. Respostas em
`~/treinos/rede/` (só o valor pedido em cada arquivo, quando for um valor).

1. O IP da interface principal (não o 127.0.0.1) em `ip.txt`.
2. O IP do gateway (a rota padrão) em `gateway.txt`.
3. A lista das portas TCP escutando, com os programas, em `portas.txt`.
4. Um dos dois serviços de treino só aceita conexões da própria máquina. Qual porta?
   Em `so-local.txt`.
5. Os cabeçalhos da resposta de `http://localhost:7272/` em `cabecalhos.txt`.
6. Faça o nome `pinguim.exemplo` apontar para `127.0.0.1` só nesta máquina, e salve a
   prova (a resolução) em `nome.txt`.
7. Prove com `nc` que a porta 7171 aceita conexão; salve a mensagem em `nc.txt`.
8. O IP do servidor DNS configurado em `dns.txt`.

## COMANDOS
ip hostname getent dig ss curl nc ping cat tee

## PERGUNTAS
1. Qual a diferença entre escutar em `127.0.0.1` e em `0.0.0.0`? Quando cada um é o certo?
2. `curl` responde "Connection refused" ou fica parado até dar tempo esgotado: o que cada sintoma sugere?
3. Por que o `/etc/hosts` é uma ferramenta de diagnóstico tão útil, e por que ele é perigoso se esquecido?

## ESTUDE
- Akitando #124 (sockets, cliente e servidor): https://akitaonrails.com/2022/08/04/akitando-124-como-funciona-sockets-cliente-servidor-e-a-web-introducao-a-redes-parte-4/
- MDN, HTTP em português: https://developer.mozilla.org/pt-BR/docs/Web/HTTP
- LPI Linux Essentials, tópico 4.4: https://learning.lpi.org/pt/learning-materials/010-160/
