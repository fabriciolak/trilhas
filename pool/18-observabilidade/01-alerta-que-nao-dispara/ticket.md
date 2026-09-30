---
mes: 6
semana: 25
palco: host
tipo: ticket
nivel: 3
conceitos: prometheus, scrape, targets, promql, rate, regras de alerta, for, reload
---
# Alerta que não dispara

## TICKET
Ontem o checkout passou uma hora devolvendo erro 500 e **nenhum alerta tocou**. O
monitoramento da loja está em `observabilidade/`, na oficina: a loja expõe métricas e
um Prometheus coleta e avalia os alertas. Ele já está rodando (Docker Compose, projeto
`gym-obs`), com a interface em `http://localhost:19090`. O checkout continua com erros
agora mesmo, então o alerta deveria estar disparando.

1. Na interface do Prometheus, veja se ele consegue coletar as métricas da loja.
   Conserte a coleta.
2. O alerta `ErrosNoCheckout` nem aparece na lista de alertas. Descubra por quê e
   conserte.
3. Quando aparecer, ele nunca dispara. Descubra quais métricas a loja realmente expõe
   (nome e rótulos) e reescreva a expressão para disparar quando o checkout passar de
   0,1 erro 500 por segundo, no último minuto.
4. Aplique as mudanças **sem derrubar** o Prometheus (ele aceita recarregar a
   configuração) e acompanhe o alerta passar de *pending* para *firing*.
5. Em `respostas.txt`, na oficina, escreva a consulta PromQL que mostra a
   **porcentagem** de requisições do checkout que deram erro 500 no último minuto, e o
   valor que ela deu.

## COMANDOS
docker compose ps logs restart curl -X POST /-/reload /api/v1/targets rate sum by

## PERGUNTAS
1. Métricas, logs e traces: o que cada um responde? Por que precisamos dos três?
2. Por que usar `rate()` em counters, e não o valor cru? O que é um counter e o que é um gauge?
3. Para que serve o `for: 30s` numa regra de alerta? O que acontece sem ele?
4. O que são SLI e SLO? Escreva um SLO para o checkout e o alerta que o protege.
5. Por que um alerta que nunca dispara é pior do que não ter alerta?

## ESTUDE
- Descomplicando o Prometheus (LINUXtips), livro online: https://livro.descomplicandoprometheus.com.br/
- Livro de SRE do Google, capítulos de monitoramento e SLO (inglês): https://sre.google/books/
- Documentação do Prometheus, PromQL (inglês): https://prometheus.io/docs/prometheus/latest/querying/basics/
