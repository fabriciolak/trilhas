#!/bin/bash
# Relógio da loja: escreve a hora no fuso da loja a cada 5 segundos.
# O fuso vem da variável FUSO (ex.: America/Sao_Paulo). Sem ela, não sobe.
: "${FUSO:?defina a variável FUSO com o fuso da loja, ex.: America/Sao_Paulo}"

while true; do
  echo "$(date -u '+%Y-%m-%d %H:%M:%S') UTC | relógio da loja ($FUSO)"
  sleep 5
done
