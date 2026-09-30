---
mes: 6
semana: 24
palco: host
tipo: treino
nivel: 2
conceitos: ConfigMap, Secret, base64, env valueFrom, volume de ConfigMap, requests e limits, readinessProbe, livenessProbe, rollout restart
---
# Treino: configuração, segredos, recursos e probes

## AULA
**Configuração fora da imagem** (fator III do *12-Factor App*): a mesma imagem roda em
teste e em produção; o que muda vem de fora.

**ConfigMap** guarda configuração não secreta, como pares chave-valor ou arquivos
inteiros:

    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: app-config
      namespace: treino-config
    data:
      COR: azul
      mensagem.txt: |
        Bem-vindo ao treino

**Secret** guarda o que é sensível. Crie pela linha de comando, **sem** arquivo no Git:

    gym kubectl create secret generic app-segredo -n treino-config --from-literal=SENHA=...
    gym kubectl get secret app-segredo -n treino-config -o jsonpath='{.data.SENHA}'   # em base64
    ... | base64 -d                                                                   # decodificado

**Base64 não é criptografia:** qualquer um com permissão de ler o Secret lê a senha. A
proteção de verdade vem das permissões (RBAC) e, em produção, de cofres (Vault, Secrets
Manager) e da criptografia do etcd.

**Levando para o container:**

    env:
      - name: COR
        valueFrom:
          configMapKeyRef: {name: app-config, key: COR}
      - name: SENHA
        valueFrom:
          secretKeyRef: {name: app-segredo, key: SENHA}
    volumeMounts:
      - name: config
        mountPath: /config            # cada chave vira um arquivo: /config/mensagem.txt
    ...
    volumes:
      - name: config
        configMap:
          name: app-config

Variável de ambiente é lida quando o container **nasce**: mudou o ConfigMap, faça
`gym kubectl rollout restart deployment/app -n treino-config`. Arquivo montado por volume
se atualiza sozinho depois de um tempo.

**Recursos:** `requests` é o que o agendador reserva no nó; `limits` é o teto (passou da
memória, o kernel mata: `OOMKilled`).

    resources:
      requests: {cpu: 50m, memory: 32Mi}
      limits: {memory: 64Mi}

**Probes:** a **readiness** diz se o pod pode receber tráfego (falhou: sai do service); a
**liveness** diz se ele está vivo (falhou: o container é reiniciado).

    readinessProbe:
      httpGet: {path: /pronto, port: 8080}
    livenessProbe:
      httpGet: {path: /saude, port: 8080}
      periodSeconds: 10

## TICKET
Os manifestos estão em `k8s/`, na oficina: `codigo.yaml` (o programa, não mexa) e
`app.yaml` (para completar). Tudo no namespace `treino-config`.

1. Em `app.yaml`, o ConfigMap `app-config` com `COR: azul` e a chave `mensagem.txt`
   com o texto `Bem-vindo ao treino`.
2. O Secret `app-segredo` com a chave `SENHA` valendo `s3nh4-do-treino`, criado pela linha
   de comando (a senha não pode aparecer em nenhum arquivo de `k8s/`).
3. No Deployment: `COR` vindo do ConfigMap, `SENHA` do Secret, e o ConfigMap montado em
   `/config`.
4. `requests` de CPU (`50m`) e memória (`32Mi`) e `limits` de memória (`64Mi`).
5. `readinessProbe` em `/pronto` e `livenessProbe` em `/saude`, os dois na porta 8080.
   Aplique tudo (`gym kubectl apply -f k8s/`) e espere o pod ficar pronto.
6. Troque a cor para `verde` no arquivo, aplique e faça o pod usar a cor nova.
7. Salve em `senha.txt` a senha lida do Secret no cluster, decodificada.

## COMANDOS
gym kubectl apply create secret generic get -o jsonpath base64 -d rollout restart rollout status exec printenv

## PERGUNTAS
1. Por que base64 não protege nada? Onde a proteção de um Secret realmente está?
2. Por que mudar o ConfigMap não mudou a variável `COR` no pod que já estava rodando?
3. Qual a diferença entre readiness e liveness? O que acontece se a liveness estiver errada?

## ESTUDE
- ConfigMaps e Secrets (documentação em português): https://kubernetes.io/pt-br/docs/concepts/configuration/
- Recursos de contêineres: https://kubernetes.io/pt-br/docs/concepts/configuration/manage-resources-containers/
- The Twelve-Factor App (fator III): https://12factor.net/pt_br/config
