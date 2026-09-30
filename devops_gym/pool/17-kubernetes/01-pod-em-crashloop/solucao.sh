#!/usr/bin/env bash
# Pod em CrashLoopBackOff: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
sleep 20   # dá tempo de os dois pods chegarem ao estado quebrado
gym kubectl get pods -n vitrine > relatorio.txt
gym kubectl describe pod -n vitrine -l app=vitrine | tail -n 5
gym kubectl logs -n vitrine deploy/catalogo --previous || gym kubectl logs -n vitrine deploy/catalogo || true
echo "vitrine: ImagePullBackOff, tag nginx:1.30-alpina não existe" >> relatorio.txt
echo "catalogo: CrashLoopBackOff, o log diz FATAL BANCO_URL não definida" >> relatorio.txt
sed -i 's/nginx:1.30-alpina/nginx:1.30-alpine/' k8s/vitrine.yaml
python3 - <<'EOF'
from pathlib import Path
p = Path("k8s/catalogo.yaml")
s = p.read_text()
s = s.replace('          command: ["python", "-u", "/app/servidor.py"]\n',
              '          command: ["python", "-u", "/app/servidor.py"]\n'
              '          env:\n'
              '            - name: BANCO_URL\n'
              '              value: postgres://catalogo@banco:5432/catalogo\n')
p.write_text(s)
EOF
gym kubectl apply -f k8s/
gym kubectl rollout status deployment/vitrine -n vitrine --timeout=180s
gym kubectl rollout status deployment/catalogo -n vitrine --timeout=180s
