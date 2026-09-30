#!/usr/bin/env bash
# Troca de equipe: um processo do terceirizado que ficou rodando.
if id terceirizado >/dev/null 2>&1 && [ -x /home/terceirizado/sincroniza.sh ]; then
  runuser -u terceirizado -- setsid -f /home/terceirizado/sincroniza.sh >/dev/null 2>&1
fi
