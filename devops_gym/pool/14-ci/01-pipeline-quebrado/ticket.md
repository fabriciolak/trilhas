---
mes: 5
semana: 18
palco: host
tipo: ticket
nivel: 2
conceitos: github actions, workflow, jobs, needs, permissions, GITHUB_TOKEN, injeção em run, actionlint
---
# Pipeline quebrado

## TICKET
O Beto escreveu o primeiro pipeline de CI da loja (`loja-ci/.github/workflows/ci.yml`,
na oficina) e foi embora antes de ver rodar. Ele deveria:

- em todo push na `main` e em todo pull request: rodar os testes de `app/`;
- **só** em push na `main`, e **só** se os testes passarem: construir a imagem e
  publicar no GitHub Container Registry (`ghcr.io`), com a tag igual ao SHA do commit.

Antes de gastar minutos de CI, valide localmente com o **actionlint**, o "compilador"
de workflows (roda em container, na pasta `loja-ci`):

```
docker run --rm -v "${PWD}:/repo" -w /repo rhysd/actionlint:1.7.12 -color .github/workflows/ci.yml
```

1. Rode o actionlint e conserte **tudo** que ele apontar. Um dos erros é de segurança:
   entenda o motivo antes de consertar.
2. Há problemas que o actionlint não pega, porque são de regra de negócio:
   - a imagem não pode ser publicada em pull request;
   - para publicar no GHCR com o `GITHUB_TOKEN`, o job precisa de permissão de escrita
     em pacotes (e o resto do workflow deve ficar só com leitura do código);
   - nenhuma action pode estar numa versão abandonada.
3. No fim, o actionlint não pode reclamar de nada.

Extra (não verificado): crie um repositório seu no GitHub com a pasta `loja-ci` e veja
o pipeline rodar de verdade na aba **Actions**.

## COMANDOS
docker run actionlint git on push pull_request jobs needs permissions if env GITHUB_OUTPUT secrets.GITHUB_TOKEN

## PERGUNTAS
1. Qual a diferença entre CI e CD? Onde termina um e começa o outro neste workflow?
2. Por que `run: echo "${{ github.event.pull_request.title }}"` é uma falha de segurança? Como passar o valor com segurança?
3. O que é o `GITHUB_TOKEN`, que permissões ele tem por padrão e por que declarar `permissions` no mínimo necessário?
4. Por que fixar as actions em versão (ou até num SHA de commit) em vez de `@main`?
5. Por que publicar a imagem com a tag do SHA, e não só `latest`?

## ESTUDE
- Descomplicando GitHub Actions (LINUXtips): https://github.com/badtuxx/DescomplicandoGithubActions
- Documentação do GitHub em português, GitHub Actions: https://docs.github.com/pt/actions
- Microsoft Learn, "Introdução ao GitHub Actions": https://learn.microsoft.com/pt-br/training/modules/introduction-to-github-actions/
- actionlint (inglês): https://github.com/rhysd/actionlint
