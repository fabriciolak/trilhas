---
mes: 1
semana: 4
palco: lab
tipo: chefe
nivel: 3
conceitos: logs comprimidos, zcat, awk, sort, uniq, sed com backup, tar
---
# Auditoria da madrugada

## TICKET
Chefe do mês 1. O time antifraude acordou você: o número de pagamentos **recusados**
explodiu nos últimos dias e eles querem os números antes das 9h. Os logs do gateway
estão em `/var/log/pagamentos/`, com a rotação de sempre: o atual, o de ontem e os mais
velhos **comprimidos**. Cada linha tem o BIN do cartão (os 6 primeiros dígitos), o status
e o motivo.

Monte `~/auditoria.txt` com:

1. O total de transações e o total de recusadas, somando **todos** os arquivos (os
   comprimidos também contam).
2. O ranking dos 3 BINs com mais recusas, com as contagens.
3. Para o BIN campeão de recusas, o motivo mais comum.
4. Bloqueie esse BIN em `/etc/pagamentos/regras.conf`: ele entra no fim da linha
   `bins_bloqueados`, separado por vírgula, **sem apagar os que já estão lá**. Guarde
   uma cópia do original com a extensão `.bak`.
5. Empacote todos os logs de pagamento (os quatro) em `~/evidencias.tar.gz` para o
   time jurídico.

Tudo com comandos, nada de editor.

## COMANDOS
ls zcat zgrep cat grep awk cut sort uniq head wc sed tar

## PERGUNTAS
1. Por que os logs antigos ficam comprimidos, e quem faz isso (logrotate)? Como ler um `.gz` sem descomprimir o arquivo em disco?
2. O que acontece se você contar só o arquivo atual num incidente que começou há três dias?
3. Por que `sed -i.bak` antes de mudar uma regra de produção? E por que o ideal nem é isso, e sim versionar a configuração?
4. Como você faria a mesma contagem se os logs estivessem em 50 servidores?

## ESTUDE
- LPI Linux Essentials, tópicos 3.1 (arquivamento) e 3.2 (buscar e extrair dados): https://learning.lpi.org/pt/learning-materials/010-160/
- `man zcat`, `man tar`, `man logrotate`
