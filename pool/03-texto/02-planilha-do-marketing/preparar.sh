#!/usr/bin/env bash
# Planilha do marketing: CSV com CRLF, ponto e vírgula, e-mails em caixa alta,
# linhas repetidas, linhas em branco e uma cidade com espaço no nome.
set -euo pipefail

mkdir -p /srv/exportacao
sed 's/$/\r/' > /srv/exportacao/clientes.csv <<'EOF'
NOME;EMAIL;CIDADE
Ana Souza;ANA.SOUZA@EXEMPLO.COM.BR;Recife
Bruno Lima;BRUNO.LIMA@EXEMPLO.COM.BR;Curitiba

Carla Dias;CARLA.DIAS@EXEMPLO.COM.BR;Recife
Ana Souza;ANA.SOUZA@EXEMPLO.COM.BR;Recife
Diego Alves;DIEGO.ALVES@EXEMPLO.COM.BR;Manaus
Elisa Rocha;ELISA.ROCHA@EXEMPLO.COM.BR;Porto Alegre

Fabio Nunes;FABIO.NUNES@EXEMPLO.COM.BR;Curitiba
Bruno Lima;BRUNO.LIMA@EXEMPLO.COM.BR;Curitiba
Gabi Costa;GABI.COSTA@EXEMPLO.COM.BR;Manaus
Heitor Melo;HEITOR.MELO@EXEMPLO.COM.BR;Salvador
Iara Pinto;IARA.PINTO@EXEMPLO.COM.BR;Porto Alegre
EOF
chmod 644 /srv/exportacao/clientes.csv
