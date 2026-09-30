#!/usr/bin/env bash
# Mapa do servidor: a vitrine espalhada pelo sistema, do jeito que o FHS manda,
# e uma cópia velha de configuração numa pasta pessoal para confundir.
set -euo pipefail

install -d /etc/vitrine /var/log/vitrine /var/lib/vitrine /var/cache/vitrine/paginas /usr/share/doc/vitrine

cat > /usr/local/bin/vitrine <<'EOF'
#!/bin/sh
# vitrine: o site da Pinguim Store (simulado para o DevOps Gym).
echo "vitrine 2.4.1 · configuração em /etc/vitrine/vitrine.conf"
EOF
chmod 755 /usr/local/bin/vitrine

cat > /etc/vitrine/vitrine.conf <<'EOF'
# Configuração da vitrine (a que está em uso)
porta = 8180
dados = /var/lib/vitrine
cache = /var/cache/vitrine
log = /var/log/vitrine/vitrine.log
nivel_log = info
EOF

cat > /usr/share/doc/vitrine/LEIAME <<'EOF'
vitrine: o site da Pinguim Store.
Configuração: /etc/vitrine/vitrine.conf · Logs: /var/log/vitrine
EOF

printf 'id;nome;preco\n1;Caneca Tux;39.90\n2;Camiseta Pinguim;79.90\n' > /var/lib/vitrine/produtos.csv
for n in $(seq 1 40); do printf '<html>produto %s</html>\n' "$n" > "/var/cache/vitrine/paginas/produto-$n.html"; done

# Um log grande, com erros espalhados; o último erro é o que importa.
log=/var/log/vitrine/vitrine.log
: > "$log"
for i in $(seq 1 3000); do
  printf '2026-09-2%d 10:%02d:%02d INFO GET /produto/%d 200\n' $((i % 9)) $((i % 60)) $((i * 7 % 60)) $((i % 40 + 1)) >> "$log"
  if (( i % 450 == 0 )); then
    printf '2026-09-2%d 10:%02d:%02d ERRO banco de dados lento (%d ms)\n' $((i % 9)) $((i % 60)) $((i % 60)) $((i + 900)) >> "$log"
  fi
done
echo "2026-09-29 23:47:12 ERRO fornecedor-api: tempo esgotado ao atualizar estoque (código F-504)" >> "$log"
for i in $(seq 1 25); do echo "2026-09-29 23:5$((i % 10)):0$((i % 10)) INFO GET /health 200" >> "$log"; done

# A pegadinha: uma cópia antiga e errada, na pasta pessoal do administrador anterior.
id beto >/dev/null 2>&1 || useradd -m -s /bin/bash beto
install -d -o beto -g beto /home/beto/antigo
cat > /home/beto/antigo/vitrine.conf <<'EOF'
# cópia antiga, não usar
porta = 8080
EOF
chown beto:beto /home/beto/antigo/vitrine.conf
chmod 755 /home/beto
