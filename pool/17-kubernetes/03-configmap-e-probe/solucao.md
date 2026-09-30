# ConfigMap, Secret e probes: uma solução possível

Na pasta da oficina.

## 1. Por que nem roda

```
gym kubectl get pods -n pagamento
gym kubectl describe pod -n pagamento -l app=pagamento
```

`CreateContainerConfigError`, e o evento diz: `couldn't find key GATEWAY_URL in ConfigMap
pagamento/pagamento-config`. A chave se chama `gateway_url` (minúsculas). O Kubernetes
monta as variáveis antes de criar o container, então nem há log para ler.

## 2. Configuração e probes

Em `k8s/pagamento.yaml`: `key: gateway_url`. Reaplique. Agora o pod roda, mas:

- **readiness** em `/healthz`, que devolve 404: o pod nunca fica pronto (`0/1`) e o
  Service fica sem destino. O certo é `/saude`.
- **liveness** na porta 8081, onde ninguém escuta: falha uma vez (`failureThreshold: 1`)
  e o kubelet mata o container. O certo é a porta 8080. Vale também dar folga ao app
  para subir (`initialDelaySeconds: 5`, `failureThreshold: 3`).

```
gym kubectl logs -n pagamento deploy/pagamento        (ouvindo na 8080; saúde em /saude)
gym kubectl get events -n pagamento --sort-by=.lastTimestamp
```

## 3. Token para um Secret

Tire `token_gateway` do ConfigMap no arquivo e crie o Secret pela linha de comando:

```
gym kubectl create secret generic pagamento-segredos -n pagamento --from-literal=token=tk-live-8841-5520-9913
```

No Deployment:

```yaml
            - name: TOKEN_GATEWAY
              valueFrom:
                secretKeyRef:
                  name: pagamento-segredos
                  key: token
```

Detalhe importante: um Secret é só base64, não é criptografia. Ele é mais seguro porque
tem permissão separada (RBAC), porque pode ser criptografado no etcd e porque não vai
para o Git. Em produção, use sealed-secrets, external-secrets ou um cofre.

## 4. Aplicar e conferir

```
gym kubectl apply -f k8s/
gym kubectl rollout status deployment/pagamento -n pagamento
gym kubectl get pods -n pagamento          (1/1, RESTARTS parado)
gym kubectl get endpoints pagamento -n pagamento
```
