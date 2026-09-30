# AGENTS.md: como trabalhar neste repositório

Tudo em português (código, textos da interface e commits). pnpm workspaces, TypeScript
estrito (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`, imports com `.ts`/`.tsx`).

## Antes de enviar

```bash
pnpm typecheck && pnpm test && pnpm validar && pnpm --filter @trilhas/web build && pnpm e2e
```

`pnpm validar` instala os pacotes dos templates na primeira vez (cache em
`~/.cache/trilhas/templates`). O `pnpm e2e` usa o Chromium do Playwright 1.56.1.

## Onde fica cada coisa

| Mudança | Arquivo |
|---|---|
| Formato da trilha (tipos de item, campos) | `packages/nucleo/src/esquema.ts`; depois ajuste `prompts.ts` (`TIPOS_DE_ITEM`) e a view do item em `apps/web/src/itens/` |
| Regras pedagógicas e prompts | `packages/nucleo/src/prompts.ts` (usados pelo site e pelo MCP) |
| Gerar e consertar roteiro e semana | `packages/nucleo/src/gerador.ts` |
| Revisão espaçada | `packages/nucleo/src/leitner.ts` (mesmas regras do `devops_gym/gym.py`) |
| Templates de execução | `packages/nucleo/src/templates.ts` (os `package.json` e a leitura de TAP e do JSON do vitest) |
| Provedores de IA | `packages/nucleo/src/ia/` |
| WebContainer | `apps/web/src/executor/webcontainer.ts` |
| Ferramentas do MCP | `packages/mcp/src/servidor.ts` (+ teste em `packages/mcp/test/`) |
| Trilha de exemplo | `scripts/exemplos/exemplo-js.mjs` → `node scripts/exemplos/exemplo-js.mjs > trilhas/exemplo-js.json` e `node packages/cli/dist/trilhas.js validar trilhas/exemplo-js.json --gravar` |
| Trilha do DevOps | `pnpm importar-gym` (não edite `trilhas/devops-linux.json` à mão) |

## Regras que não podem quebrar

- **Todo item com código:** o inicial reprova e a solução aprova, com os mesmos testes. O
  validador (`validador.ts`) é o mesmo no CLI, no MCP e no site.
- **A solução nunca vai para a IA do tutor** (`resumoDoItem` só inclui enunciado, aula, testes visíveis e perguntas: nada de `solucao`, `ocultos`, `editorial` ou respostas do quiz) nem
  para o MCP sem `incluir_solucao`.
- **Nada de servidor:** o site é estático e as chaves ficam no navegador. Qualquer recurso de
  outra origem precisa funcionar com `Cross-Origin-Embedder-Policy: require-corp` (CORS ou
  `Cross-Origin-Resource-Policy`).
- **Rotas pelo hash** (`#/trilha/...`), para funcionar em qualquer hospedagem estática.
- Novos textos da interface: curtos, em português do Brasil e em segunda pessoa ("você").

## Testar sem rede e sem chave

- `?ia=falso` → `apps/web/src/ia/falso-e2e.ts` responde conforme o prompt de sistema.
- `?executor=falso` → `apps/web/src/executor/falso.ts` aprova quando os arquivos batem com a
  solução conhecida.
- O WebContainer de verdade precisa alcançar `*.stackblitz.com` e o npm; se não conseguir, o
  site avisa depois de 60 s.

## devops_gym

`devops_gym/` é uma cópia (subtree) do `labs`, com o histórico. Tem as próprias regras em
[`devops_gym/AGENTS.md`](devops_gym/AGENTS.md). Ao mudar os itens dele, rode
`pnpm importar-gym`.
