---
mes: 6
semana: 25
palco: host
tipo: treino
nivel: 2
conceitos: métricas, counter, gauge, histogram, labels, scrape, /metrics, PromQL, rate, increase, sum by, topk, histogram_quantile, up
---
# Treino: PromQL

## AULA
**Métricas** são números medidos ao longo do tempo, com **labels** que dizem de onde vêm:
`loja_pedidos_total{metodo="pix"} 1532`. O **Prometheus** busca (*scrape*) as métricas de
cada alvo, de tempos em tempos, num endereço `/metrics`, e guarda a série no tempo.

**Os três tipos que você mais vê:**

| tipo | comportamento | exemplo | como consultar |
|---|---|---|---|
| **counter** | só sobe (zera quando o processo reinicia) | pedidos, erros, bytes | nunca o valor cru: `rate()` ou `increase()` |
| **gauge** | sobe e desce | memória, fila, carrinhos abertos | o valor direto, `avg_over_time()` |
| **histogram** | conta observações em baldes (`_bucket{le=...}`), mais `_sum` e `_count` | latência | `histogram_quantile()` |

**PromQL, o essencial.**

    loja_carrinhos_abertos                         # vetor instantâneo: o último valor de cada série
    loja_pedidos_total[1m]                         # vetor de intervalo: as amostras do último minuto
    rate(loja_pedidos_total[1m])                   # por segundo, na média do último minuto
    increase(loja_pedidos_total[5m])               # quanto cresceu em 5 minutos
    sum(rate(loja_pedidos_total[1m]))              # soma todas as séries
    sum by (metodo) (rate(loja_pedidos_total[1m])) # soma, mantendo o label metodo
    topk(1, ...)                                   # só a maior série
    histogram_quantile(0.95, sum by (le) (rate(loja_latencia_segundos_bucket[5m])))  # p95
    up                                             # 1 para cada alvo que respondeu o último scrape
    count(up == 1)                                 # quantos alvos estão de pé

Filtros por label: `{metodo="pix"}`, `{metodo!="boleto"}`, `{metodo=~"pix|cartao"}`.

**Percentil (p95):** 95% dos pedidos fecharam em até esse tempo. Média esconde a cauda;
é o p95/p99 que o cliente sente.

Teste cada consulta na interface (`http://localhost:19191`, aba **Query**, com o
**Graph** para ver no tempo) antes de salvar no arquivo.

## TICKET
Suba nada: a loja e o Prometheus já estão rodando (projeto `treino-obs`, pasta `obs/`).
Interface: `http://localhost:19191`. Escreva **uma consulta por arquivo** na pasta
`consultas/` da oficina (só a consulta, sem mais nada).

1. Salve em `metricas.txt` a saída crua de `http://localhost:18000/metrics`.
2. `q1.promql`: quantos carrinhos estão abertos agora.
3. `q2.promql`: quantos pedidos por segundo a loja está fechando, somando todos os
   métodos, na média do último minuto.
4. `q3.promql`: a mesma taxa, separada por método de pagamento.
5. `q4.promql`: só o método com mais pedidos nos últimos 5 minutos.
6. `q5.promql`: o p95 da latência dos pedidos nos últimos 5 minutos.
7. `q6.promql`: quantos alvos do Prometheus estão de pé.

## COMANDOS
curl rate increase sum by topk histogram_quantile up count

## PERGUNTAS
1. Por que não faz sentido fazer um gráfico do valor cru de um counter?
2. Qual a diferença entre média e p95? Por que SLOs costumam usar percentis?
3. O que acontece com `rate()` quando o processo reinicia e o counter volta a zero?

## ESTUDE
- Descomplicando o Prometheus (livro online): https://livro.descomplicandoprometheus.com.br/
- Documentação do PromQL: https://prometheus.io/docs/prometheus/latest/querying/basics/
