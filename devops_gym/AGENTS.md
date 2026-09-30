# AGENTS.md: devops_gym

Guia para quem cria ou mantém itens (treinos, tickets e chefes), seja você ou um
assistente de IA como o Claude Code, e para assistentes que ajudam alguém a treinar.

## Se você é um assistente ajudando alguém a treinar

- **Treino** (tem `## AULA`) é para aprender: explique à vontade, com exemplos
  parecidos (não os do passo). **Ticket e chefe** são para aplicar: aí vale a regra abaixo.
- **Não entregue a solução.** Quem pede ajuda num ticket quer destravar, não copiar.
  Dê dicas em degraus: (1) qual camada olhar, (2) qual tipo de comando, (3) o comando
  sem os argumentos. A solução completa só se a pessoa pedir de novo, explicitamente,
  depois de tentar.
- Pergunte o que a pessoa já viu (a saída do comando, a mensagem de erro) antes de
  sugerir algo. Ensine a ler a mensagem de erro.
- Depois de resolvido, faça as perguntas de `## PERGUNTAS` do ticket como numa
  entrevista e corrija as respostas.
- Responda em português.

## Decisões de arquitetura (fixas)

- Um laboratório só para todos os tickets do palco `lab`: `ubuntu:24.04` com **systemd
  como PID 1**, usuário `aluno` com sudo sem senha, hostname `devops-lab`.
- O lab roda com `--privileged --cgroupns=private --tmpfs /run --tmpfs /run/lock`
  (Docker) ou `--systemd=always` (Podman). Funciona em cgroup v1 e v2, e no Docker
  Desktop (Windows/macOS).
- O container **não** usa `--rm`: sobrevive quando o aluno sai, para dar tempo de
  verificar. `gym lab --new` recria; `gym stop` apaga.
- `gym.py` usa **só a biblioteca padrão** e roda no Windows (PowerShell), Linux e macOS.
  Nada de bash no lado do host: tudo que roda no host é Python.
- Progresso em `progresso/` (TSV), fora do git. Agenda de Leitner: caixas 1–5, com
  intervalos de 1, 2, 4, 8 e 16 dias. Notas: `travei` volta à caixa 1, `sofri` mantém,
  `tranquilo` sobe uma caixa.
- Tudo em `devops_gym/` tem fim de linha LF (`.gitattributes`), menos `*.cmd` e `*.ps1`.

## O modelo pedagógico: treino → ticket → chefe

Cada semana tem um **treino** (aprender), um ou dois **tickets** (aplicar) e cada mês
fecha com um **chefe** (combinar). O `gym` ordena por mês, semana e tipo, então o treino
sempre vem antes do ticket da mesma semana.

| tipo | nível | o que é | regras |
|---|---|---|---|
| `treino` | 1 (às vezes 2) | `## AULA` com o conceito e exemplos, mais 5 a 10 passos pequenos | cada passo tem um entregável verificável; os exemplos da aula são parecidos, **não iguais** aos passos |
| `ticket` | 2 (às vezes 3) | um incidente | sintomas, não comandos; pelo menos uma pegadinha realista |
| `chefe` | 3 | vários problemas do mês num incidente só | problemas encadeados (um esconde o outro); usa tudo do mês e um pouco dos anteriores |

## Anatomia de um item

`pool/<NN-tema>/<NN-cenario>/ticket.md` (os treinos ficam em `00-treino-<assunto>`, os
chefes em `pool/90-chefes/`):

```markdown
---
mes: 3
semana: 11
palco: lab          # lab = dentro do laboratório; host = no Docker do computador
tipo: ticket        # treino | ticket | chefe (padrão: ticket)
nivel: 2            # 1 básico, 2 intermediário, 3 avançado (padrão: 2)
conceitos: ss, portas, curl, proxy reverso   # separados por vírgula (a web e a IA usam)
---
# Título curto

## AULA
(só nos treinos) O conceito, com exemplos que o aluno testa. Tabelas e blocos de código
com 4 espaços de recuo (o terminal mostra o texto como está).

## TICKET
O incidente, contado como o chamado chega: sintomas, contexto e a história da
Pinguim Store. NUNCA diga qual comando usar. Passos numerados com entregáveis
verificáveis (arquivos em ~/, estado do sistema).

## COMANDOS
lista de comandos separados por espaço (a "dica" do ticket)

## PERGUNTAS
1. 3 a 5 perguntas de entrevista de nível júnior/pleno sobre os fundamentos. Nada de decoreba.

## ESTUDE
- links do CONTEUDOS.md que cobrem o tema (preferir português)
```

