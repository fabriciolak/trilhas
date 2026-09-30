---
mes: 2
semana: 8
palco: lab
tipo: ticket
nivel: 2
conceitos: script do zero, funções, validação de argumentos, códigos de saída para monitoramento
---
# Check de saúde

## TICKET
A Carla quer um script simples de saúde do servidor para rodar no plantão e, mais
tarde, plugar no monitoramento. Monitoramento não lê texto bonito: lê **código de
saída**. Escreva `~/bin/saude.sh` do zero:

```
Uso: saude.sh [limite]
  limite: uso máximo do disco / em porcentagem, de 0 a 100 (padrão: 90)
```

1. Imprime exatamente três linhas, neste formato (números de verdade):
   ```
   disco: 37%
   memoria: 52%
   carga: 0.45
   ```
   `disco` é o uso de `/`; `memoria` é a memória usada sobre a total; `carga` é a
   média de carga do último minuto.
2. Se o uso do disco passar do limite, imprime também uma linha que começa com
   `ALERTA` e sai com código **1**. Senão, sai com **0**.
3. Se o limite não for um número inteiro de 0 a 100, mostra o uso na **saída de erro**
   e sai com código **2**.
4. Organize em funções (uma para cada medida). Dica: `~/bin` entra no seu PATH quando
   existe no login, então depois de sair e entrar de novo você chama só `saude.sh`.

## COMANDOS
bash df free awk cut tr cat echo printf exit test case chmod

## PERGUNTAS
1. Por que ferramentas de monitoramento (Nagios, Zabbix, Kubernetes com probes) usam código de saída em vez de ler o texto?
2. De onde vem a "carga" (load average)? Leia `/proc/loadavg`. Qual a diferença entre carga alta e CPU alta?
3. Por que validar argumentos logo no começo do script? O que acontece com `[ "$limite" -gt 90 ]` se `$limite` for "abc"?
4. Como você faria esse script rodar a cada 5 minutos? E como saberia que ele parou de rodar?

## ESTUDE
- Blau Araujo, Curso Básico de Programação em Bash (funções, testes, códigos de saída): https://debxp.org/
- LPI Linux Essentials, tópico 3.3 (transformando comandos em script): https://learning.lpi.org/pt/learning-materials/010-160/
- GIRUS, labs "linux_shell-script" e "linux_monitoramento-sistema": https://github.com/badtuxx/girus-cli
