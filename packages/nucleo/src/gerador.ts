/**
 * A IA monta a trilha: primeiro o roteiro (meses e semanas), depois o conteúdo de cada
 * semana, quando ela abre. Todo JSON que volta é validado com o esquema; o que tem código
 * passa pelo validador (inicial reprova, solução aprova). O que falhar volta para a IA
 * consertar, até 2 vezes. Se ainda falhar, o item fica marcado como não verificado.
 */
import { z } from "zod";
import { ItemSchema, SemanaSchema, TrilhaSchema, temCodigo, type Item, type Semana, type Trilha } from "./esquema.ts";
import { textoCompleto, type Mensagem, type ProvedorIA } from "./ia/tipos.ts";
import { promptConsertar, promptRoadmap, promptRubrica, promptSemana, type Briefing } from "./prompts.ts";
import { validarItem, type Executor } from "./validador.ts";

/** Tira cercas de código e texto em volta, e devolve o primeiro objeto JSON. */
export function extrairJson(texto: string): unknown {
  const semCerca = texto.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
  const inicio = semCerca.indexOf("{");
  const fim = semCerca.lastIndexOf("}");
  if (inicio < 0 || fim < inicio) throw new Error("a resposta não tem um objeto JSON");
  return JSON.parse(semCerca.slice(inicio, fim + 1));
}

function errosDoZod(erro: z.ZodError): string {
  return erro.issues
    .slice(0, 15)
    .map((i) => `- ${i.path.join(".") || "(raiz)"}: ${i.message}`)
    .join("\n");
}

/** Avisa a interface em que etapa a geração está. */
export type AoAvancar = (etapa: string) => void;

/** Pede um JSON e insiste (com os erros) até ele passar no esquema. */
export async function pedirJson<T>(
  provedor: ProvedorIA,
  pedido: { sistema: string; usuario: string },
  schema: z.ZodType<T>,
  opcoes: { tentativas?: number; sinal?: AbortSignal; maxTokens?: number } = {},
): Promise<T> {
  const mensagens: Mensagem[] = [{ papel: "user", conteudo: pedido.usuario }];
  let ultimoErro = "";
  for (let tentativa = 0; tentativa <= (opcoes.tentativas ?? 2); tentativa++) {
    const texto = await textoCompleto(provedor, {
      sistema: pedido.sistema,
      mensagens: [...mensagens],
      maxTokens: opcoes.maxTokens ?? 32000,
      esforco: "high",
      sinal: opcoes.sinal,
    });
    let dados: unknown;
    try {
      dados = extrairJson(texto);
    } catch (e) {
      ultimoErro = `JSON inválido: ${(e as Error).message}`;
      mensagens.push({ papel: "assistant", conteudo: texto }, { papel: "user", conteudo: `${ultimoErro}. Devolva só o JSON.` });
      continue;
    }
    const r = schema.safeParse(dados);
    if (r.success) return r.data;
    ultimoErro = errosDoZod(r.error);
    mensagens.push(
      { papel: "assistant", conteudo: texto },
      { papel: "user", conteudo: `O JSON não segue o formato:\n${ultimoErro}\nDevolva o objeto inteiro corrigido.` },
    );
  }
  throw new Error(`a IA não devolveu um JSON válido depois de várias tentativas:\n${ultimoErro}`);
}

/** Passo 1: o roteiro (meses e semanas, sem conteúdo). */
export async function gerarRoteiro(provedor: ProvedorIA, briefing: Briefing, sinal?: AbortSignal): Promise<Trilha> {
  const trilha = await pedirJson(provedor, promptRoadmap(briefing), TrilhaSchema, { sinal });
  return { ...trilha, origem: "ia", assunto: briefing.assunto, horasPorSemana: briefing.horasPorSemana };
}

export interface ResultadoSemana {
  semana: Semana;
  /** Itens com código que não passaram no validador mesmo depois dos consertos. */
  naoVerificados: string[];
}

/** Passo 2: o conteúdo de uma semana, com cada item de código validado (e consertado). */
export async function gerarSemana(
  provedor: ProvedorIA,
  trilha: Trilha,
  numero: number,
  opcoes: { executor?: Executor; notas?: string; aoAvancar?: AoAvancar; sinal?: AbortSignal } = {},
): Promise<ResultadoSemana> {
  const esboco = trilha.meses.flatMap((m) => m.semanas).find((s) => s.numero === numero);
  if (!esboco) throw new Error(`a trilha não tem a semana ${numero}`);
  opcoes.aoAvancar?.(`Escrevendo a semana ${numero}: ${esboco.tema}`);
  const semana = await pedirJson(provedor, promptSemana(trilha, esboco, { notas: opcoes.notas }), SemanaSchema, {
    sinal: opcoes.sinal,
  });
  const idsDeOutrasSemanas = new Set(
    trilha.meses.flatMap((m) => m.semanas.filter((s) => s.numero !== numero).flatMap((s) => s.itens.map((i) => i.id))),
  );
  const itens: Item[] = semana.itens.map((item) =>
    idsDeOutrasSemanas.has(item.id) ? { ...item, id: `s${numero}-${item.id}` } : item,
  );
  const naoVerificados: string[] = [];
  if (opcoes.executor) {
    for (let i = 0; i < itens.length; i++) {
      let item = itens[i] as Item;
      if (!temCodigo(item)) continue;
      opcoes.aoAvancar?.(`Validando "${item.titulo}"`);
      let r = await validarItem(item, opcoes.executor);
      for (let conserto = 0; !r.ok && conserto < 2; conserto++) {
        opcoes.aoAvancar?.(`Consertando "${item.titulo}" (${r.motivo})`);
        const saida = [r.inicial?.saida, r.solucao?.saida].filter(Boolean).join("\n---\n");
        try {
          item = await pedirJson(provedor, promptConsertar(item, r.motivo ?? "", saida), ItemSchema, { sinal: opcoes.sinal });
        } catch {
          break;
        }
        r = await validarItem(item, opcoes.executor);
      }
      itens[i] = { ...item, verificado: r.ok };
      if (!r.ok) naoVerificados.push(item.id);
    }
  }
  return { semana: { ...semana, numero, tema: esboco.tema, gerada: true, itens }, naoVerificados };
}

/** Coloca a semana gerada no lugar do esboço. */
export function comSemana(trilha: Trilha, semana: Semana): Trilha {
  return {
    ...trilha,
    meses: trilha.meses.map((m) => ({
      ...m,
      semanas: m.semanas.map((s) => (s.numero === semana.numero ? semana : s)),
    })),
  };
}

export const CorrecaoSchema = z.object({
  criterios: z.array(z.object({ criterio: z.string(), atendido: z.boolean(), comentario: z.string().default("") })),
  nota: z.number().min(0).max(100),
  resumo: z.string(),
});
export type Correcao = z.infer<typeof CorrecaoSchema>;

/** Corrige uma resposta aberta (ou projeto) pela rubrica. */
export function corrigirPorRubrica(
  provedor: ProvedorIA,
  enunciado: string,
  rubrica: string[],
  resposta: string,
  sinal?: AbortSignal,
): Promise<Correcao> {
  return pedirJson(provedor, promptRubrica(enunciado, rubrica, resposta), CorrecaoSchema, { sinal, maxTokens: 8000 });
}
