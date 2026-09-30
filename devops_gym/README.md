# DevOps Gym

Aprenda **Linux e DevOps ao mesmo tempo**, do zero e em português, resolvendo
incidentes de verdade num servidor descartável. Funciona no **Windows**, no **Linux** e
no **macOS**: o laboratório é um Ubuntu 24.04 com systemd rodando no Docker.

- **60 itens em três níveis**, do básico ao avançado, cobrindo as 26 semanas:
  - **23 treinos** (•): uma **aula** com exemplos e passos pequenos verificados, para
    aprender o assunto da semana antes do incidente;
  - **31 tickets** (••, alguns •••): incidentes de verdade. Disco lotado, log em chamas, processo
    imortal, serviço que não sobe, DNS mentindo, container que morre, pipeline quebrado,
    Terraform com drift, bucket exposto, pod em CrashLoopBackOff, alerta que não dispara...
  - **6 chefes** (•••): no fim de cada mês, vários problemas juntos, como num plantão
    de verdade. O último é a Black Friday no Kubernetes.
- **Tudo no seu computador, sem conta em nuvem**: laboratório Linux com systemd,
  Kubernetes (k3s), Terraform, AWS simulada (Moto), GitHub Actions (validado com o
  actionlint) e Prometheus, tudo rodando no Docker.
- **Verificação automática**: `v` no item (ou `gym check`) confere se você resolveu.
- **Perguntas de entrevista** em cada ticket, e uma **solução comentada** para depois
  de tentar.
- **Repetição espaçada** (caixas de Leitner): o que você acerta volta cada vez mais
  espaçado; o que você erra volta amanhã.
- **[Roadmap de 6 meses](ROADMAP.md)** semana a semana, ligando cada ticket ao
  conteúdo de estudo e a um entregável de portfólio.
- **[Conteúdos em português](CONTEUDOS.md)**, texto e vídeo, conferidos em setembro
  de 2026.

## Começar

Instale Git, Python 3.9+ e Docker ([AMBIENTE.md](AMBIENTE.md) tem o passo a passo de
cada sistema). Depois, com **dois terminais**:

```text
terminal 1:  ./gym          # o treino de hoje: escolha o ticket e leia
terminal 2:  ./gym lab      # entra no servidor descartável (a 1ª vez constrói, leva alguns minutos)
```

No Windows (PowerShell), é `.\gym` e `.\gym lab`. No WSL, igual ao Linux.

Resolva no terminal 2. No terminal 1, aperte `v` para verificar, `p` para ver as
perguntas de entrevista e `x` para dar a nota.

## Como a semana funciona

Cada semana segue **aprender → aplicar → combinar**:

1. **Treino** (•): leia a aula (`a`) com o laboratório aberto, teste cada exemplo e faça
   os passos. O `v` confere passo a passo.
2. **Ticket** (••): o incidente da semana. Ninguém diz o comando: você diagnostica.
3. **Chefe** (•••), no fim do mês: o mês inteiro num incidente só.

O [ROADMAP](ROADMAP.md) diz o que estudar em cada semana e explica como a sequência foi
montada.

## Comandos

```text
gym                    treino de hoje: revisões que venceram + o próximo item novo
gym <item>             abre um treino, ticket ou chefe (ex.: gym log-em-chamas)
gym list               todos os itens, na ordem do roadmap, com o seu progresso
gym lab [--new]        entra no laboratório (liga se preciso; --new recria do zero)
gym check [item]       confere a sua solução (sem item: o último aberto)
gym stop               desliga o laboratório
gym doctor             confere se este computador está pronto (Python e Docker)

Ferramentas em container (nada para instalar além do Docker):
gym k8s start|stop     liga ou desliga o Kubernetes local (k3s no Docker)
gym kubectl ...        kubectl apontado para ele
gym terraform ...      Terraform na pasta atual, enxergando o seu Docker
gym aws ...            AWS CLI apontada para a AWS simulada (Moto), nunca para a real
```

Dentro de um item:

```text
a aula (nos treinos)   t ticket   c comandos (dica)   p perguntas   e estude
v verificar   s solução   r recomeçar (no seu computador)   x dar nota   q voltar
```

## Como funciona

```text
 seu computador (Windows, Linux ou macOS)
 ├── gym.py ─────────────── mostra o ticket, guarda seu progresso, verifica
 │     │  docker build/run/exec
 │     ▼
 ├── Docker ─┬── devops-gym-lab ─── Ubuntu 24.04 + systemd, usuário "aluno" com sudo,
 │           │                      já "quebrado" pelos itens do laboratório
 │           ├── gym-k3s ────────── Kubernetes local (mês 6)
 │           ├── gym-moto ───────── AWS simulada (mês 5)
 │           └── containers dos itens do seu computador (Docker, Compose, Prometheus...)
 └── oficina/ ───────────── arquivos dos itens que rodam no seu computador
```

