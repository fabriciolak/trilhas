/**
 * O servidor MCP das trilhas. Com ele, o Claude Desktop ou o Claude Code (usando a
 * assinatura da pessoa, sem chave de API) monta trilhas, escreve e valida o conteúdo, e
 * acompanha a repetição espaçada, tudo numa pasta de trabalho que o site também abre.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  acharItem,
  comSemana,
  dataIso,
  FORMATO_CODIGO,
  gravarNota,
  ItemSchema,
  itensDaTrilha,
  lerTrilha,
  marcarVerificados,
  NOTAS,
  PEDAGOGIA,
  resumo,
  SemanaSchema,
  situacao,
  temCodigo,
  TIPOS_DE_ITEM,
  treinoDeHoje,
  TrilhaSchema,
  validarItem,
  validarTrilha,
  type Executor,
  type Item,
  type ResultadoValidacao,
  type Trilha,
} from "@trilhas/nucleo";
import { PastaDeTrabalho } from "@trilhas/nucleo/node";
import { z } from "zod";

type Resposta = { content: { type: "text"; text: string }[]; isError?: boolean };

const texto = (t: string): Resposta => ({ content: [{ type: "text", text: t }] });
const erro = (t: string): Resposta => ({ content: [{ type: "text", text: t }], isError: true });
const json = (dados: unknown): Resposta => texto(JSON.stringify(dados, null, 2));

/** Sem a solução e o editorial: para o Claude ensinar sem entregar a resposta. */
export function semSolucao(item: Item): Item {
  const copia = structuredClone(item) as Item & { editorial?: string };
  if (temCodigo(copia)) copia.codigo = { ...copia.codigo, solucao: {} };
  if ("editorial" in copia) copia.editorial = "(escondido: peça com incluir_solucao=true depois de tentar)";
  return copia;
}

function relatorio(resultados: ResultadoValidacao[]): string {
  if (resultados.length === 0) return "Nenhum item com código para validar.";
  return resultados
    .map((r) => {
      if (r.ok) return `✔ ${r.itemId}`;
      const saida = (r.solucao?.saida || r.inicial?.saida || "").trim().split("\n").slice(-12).join("\n");
      return `✘ ${r.itemId}: ${r.motivo}${saida ? `\n${saida}` : ""}`;
    })
    .join("\n");
}

export const GUIA = `# Guia de autoria das trilhas

Uma trilha é um JSON (formato "trilhas/1"): trilha → meses → semanas → itens. O esquema
completo está no recurso trilhas://esquema.

${PEDAGOGIA}

${TIPOS_DE_ITEM}

${FORMATO_CODIGO}

## Como montar uma trilha com estas ferramentas
1. Converse com a pessoa: o que quer aprender, para quê, nível atual, horas por semana e prazo.
2. Monte o roteiro (meses e semanas com tema e objetivo; semanas ainda sem itens, "gerada": false)
   e salve com salvar_trilha. Mostre o roteiro e ajuste com a pessoa.
3. Escreva uma semana de cada vez e salve com salvar_semana: os itens com código são testados
   na hora (o inicial precisa reprovar e a solução, aprovar). Conserte o que falhar e salve de novo.
4. Para estudar: proximo_item diz o que fazer hoje; ler_item mostra o item (sem a solução);
   depois, registrar_nota agenda a revisão (travei, sofri ou tranquilo).
5. Como tutor: dê dicas em degraus e nunca a solução de primeira.
`;

