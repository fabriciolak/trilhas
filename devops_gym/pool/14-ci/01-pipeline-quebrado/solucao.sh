#!/usr/bin/env bash
# Pipeline quebrado: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
cd loja-ci
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:1.7.12 -no-color .github/workflows/ci.yml || true
cat > .github/workflows/ci.yml <<'EOF'
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
EOF
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:1.7.12 -no-color .github/workflows/ci.yml
(cd app && python3 -m unittest -q)