Arquivos do palco `lab`:

| Arquivo | Quando roda | Como |
|---|---|---|
| `preparar.sh` | na construção da imagem | como root, com `set -euo pipefail`, na pasta do ticket |
| `boot.sh` | a cada boot do laboratório (serviço `lab-inicio`) | como root; para montagens, `/etc/hosts` (o Docker reescreve no boot) e processos vivos (`setsid -f`) |
| `verificar.sh` | no `gym check` / tecla `v` | como root, dentro do lab, junto com `lab/verificar-lib.sh` |
| `solucao.sh` | mostrado na tecla `s`; executado pelo `lab/testar.py` | como `aluno` (use `sudo` onde precisar) |

Arquivos do palco `host`:

| Arquivo | Para quê |
|---|---|
| `arquivos/` | copiado para `oficina/<nome>/` quando o ticket é aberto |
| `preparar.py` | roda depois da cópia e no "recomeçar": gera arquivos grandes e apaga containers de tentativas antigas |
| `verificar.py` | confere pelo Docker e pelo HTTP |
| `solucao.md` | mostrado na tecla `s` (comandos para bash **e** PowerShell quando diferirem) |
| `solucao.sh` | a mesma solução em bash, para o `lab/testar.py` |

Os `.py` recebem prontos:

| função | faz |
|---|---|
| `ok(msg)`, `falha(msg, dica)`, `checar(msg, condicao, dica)` | o placar |
| `docker(*args) -> (código, saída)` | roda o Docker (ou o Podman) |
| `http(url, timeout=5, metodo="GET", corpo=None, cabecalhos=None) -> (status, corpo)` | HTTP sem proxy |
| `oficina` | a pasta do item (Path) |
| `k3s_ligar() -> bool` e `k8s(*args, entrada=None) -> (código, saída)` | Kubernetes local (k3s no Docker, container `gym-k3s`) |
| `rede_nuvem()` | cria a rede `gym-nuvem` (onde ficam o `gym-moto` e a AWS CLI) |
| `terraform(pasta, *args) -> (código, saída)` | Terraform em container na pasta |

### As ferramentas em container

O aluno só instala o Docker. O resto roda em container, pelos subcomandos do `gym`:

| comando | como |
|---|---|
| `gym k8s start/stop`, `gym kubectl` | `rancher/k3s` privilegiado (`gym-k3s`), com a oficina montada em `/oficina` e o Docker Hub via `mirror.gcr.io`; o `kubectl` roda com `docker exec` |
| `gym terraform` | `hashicorp/terraform`, com a pasta atual em `/trabalho` e o `docker.sock` (provider `kreuzwerker/docker`) |
| `gym aws` | `amazon/aws-cli` na rede `gym-nuvem`, apontada para `http://moto:5000` (o `gym-moto`, que o `preparar.py` do item sobe), com buckets por caminho |

Para validar GitHub Actions, os itens rodam o `rhysd/actionlint` pelo `docker()`.

### A biblioteca dos verificar.sh

```bash
checar "o que deveria ser verdade" "dica se falhar" comando args...
ok "mensagem";  falha "mensagem" "dica"
como_aluno comando args...        # roda como aluno, com HOME certo
contem arquivo "texto"            # grep -iF
sem_processo "padrão"             # nenhum processo casa com pgrep -f
```

Armadilhas que já aconteceram:

- Dica entre **aspas duplas** com `$algo` quebra o verificador (`set -u`). Use aspas simples.
- `sh -c '! pgrep -f x'` sempre acha o próprio `sh`. Use `sem_processo x`.
- Glob (`*`) em pasta que o aluno não lê é expandido **antes** do `sudo`, pelo shell do aluno.
- `tar -t` sem locale UTF-8 escapa acentos. A biblioteca já exporta `LC_ALL=C.UTF-8`.
- Em `/etc/cron.d`, o `%` precisa de `\%`, e existe o campo de usuário.
- `/etc/hosts` num container é um bind mount: `sed -i` falha; `cp` e `tee` funcionam.
- No Ubuntu 24.04, `/bin` aponta para `/usr/bin` (usrmerge): `dpkg -S /usr/bin/ss` não
  acha o pacote, `dpkg -S '*/bin/ss'` acha.
- Mensagem capturada em variável (`erro=$(...)`) pode ter aspas simples: não a coloque
  dentro de `sh -c '...'`. Compare no próprio shell (`test -n "$erro"`) ou numa função.
