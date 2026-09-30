#!/usr/bin/env bash
# Deploy sem mão (chefe do mês 5): esteira caseira com Git + Ansible.
# - /srv/git/vitrine.git (main na 1.1) com um post-receive sem permissão de execução, que
#   ignora o resultado dos testes;
# - /srv/deploy/deploy.yml troca a versão com "ln -s" (quando o link já existe, ele cria
#   um link DENTRO da pasta antiga e a versão no ar não muda);
# - no ar: a 1.0 (vitrine.service); em ~/vitrine: o commit 1.2 do Beto, com bug no cupom.
set -euo pipefail
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1

commit() {  # commit <autor> <mensagem>
  git -c user.name="$1" -c user.email="$(echo "$1" | tr 'A-Z' 'a-z')@pinguim.local" commit -qam "$2"
}

src=$(mktemp -d)
cd "$src"
git init -q -b main

cat > app.py <<'PY'
#!/usr/bin/env python3
"""Vitrine da Pinguim Store (simulada para o DevOps Gym)."""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

PORTA = 8600
VERSAO = (Path(__file__).resolve().parent / "VERSION").read_text().strip()
FRETE_GRATIS_A_PARTIR_DE = 300.0


def calcular_frete(valor: float) -> float:
    """Frete grátis a partir de um valor; abaixo dele, R$ 19,90."""
    return 0.0 if valor >= FRETE_GRATIS_A_PARTIR_DE else 19.90


