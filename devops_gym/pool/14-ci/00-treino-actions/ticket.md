---
mes: 5
semana: 18
palco: host
tipo: treino
nivel: 1
conceitos: CI, GitHub Actions, workflow, gatilhos, jobs, steps, uses, run, matrix, needs, if, permissions, secrets, concurrency, actionlint
---
# Treino: seu primeiro pipeline no GitHub Actions

## AULA
**CI (integração contínua):** a cada push ou pull request, uma máquina limpa baixa o
código, roda os testes e as verificações, e diz "verde" ou "vermelho" **antes** de o
código entrar. **CD** é o passo seguinte: publicar sozinho o que passou.

No GitHub, o pipeline é um **workflow**: um YAML em `.github/workflows/`.

    name: CI
    on:                                   # QUANDO roda
      push:
        branches: [main]
      pull_request:
      workflow_dispatch:                  # botão "Run workflow" na aba Actions
    permissions:
      contents: read                      # o token do job só lê o código (menor privilégio)
    concurrency:                          # um push novo cancela o anterior do mesmo branch
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true
    jobs:
      testes:                             # cada job roda numa máquina nova (runner)
        runs-on: ubuntu-24.04
        strategy:
          matrix:
            python: ["3.13", "3.14"]      # o job roda uma vez para cada valor
        steps:
          - uses: actions/checkout@v7     # "uses": uma action pronta (sempre com versão)
          - uses: actions/setup-python@v7
            with:
              python-version: ${{ matrix.python }}
          - run: python -m unittest discover -s app   # "run": comandos de shell
      imagem:
        needs: [testes]                   # só começa se os testes passaram
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        runs-on: ubuntu-24.04
        steps:
          - uses: actions/checkout@v7
          - run: docker build -t loja:${{ github.sha }} .

**Expressões** `${{ ... }}` leem contextos (`github`, `matrix`, `secrets`, `env`,
`steps`). **Segredos** (`secrets.NOME`) são cadastrados no GitHub, em Settings → Secrets.

**Segurança:** nunca escreva `${{ github.event.pull_request.title }}` (ou qualquer dado
de quem abriu o PR) direto num `run:`: isso vira injeção de comando. Passe por `env:` e
use a variável do shell. O mesmo vale para segredos:

    - name: Usa o token
      env:
        TOKEN: ${{ secrets.AVISO_TOKEN }}
      run: ./avisa.sh "$TOKEN"

**Armadilha do YAML:** dois-pontos seguido de espaço dentro de um valor sem aspas quebra o
arquivo (`run: echo "total: 10"` não é YAML válido). Use o bloco `run: |`, com o comando
na linha de baixo, que também serve para vários comandos:

    - run: |
        echo "total: 10"
        ./deploy.sh

**Antes de subir**, valide com o **actionlint** (roda no seu Docker):

    docker run --rm -v "${PWD}:/repo" -w /repo rhysd/actionlint:1.7.12 -color .github/workflows/ci.yml

Depois, é fazer o push para o seu repositório `meu-devops` e acompanhar na aba **Actions**.

## TICKET
A pasta `projeto/` da oficina tem um app Python com testes (`app/`), um script
(`scripts/deploy.sh`) e um `Dockerfile`. Escreva `projeto/.github/workflows/ci.yml`:

1. Nome `CI`; roda em push na `main`, em pull request e pelo botão (manual).
2. O token dos jobs só lê o código; um push novo cancela a execução anterior do mesmo
   branch.
3. Job `testes`: Ubuntu 24.04, em Python **3.13 e 3.14** (matriz), com checkout,
   setup do Python da matriz e `python -m unittest discover -s app`.
4. Job `lint`: roda `shellcheck scripts/*.sh` (o ShellCheck já vem no runner do Ubuntu).
5. Job `imagem`: só depois de `testes` **e** `lint`, só em push na `main`; faz o
   checkout e `docker build` com a tag `loja:` + o SHA do commit.
6. No job `imagem`, um passo que recebe o segredo `AVISO_TOKEN` por variável de ambiente
   (`TOKEN`) e roda `echo "token configurado: ${TOKEN:+sim}"` (repare no dois-pontos:
   veja a armadilha do YAML na aula).
7. O actionlint não pode reclamar de nada.

Opcional (e recomendado): copie o `projeto/` para o seu `meu-devops`, faça o push e veja
rodar de verdade.

## COMANDOS
on push pull_request workflow_dispatch permissions concurrency jobs runs-on strategy matrix steps uses with run needs if env secrets actionlint

## PERGUNTAS
1. Por que cada job roda numa máquina nova? O que isso muda para arquivos entre jobs?
2. Por que interpolar dados do PR direto no `run:` é perigoso, e como o `env:` resolve?
3. Para que serve o `permissions:` no topo do workflow?

## ESTUDE
- GitHub Actions na documentação em português: https://docs.github.com/pt/actions
- Descomplicando GitHub Actions (LINUXtips): https://github.com/badtuxx/DescomplicandoGithubActions
- actionlint: https://github.com/rhysd/actionlint
