---
mes: 1
semana: 1
palco: lab
tipo: ticket
nivel: 1
conceitos: quem sou eu, id, grupos, hostname, uname, uptime, memória, CPU, variáveis de ambiente
---
# Primeiro plantão

## TICKET
Primeiro dia na Pinguim Store e você já está de plantão. O Beto, que cuidava deste
servidor, saiu de férias sem celular e deixou um bilhete (ele aparece quando você
entra no servidor). O bilhete garante: Debian 11, 16 processadores, 64 GB de RAM,
"reiniciei agora há pouco", "todo mundo aqui usa zsh" e "não tem nada estranho no
meu histórico".

Não confie em nada. Confira cada afirmação no próprio servidor.

1. Monte o arquivo `~/fatos.txt` **sem abrir editor de texto** (só com a saída dos
   comandos). Ele precisa mostrar: quem é você e seus grupos, quem está logado, o
   nome do servidor, a pasta onde você está, a data, a distribuição, o kernel, o seu
   shell, há quanto tempo o servidor está ligado, a memória, quantos processadores
   existem e onde ficam os programas que você usou.
2. Acrescente o histórico de logins do servidor. Quem esteve aqui antes de você, e
   de onde veio?
3. O histórico de comandos do Beto ficou em `/home/beto/.bash_history`. Você não vai
   conseguir ler como usuário comum: descubra por quê e leia mesmo assim. Acrescente
   ao relatório as linhas suspeitas.
4. Um daqueles comandos deixou rastro no sistema. Encontre esse rastro e registre,
   **sem apagar nada**: em incidente de segurança, evidência não se destrói.
5. Termine o relatório com uma linha que comece com `VEREDITO:` dizendo se isso vai
   para o time de segurança e por quê.

## COMANDOS
whoami id groups who w hostname pwd date cat uname uptime free nproc lscpu echo command -v last sudo ls grep awk env

## PERGUNTAS
1. Você entra num servidor no meio de um incidente. Quais são as cinco primeiras coisas que você confere antes de mudar qualquer coisa, e por que nessa ordem?
2. `uptime` mostra "load average: 8.00, 2.00, 0.50" numa máquina com 4 processadores. O que isso conta sobre os últimos 15 minutos, e o que você olharia em seguida?
3. Qual a diferença entre kernel e distribuição? De onde cada comando que você usou tirou a resposta?
4. O que significa uma conta com UID 0 além do root? Por que alguém criaria uma, e como você procuraria outras?
5. Por que `>` e `>>` são perigosos quando você está com pressa? O que acontece se você usar `sudo echo texto > /arquivo/do/root`?

## ESTUDE
- LPI Linux Essentials, tópico 2.1 (básico da linha de comando) e 4.2/4.3 (hardware e onde os dados ficam): https://learning.lpi.org/pt/learning-materials/010-160/
- Blau Araujo, Curso Shell GNU (primeiras aulas: o que é o shell, comandos e redirecionamento): https://debxp.org/
- `man hier`, `man uname`, `man last` (em português: `LANG=pt_BR.UTF-8 man uname`)
