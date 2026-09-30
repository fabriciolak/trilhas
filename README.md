# Trilhas

Estude **qualquer assunto** com um roteiro montado pela IA, do básico até onde dá para chegar
no seu prazo. Toda semana tem aula, exercício e desafio no estilo LeetCode/HackerRank, e o mês
fecha com um "chefe". O código roda **isolado no navegador** (WebContainers), e a revisão
espaçada (caixas de Leitner) traz de volta o que você esqueceu.

- **A IA monta o roteiro.** Você diz o que quer aprender, para quê, em que nível está e
  quantas horas por semana tem. Ela devolve os meses e as semanas. Você revisa, pede ajustes
  e salva.
- **Cada semana é escrita quando chega**, levando em conta como você foi nas anteriores.
  Todo item de código passa por uma checagem: o código inicial precisa **reprovar** nos
  testes e a solução precisa **aprovar**. Se isso não acontecer, a IA conserta (até 2 vezes);
  se ainda falhar, o item aparece como "não verificado".
- **Tutor que ensina em vez de resolver.** Dá dicas em degraus, explica o erro dos testes,
  revisa o código depois que ele passa e faz sabatina de entrevista.
- **Funciona com o que você tiver:**
  - chave da Anthropic (Claude);
  - qualquer API compatível com a da OpenAI;
  - **Ollama local**;
  - sem chave nenhuma, o **claude.ai** e o **Claude Desktop/Code** (via MCP), com a sua
    assinatura.
- **DevOps de verdade.** A trilha "Linux e DevOps em 6 meses" vem do
  [`devops_gym`](devops_gym/): as aulas ficam no site e a prática é no seu computador, com
  Docker.

Tudo fica no seu navegador (IndexedDB). Não há servidor nem conta. As chaves de API ficam no
`localStorage` e vão direto do navegador para o provedor que você escolher.

## Começar

Precisa do Node 20 ou mais novo e do pnpm (`corepack enable` já instala a versão certa do
pnpm).

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

Abra no **Chrome ou no Edge**: o WebContainer funciona melhor neles, e Firefox e Safari têm
suporte parcial. Na primeira visita, a trilha de exemplo "JavaScript do zero" já aparece. A do
DevOps você adiciona pela página inicial.

Para criar a sua trilha, use **Nova trilha**. Para ligar a IA, vá em **Configurações**.

## Tipos de item

| Tipo | O que é | Como é corrigido |
|---|---|---|
| `aula` | explicação em markdown com checagem rápida | pela checagem, no próprio site |
| `exercicio` | código com testes | testes no WebContainer |
| `desafio` | estilo LeetCode: dificuldade, exemplos, restrições, testes ocultos, dicas e editorial | testes no WebContainer |
| `projeto` | vários arquivos, algo maior | testes (se houver) e a IA, com rubrica |
| `quiz` | múltipla escolha ou resposta curta | no site |
| `aberta` | resposta escrita | a IA, com rubrica (nota de 0 a 100) |
| `local` | prática fora do navegador (ex.: `gym treino-bash`) | você mesmo |
| `chefe` | fim de mês: junta tudo | conforme as partes |

Depois de cada item, você diz como foi:

| Nota | O que acontece |
|---|---|
| **Travei** | o item volta amanhã |
| **Sofri** | o item fica na mesma caixa |
| **Tranquilo** | o item sobe de caixa; a última caixa volta em 16 dias |

A tela **Hoje** mostra o que revisar e o próximo item novo.

Templates de execução:

| Template | Para quê |
|---|---|
| `node` | JavaScript, com `node --test` |
| `vitest` | JavaScript e TypeScript |
| `react` | React, com Testing Library e jsdom |

Assuntos sem código usam `aula`, `quiz` e `aberta`.

## IA

| Provedor | Como configurar | Observações |
|---|---|---|
| Anthropic (Claude) | chave de API em Configurações | SDK oficial, com streaming; o modelo padrão é o Claude Opus 5.5 |
| Compatível com a OpenAI | URL base, modelo e chave | OpenAI, OpenRouter, Groq, LM Studio... (o provedor precisa aceitar chamadas do navegador) |
| Ollama | só liberar este site | `http://localhost:11434/v1`; veja abaixo |
| Sem chave | botão **Abrir no Claude** | abre o claude.ai com o contexto do item; em **Nova trilha**, você cola o JSON de volta |

**Ollama:** por segurança, ele só responde aos sites liberados em `OLLAMA_ORIGINS`. A tela de
Configurações mostra o comando pronto para Linux, macOS e Windows, já com o endereço do site,
e tem o botão **Testar a conexão**. Modelos pequenos erram mais o formato das trilhas, então,
para gerar roteiros, prefira um modelo de 14B ou mais.

**No Claude (Anthropic):** nos modelos que aceitam, o site liga o fallback do servidor
(`fallbacks: "default"`). Se o modelo pedido recusar, a API tenta outro modelo da Anthropic.
Essa configuração fica em [`packages/nucleo/src/ia/anthropic.ts`](packages/nucleo/src/ia/anthropic.ts).

## Claude Desktop e Claude Code (MCP)

O servidor MCP deixa o Claude criar trilhas, escrever semanas, dar aula e registrar notas
direto numa **pasta de trabalho** (`trilhas/*.json` e `progresso/*.json`). Ele usa a sua
assinatura, sem chave de API.

