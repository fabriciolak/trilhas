#!/usr/bin/env bash
# Nome errado: o Docker reescreve o /etc/hosts a cada boot, então a entrada errada
# entra aqui (e não na construção da imagem).
grep -q 'fretes.interno' /etc/hosts || echo "10.20.30.40   fretes.interno   # migração 2026-09" >> /etc/hosts
