# Service sem endpoints: uma solução possível

Na pasta da oficina.

## 1. Reproduzir de dentro do cluster

```
gym kubectl run -n carrinho teste --rm -i --restart=Never --image=alpine:3.24 -- wget -qO- -T 5 http://carrinho
```

O `wget` falha (recusado ou tempo esgotado). O nome resolve, porque o Service existe,
mas ninguém atende do outro lado.

## 2. Para onde o Service manda

```
gym kubectl describe service carrinho -n carrinho
gym kubectl get endpoints carrinho -n carrinho
gym kubectl get pods -n carrinho --show-labels
```

`Endpoints: <none>`: nenhum pod casa com o selector `app: carinho` (falta um "r"). Os
pods têm `app=carrinho`. Um selector errado não é erro para o Kubernetes: é só um
Service que não seleciona ninguém.

```
gym kubectl describe service carrinho -n carrinho > relatorio.txt
```

## 3. Consertar os dois problemas no arquivo

Em `k8s/carrinho.yaml`, no Service: `app: carrinho` no selector. Depois de reaplicar, os
endpoints aparecem (`IP:80`), mas a chamada ainda é recusada: o app escuta na **8080**
(está no log e no `containerPort`), e o Service manda para a 80. Troque para
`targetPort: 8080`.

```
gym kubectl apply -f k8s/
gym kubectl get endpoints carrinho -n carrinho      (agora: IP1:8080, IP2:8080)
```

## 4. Provar

```
gym kubectl run -n carrinho teste --rm -i --restart=Never --image=alpine:3.24 -- wget -qO- http://carrinho >> relatorio.txt
```

Repita algumas vezes: o campo `pod` alterna entre os dois. É o Service balanceando.
