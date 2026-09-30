---
mes: 1
semana: 2
palco: lab
tipo: ticket
nivel: 2
conceitos: df, du, find por tamanho, arquivo esparso, file, apagar em massa com segurança
---
# Disco lotado

## TICKET
O monitoramento disparou de madrugada: o disco do serviço de fotos, montado em
`/var/lib/fotos`, passou do limite. O time do app jura que "só grava miniaturas
pequenas". Ninguém sabe para onde foi o espaço.

Primeiro evidência, depois limpeza. Tudo que você descobrir vai para
`~/relatorio-disco.txt`:

1. Quanto do disco está ocupado? Registre.
2. Ache os **três arquivos** que realmente comem o espaço e prove com números,
   do maior para o menor. Tem coisa escondida. **Não apague esses três**: quem
   decide é o time.
3. Um arquivo parece gigante numa listagem, mas quase não ocupa disco. Qual é, e
   por que isso acontece? Uma linha no relatório.
4. A árvore está cheia de arquivos `.tmp` velhos e de exportações `.csv` **vazias**.
   Conte quantos são no total, registre o número e apague todos de uma vez (nada
   de um por um), sem apagar nenhum `.csv` que tenha conteúdo.
5. `exportacoes/relatorio-final.txt` não abre como texto. Descubra o que ele é de
   verdade e registre o tipo.
6. Existe um arquivo com espaços e parênteses no nome: `foto da festa (cópia).jpg`.
   Apague sem renomear.
7. No fim, registre de novo quanto do disco está ocupado.

## COMANDOS
df du find ls stat file wc rm sort head xargs

## PERGUNTAS
1. `ls -l` mostra um arquivo de 5 GB num disco de 88 MB. Como isso é possível? Que comando mostra o espaço real ocupado?
2. Você apagou um log de 30 GB e o `df` não mudou. Por quê? Como você recupera o espaço sem reiniciar o serviço?
3. O que é um inode? Por que um disco pode dar "No space left on device" com `df -h` mostrando espaço livre?
4. Por que `rm $(find . -name '*.tmp')` quebra com nomes que têm espaço, e como `find -delete`, `-exec` ou `-print0 | xargs -0` resolvem?

## ESTUDE
- LPI Linux Essentials, tópicos 2.4 (criar, mover e apagar arquivos) e 3.2 (buscar dados em arquivos): https://learning.lpi.org/pt/learning-materials/010-160/
- Descomplicando o Docker, capítulo de volumes (o mesmo problema de disco cheio aparece em containers): https://livro.descomplicandodocker.com.br/
- `man find` (procure por `-size`, `-empty`, `-delete`), `man du`, `man df`
