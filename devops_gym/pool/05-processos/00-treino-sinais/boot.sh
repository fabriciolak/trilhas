#!/usr/bin/env bash
# Treino de processos: liga os três processos, como aluno.
for p in relogio vigia teimoso; do
  runuser -u aluno -- setsid -f /opt/treino-processos/$p >/dev/null 2>&1
done
exit 0