- `pgrep` dentro de `sh -c "..."` também acha o `sh` (a linha de comando dele tem o
  padrão). Use `sem_processo` ou uma função do próprio verificador.
- `ps -o ppid=` devolve o número com espaços na frente: `tr -d ' '` antes de usar.
- Sem `sudo` (ou o grupo `adm`), o `journalctl` do aluno não mostra os serviços do sistema.
- Datas relativas ("45 dias atrás") vão no `boot.sh`: a imagem é construída uma vez e
  usada por meses.
- Processo vivo no `boot.sh` roda em **todos** os itens do laboratório: nada de CPU a
  100% (o do `plantao-de-sexta` trabalha em rajadas, ~20%).
- Chefes podem usar o estado quebrado de itens anteriores do mesmo laboratório, mas a
  solução não pode depender dele.

Do lado do host:

- Montar **um arquivo só** num container (`./alertas.yml:/etc/...`) prende o inode:
  `sed -i` e muitos editores gravam um arquivo novo, e o container continua vendo o
  antigo. Monte a pasta.
- YAML: dois-pontos seguido de espaço dentro de um valor sem aspas (`run: echo "a: b"`)
  quebra o arquivo. Use `run: |`.
- O `actionlint` fora de um repositório Git precisa do caminho do workflow.
- No k3s, o `Ready` do nó chega antes da serviceaccount `default`: o `k3s_ligar()` já
  espera por ela.
- `dpkg -i` com dependência faltando deixa o pacote pela metade, e o `apt` passa a recusar
  tudo. Nas soluções, use `apt-get install ./arquivo.deb`.

## Regras de design

- **Sintomas, não comandos.** O ticket descreve o que o usuário ou o monitoramento vê.
- **Incidente de verdade.** Soluções com vários comandos, pipes e redirecionamento;
  pelo menos uma pegadinha realista (arquivo oculto, nome com espaço, IP parecido,
  erro que esconde outro erro).
- **Evidência antes de mudança.** Sempre que fizer sentido, peça um relatório em `~/`
  montado com redirecionamento, e não com editor.
- **Não destrua evidência** e **não resolva como root o que deveria rodar sem root**:
  verifique isso também.
- **Continuidade.** A empresa é a Pinguim Store; o administrador anterior é o Beto; a
  tech lead é a Carla. Nomes de serviço em português.
- **Item isolado.** Um item não pode depender do estado de outro (crie o que
  precisar, de forma idempotente). Nomes, portas e namespaces próprios: nada de
  reaproveitar os de outro item.
- O verificador precisa **reprovar** o estado inicial e **aprovar** a solução.

## Criando um item novo

1. Crie a pasta e os arquivos acima (treino: com `## AULA`; chefe: em `pool/90-chefes/`).
2. Teste de ponta a ponta:

   ```bash
   python3 lab/testar.py <parte-do-nome>
   ```

   Para cada item, ele sobe um laboratório novo (ou uma oficina nova), confere que o
   verificador reprova, roda a solução e confere que o verificador aprova.
3. Mapeie o ticket no [ROADMAP.md](ROADMAP.md) e, se usou conteúdo novo, no
   [CONTEUDOS.md](CONTEUDOS.md).

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `GYM_BUILD_ARGS` | argumentos a mais no `docker build` do laboratório. Ex.: `--build-arg BASE=espelho.empresa/ubuntu:24.04` (a imagem base é o `ARG BASE` do Dockerfile) ou `--network host` |
| `GYM_RUN_ARGS` | argumentos a mais no `docker run` do laboratório. Ex.: `--network host`, para os itens de pacotes atrás de um proxy local |
| `GYM_K3S_ARGS` | argumentos a mais no `docker run` do k3s. Ex.: montar o certificado de um proxy corporativo em `/etc/ssl/certs/ca-certificates.crt` |
| `GYM_TF_ARGS` | argumentos a mais no container do Terraform. Ex.: um espelho de providers (`-v espelho:/mirror -e TF_CLI_CONFIG_FILE=...`) |
| `NO_COLOR` | desliga as cores |

## Ideias para próximos itens

- **Logs:** um `logrotate` quebrado deixando `/var/log` cheio; `journalctl --vacuum`.
- **Redes:** firewall com `nftables` bloqueando uma porta; MTU; um certificado TLS vencido.
- **Kubernetes:** Ingress, HPA (ligando o metrics-server do k3s), RBAC e Helm.
- **Observabilidade:** Grafana com um painel como código; logs com Loki.
- **Segurança:** varredura de imagem (Trivy) no pipeline; segredos vazados no histórico do Git.
