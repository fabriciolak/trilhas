#!/usr/bin/env bash
# Treino de configuração no Kubernetes: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
gym kubectl apply -f k8s/00-namespace.yaml
gym kubectl create secret generic app-segredo -n treino-config --from-literal=SENHA=s3nh4-do-treino
python3 - <<'PY'
from pathlib import Path

p = Path("k8s/app.yaml")
s = p.read_text()
s = s.replace("# >>> 1. o ConfigMap app-config (COR e mensagem.txt)\n", """apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: treino-config
data:
  COR: azul
  mensagem.txt: |
    Bem-vindo ao treino
""")
s = s.replace("""          # >>> 3. env (COR do ConfigMap, SENHA do Secret)
          # >>> 4. resources
          # >>> 5. readinessProbe e livenessProbe
""", """          env:
            - name: COR
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: COR
            - name: SENHA
              valueFrom:
                secretKeyRef:
                  name: app-segredo
                  key: SENHA
          resources:
            requests:
              cpu: 50m
              memory: 32Mi
            limits:
              memory: 64Mi
          readinessProbe:
            httpGet:
              path: /pronto
              port: 8080
          livenessProbe:
            httpGet:
              path: /saude
              port: 8080
            periodSeconds: 10
""")
s = s.replace("""            # >>> 3. o ConfigMap app-config montado em /config
""", """            - name: config
              mountPath: /config
""")
s = s.replace("""        # >>> 3. o volume do ConfigMap app-config
""", """        - name: config
          configMap:
            name: app-config
""")
p.write_text(s)
PY
gym kubectl apply -f k8s/
gym kubectl rollout status deployment/app -n treino-config --timeout=180s
sed -i 's/^  COR: azul$/  COR: verde/' k8s/app.yaml
gym kubectl apply -f k8s/
gym kubectl rollout restart deployment/app -n treino-config
gym kubectl rollout status deployment/app -n treino-config --timeout=180s
gym kubectl get secret app-segredo -n treino-config -o jsonpath='{.data.SENHA}' | base64 -d > senha.txt
cat senha.txt; echo
