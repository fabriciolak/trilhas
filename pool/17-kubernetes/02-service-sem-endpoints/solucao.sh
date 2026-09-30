#!/usr/bin/env bash
# Service sem endpoints: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
gym kubectl rollout status deployment/carrinho -n carrinho --timeout=180s
gym kubectl describe service carrinho -n carrinho > relatorio.txt
gym kubectl get pods -n carrinho --show-labels
sed -i 's/app: carinho/app: carrinho/; s/targetPort: 80$/targetPort: 8080/' k8s/carrinho.yaml
gym kubectl apply -f k8s/
sleep 3
gym kubectl get endpoints carrinho -n carrinho
gym kubectl run -n carrinho teste --rm -i --restart=Never --image=alpine:3.24 -- wget -qO- -T 10 http://carrinho >> relatorio.txt
cat relatorio.txt | tail -n 2