- **Itens do laboratório** (meses 1 a 3, Ansible e o chefe do mês 5): o estado quebrado
  é fabricado na construção da imagem (`preparar.sh`) e no boot (`boot.sh`). Os
  processos "vivos", como o tráfego do log e o processo imortal, já estão rodando
  quando você entra.
- **Itens do seu computador** (Docker, Compose, CI, Terraform, AWS, Kubernetes,
  Prometheus): os arquivos vão para `oficina/<item>/`, e você trabalha com o Docker de
  verdade da sua máquina. `r` recomeça do zero.
- O laboratório continua ligado quando você sai (para verificar depois).
  `gym lab --new` recomeça do zero; `gym stop` desliga.

Cada item é uma pasta em `pool/<tema>/<cenário>/`:

```text
ticket.md       metadados (mês, semana, palco, tipo, nível, conceitos), a AULA (treinos),
                o TICKET, os comandos em jogo, as perguntas e o que estudar
preparar.sh     (laboratório) fabrica o estado quebrado na construção da imagem
boot.sh         (laboratório) o que precisa acontecer a cada boot (montagens, processos)
verificar.sh    (laboratório) confere a solução, como root, dentro do laboratório
arquivos/       (seu computador) copiados para oficina/<ticket>/
preparar.py     (seu computador) prepara a oficina (arquivos grandes, limpeza)
verificar.py    (seu computador) confere a solução pelo Docker e pelo HTTP
solucao.sh/md   uma solução possível, comentada
```

## Os itens

| Mês | Treinos (•) | Tickets (••/•••) | Chefe (•••) |
|---|---|---|---|
| 1 · Terminal, arquivos e texto | terminal, find-e-du, pipes, sed-awk | primeiro-plantao, mapa-do-servidor, disco-lotado, invasao-de-madrugada, log-em-chamas, planilha-do-marketing, migracao-do-banco | auditoria-da-madrugada |
| 2 · Usuários, processos, pacotes e scripts | permissoes, sinais, apt, bash | troca-de-equipe, chmod-777, log-descontrolado, processo-imortal, ferramenta-sumida, backup-quebrado, check-de-saude | plantao-de-sexta |
| 3 · Serviços, redes e SSH | systemd, cron, rede, ssh | api-de-estoque, cron-que-nao-roda, site-fora-do-ar, nome-errado, chave-recusada | servidor-em-chamas |
| 4 · Docker e Compose | docker-run, dockerfile, imagens, compose | site-da-campanha, container-que-morre, imagem-gigante, loja-no-compose | compose-de-producao |
| 5 · CI/CD, Ansible, Terraform e AWS | actions, ansible, terraform, aws | pipeline-quebrado, playbook-quebrado, terraform-no-docker, bucket-exposto | deploy-sem-mao |
| 6 · Kubernetes e observabilidade | kubectl, k8s-config, promql | pod-em-crashloop, service-sem-endpoints, configmap-e-probe, alerta-que-nao-dispara | black-friday |

Os nomes dos treinos começam com `treino-` (ex.: `gym treino-pipes`).

## Estrutura

```text
devops_gym/
├── gym, gym.cmd, gym.py   o programa (só biblioteca padrão do Python) e os atalhos
├── lab/                   Dockerfile do laboratório, serviço de boot, biblioteca de verificação
│   └── testar.py          testa todos os itens (para quem escreve itens)
├── pool/                  os treinos, tickets e chefes
├── ROADMAP.md             o plano de 6 meses
├── CONTEUDOS.md           os conteúdos em português
├── AMBIENTE.md            instalação no Windows, Linux e macOS
├── AGENTS.md              como criar itens novos (e como um assistente de IA deve ajudar)
├── progresso/             seu progresso (fora do git)
└── oficina/               arquivos de trabalho dos itens do seu computador (fora do git)
```

## Créditos

Inspirado no [devops_gym](https://github.com/juancrfig/lab/tree/master/devops_gym)
e no treino de [containers](https://github.com/juancrfig/lab/tree/master/containers)
de [juancrfig](https://github.com/juancrfig): a ideia de incidentes num container descartável, tickets que
descrevem sintomas sem entregar o comando, perguntas de entrevista e repetição
espaçada. Os cenários, o código e os textos daqui são próprios, em português, com
verificação automática e suporte a Windows.
