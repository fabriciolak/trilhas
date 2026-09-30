---
mes: 2
semana: 7
palco: lab
tipo: ticket
nivel: 2
conceitos: apt, repositório quebrado, dpkg -S, usrmerge, apt-mark hold
---
# Ferramenta sumida

## TICKET
O deploy da loja parou. O script `deploy-loja` morre logo no começo reclamando de
um comando que não existe neste servidor. E quando a Carla, tech lead, tentou
instalar, o gerenciador de pacotes reclamou de outra coisa.

Este ticket precisa de internet dentro do laboratório.

1. Rode `sudo deploy-loja` e leia o erro com atenção.
2. Instale o que falta. Se o gerenciador de pacotes reclamar antes disso, descubra
   de onde vem a reclamação e desative a causa **sem apagar**: renomeie o arquivo ou
   comente as linhas, para ficar o histórico.
3. Rode o deploy de novo até dar certo.
4. Em `~/pacotes.txt`, registre:
   - de qual pacote veio o comando `ss`;
   - qual versão do pacote `nginx` está instalada;
   - os 5 pacotes instalados que mais ocupam espaço.
5. A versão do nginx foi validada pelo time e **não pode** ser atualizada sem aviso.
   Trave o pacote para as atualizações automáticas não mexerem nele.

## COMANDOS
apt apt-get apt-cache apt-mark dpkg dpkg-query ls cat grep mv sort head command -v

## PERGUNTAS
1. Qual a diferença entre `apt update` e `apt upgrade`? O que cada um baixa e o que cada um muda no sistema?
2. O que é um repositório de pacotes, e por que ele é assinado com chave? O que `[trusted=yes]` desliga e por que isso é perigoso?
3. `dpkg` e `apt`: quem faz o quê? Por que o `dpkg -i` sozinho às vezes deixa o sistema com dependências quebradas?
4. Por que times de operação travam a versão de pacotes críticos (nginx, banco, kernel)? Qual o risco de travar e esquecer?
5. Num container Docker, você faria `apt upgrade` dentro do container rodando? O que se faz no lugar?

## ESTUDE
- LPI Linux Essentials, tópico 1.2 (aplicações e gerenciamento de pacotes): https://learning.lpi.org/pt/learning-materials/010-160/
- Documentação do Ubuntu (Server, gerenciamento de pacotes): https://documentation.ubuntu.com/server/
- `man apt`, `man apt-mark`, `man dpkg-query`
