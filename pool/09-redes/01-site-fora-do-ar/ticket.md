---
mes: 3
semana: 11
palco: lab
tipo: ticket
nivel: 2
conceitos: nginx -t, proxy reverso, 502, ss, logs de erro, reload
---
# Site fora do ar

## TICKET
Sexta-feira, 18h. O site da loja (`http://localhost` neste servidor) não abre, e o
último que mexeu na configuração do servidor web já foi embora. A aplicação de
verdade (o "backend" da vitrine) roda neste mesmo servidor, atrás do nginx, que
recebe os clientes e repassa os pedidos (proxy reverso).

1. Prove que o site está fora do ar, do ponto de vista de um cliente. Guarde a
   evidência em `~/site.txt`.
2. Descubra por que o servidor web não sobe. **Valide a configuração antes de
   reiniciar qualquer coisa**: reiniciar com configuração quebrada derruba o que
   ainda está de pé.
3. Quando ele subir, o site ainda não vai funcionar: o erro muda. Leia o log de erro
   **do site** (não o geral) e descubra para onde o nginx está mandando os pedidos e
   onde o backend realmente escuta.
4. Conserte e aplique a mudança **sem derrubar** o servidor web (recarregar, não
   reiniciar).
5. Prove que voltou: a página da loja abre e o código HTTP é 200. Acrescente a prova
   em `~/site.txt`.

## COMANDOS
curl systemctl journalctl nginx ss ls cat tail grep

## PERGUNTAS
1. O que é um proxy reverso e por que quase todo site tem um na frente da aplicação?
2. O que significam os erros 502, 503 e 504? Qual camada falhou em cada um?
3. `systemctl reload nginx` e `systemctl restart nginx`: o que acontece com as conexões abertas em cada caso?
4. Para que serve `nginx -t`? Por que ele devia estar em todo roteiro de mudança (e em todo pipeline)?
5. `ss -tlnp` mostra `127.0.0.1:5001`. Isso aceita conexão de outra máquina? E `0.0.0.0:5001`?

## ESTUDE
- Fabio Akita (Akitando), série de introdução a redes, episódio #124 (sockets, cliente, servidor e a Web): https://akitaonrails.com/2022/08/04/akitando-124-como-funciona-sockets-cliente-servidor-e-a-web-introducao-a-redes-parte-4/
- MDN em português, documentação de HTTP (comece pela visão geral): https://developer.mozilla.org/pt-BR/docs/Web/HTTP
- LPI Linux Essentials, tópico 4.4 (seu computador na rede): https://learning.lpi.org/pt/learning-materials/010-160/
