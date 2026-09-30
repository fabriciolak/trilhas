/**
 * O validador: roda os testes de um item e confere o contrato de todo item com código,
 * o mesmo do devops_gym: o código inicial precisa REPROVAR e a solução, APROVAR.
 *
 * Quem roda de verdade é um Executor: no navegador, o WebContainer; no terminal (CLI e
 * MCP), o Node local. O validador não sabe qual é.
 */
import { itensDaTrilha, temCodigo, type Arquivos, type Codigo, type Item, type Template, type Trilha } from "./esquema.ts";
import { montarArquivos, type ResultadoTeste } from "./templates.ts";

export interface ExecucaoTestes {
  /** O comando terminou com código 0. */
  ok: boolean;
  codigo: number;
  /** A saída do comando (stdout e stderr juntos). */
  saida: string;
  testes: ResultadoTeste[];
}

export interface Executor {
  rodar(template: Template, arquivos: Arquivos, opcoes?: { sinal?: AbortSignal }): Promise<ExecucaoTestes>;
}

export type Modo = "executar" | "enviar";

/** Os arquivos de uma execução: o código da pessoa com os testes do modo. */
export function arquivosDaExecucao(item: Item & { codigo: Codigo }, codigoDaPessoa: Arquivos, modo: Modo): Arquivos {
  const c = item.codigo;
  return montarArquivos(c.template, c.inicial, codigoDaPessoa, c.testes, modo === "enviar" ? c.ocultos : {});
}

export interface ResultadoValidacao {
  itemId: string;
  ok: boolean;
  /** Em português, o que deu errado. */
  motivo?: string;
  inicial?: ExecucaoTestes;
  solucao?: ExecucaoTestes;
}

/** Confere um item: sem código, só passa; com código, inicial reprova e solução aprova. */
export async function validarItem(item: Item, executor: Executor): Promise<ResultadoValidacao> {
  if (!temCodigo(item)) return { itemId: item.id, ok: true };
  const c = item.codigo;
  const testes = { ...c.testes, ...c.ocultos };
  if (Object.keys(testes).length === 0) {
    return { itemId: item.id, ok: false, motivo: "item com código, mas sem nenhum arquivo de teste" };
  }
  if (!(c.abrir in c.inicial)) {
    return { itemId: item.id, ok: false, motivo: `o arquivo "${c.abrir}" (abrir) não está no inicial` };
  }
  const inicial = await executor.rodar(c.template, montarArquivos(c.template, c.inicial, testes));
  const solucao = await executor.rodar(c.template, montarArquivos(c.template, c.inicial, c.solucao, testes));
  if (inicial.ok) {
    return { itemId: item.id, ok: false, motivo: "o código inicial já passa nos testes (o exercício não ensina nada)", inicial, solucao };
  }
  if (!solucao.ok) {
    const falhas = solucao.testes.filter((t) => !t.passou).map((t) => t.nome);
    return {
      itemId: item.id,
      ok: false,
      motivo: `a solução não passa nos testes${falhas.length ? `: ${falhas.join("; ")}` : ""}`,
      inicial,
      solucao,
    };
  }
  if (solucao.testes.length === 0) {
    return { itemId: item.id, ok: false, motivo: "a solução passou, mas nenhum teste foi encontrado", inicial, solucao };
  }
  return { itemId: item.id, ok: true, inicial, solucao };
}

/** Valida todos os itens com código de uma trilha, um de cada vez. */
export async function validarTrilha(
  trilha: Trilha,
  executor: Executor,
  aoTerminarItem?: (r: ResultadoValidacao) => void,
): Promise<ResultadoValidacao[]> {
  const resultados: ResultadoValidacao[] = [];
  for (const { item } of itensDaTrilha(trilha)) {
    if (!temCodigo(item)) continue;
    const r = await validarItem(item, executor);
    resultados.push(r);
    aoTerminarItem?.(r);
  }
  return resultados;
}

/** Marca como verificados os itens que passaram (e desmarca os que falharam). */
export function marcarVerificados(trilha: Trilha, resultados: ResultadoValidacao[]): Trilha {
  const porId = new Map(resultados.map((r) => [r.itemId, r.ok]));
  return {
    ...trilha,
    meses: trilha.meses.map((mes) => ({
      ...mes,
      semanas: mes.semanas.map((semana) => ({
        ...semana,
        itens: semana.itens.map((item) => (porId.has(item.id) ? { ...item, verificado: porId.get(item.id) ?? false } : item)),
      })),
    })),
  };
}
