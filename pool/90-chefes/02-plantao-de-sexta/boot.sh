#!/usr/bin/env bash
# Plantão de sexta: o reindexador do legado, rodando como o usuário legado.
runuser -u legado -- setsid -f /opt/legado/reindexar >/dev/null 2>&1
