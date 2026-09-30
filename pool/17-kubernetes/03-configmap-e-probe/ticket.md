---
mes: 6
semana: 24
palco: host
tipo: ticket
nivel: 3
conceitos: configmap, secret, readinessProbe, livenessProbe, CreateContainerConfigError
---
# ConfigMap, Secret e probes

## TICKET
O serviço de pagamento (namespace `pagamento`) nunca ficou pronto no cluster novo.
A auditoria de segurança ainda achou um problema grave nos manifestos. Os arquivos
estão em `k8s/`, na oficina, e já estão aplicados.

1. Descubra por que o pod nem chega a rodar. O motivo está nos eventos.
2. Conserte a referência de configuração. Aí o pod roda, mas fica `0/1` (nunca
   pronto) **e** reinicia sem parar. São duas probes diferentes com dois problemas
   diferentes. O app diz no log em que porta escuta, e o endpoint de saúde é `/saude`.
3. Auditoria: o token do gateway de pagamento está num ConfigMap, em texto aberto e
   versionado. Tire de lá e passe para um **Secret** chamado `pagamento-segredos` (chave
   `token`), criado **pela linha de comando**, sem arquivo no repositório. O Deployment
   deve ler o token desse Secret.
4. No fim: pod pronto (`1/1`), sem reinícios novos, e o Service `pagamento` com o pod
   como destino.

## COMANDOS
gym kubectl describe get logs events apply create secret configmap rollout

## PERGUNTAS
1. ConfigMap e Secret: qual a diferença de verdade? Um Secret é criptografado por padrão? O que você faria em produção (sealed-secrets, external-secrets, vault)?
2. readinessProbe e livenessProbe: o que cada uma decide? O que acontece quando a liveness está errada?
3. Por que uma liveness agressiva (sem tempo inicial, uma falha só) derruba apps lentos para iniciar? E a startupProbe?
4. O que é CreateContainerConfigError, e por que ele aparece antes de o container existir?

## ESTUDE
- Descomplicando o Kubernetes (LINUXtips), dias sobre ConfigMap, Secret e probes: https://github.com/badtuxx/DescomplicandoKubernetes
- GIRUS, lab `kubernetes_configmaps-secrets`: https://github.com/badtuxx/girus-cli
- Documentação do Kubernetes em português, "Configurar probes": https://kubernetes.io/pt-br/docs/
