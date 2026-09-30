#!/usr/bin/env bash
# Black Friday: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
sleep 10
gym kubectl get pods -n blackfriday
{ echo "Por que os pods morriam:"; gym kubectl describe pod -n blackfriday -l app=loja | grep -A3 'Last State'; } > blackfriday.txt
echo "OOMKilled, código 137 (128 + 9: SIGKILL do kernel ao passar do limits.memory de 32Mi; o cache sozinho tem 48 MB)." >> blackfriday.txt

python3 - <<'PY'
from pathlib import Path

p = Path("k8s/loja.yaml")
s = p.read_text()
s = s.replace('  DESCONTO: "10"\n', '  DESCONTO: "50"\n')
s = s.replace("""spec:
  replicas: 1
""", """spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
""")
s = s.replace("""          resources:
            limits:
              memory: 32Mi
""", """          resources:
            requests:
              cpu: 100m
              memory: 96Mi
            limits:
              memory: 128Mi
          readinessProbe:
            httpGet:
              path: /pronto
              port: 8080
            periodSeconds: 2
          livenessProbe:
            httpGet:
              path: /saude
              port: 8080
            periodSeconds: 10
""")
s += """---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: loja
  namespace: blackfriday
spec:
  maxUnavailable: 1
  selector:
    matchLabels:
      app: loja
"""
p.write_text(s)
PY

gym kubectl apply -f k8s/
gym kubectl rollout status deployment/loja -n blackfriday --timeout=180s
# O ConfigMap mudou, mas env só é lido quando o pod nasce. Se o template do deployment
# não mudou, nada reinicia: rollout restart troca os pods um a um (respeitando o maxUnavailable).
gym kubectl rollout restart deployment/loja -n blackfriday
gym kubectl rollout status deployment/loja -n blackfriday --timeout=180s
gym kubectl get pods,pdb -n blackfriday