class Vitrine(BaseHTTPRequestHandler):
    def responder(self, codigo: int, corpo: str, tipo: str = "application/json") -> None:
        dados = corpo.encode()
        self.send_response(codigo)
        self.send_header("Content-Type", f"{tipo}; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        url = urlparse(self.path)
        parametros = {chave: valores[0] for chave, valores in parse_qs(url.query).items()}
        if url.path == "/saude":
            self.responder(200, json.dumps({"status": "ok"}))
        elif url.path == "/versao":
            self.responder(200, VERSAO, "text/plain")
        elif url.path == "/frete":
            self.responder(200, json.dumps({"frete": calcular_frete(float(parametros.get("valor", 0)))}))
        else:
            self.responder(404, json.dumps({"erro": "não encontrado"}))

    def log_message(self, formato, *args):
        pass


if __name__ == "__main__":
    print(f"vitrine {VERSAO}: ouvindo em 127.0.0.1:{PORTA}", flush=True)
    HTTPServer(("127.0.0.1", PORTA), Vitrine).serve_forever()
PY
cat > test_app.py <<'PY'
import unittest

import app


class TestFrete(unittest.TestCase):
    def test_frete_gratis_a_partir_do_limite(self):
        self.assertEqual(app.calcular_frete(app.FRETE_GRATIS_A_PARTIR_DE), 0.0)

    def test_frete_abaixo_do_limite(self):
        self.assertEqual(app.calcular_frete(50.0), 19.90)
PY
printf '# Vitrine da Pinguim Store\n\nTestes: `python3 -m unittest`\n' > README.md
echo 1.0 > VERSION
git add -A
commit Carla "vitrine 1.0"
v10=$(git rev-parse HEAD)

# 1.1: frete grátis a partir de R$ 200.
sed -i 's/^FRETE_GRATIS_A_PARTIR_DE = 300.0$/FRETE_GRATIS_A_PARTIR_DE = 200.0/' app.py
cat >> test_app.py <<'PY'

    def test_frete_gratis_a_partir_de_200(self):
        self.assertEqual(app.calcular_frete(200.0), 0.0)
PY
echo 1.1 > VERSION
commit Carla "vitrine 1.1: frete grátis a partir de R\$ 200"

install -d -o aluno -g aluno /srv/git
git clone -q --bare "$src" /srv/git/vitrine.git

# ~/vitrine: o clone de trabalho, com o commit 1.2 do Beto ainda não enviado (e com bug).
git clone -q /srv/git/vitrine.git /home/aluno/vitrine
cd /home/aluno/vitrine
python3 - <<'PY'
from pathlib import Path

app = Path("app.py")
texto = app.read_text()
texto = texto.replace('''    return 0.0 if valor >= FRETE_GRATIS_A_PARTIR_DE else 19.90
''', '''    return 0.0 if valor >= FRETE_GRATIS_A_PARTIR_DE else 19.90


CUPONS = {"PINGUIM10": 10}


def aplicar_cupom(valor: float, codigo: str) -> float:
    """Valor a pagar depois do cupom (desconto em %). Cupom desconhecido: valor cheio."""
    desconto = CUPONS.get(codigo, 0)
    return round(valor * desconto / 100, 2)
''')
texto = texto.replace('''        else:
            self.responder(404''', '''        elif url.path == "/cupom":
            valor = aplicar_cupom(float(parametros.get("valor", 0)), parametros.get("codigo", ""))
            self.responder(200, json.dumps({"valor": valor}))
        else:
            self.responder(404''')
assert texto.count("aplicar_cupom") == 2, "o patch da 1.2 não encaixou"
app.write_text(texto)
Path("test_app.py").write_text(Path("test_app.py").read_text() + '''

class TestCupom(unittest.TestCase):
    def test_pinguim10_da_dez_por_cento(self):
        self.assertEqual(app.aplicar_cupom(100.0, "PINGUIM10"), 90.0)

    def test_cupom_desconhecido_nao_desconta(self):
        self.assertEqual(app.aplicar_cupom(100.0, "XYZ"), 100.0)
''')
PY
echo 1.2 > VERSION
commit Beto "vitrine 1.2: cupom PINGUIM10"
rm -rf "$src"

# A esteira.
cat > /srv/git/vitrine.git/hooks/post-receive <<'SH'
#!/bin/bash
# Esteira da vitrine: a cada push no main, testa, empacota e publica.
while read -r antigo novo ref; do
  [ "$ref" = refs/heads/main ] || continue
  echo "esteira: publicando ${novo:0:7}"
  tmp=$(mktemp -d)
  git archive "$novo" | tar -x -C "$tmp"
  (cd "$tmp" && python3 -m unittest -q) || echo "esteira: AVISO: testes falharam"
  tar -czf "/srv/vitrine/artefatos/vitrine-$novo.tar.gz" -C "$tmp" .
  rm -rf "$tmp"
  sudo ansible-playbook -i localhost, -c local /srv/deploy/deploy.yml -e versao="$novo"
done
SH
chmod 644 /srv/git/vitrine.git/hooks/post-receive

install -d /srv/deploy
cat > /srv/deploy/deploy.yml <<'YML'
# Publica uma versão da vitrine: cada versão numa pasta, e o link "atual" aponta para ela.
# Uso: ansible-playbook -i localhost, -c local deploy.yml -e versao=<commit>
- name: Publica a vitrine
  hosts: localhost
  gather_facts: false
  become: true
  vars:
    releases: /srv/vitrine/releases
  tasks:
    - name: Pasta da versão
      ansible.builtin.file:
        path: "{{ releases }}/{{ versao }}"
        state: directory
        mode: "0755"

    - name: Extrai o artefato
      ansible.builtin.unarchive:
        src: "/srv/vitrine/artefatos/vitrine-{{ versao }}.tar.gz"
        dest: "{{ releases }}/{{ versao }}"
        remote_src: true

    - name: Aponta a versão atual
      ansible.builtin.command: ln -s {{ releases }}/{{ versao }} /srv/vitrine/atual

    - name: Reinicia o serviço
      ansible.builtin.systemd:
        name: vitrine
        state: restarted
YML

# O que está no ar: a 1.0, publicada na mão.
install -d /srv/vitrine/releases/"$v10" /srv/vitrine/artefatos
git -C /srv/git/vitrine.git archive "$v10" | tar -x -C /srv/vitrine/releases/"$v10"
ln -sfn /srv/vitrine/releases/"$v10" /srv/vitrine/atual
cat > /etc/systemd/system/vitrine.service <<'UNIT'
[Unit]
Description=Vitrine da Pinguim Store
After=network.target
StartLimitIntervalSec=0

[Service]
User=nobody
ExecStart=/usr/bin/python3 /srv/vitrine/atual/app.py
Restart=on-failure
RestartSec=1

[Install]
WantedBy=multi-user.target
UNIT
systemctl enable vitrine.service

chown -R aluno:aluno /srv/git/vitrine.git /home/aluno/vitrine /srv/deploy /srv/vitrine/artefatos
