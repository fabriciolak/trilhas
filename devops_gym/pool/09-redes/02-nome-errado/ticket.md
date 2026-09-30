---
mes: 3
semana: 11
palco: lab
tipo: ticket
nivel: 2
conceitos: DNS, /etc/hosts, getent, dig, resolução de nomes
---
# Nome errado

## TICKET
O checkout da loja calcula o frete chamando o serviço `fretes-api` pelo nome
`fretes.interno`, na porta 7070. Desde a migração de ontem, toda compra trava no
cálculo do frete. O time de rede jura: "o DNS está certo, o problema é da aplicação".
O comando que o checkout usa está em `/usr/local/bin/checkout-cotacao`.

Relatório em `~/rede.txt`:

1. Reproduza o erro rodando `checkout-cotacao`. Guarde a saída.
2. Para qual IP o nome `fretes.interno` está sendo resolvido **para os programas
   deste servidor**? Compare com o que o `dig` responde. Por que as respostas são
   diferentes, e de onde vem a errada? Registre as duas.
3. Onde o `fretes-api` realmente escuta (endereço e porta)? Registre.
4. Conserte a resolução para `fretes.interno` apontar para este próprio servidor.
   Atenção: neste servidor (um container), o arquivo que você vai mexer é especial,
   e alguns jeitos de editar não funcionam. Leia a mensagem de erro se aparecer.
5. Um parceiro externo também vai chamar o `fretes-api` pelo IP deste servidor.
   Faça ele escutar em todas as interfaces (a configuração dele fica em `/etc/fretes`),
   reinicie pelo supervisor e prove chamando pelo IP do servidor, não por `localhost`.
6. Rode `checkout-cotacao` de novo e acrescente a saída que funcionou.

## COMANDOS
curl getent dig cat grep ss ip hostname systemctl cp tee

## PERGUNTAS
1. O que acontece, passo a passo, quando um programa resolve um nome? Qual o papel de `/etc/nsswitch.conf`, `/etc/hosts` e `/etc/resolv.conf`?
2. Por que o `dig` e o `getent hosts` podem dar respostas diferentes para o mesmo nome? Qual dos dois mostra o que a aplicação vê?
3. Qual a diferença entre escutar em `127.0.0.1`, em `0.0.0.0` e no IP de uma interface? Quando cada um é o certo?
4. Por que `sed -i` falha em `/etc/hosts` dentro de um container e `cp` funciona? (Dica: o `sed -i` cria um arquivo novo e troca; o que o Docker montou ali?)
5. "É sempre DNS": por que times de operação dizem isso? Como você provaria rapidamente que é, ou que não é?

## ESTUDE
- Fabio Akita (Akitando), série de introdução a redes, #123 (como sua internet funciona): https://akitaonrails.com/2022/07/23/akitando-123-como-sua-internet-funciona-introducao-a-redes-parte-3/
- LPI Linux Essentials, tópico 4.4 (seu computador na rede: IP, DNS, portas): https://learning.lpi.org/pt/learning-materials/010-160/
- GIRUS, lab "linux_redes-conectividade": https://github.com/badtuxx/girus-cli
- `man 5 hosts`, `man nsswitch.conf`, `man getent`
