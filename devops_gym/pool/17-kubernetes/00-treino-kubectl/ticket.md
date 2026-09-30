---
mes: 6
semana: 23
palco: host
tipo: treino
nivel: 1
conceitos: cluster, nó, namespace, pod, deployment, replicaset, service, labels e selectors, kubectl, manifestos YAML, apply, scale, rollout
---
# Treino: primeiros passos no Kubernetes

## AULA
**Kubernetes** mantém aplicações rodando do jeito que você **declarou**: "quero 3 cópias
deste container, acessíveis por este nome". Se uma cópia morre, ele cria outra; se um nó
cai, ele reagenda. Você não diz *como*, diz *o quê*, e ele corrige a diferença o tempo todo.

As peças:

| objeto | o que é |
|---|---|
| **nó** (node) | uma máquina do cluster (aqui, um só: o k3s rodando no seu Docker) |
| **namespace** | uma "pasta" para separar objetos (`default`, `kube-system`, os seus) |
| **pod** | a menor unidade: um ou mais containers juntos, com um IP. Descartável |
| **deployment** | "mantenha N pods iguais a este modelo"; cuida de atualizar aos poucos |
| **replicaset** | o que o deployment usa por baixo para contar as cópias |
| **service** | um nome e um IP **fixos** na frente de pods que mudam o tempo todo |

**Labels e selectors** ligam tudo: o deployment marca os pods com `app: web`, e o
service manda tráfego para quem tiver `app: web`.

    gym k8s start                                    # liga o cluster local (k3s no Docker)
    gym kubectl get nodes
    gym kubectl create namespace treino
    gym kubectl create deployment web --image=nginx:1.30-alpine --replicas=2 -n treino
    gym kubectl get deploy,rs,pods -n treino -o wide
    gym kubectl describe pod NOME -n treino          # eventos: o primeiro lugar a olhar
    gym kubectl logs deploy/web -n treino
    gym kubectl scale deployment web --replicas=3 -n treino
    gym kubectl expose deployment web --port=80 -n treino       # cria o service
    gym kubectl get endpoints web -n treino          # os IPs dos pods atrás do service

**Declarativo é o jeito de verdade:** escreva o YAML, guarde no Git, aplique.

    gym kubectl create deployment web --image=nginx:1.30-alpine --dry-run=client -o yaml > k8s/web.yaml
    gym kubectl apply -f k8s/                        # cria ou atualiza até ficar igual ao arquivo

Todo manifesto tem `apiVersion`, `kind`, `metadata` (nome, namespace, labels) e `spec` (o
estado desejado). Vários objetos num arquivo são separados por `---`.

**Atualizar sem derrubar:** mudar o modelo do pod (imagem, variáveis) dispara um
**rollout**: pods novos sobem, os velhos saem aos poucos.

    gym kubectl set env deployment/web VERSAO=2 -n treino
    gym kubectl rollout status deployment/web -n treino
    gym kubectl rollout history deployment/web -n treino
    gym kubectl rollout undo deployment/web -n treino           # volta para a revisão anterior

Dica: no bash, `alias k='gym kubectl'` economiza dedo.

## TICKET
Tudo no namespace `treino`. Manifestos na pasta `k8s/` e respostas na pasta da oficina.

1. Ligue o cluster e salve a lista de nós em `nos.txt`.
2. Crie o namespace `treino`.
3. Escreva `k8s/web.yaml` com um Deployment `web` (`nginx:1.30-alpine`, **3** réplicas,
   label `app: web`) e um Service `web` na porta 80 para esses pods. Aplique.
4. Confira que o service tem os 3 pods como destino e salve os endpoints em
   `endpoints.txt`.
5. Apague **um** pod na mão e veja o que acontece. Salve em `pods.txt` a lista de pods
   depois disso (continuam 3?).
6. Faça um rollout mudando a variável `VERSAO` para `2` no deployment, e salve o
   histórico de rollouts em `historico.txt`.

## COMANDOS
gym k8s start, gym kubectl get/describe/logs/create/apply/scale/expose/set env/rollout/delete, --dry-run=client -o yaml

## PERGUNTAS
1. Por que você quase nunca cria um pod sozinho, e sim um deployment?
2. Os pods mudam de IP quando são recriados. Como o service resolve isso?
3. Qual a diferença entre `kubectl create` e `kubectl apply`?

## ESTUDE
- Documentação do Kubernetes em português (conceitos): https://kubernetes.io/pt-br/docs/concepts/
- Descomplicando o Kubernetes (LINUXtips): https://github.com/badtuxx/DescomplicandoKubernetes
