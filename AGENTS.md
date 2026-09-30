# AGENTS.md: devops_gym

Guia para quem cria ou mantém tickets (você, ou um assistente de IA como o Claude
Code) e para assistentes que ajudam alguém a treinar.

## Se você é um assistente ajudando alguém a treinar

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

## Anatomia de um ticket

`pool/<NN-tema>/<NN-cenario>/ticket.md`:

```markdown
---
mes: 3
semana: 11
palco: lab          # lab = dentro do laboratório; host = no Docker do computador
---
# Título curto

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

Os `.py` recebem prontos: `ok(msg)`, `falha(msg, dica)`, `checar(msg, condicao, dica)`,
`docker(*args) -> (código, saída)`, `http(url) -> (status, corpo)` e `oficina` (Path).

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
- **Ticket isolado.** Um ticket não pode depender do estado de outro (crie o que
  precisar, de forma idempotente).
- O verificador precisa **reprovar** o estado inicial e **aprovar** a solução.

## Criando um ticket novo

1. Crie a pasta e os arquivos acima.
2. Teste de ponta a ponta:

   ```bash
   python3 lab/testar.py <parte-do-nome>
   ```

   Para cada ticket, ele sobe um laboratório novo (ou uma oficina nova), confere que o
   verificador reprova, roda a solução e confere que o verificador aprova.
3. Mapeie o ticket no [ROADMAP.md](ROADMAP.md) e, se usou conteúdo novo, no
   [CONTEUDOS.md](CONTEUDOS.md).

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `GYM_BUILD_ARGS` | argumentos a mais no `docker build` do laboratório. Ex.: `--build-arg BASE=espelho.empresa/ubuntu:24.04` (a imagem base é o `ARG BASE` do Dockerfile) ou `--network host` |
| `GYM_RUN_ARGS` | argumentos a mais no `docker run` do laboratório. Ex.: `--network host`, para o ticket de pacotes atrás de um proxy local |
| `NO_COLOR` | desliga as cores |

## Ideias para próximos tickets

- **Mês 3, gincana júnior:** um servidor com vários problemas ao mesmo tempo (disco
  cheio, processo comendo CPU, serviço caído, permissão errada), para treinar triagem.
- **Logs:** um `logrotate` quebrado deixando `/var/log` cheio; `journalctl --vacuum`.
- **Redes:** firewall com `nftables` bloqueando uma porta; MTU; um certificado TLS vencido.
- **Kubernetes (host):** um cluster `kind` com um Deployment em CrashLoopBackOff, uma
  probe errada e um Service sem endpoints.
- **CI:** um workflow do GitHub Actions quebrado, validado localmente com `actionlint`.
