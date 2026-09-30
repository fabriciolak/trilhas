---
mes: 6
semana: 26
palco: host
tipo: chefe
nivel: 3
conceitos: OOMKilled, requests e limits, réplicas, rolling update, readinessProbe, ConfigMap e rollout, PodDisruptionBudget
---
# Black Friday

## TICKET
Chefe final. Faltam poucas horas para a Black Friday e a loja, no Kubernetes
(namespace `blackfriday`, manifestos em `k8s/`, na oficina), **não para de pé**. A
diretoria quer quatro coisas antes da meia-noite:

1. **De pé.** Descubra por que os pods morrem. O cache de 48 MB (`CACHE_MB`) é
   obrigatório na Black Friday, então **não mexa nele**: dê ao container o que ele
   precisa, com `requests` e `limits` de memória (até 512 Mi) e um `request` de CPU.
2. **Aguentar o tráfego.** Pelo menos 3 réplicas prontas. Nenhum pod recebe cliente
   enquanto ainda está aquecendo o cache (o app avisa em `/pronto`). E uma atualização
   nunca pode deixar a loja com menos réplicas prontas do que o combinado.
3. **A promoção.** O desconto passa de 10 para **50**%. Todos os pods têm de vender com
   50, sem apagar pod na mão.
4. **Manutenção sem susto.** Se alguém drenar um nó durante a Black Friday, no máximo uma
   réplica pode sair por vez, mas o dreno precisa conseguir andar.

Tudo nos arquivos de `k8s/` (é o que vai para o Git), aplicado no cluster. E em
`blackfriday.txt`, na oficina: o motivo exato da morte dos pods e o código de saída.

## COMANDOS
gym kubectl get/describe/logs/apply/rollout, gym kubectl get events --sort-by=.lastTimestamp

## PERGUNTAS
1. O que significa `OOMKilled` e por que o código de saída é 137 (128 + 9)? Quem mata o processo: o Kubernetes, o kernel ou o próprio app?
2. Qual a diferença entre `requests` e `limits`? Qual deles o agendador usa para escolher o nó, e o que acontece quando um pod passa de cada um?
3. Por que mudar o ConfigMap não muda o desconto nos pods que já estão rodando? Em que caso a mudança aparece sozinha?
4. `maxUnavailable: 0` e `maxSurge: 1`: como fica a sequência de pods durante um rollout?
5. Por que um PodDisruptionBudget com `minAvailable` igual ao número de réplicas trava a manutenção do cluster?

## ESTUDE
- Documentação do Kubernetes em português (conceitos: workloads, configuração, políticas): https://kubernetes.io/pt-br/docs/concepts/
- "Gerenciando recursos de computação para contêineres": https://kubernetes.io/pt-br/docs/concepts/configuration/manage-resources-containers/
- Descomplicando o Kubernetes (LINUXtips): https://github.com/badtuxx/DescomplicandoKubernetes
