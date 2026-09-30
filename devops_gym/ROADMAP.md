# Roadmap de 6 meses: Linux e DevOps ao mesmo tempo

Do zero ao nível de uma vaga júnior de DevOps/SRE/Cloud, em **26 semanas**, com
**8 a 10 horas por semana**. Os conteúdos citados estão em [CONTEUDOS.md](CONTEUDOS.md);
os tickets rodam no gym (`gym <nome>`).

## A ideia: por que junto, e não um depois do outro

DevOps roda em cima de Linux: servidores, containers, pipelines e Kubernetes são,
no fundo, processos, arquivos, permissões e rede num Linux. Quem estuda "Linux
primeiro e DevOps depois" costuma passar meses decorando comandos soltos. Aqui cada
semana tem três trilhas que se alimentam:

- 🐧 **Linux**: o fundamento da semana (estudo com texto e vídeo).
- 🏋️ **Gym**: primeiro um **treino** guiado (aula + passos verificados), depois um
  **incidente** de verdade que obriga a usar o fundamento sob pressão, e no fim de cada
  mês um **chefe** que junta tudo (no laboratório e, a partir do mês 4, no seu Docker).
- ⚙️ **DevOps**: uma prática de engenharia desde a semana 1. Tudo vai para um
  repositório Git; a partir do mês 2, com CI; a partir do mês 4, em containers.

E um fio que liga tudo: o repositório **`meu-devops`** no seu GitHub. Cada semana
deixa um entregável nele. No fim dos 6 meses, é o seu portfólio.

## Como este roteiro foi montado

