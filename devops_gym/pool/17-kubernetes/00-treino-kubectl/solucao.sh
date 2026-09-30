#!/usr/bin/env bash
# Treino de kubectl: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
gym k8s start
gym kubectl get nodes > nos.txt
gym kubectl create namespace treino
cat > k8s/web.yaml <<'YAML'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: treino
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.30-alpine
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: treino
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
YAML
gym kubectl apply -f k8s/web.yaml
gym kubectl rollout status deployment/web -n treino --timeout=180s
gym kubectl get endpoints web -n treino > endpoints.txt
pod=$(gym kubectl get pods -n treino -l app=web -o jsonpath='{.items[0].metadata.name}')
gym kubectl delete pod "$pod" -n treino
gym kubectl rollout status deployment/web -n treino --timeout=180s
gym kubectl get pods -n treino > pods.txt
gym kubectl set env deployment/web VERSAO=2 -n treino
gym kubectl rollout status deployment/web -n treino --timeout=180s
gym kubectl rollout history deployment/web -n treino > historico.txt
sleep 3
gym kubectl get endpoints web -n treino > endpoints.txt
cat pods.txt historico.txt
