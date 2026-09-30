# Black Friday: uma solução possível

Os manifestos estão em `k8s/`, na oficina.

## 1. Por que morrem

```
gym kubectl get pods -n blackfriday             # STATUS OOMKilled / CrashLoopBackOff
gym kubectl describe pod -n blackfriday -l app=loja
```

Em **Last State**: `Reason: OOMKilled`, `Exit Code: 137`. O container tem `limits.memory:
32Mi`, e só o cache já tem 48 MB. Ao passar do limite, o **kernel** mata o processo com
SIGKILL (137 = 128 + 9). O Kubernetes só registra e reinicia. Vai para `blackfriday.txt`.

Conserto (sem mexer no `CACHE_MB`):

```yaml
          resources:
            requests:
              cpu: 100m
              memory: 96Mi       # o que o agendador reserva no nó
            limits:
              memory: 128Mi      # o teto: passou, o kernel mata
```

## 2. Aguentar o tráfego

```yaml
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0          # nunca fica abaixo de 3 prontas
      maxSurge: 1                # sobe 1 a mais, espera ficar pronta, derruba 1 antiga
```

E no container, para não mandar cliente para pod aquecendo:

```yaml
          readinessProbe:
            httpGet:
              path: /pronto
              port: 8080
            periodSeconds: 2
```

## 3. A promoção

No ConfigMap: `DESCONTO: "50"`. Depois do `apply`, os pods continuam com 10, porque
variável de ambiente é lida quando o container nasce. Sem apagar pod na mão:

```
gym kubectl rollout restart deployment/loja -n blackfriday
gym kubectl rollout status deployment/loja -n blackfriday
```

(Se o ConfigMap fosse montado como **volume**, o arquivo mudaria sozinho depois de algum
tempo, mas o app ainda precisaria reler o arquivo.)

## 4. Manutenção sem susto

```yaml
---
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
```

`gym kubectl get pdb -n blackfriday` mostra `ALLOWED DISRUPTIONS: 1`. Com
`minAvailable: 3` e 3 réplicas, o valor seria 0 e um `kubectl drain` ficaria esperando
para sempre.

Aplicar tudo: `gym kubectl apply -f k8s/`.