1. **A ordem dos temas** segue o consenso dos mapas de carreira mais usados (o
   [roadmap.sh/devops](https://roadmap.sh/devops) e as vagas júnior de DevOps, SRE e
   Cloud): Linux → Git → shell script → serviços e redes → containers → CI/CD →
   automação e IaC → nuvem → Kubernetes → observabilidade. Cada tema usa o anterior:
   não dá para depurar um pod sem saber o que é um processo, uma porta e um log.
2. **Os meses 1 a 3** seguem os objetivos oficiais do **LPI Linux Essentials** (tópicos
   1 a 5), que é a base de Linux que as vagas pedem, com material oficial em português.
3. **A carga** cabe em 8 a 10 horas por semana: um tema novo por semana e uma semana
   de "chefe" ou projeto no fim de cada mês para consolidar.
4. **Do básico ao máximo possível em 6 meses:** cada semana sobe de nível
   (treino •, ticket ••, alguns •••), e cada mês fecha com um **chefe** (•••) que combina
   o mês inteiro com um pouco dos anteriores. No fim, o nível esperado é o de uma vaga
   júnior forte: você resolve incidentes reais sozinho e explica o porquê.
5. **O que ficou de fora de propósito** (vem depois, em "Depois dos 6 meses"): GitOps,
   service mesh, Helm a fundo, segurança de supply chain e certificações avançadas.
   Seis meses bem feitos no fundamento valem mais do que doze assuntos pela metade.
6. **Tudo roda no seu computador**, sem conta de nuvem e sem custo: o laboratório,
   o Kubernetes (k3s), a AWS simulada (Moto), o Terraform e o Prometheus são containers.

Legenda do 🏋️ Gym nas tabelas: `treino` → `ticket` significa "faça o treino e depois o
ticket"; 👑 é o chefe do mês.

## A rotina da semana

| Quando | O quê | Tempo |
|---|---|---|
| Todo dia | `gym`: as revisões que venceram (repetição espaçada) | 10–15 min |
| 2 sessões | 🐧 Estudo do tema: primeiro texto, depois vídeo, **com o terminal aberto** | 1h30 cada |
| 1 sessão | 🏋️ Treino da semana: leia a aula (`a`) com o laboratório aberto e faça os passos | 1h |
| 1–2 sessões | 🏋️ Ticket(s) da semana: tente sozinho, verifique (`v`), leia as perguntas e dê a nota | 1h30 |
| 1 sessão | ⚙️ Entregável da semana no `meu-devops` (commit + push) | 1h |
| Fim de semana | Responda em voz alta as perguntas dos tickets da semana, como numa entrevista | 20 min |

Regras que fazem diferença:

1. **Tente antes de ver a solução.** Travou por 20 minutos? Veja os `[c]omandos` do
   ticket. Travou por mais 20? Volte à aula do treino da semana (`gym treino-...`, tecla
   `a`) e ao `[e]studo`. Só depois veja a `[s]olução`.
2. **Dê a nota com honestidade.** "Tranquilo" só se você resolveria de novo sem ajuda
   **e** responderia as perguntas numa entrevista. A repetição espaçada só funciona assim.
3. **Escreva.** Um arquivo `notas/semana-NN.md` por semana no `meu-devops`: o que
   aprendeu, o que errou, comandos novos. Escrever é o que transforma prática em memória.
4. **Atrasou? Estique, não pule.** Se uma semana virar duas, tudo bem. Não pule os
   fundamentos dos meses 1 a 3: eles sustentam todo o resto.

---

## Mês 1 · Terminal, arquivos e texto (+ Git)

Objetivo: se virar num servidor Linux só pelo terminal e versionar tudo com Git.

| Sem | 🐧 Linux | 🏋️ Gym | ⚙️ DevOps (entregável no `meu-devops`) |
|---|---|---|---|
| 1 | Preparar o ambiente ([AMBIENTE.md](AMBIENTE.md)). O que é Linux, distribuição, kernel, shell. Primeiros comandos, ajuda (`man`, `--help`) e a hierarquia de pastas. LPI tópicos 1.1–1.4, 2.1 e 2.2. | `treino-terminal` → `primeiro-plantao`, `mapa-do-servidor` | O que é DevOps ("O que é DevOps?" da AWS). Instalar e configurar o Git. Criar o repositório `meu-devops` no GitHub com um `README.md` dizendo seu objetivo. |
| 2 | Arquivos e pastas: `ls`, `cp`, `mv`, `rm`, `find`, `du`, `df`, arquivos ocultos, datas. LPI 2.3 e 2.4. | `treino-find-e-du` → `disco-lotado`, `invasao-de-madrugada` | Pro Git caps. 1–2: `add`, `commit`, `log`, `diff`, `.gitignore`. Commit da sua cola de comandos (`notas/comandos.md`). |
| 3 | Pipes e redirecionamento: `grep`, `cut`, `sort`, `uniq`, `wc`, `tr`, `xargs`, `>`, `>>`, `2>`. LPI 3.2. Blau Araujo: aulas de redirecionamento. | `treino-pipes` → `log-em-chamas`, `planilha-do-marketing` | Pro Git cap. 3: branches e merge. Crie uma branch, altere, faça o merge. |
| 4 | Expressões regulares, `sed` e `awk`. Guia de regex do Aurélio. | `treino-sed-awk` → `migracao-do-banco` → 👑 **`auditoria-da-madrugada`** | Abra um **pull request** no seu próprio repositório e faça o merge pelo GitHub. Escreva `notas/mes-1.md`. |

**Marco do mês 1:** você vence o chefe `auditoria-da-madrugada` sem olhar a solução e
explica, sem colar, o que é um pipe e o que `2>&1` faz.

## Mês 2 · Usuários, processos, pacotes e shell script (+ CI)

Objetivo: administrar um servidor com segurança e automatizar tarefas com scripts que
falham do jeito certo.

| Sem | 🐧 Linux | 🏋️ Gym | ⚙️ DevOps |
|---|---|---|---|
| 5 | Usuários, grupos, permissões (octal e simbólica), `sudo`, setgid. LPI 5.1–5.4. GIRUS: `linux_gerenciamento-usuarios`, `linux_permissoes-arquivos`. | `treino-permissoes` → `troca-de-equipe`, `chmod-777` | Escreva um **roteiro de desligamento de funcionário** (runbook) em `runbooks/offboarding.md`. Documentação operacional é trabalho de DevOps. |
| 6 | Processos: `ps`, `top`, `pstree`, sinais, `kill`, jobs, zumbis, `/proc`. GIRUS: `linux_gerenciamento-processos`. | `treino-sinais` → `log-descontrolado`, `processo-imortal` | Escreva um **postmortem** do `processo-imortal` (o que aconteceu, impacto, causa, correção, prevenção) em `postmortems/`. Formato sem culpados. |
| 7 | Pacotes: `apt`, `dpkg`, repositórios, assinaturas, travar versões. Introdução à teoria de redes (Akitando #121). | `treino-apt` → `ferramenta-sumida` | Leia o fator III do *12-Factor App* (configuração). Guarde variáveis e segredos fora do código a partir de agora. |
| 8 | Shell script: variáveis, aspas, `if`, `case`, funções, códigos de saída, `set -euo pipefail`. Blau Araujo: Curso Básico de Bash. GIRUS: `linux_shell-script`. | `treino-bash` → `backup-quebrado`, `check-de-saude` → 👑 **`plantao-de-sexta`** | **Seu primeiro CI:** copie seus scripts do gym para `scripts/` e crie um workflow do GitHub Actions que roda o ShellCheck a cada push (Descomplicando GitHub Actions, primeiros capítulos). |

**Marco do mês 2:** você vence o `plantao-de-sexta`; seu `meu-devops` tem scripts, um
runbook, um postmortem e um badge de CI verde. Você explica SIGTERM x SIGKILL e o que é
um processo zumbi.

## Mês 3 · Serviços, redes e SSH

Objetivo: colocar serviços de pé e diagnosticar "o site caiu", de ponta a ponta.

| Sem | 🐧 Linux | 🏋️ Gym | ⚙️ DevOps |
|---|---|---|---|
| 9 | systemd: units, `systemctl`, `journalctl`, restart policy, usuários de serviço. | `treino-systemd` → `api-de-estoque` | Escreva uma unit do systemd para o seu `check-de-saude.sh` rodar como serviço em `servidor/`. |
| 10 | Agendamento: `cron`, timers do systemd, logs e `logrotate`. GIRUS: `linux_automacao-agendamento`. | `treino-cron` → `cron-que-nao-roda` | Transforme o agendamento do ticket num **timer do systemd** e versione a unit e o timer. |
| 11 | Redes: IP, portas, DNS, `/etc/hosts`, `ss`, `curl`, `dig`, HTTP, proxy reverso com nginx. Akitando #123 e #124. MDN: HTTP. LPI 4.4. | `treino-rede` → `site-fora-do-ar`, `nome-errado` | Escreva a configuração de nginx de um site estático com proxy para uma API, validada com `nginx -t`, em `servidor/nginx/`. |
| 12 | SSH: chaves, `~/.ssh/config`, `authorized_keys`, endurecimento (sem senha, sem root, AllowUsers). | `treino-ssh` → `chave-recusada` | Configure a sua chave SSH no GitHub e passe a usar `git@github.com:` no `meu-devops`. |
| 13 | **Semana de revisão e projeto.** Refaça os tickets que ainda estão nas caixas 1 e 2. | 👑 **`servidor-em-chamas`** + revisões | **Projeto "meu primeiro servidor"**: no laboratório (ou numa VM ou WSL), publique um site estático com nginx, um serviço systemd e um script de deploy que envia os arquivos por SSH (`rsync` ou `scp`). Documente no README como reproduzir. |

**Marco do mês 3:** você vence o `servidor-em-chamas` e diagnostica um "site fora do ar" seguindo as camadas (DNS →
rede → porta → processo → configuração → log) e explica cada uma. Pronto para a prova
LPI Linux Essentials, se quiser.

## Mês 4 · Containers: Docker e Compose

Objetivo: empacotar e rodar aplicações em containers, e entender o que um container
**é** (você já viu namespaces e cgroups sem saber: o laboratório é um container).

| Sem | 🐧 Linux por baixo | 🏋️ Gym (no seu computador) | ⚙️ DevOps |
|---|---|---|---|
| 14 | O que é um container: processo isolado por namespaces e cgroups. No laboratório, rode `ps aux` e compare com o `docker top devops-gym-lab` no seu computador. Descomplicando o Docker: primeiros capítulos. | `treino-docker-run` → `site-da-campanha` | GIRUS: `docker_fundamentos` e `docker_gerenciamento-containers`. Anote em `notas/` a diferença entre imagem, container e volume. |
| 15 | Dockerfile, camadas, `ENTRYPOINT` e `CMD`, PID 1 e sinais dentro do container. | `treino-dockerfile` → `container-que-morre` | Escreva um Dockerfile para um app seu (ou para o `check-de-saude.sh`) em `app/`. |
| 16 | Imagens enxutas e seguras: multi-stage, `.dockerignore`, usuário não-root, tags. | `treino-imagens` → `imagem-gigante` | **CI que constrói e publica a imagem** no GitHub Container Registry (GHCR) a cada push na main. |
| 17 | Redes e volumes no Docker, Docker Compose. GIRUS: `docker_compose`, `docker_volumes-persistencia`. | `treino-compose` → `loja-no-compose` → 👑 **`compose-de-producao`** | Um `compose.yaml` que sobe o seu app com um banco ou cache, e um README com `docker compose up` como único passo. |

**Marco do mês 4:** você vence o `compose-de-producao`; qualquer pessoa clona o seu
repositório e sobe o seu app com um comando. A imagem é construída pelo CI, não na sua
máquina.

## Mês 5 · Automação: CI/CD, Ansible, Terraform e nuvem

Objetivo: nada feito à mão. Configuração, infraestrutura e entrega saem do código.

| Sem | Tema | 🏋️ Gym / prática | ⚙️ Entregável |
|---|---|---|---|
| 18 | **CI/CD a fundo**: jobs, dependências, matriz, cache, segredos, ambientes, aprovação manual. Descomplicando GitHub Actions (até o fim) e Microsoft Learn. | `treino-actions` → `pipeline-quebrado` | Pipeline completo: lint → testes → build da imagem → push para o GHCR → (simulado) deploy. |
| 19 | **Ansible**: inventário, playbooks, módulos, templates, handlers, idempotência. | `treino-ansible` → `playbook-quebrado` | Um playbook que configura o laboratório: usuário, nginx, site e serviço. Rode duas vezes e mostre `changed=0`. |
| 20 | **Terraform/OpenTofu**: HCL, providers, `plan` e `apply`, estado, variáveis, módulos. Curso do Google Cloud em português. | `treino-terraform` → `terraform-no-docker` (GIRUS: `terraform_modulos`, opcional) | Terraform com o provider de Docker (sem nuvem, sem custo) criando a rede, o volume e os containers do seu app. |
| 21 | **Nuvem**: conceitos (regiões, IAM, VPC, computação, armazenamento, custos). AWS Cloud Practitioner Essentials (português). | `treino-aws` → `bucket-exposto` (AWS simulada com o Moto, pelo `gym aws`) | Um script (ou Terraform) que cria bucket, usuário e grupo IAM com menor privilégio na conta simulada. Se usar a AWS de verdade: alerta de orçamento **antes** de qualquer recurso. |
| 22 | **Semana de projeto**: juntar as peças. | 👑 **`deploy-sem-mao`** + revisões | O push na main roda o CI, publica a imagem e faz o deploy (Ansible via SSH no laboratório, ou Terraform no Docker). Um diagrama do fluxo no README. |

**Marco do mês 5:** você vence o `deploy-sem-mao`, explica a diferença entre gerência de
configuração (Ansible) e provisionamento (Terraform), e o seu deploy não tem nenhum passo
manual.

## Mês 6 · Kubernetes, observabilidade e projeto final

Objetivo: orquestrar containers, enxergar o que está acontecendo e contar essa
história numa entrevista.

| Sem | Tema | Prática | ⚙️ Entregável |
|---|---|---|---|
| 23 | **Kubernetes**: cluster, Pod, Deployment, ReplicaSet, Service, namespaces, `kubectl`. Descomplicando o Kubernetes, dias 1 a 3. Documentação em português. | `treino-kubectl` → `pod-em-crashloop` | O seu app rodando num Deployment com Service no cluster local (`gym k8s start`; o `kind` também serve). Manifestos em `k8s/`. |
| 24 | **Kubernetes na prática**: ConfigMap, Secret, probes, requests e limits, Ingress, volumes, Helm. Descomplicando o Kubernetes, dias 4 a 8. | `treino-k8s-config` → `service-sem-endpoints`, `configmap-e-probe` | A sua loja do Compose, agora no Kubernetes: configuração via ConfigMap e Secret, probes de saúde, um Ingress. |
| 25 | **Observabilidade**: métricas, logs, traces; SLI, SLO e alertas; Prometheus e Grafana. Descomplicando o Prometheus. Livro de SRE do Google: capítulos de SLO e monitoramento. | `treino-promql` → `alerta-que-nao-dispara` (depois, se quiser: kube-prometheus-stack via Helm) | Um dashboard com as métricas do seu app e um alerta. Um SLO escrito no README ("99% das requisições em menos de 300 ms"). |
| 26 | **Projeto final e carreira.** | 👑 **`black-friday`** + revisão geral (todos os itens nas caixas 3 a 5) | README do `meu-devops` contando a história: o que o projeto faz, o diagrama, como rodar, as decisões e o que você faria diferente. Simulado de entrevista com as perguntas dos tickets. |

**Marco final:** você vence a `black-friday` e tem um repositório que prova, com código, CI verde, containers,
automação, Kubernetes e observabilidade, e uma rotina de estudo que continua depois
dos 6 meses.

---

## Depois dos 6 meses

- Continue o `gym` diário: as revisões espaçadas mantêm o Linux afiado.
- Crie tickets novos para o que você aprendeu no trabalho ([AGENTS.md](AGENTS.md)
  explica o formato). Ensinar é a melhor revisão.
- Próximos temas naturais: GitOps (Argo CD, com o *Descomplicando ArgoCD*), segurança
  de supply chain (assinatura de imagens, SBOM), service mesh e FinOps.
- Certificações, se fizer sentido para as vagas que você quer: LPI Linux Essentials,
  AWS Cloud Practitioner, KCNA, depois CKA.