export function criarServidor(pasta: PastaDeTrabalho, executor: Executor, hoje: () => string = () => dataIso(new Date())): McpServer {
  const servidor = new McpServer(
    { name: "trilhas", version: "0.1.0" },
    { instructions: "Trilhas de estudo guiadas. Leia o recurso trilhas://guia antes de criar ou editar uma trilha." },
  );

  servidor.registerResource(
    "esquema",
    "trilhas://esquema",
    { title: "Esquema JSON da trilha", mimeType: "application/json" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(z.toJSONSchema(TrilhaSchema, { io: "input" }), null, 2) }] }),
  );
  servidor.registerResource(
    "guia",
    "trilhas://guia",
    { title: "Guia de autoria (pedagogia, tipos de item, formato do código)", mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: GUIA }] }),
  );

  servidor.registerPrompt(
    "nova_trilha",
    {
      title: "Montar uma trilha nova",
      description: "Entrevista a pessoa e monta uma trilha do básico ao máximo possível no prazo.",
      argsSchema: { assunto: z.string().describe("O que a pessoa quer aprender") },
    },
    ({ assunto }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Quero montar uma trilha de estudo sobre: ${assunto}.\n\nSiga o guia (recurso trilhas://guia): primeiro me pergunte o objetivo, meu nível, as horas por semana e o prazo; depois monte o roteiro, salve com salvar_trilha e me mostre. Em seguida escreva a semana 1 e salve com salvar_semana.`,
          },
        },
      ],
    }),
  );

  servidor.registerTool(
    "listar_trilhas",
    { title: "Listar trilhas", description: "As trilhas da pasta de trabalho, com o progresso de cada uma.", inputSchema: {}, annotations: { readOnlyHint: true } },
    async () => {
      const lista = await pasta.listarTrilhas();
      const comProgresso = [];
      for (const t of lista) {
        if (t.erro) {
          comProgresso.push(t);
          continue;
        }
        const trilha = await pasta.lerTrilha(t.id);
        comProgresso.push({ ...t, ...resumo(trilha, await pasta.lerProgresso(t.id)) });
      }
      return lista.length ? json(comProgresso) : texto(`Nenhuma trilha em ${pasta.raiz}/trilhas. Use o prompt nova_trilha ou salvar_trilha.`);
    },
  );

  servidor.registerTool(
    "ler_trilha",
    {
      title: "Ler o roteiro de uma trilha",
      description: "Meses, semanas e itens (id, tipo, nível, situação na repetição espaçada), sem o conteúdo.",
      inputSchema: { trilha: z.string().describe("id da trilha") },
      annotations: { readOnlyHint: true },
    },
    async ({ trilha: id }) => {
      const trilha = await pasta.lerTrilha(id);
      const progresso = await pasta.lerProgresso(id);
      const dia = hoje();
      return json({
        id: trilha.id,
        titulo: trilha.titulo,
        racional: trilha.racional,
        meses: trilha.meses.map((m) => ({
          numero: m.numero,
          titulo: m.titulo,
          marco: m.marco,
          semanas: m.semanas.map((s) => ({
            numero: s.numero,
            tema: s.tema,
            gerada: s.gerada,
            itens: s.itens.map((i) => ({ id: i.id, tipo: i.tipo, titulo: i.titulo, nivel: i.nivel, verificado: i.verificado, situacao: situacao(progresso, i.id, dia) })),
          })),
        })),
      });
    },
  );

  servidor.registerTool(
    "ler_item",
    {
      title: "Ler um item",
      description: "O item completo. Por padrão SEM a solução e o editorial (para ensinar sem entregar a resposta).",
      inputSchema: {
        trilha: z.string(),
        item: z.string().describe("id do item"),
        incluir_solucao: z.boolean().default(false).describe("true só depois de a pessoa tentar de verdade"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ trilha: id, item: itemId, incluir_solucao }) => {
      const p = acharItem(await pasta.lerTrilha(id), itemId);
      if (!p) return erro(`Item ${itemId} não encontrado na trilha ${id}.`);
      return json({ mes: p.mes, semana: p.semana, item: incluir_solucao ? p.item : semSolucao(p.item) });
    },
  );

  servidor.registerTool(
    "proximo_item",
    {
      title: "O que estudar hoje",
      description: "As revisões que venceram e o próximo item novo, na ordem da trilha.",
      inputSchema: { trilha: z.string() },
      annotations: { readOnlyHint: true },
    },
    async ({ trilha: id }) => {
      const trilha = await pasta.lerTrilha(id);
      const r = treinoDeHoje(trilha, await pasta.lerProgresso(id), hoje());
      const curto = (p: { mes: number; semana: number; item: Item }) => ({ id: p.item.id, tipo: p.item.tipo, titulo: p.item.titulo, mes: p.mes, semana: p.semana });
      const pendente = trilha.meses.flatMap((m) => m.semanas).find((s) => !s.gerada);
      return json({
        revisoes: r.revisoes.map(curto),
        novo: r.novo ? curto(r.novo) : null,
        proximaRevisao: r.proximaRevisao ?? null,
        ...(r.novo === undefined && pendente ? { aviso: `A semana ${pendente.numero} (${pendente.tema}) ainda não tem conteúdo: escreva e salve com salvar_semana.` } : {}),
      });
    },
  );

  servidor.registerTool(
    "registrar_nota",
    {
      title: "Registrar a nota de um item",
      description: "travei (volta amanhã), sofri (mesma caixa) ou tranquilo (sobe uma caixa). Agenda a próxima revisão.",
      inputSchema: { trilha: z.string(), item: z.string(), nota: z.enum(NOTAS) },
    },
    async ({ trilha: id, item: itemId, nota }) => {
      const trilha = await pasta.lerTrilha(id);
      if (!acharItem(trilha, itemId)) return erro(`Item ${itemId} não encontrado na trilha ${id}.`);
      const progresso = gravarNota(await pasta.lerProgresso(id), itemId, nota, hoje());
      await pasta.salvarProgresso(progresso);
      const a = progresso.agenda[itemId];
      return texto(`Nota "${nota}" registrada: ${itemId} está na caixa ${a?.caixa} e volta em ${a?.proxima}.`);
    },
  );

  servidor.registerTool(
    "progresso",
    {
      title: "Progresso numa trilha",
      description: "Quantos itens feitos, por caixa, e o histórico recente de notas.",
      inputSchema: { trilha: z.string() },
      annotations: { readOnlyHint: true },
    },
    async ({ trilha: id }) => {
      const trilha = await pasta.lerTrilha(id);
      const p = await pasta.lerProgresso(id);
      return json({ ...resumo(trilha, p), historicoRecente: p.historico.slice(-15) });
    },
  );

  servidor.registerTool(
    "validar_item",
    {
      title: "Validar um item (sem salvar)",
      description: "Roda os testes de um item com código: o inicial precisa reprovar e a solução, aprovar.",
      inputSchema: { item: z.record(z.string(), z.unknown()).describe("o item em JSON") },
    },
    async ({ item }) => {
      const r = ItemSchema.safeParse(item);
      if (!r.success) return erro(`O item não segue o esquema:\n${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n")}`);
      const v = await validarItem(r.data, executor);
      return v.ok ? texto(relatorio([v])) : erro(relatorio([v]));
    },
  );

  servidor.registerTool(
    "salvar_trilha",
    {
      title: "Salvar uma trilha inteira",
      description: "Confere o esquema, valida os itens com código e grava em trilhas/<id>.json (marcando verificado).",
      inputSchema: { trilha: z.record(z.string(), z.unknown()).describe("a trilha em JSON (formato trilhas/1)") },
    },
    async ({ trilha: dados }) => {
      const r = lerTrilha(dados);
      if (!r.ok) return erro(`A trilha não segue o esquema (veja trilhas://esquema):\n${r.erros.slice(0, 30).join("\n")}`);
      const resultados = await validarTrilha(r.trilha, executor);
      const caminho = await pasta.salvarTrilha(marcarVerificados(r.trilha, resultados));
      const falhas = resultados.filter((x) => !x.ok).length;
      return texto(`Salva em ${caminho}.\n${relatorio(resultados)}${falhas ? `\n\n${falhas} item(ns) não verificados: conserte e salve de novo.` : ""}`);
    },
  );

  servidor.registerTool(
    "salvar_semana",
    {
      title: "Salvar o conteúdo de uma semana",
      description: "Coloca a semana (com os itens) no lugar do esboço, valida os itens com código e grava.",
      inputSchema: { trilha: z.string(), semana: z.record(z.string(), z.unknown()).describe('{"numero", "tema", "objetivo", "itens": [...]}') },
    },
    async ({ trilha: id, semana: dados }) => {
      const trilha: Trilha = await pasta.lerTrilha(id);
      const r = SemanaSchema.safeParse({ ...dados, gerada: true });
      if (!r.success) return erro(`A semana não segue o esquema:\n${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n")}`);
      if (!trilha.meses.some((m) => m.semanas.some((s) => s.numero === r.data.numero))) {
        return erro(`A trilha ${id} não tem a semana ${r.data.numero}.`);
      }
      const nova = comSemana(trilha, r.data);
      const lida = lerTrilha(nova);
      if (!lida.ok) return erro(lida.erros.join("\n"));
      const daSemana = new Set(r.data.itens.map((i) => i.id));
      const resultados: ResultadoValidacao[] = [];
      for (const { item } of itensDaTrilha(lida.trilha)) {
        if (daSemana.has(item.id) && temCodigo(item)) resultados.push(await validarItem(item, executor));
      }
      await pasta.salvarTrilha(marcarVerificados(lida.trilha, resultados));
      return texto(`Semana ${r.data.numero} salva (${r.data.itens.length} itens).\n${relatorio(resultados)}`);
    },
  );

  return servidor;
}
