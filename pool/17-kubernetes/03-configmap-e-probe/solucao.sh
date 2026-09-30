#!/usr/bin/env bash
# ConfigMap, Secret e probes: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
sleep 5
gym kubectl describe pod -n pagamento -l app=pagamento | tail -n 5
gym kubectl create secret generic pagamento-segredos -n pagamento --from-literal=token=tk-live-8841-5520-9913
python3 - <<'EOF'
from pathlib import Path
p = Path("k8s/pagamento.yaml")
s = p.read_text()
s = s.replace("  token_gateway: tk-live-8841-5520-9913\n", "")
s = s.replace("                  key: GATEWAY_URL\n", "                  key: gateway_url\n")
s = s.replace("""                configMapKeyRef:
                  name: pagamento-config
                  key: token_gateway
""", """                secretKeyRef:
                  name: pagamento-segredos
                  key: token
""")
s = s.replace("              path: /healthz\n", "              path: /saude\n")
s = s.replace("""              port: 8081
            initialDelaySeconds: 0
            periodSeconds: 3
            failureThreshold: 1
""", """              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 3
""")
p.write_text(s)
EOF
gym kubectl apply -f k8s/
gym kubectl rollout status deployment/pagamento -n pagamento --timeout=180s
gym kubectl get pods -n pagamento
