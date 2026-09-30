# Deploy sem mão: uma solução possível.
cd ~/vitrine
git log --oneline --all
git status                       # à frente de origin/main por 1 commit (o do Beto)
python3 -m unittest -q           # o cupom está errado: devolve o desconto, não o valor final

# 1. O hook: sem +x, o Git ignora (o push avisa: "hook was ignored because it's not set as executable").
ls -l /srv/git/vitrine.git/hooks/

# 2. Portão: pre-receive roda os testes do commit que está chegando; saída 1 recusa o push.
cat > /srv/git/vitrine.git/hooks/pre-receive <<'SH'
#!/bin/bash
# Portão da esteira: push no main com teste falhando é recusado.
while read -r antigo novo ref; do
  [ "$ref" = refs/heads/main ] || continue
  [ "$novo" = 0000000000000000000000000000000000000000 ] && continue    # apagar o branch
  tmp=$(mktemp -d)
  git archive "$novo" | tar -x -C "$tmp"
  if ! (cd "$tmp" && python3 -m unittest -q); then
    echo "esteira: testes falharam em ${novo:0:7}; push recusado" >&2
    rm -rf "$tmp"
    exit 1
  fi
  rm -rf "$tmp"
done
SH

# 3 e 4. Publica; testa no ar; se não responder, volta o link; registra.
cat > /srv/git/vitrine.git/hooks/post-receive <<'SH'
#!/bin/bash
# Esteira da vitrine: a cada push no main, empacota, publica, confere no ar e registra.
# Os testes já passaram no pre-receive.
log=/srv/vitrine/deploys.log
while read -r antigo novo ref; do
  [ "$ref" = refs/heads/main ] || continue
  echo "esteira: publicando ${novo:0:7}"
  git archive --format=tar.gz -o "/srv/vitrine/artefatos/vitrine-$novo.tar.gz" "$novo"
  anterior=$(readlink /srv/vitrine/atual)
  if sudo ansible-playbook -i localhost, -c local /srv/deploy/deploy.yml -e versao="$novo" \
     && curl -sf --retry 5 --retry-delay 1 --retry-all-errors --max-time 2 http://127.0.0.1:8600/saude; then
    echo "$(date -Is) ${novo:0:7} ok" | sudo tee -a "$log"
  else
    echo "esteira: ${novo:0:7} não respondeu; voltando para $(basename "$anterior")" >&2
    sudo ln -sfn "$anterior" /srv/vitrine/atual
    sudo systemctl restart vitrine
    echo "$(date -Is) ${novo:0:7} rollback para $(basename "$anterior" | cut -c1-7)" | sudo tee -a "$log"
  fi
done
SH
chmod +x /srv/git/vitrine.git/hooks/pre-receive /srv/git/vitrine.git/hooks/post-receive

# O link: "ln -s" num destino que já é link para pasta cria o link DENTRO da pasta.
# O módulo file com force troca o link (idempotente).
python3 - <<'PY'
from pathlib import Path

p = Path("/srv/deploy/deploy.yml")
p.write_text(p.read_text().replace(
    "      ansible.builtin.command: ln -s {{ releases }}/{{ versao }} /srv/vitrine/atual\n",
    "      ansible.builtin.file:\n"
    "        src: \"{{ releases }}/{{ versao }}\"\n"
    "        dest: /srv/vitrine/atual\n"
    "        state: link\n"
    "        force: true\n"))
PY

# 5. O bug do Beto: devolvia o desconto em vez do valor final.
sed -i 's|return round(valor \* desconto / 100, 2)|return round(valor * (100 - desconto) / 100, 2)|' app.py
python3 -m unittest -q
git -c user.name=Aluno -c user.email=aluno@pinguim.local commit -qam "corrige o cupom: devolve o valor com desconto"
git push origin main
curl -s localhost:8600/versao; echo
curl -s 'localhost:8600/cupom?valor=100&codigo=PINGUIM10'; echo
cat /srv/vitrine/deploys.log
