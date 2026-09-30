# Alerta que não dispara: uma solução possível

Os arquivos estão em `observabilidade/`, na oficina. Interface: `http://localhost:19090`.

## 1. A coleta

Em **Status > Target health**, o alvo `loja` aparece **DOWN** com
`connection refused` em `loja:9000`. A loja escuta na **8000** (está no log:
`docker compose -f observabilidade/compose.yaml logs loja`). Em `prometheus/prometheus.yml`:
`targets: ["loja:8000"]`.

## 2. A regra que não carrega

Em **Alerts** não aparece nada. `rule_files` aponta para `/etc/prometheus/alerta.yml`,
mas o arquivo montado se chama `alertas.yml`. Como `rule_files` aceita padrões, um nome
que não casa com nada não dá erro: só não carrega regra nenhuma. Corrija o nome.

## 3. A expressão

A regra usa `http_requests_total{status="500"}`, uma métrica que não existe aqui. A loja
expõe `loja_requisicoes_total` com os rótulos `rota` e `codigo` (autocompletar do
Prometheus, ou `http://localhost:19090` > busca por `loja_`). Em `prometheus/alertas.yml`:

```yaml
        expr: sum(rate(loja_requisicoes_total{rota="/checkout",codigo="500"}[1m])) > 0.1
```

`rate()` transforma o contador (que só cresce) em "por segundo". O `sum` junta as séries.

## 4. Recarregar sem derrubar

O Prometheus foi iniciado com `--web.enable-lifecycle`, então:

```
curl -X POST http://localhost:19090/-/reload
```

(No PowerShell: `Invoke-WebRequest -Method Post http://localhost:19090/-/reload`.)

Em **Alerts**, `ErrosNoCheckout` aparece *pending* e, depois dos 30 s do `for`, *firing*.

## 5. A porcentagem de erro

`respostas.txt`:

```
100 * sum(rate(loja_requisicoes_total{rota="/checkout",codigo="500"}[1m]))
    / sum(rate(loja_requisicoes_total{rota="/checkout"}[1m]))
valor: cerca de 35%
```

Isso já é um SLI (indicador). Um SLO seria: "99% das requisições do checkout sem erro
500, medido em 30 dias".
