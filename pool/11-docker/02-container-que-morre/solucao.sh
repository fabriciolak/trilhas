#!/usr/bin/env bash
# Container que morre: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
docker build -q -t gym-relogio:1.0 relogio/
docker rm -f gym-relogio >/dev/null 2>&1 || true
docker run -d --name gym-relogio gym-relogio:1.0
sleep 2
docker inspect -f '{{.State.Status}} {{.State.ExitCode}}' gym-relogio
docker logs gym-relogio 2>&1 || true
sed -i '1s|^#!/bin/bash$|#!/bin/sh|' relogio/relogio.sh
docker build -q -t gym-relogio:1.1 relogio/
docker rm -f gym-relogio
docker run -d --name gym-relogio -e FUSO=America/Sao_Paulo --restart on-failure gym-relogio:1.1
sleep 2
docker logs gym-relogio
