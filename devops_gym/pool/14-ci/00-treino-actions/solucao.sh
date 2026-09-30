#!/usr/bin/env bash
# Treino de GitHub Actions: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
mkdir -p projeto/.github/workflows
cat > projeto/.github/workflows/ci.yml <<'YAML'
name: CI

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  testes:
    runs-on: ubuntu-24.04
    strategy:
      matrix:
        python: ["3.13", "3.14"]
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: ${{ matrix.python }}
      - run: python -m unittest discover -s app

  lint:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7
      - run: shellcheck scripts/*.sh

  imagem:
    needs: [testes, lint]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7
      - run: docker build -t loja:${{ github.sha }} .
      - name: Avisa
        env:
          TOKEN: ${{ secrets.AVISO_TOKEN }}
        run: |
          echo "token configurado: ${TOKEN:+sim}"
YAML
docker run --rm -v "${PWD}/projeto:/repo" -w /repo rhysd/actionlint:1.7.12 -color .github/workflows/ci.yml
