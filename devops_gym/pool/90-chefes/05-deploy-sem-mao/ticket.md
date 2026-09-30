---
mes: 5
semana: 22
palco: lab
tipo: chefe
nivel: 3
conceitos: git, hooks, pre-receive, post-receive, testes como portão, artefato, ansible, link por versão, smoke test, rollback
---
# Deploy sem mão

## TICKET
Chefe do mês 5. A vitrine é publicada por uma esteira caseira: um repositório Git no
próprio servidor (`/srv/git/vitrine.git`) com hooks que testam, empacotam e publicam com
o Ansible (`/srv/deploy/deploy.yml`). A versão no ar responde em
`http://localhost:8600/versao`. Só que "o deploy automático nunca funcionou direito", e
todo mundo publica na mão. Chega.

Seu clone de trabalho é `~/vitrine`. Nele está um commit do Beto, a versão 1.2 (cupom de
desconto), que ainda não foi enviado.

1. **Esteira de pé.** Um `git push` no `main` publica sozinho, e `/versao` mostra a
   versão nova assim que o push termina. Publicar de novo a mesma versão não pode quebrar
   nada.
2. **Portão de qualidade.** Push no `main` com teste falhando é **recusado**: o `main` do
   servidor não muda e nada é publicado.
3. **Volta sozinha.** Se a versão nova não responder em `/saude` depois de publicada, a
   esteira volta para a versão anterior sem ninguém mexer.
4. **Registro.** Cada deploy vira uma linha em `/srv/vitrine/deploys.log`, com a data, o
   commit (os 7 primeiros caracteres) e o resultado: `ok` ou `rollback`.
5. **A 1.2 do Beto.** Publique pela esteira. Não vai passar de primeira: conserte o
   código, sem mexer nos testes.

Regra da casa: os hooks usam o repositório em que estão rodando (nada de escrever
`/srv/git/vitrine.git` dentro deles). O `gym check` testa a sua esteira numa **cópia**
do repositório, com pushes de verdade, e depois republica o `main`.

## COMANDOS
git log/status/commit/push, ls -l, chmod, cat, curl, readlink, ansible-playbook, systemctl, journalctl

## PERGUNTAS
1. Por que o Git ignorou o hook? O que ele avisou no push, e em que parte da saída?
2. Qual a diferença entre `pre-receive` e `post-receive`? Por que o portão de testes não pode ficar no `post-receive`?
3. O que o `ln -s` fez quando o destino já era um link para uma pasta? Por que o módulo `file` do Ansible com `force` (ou `ln -sfn`) resolve?
4. Isto é CI/CD de brinquedo. Relacione cada peça com o GitHub Actions do ticket "pipeline quebrado": quem faz o papel do hook, do artefato, do portão, do deploy e do rollback?
5. Por que publicar cada versão numa pasta e trocar um link é mais seguro do que copiar por cima da versão que está rodando?

## ESTUDE
- Pro Git em português, "Hooks do Git": https://git-scm.com/book/pt-br/v2/Customizando-o-Git-Hooks-do-Git
- Documentação do Ansible (módulos `file`, `unarchive`, `systemd`, `uri`): https://docs.ansible.com/
- `man githooks`, `man ln`
