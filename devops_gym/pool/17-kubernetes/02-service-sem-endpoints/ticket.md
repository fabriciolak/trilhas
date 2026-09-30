---
mes: 6
semana: 24
palco: host
tipo: ticket
nivel: 2
conceitos: service, selector, labels, endpoints, targetPort, dns do cluster
---
# Service sem endpoints

## TICKET
O time do checkout reclama: dentro do cluster, `http://carrinho` (namespace
`carrinho`) não responde. Os pods do carrinho estão `Running`, sem nenhum restart, e
"os logs estão limpos". Os manifestos estão em `k8s/`, na oficina, e já estão aplicados.

1. Reproduza como o checkout veria: de **dentro** do cluster, com um pod temporário
   (a imagem `alpine:3.24` tem `wget`), chame `http://carrinho`.
2. Descubra para onde o Service manda o tráfego. Um Service sem destino tem um sinal
   bem claro; ache esse sinal e compare com os pods. Anote em `relatorio.txt`.
3. Conserte no arquivo e reaplique. O erro vai mudar: ainda existe um segundo
   problema, entre a porta do Service e a porta em que o app realmente escuta.
4. Prove com o pod temporário que `http://carrinho` responde, e acrescente a resposta
   ao relatório.

## COMANDOS
gym kubectl get describe endpoints endpointslices run logs apply --show-labels

## PERGUNTAS
1. Como um Service escolhe os pods? O que é o selector, e por que um erro de digitação nele não dá erro nenhum?
2. Diferencie `port`, `targetPort` e `containerPort`. Qual deles é só documentação?
3. Como funciona o DNS dentro do cluster (`carrinho`, `carrinho.carrinho`, `carrinho.carrinho.svc.cluster.local`)?
4. ClusterIP, NodePort e LoadBalancer: quando cada um? E onde entra o Ingress?

## ESTUDE
- Descomplicando o Kubernetes (LINUXtips), dia do Service e do Ingress: https://github.com/badtuxx/DescomplicandoKubernetes
- GIRUS, lab `kubernetes_services-networking`: https://github.com/badtuxx/girus-cli
- Documentação do Kubernetes em português, "Service": https://kubernetes.io/pt-br/docs/
