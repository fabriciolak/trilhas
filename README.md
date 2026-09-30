# DevOps Gym

Aprenda **Linux e DevOps ao mesmo tempo**, do zero e em português, resolvendo
incidentes de verdade num servidor descartável. Funciona no **Windows**, no **Linux** e
no **macOS**: o laboratório é um Ubuntu 24.04 com systemd rodando no Docker.

- **24 tickets** de incidente: disco lotado, log em chamas, processo imortal, serviço
  que não sobe, site fora do ar, DNS mentindo, chave SSH recusada, container que morre,
  imagem gigante, Compose quebrado, playbook quebrado...
- **Verificação automática**: `v` no ticket (ou `gym check`) confere se você resolveu.
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

Resolva o ticket no terminal 2. No terminal 1, aperte `v` para verificar, `p` para
ver as perguntas de entrevista e `x` para dar a nota.

## Comandos

```text
gym                    treino de hoje: revisões que venceram + o próximo ticket novo
gym <ticket>           abre um ticket (ex.: gym log-em-chamas)
gym list               todos os tickets, na ordem do roadmap, com o seu progresso
gym lab [--new]        entra no laboratório (liga se preciso; --new recria do zero)
gym check [ticket]     confere a sua solução (sem ticket: o último aberto)
gym stop               desliga o laboratório
gym doctor             confere se este computador está pronto (Python e Docker)
```

Dentro de um ticket:

```text
t ticket   c comandos (dica)   p perguntas   e estude   v verificar   s solução   x dar nota   q voltar
```

## Como funciona

```text
 seu computador (Windows, Linux ou macOS)
 ├── gym.py ─────────────── mostra o ticket, guarda seu progresso, verifica
 │     │  docker build/run/exec
 │     ▼
 ├── Docker ─┬── devops-gym-lab ─── Ubuntu 24.04 + systemd, usuário "aluno" com sudo,
 │           │                      já "quebrado" pelos tickets dos meses 1 a 3 e 5
 │           └── containers dos tickets do mês 4 (você mesmo cria, no seu Docker)
 └── oficina/ ───────────── arquivos dos tickets que rodam no seu computador
```

- **Tickets do laboratório** (meses 1–3 e 5): o estado quebrado é fabricado na
  construção da imagem (`preparar.sh`) e no boot (`boot.sh`). Os processos "vivos",
  como o tráfego do log e o processo imortal, já estão rodando quando você entra.
- **Tickets do seu computador** (mês 4, Docker e Compose): os arquivos vão para
  `oficina/<ticket>/`, e você trabalha com o Docker de verdade da sua máquina.
- O laboratório continua ligado quando você sai (para verificar depois).
  `gym lab --new` recomeça do zero; `gym stop` desliga.

Cada ticket é uma pasta em `pool/<tema>/<cenário>/`:

```text
ticket.md       o incidente (TICKET), os comandos em jogo, as perguntas e o que estudar
preparar.sh     (laboratório) fabrica o estado quebrado na construção da imagem
boot.sh         (laboratório) o que precisa acontecer a cada boot (montagens, processos)
verificar.sh    (laboratório) confere a solução, como root, dentro do laboratório
arquivos/       (seu computador) copiados para oficina/<ticket>/
preparar.py     (seu computador) prepara a oficina (arquivos grandes, limpeza)
verificar.py    (seu computador) confere a solução pelo Docker e pelo HTTP
solucao.sh/md   uma solução possível, comentada
```

## Os tickets

| Mês | Tickets |
|---|---|
| 1 · Terminal, arquivos e texto | primeiro-plantao, mapa-do-servidor, disco-lotado, invasao-de-madrugada, log-em-chamas, planilha-do-marketing, migracao-do-banco |
| 2 · Usuários, processos, pacotes e scripts | troca-de-equipe, chmod-777, log-descontrolado, processo-imortal, ferramenta-sumida, backup-quebrado, check-de-saude |
| 3 · Serviços, redes e SSH | api-de-estoque, cron-que-nao-roda, site-fora-do-ar, nome-errado, chave-recusada |
| 4 · Docker e Compose (no seu computador) | site-da-campanha, container-que-morre, imagem-gigante, loja-no-compose |
| 5 · Automação | playbook-quebrado (Ansible), mais CI/CD e Terraform no [roadmap](ROADMAP.md) |
| 6 · Kubernetes e observabilidade | no [roadmap](ROADMAP.md), com os labs do GIRUS e o Descomplicando o Kubernetes |

## Estrutura

```text
devops_gym/
├── gym, gym.cmd, gym.py   o programa (só biblioteca padrão do Python) e os atalhos
├── lab/                   Dockerfile do laboratório, serviço de boot, biblioteca de verificação
│   └── testar.py          testa todos os tickets (para quem escreve tickets)
├── pool/                  os tickets
├── ROADMAP.md             o plano de 6 meses
├── CONTEUDOS.md           os conteúdos em português
├── AMBIENTE.md            instalação no Windows, Linux e macOS
├── AGENTS.md              como criar tickets novos (e como um assistente de IA deve ajudar)
├── progresso/             seu progresso (fora do git)
└── oficina/               arquivos de trabalho dos tickets do seu computador (fora do git)
```

## Créditos

Inspirado no [devops_gym](https://github.com/juancrfig/lab/tree/master/devops_gym)
e no treino de [containers](https://github.com/juancrfig/lab/tree/master/containers)
de [juancrfig](https://github.com/juancrfig): a ideia de incidentes num container descartável, tickets que
descrevem sintomas sem entregar o comando, perguntas de entrevista e repetição
espaçada. Os cenários, o código e os textos daqui são próprios, em português, com
verificação automática e suporte a Windows.
