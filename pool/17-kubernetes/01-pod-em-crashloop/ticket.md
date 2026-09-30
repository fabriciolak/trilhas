---
mes: 6
semana: 23
palco: host
tipo: ticket
nivel: 2
conceitos: pod, deployment, ImagePullBackOff, CrashLoopBackOff, logs, events
---
# Pod em CrashLoopBackOff

## TICKET
A loja começou a migrar para Kubernetes. Ontem à noite alguém aplicou os manifestos
da vitrine e do catálogo no namespace `vitrine`, e nada ficou de pé. Os manifestos
estão em `k8s/`, na oficina (é o "repositório" do time), e já estão aplicados no
cluster local.

Use `gym kubectl ...` (o cluster sobe sozinho; dica: crie um apelido `kubectl`,
veja a aula do treino da semana). Rode os comandos **de dentro da pasta da oficina**,
para o cluster enxergar os arquivos.

1. Liste o que está rodando no namespace `vitrine` e anote o estado de cada pod.
2. Descubra o motivo de cada falha. Um dos motivos só aparece nos **eventos** do pod;
   o outro, nos **logs** do container que morreu. Anote tudo em `relatorio.txt`, na
   oficina.
3. Conserte **nos arquivos de `k8s/`**, não com edição direta no cluster: amanhã
   alguém reaplica os arquivos e desfaz o que não estiver neles. A URL do banco do
   catálogo é `postgres://catalogo@banco:5432/catalogo`.
4. Aplique e acompanhe até os dois deployments ficarem disponíveis.

## COMANDOS
gym kubectl get describe logs apply rollout status events

## PERGUNTAS
1. Qual a diferença entre Pod, ReplicaSet e Deployment? Por que quase nunca se cria um Pod solto?
2. O que significam ImagePullBackOff e CrashLoopBackOff? Onde você olha primeiro em cada caso?
3. Por que `kubectl logs --previous` existe? Em que situação o `logs` normal não mostra nada útil?
4. Por que corrigir no arquivo e reaplicar é melhor que `kubectl edit`? Que prática de mercado leva isso ao extremo (dica: GitOps)?

## ESTUDE
- Descomplicando o Kubernetes (LINUXtips), dias 1 a 3: https://github.com/badtuxx/DescomplicandoKubernetes
- Documentação do Kubernetes em português, "Depurando Pods": https://kubernetes.io/pt-br/docs/
- GIRUS, labs `kubernetes_fundamentos` e `kubernetes_deployments`: https://github.com/badtuxx/girus-cli