```bash
pnpm --filter @trilhas/mcp build

# Claude Code
claude mcp add trilhas -- node <repositório>/packages/mcp/dist/trilhas-mcp.js --pasta <pasta de trabalho>
```

No Claude Desktop, em `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "trilhas": {
      "command": "node",
      "args": ["<repositório>/packages/mcp/dist/trilhas-mcp.js", "--pasta", "<pasta de trabalho>"]
    }
  }
}
```

O que o servidor oferece:

| Tipo | Itens |
|---|---|
| Ferramentas | `listar_trilhas`, `ler_trilha`, `ler_item`, `proximo_item`, `registrar_nota`, `progresso`, `validar_item`, `salvar_trilha`, `salvar_semana` |
| Recursos | `trilhas://esquema`, `trilhas://guia` |
| Prompt | `nova_trilha` |

As ferramentas `salvar_*` só gravam depois de validar o esquema e rodar os testes no Node
local.

No site, **Configurações → Pasta de trabalho** liga a mesma pasta (no Chrome e no Edge). Assim,
o que o Claude criar aparece no site, e o que você fizer no site aparece para o Claude. Nos
outros navegadores, use exportar e importar.

## DevOps: aulas no site, prática no seu computador

A trilha `trilhas/devops-linux.json` é gerada do [`devops_gym`](devops_gym/), que veio do
repositório `labs` com o histórico. São 23 treinos, 31 tickets e 6 chefes, de "o que é um
terminal" até Kubernetes e Prometheus. As aulas dos treinos aparecem no site. A prática roda
com o `gym`, num contêiner Linux descartável. Veja o
[`devops_gym/README.md`](devops_gym/README.md).

```bash
pnpm importar-gym   # refaz trilhas/devops-linux.json a partir do devops_gym
```

## Estrutura

```
apps/web/          o site (Vite + React), 100% estático
packages/nucleo/   esquema das trilhas (zod), Leitner, validador, provedores de IA e prompts
packages/mcp/      servidor MCP (stdio) sobre a pasta de trabalho
packages/cli/      trilhas validar | importar-gym
trilhas/           exemplo-js.json (escrita à mão) e devops-linux.json (gerada)
devops_gym/        a prática local de Linux e DevOps
scripts/exemplos/  fonte da trilha de exemplo
```

## Comandos

```bash
pnpm dev          # site em modo de desenvolvimento
pnpm test         # testes do núcleo, do MCP e do site
pnpm typecheck
pnpm validar      # em cada trilha de trilhas/: o inicial reprova e a solução aprova (Node local)
pnpm build        # site em apps/web/dist; CLI e MCP em packages/*/dist
pnpm e2e          # Playwright, com IA e executor de mentira
```

No site, os parâmetros `?ia=falso` e `?executor=falso` na URL trocam a IA e o WebContainer
por versões de mentira. É o que o e2e usa.

## Publicar

O WebContainer só roda num site "isolado", com estes dois headers em todas as páginas:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Eles já estão configurados para:
- **Netlify:** [`netlify.toml`](netlify.toml);
- **Vercel:** [`vercel.json`](vercel.json);
- **Cloudflare Pages:** [`apps/web/public/_headers`](apps/web/public/_headers).

Conecte o repositório e use `apps/web/dist` como pasta de saída. O GitHub Pages não deixa
definir headers, então não serve.

## Limites

- O WebContainer baixa o Node e os pacotes npm na primeira execução. Por isso, precisa de
  internet e leva alguns segundos. O uso é gratuito para projetos pessoais e open source (veja
  [webcontainers.io](https://webcontainers.io/)).
- Os testes "ocultos" dos desafios estão no JSON da trilha. É autoestudo, não prova.
- Links de estudo sugeridos pela IA aparecem marcados como "sugerido pela IA: confira" até
  alguém verificar.
- O e2e cobre o site com IA e executor de mentira. WebContainer de verdade, chave de API real
  e Ollama são testados à mão:
  1. rode `pnpm dev`;
  2. abra um exercício e clique em **Executar**;
  3. em Configurações, use **Testar a conexão**.

## Por que estas peças

O [TutorialKit](https://github.com/stackblitz/tutorialkit) compila as lições no build. Aqui a
IA escreve as trilhas enquanto você estuda, então o site é um SPA próprio. Ele usa as mesmas
peças que o TutorialKit e o [bolt.diy](https://github.com/stackblitz-labs/bolt.diy):

| Parte | Biblioteca |
|---|---|
| Execução isolada | [`@webcontainer/api`](https://webcontainers.io/) |
| Editor | [CodeMirror 6](https://codemirror.net/) (`@uiw/react-codemirror`) |
| Terminal | [xterm.js](https://xtermjs.org/) |
| Layout estilo LeetCode | [`react-resizable-panels`](https://github.com/bvaughn/react-resizable-panels) |
| Dados | [Dexie](https://dexie.org/) (IndexedDB) e [zod](https://zod.dev/) |
| Estilo e ícones | [Tailwind CSS](https://tailwindcss.com/) e [Lucide](https://lucide.dev/) |
| Markdown | [marked](https://marked.js.org/) e [DOMPurify](https://github.com/cure53/DOMPurify) |
| IA | [SDK da Anthropic](https://github.com/anthropics/anthropic-sdk-typescript); OpenAI e Ollama por `fetch` com SSE |
| MCP | [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) |

O chat do tutor é um componente próprio e pequeno. Ele precisa de modos (dica, erro, revisão,
sabatina) e do contexto do item, e uma biblioteca de chat genérica não traz isso pronto.
