#!/usr/bin/env bash
# Treino de find e du: as datas são relativas a hoje, então são acertadas a cada boot.
d=/home/aluno/treinos/arquivos/logs
velho() { [ -e "$d/$1" ] && touch -d "$2 days ago" "$d/$1"; }
velho api/api-01.log 45; velho api/api-02.log 60; velho web/web-01.log 35; velho worker/worker-01.log 90
velho api/api-03.log 2; velho web/web-02.LOG 1; velho web/web-03.log 10
exit 0
