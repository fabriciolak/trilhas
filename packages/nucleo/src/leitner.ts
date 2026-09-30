/**
 * Repetição espaçada com caixas de Leitner: o mesmo modelo do devops_gym (gym.py).
 *
 * Caixas de 1 a 5. A nota decide a caixa nova e a caixa decide quando o item volta:
 * travei → caixa 1 (volta amanhã); sofri → mesma caixa; tranquilo → sobe uma caixa.
 */
import { itensDaTrilha, type Posicao, type Trilha } from "./esquema.ts";

export const INTERVALOS = [0, 1, 2, 4, 8, 16] as const;
export const NOTAS = ["travei", "sofri", "tranquilo"] as const;
export type Nota = (typeof NOTAS)[number];

export interface Agenda {
  caixa: number;
  /** Data da próxima revisão (AAAA-MM-DD). */
  proxima: string;
}

export interface Registro {
  data: string;
  itemId: string;
  nota: Nota;
  de: number;
  para: number;
}

/** O progresso de uma trilha: a agenda de cada item e o histórico de notas. */
export interface Progresso {
  trilhaId: string;
  agenda: Record<string, Agenda>;
  historico: Registro[];
}

export function progressoVazio(trilhaId: string): Progresso {
  return { trilhaId, agenda: {}, historico: [] };
}

export function dataIso(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split("-").map(Number) as [number, number, number];
  return dataIso(new Date(ano, mes - 1, dia + dias));
}

export function caixaNova(caixa: number, nota: Nota): number {
  if (nota === "travei") return 1;
  if (nota === "sofri") return caixa;
  return Math.min(caixa + 1, 5);
}

/** Grava a nota de um item. Não muda o progresso recebido: devolve um novo. */
export function gravarNota(progresso: Progresso, itemId: string, nota: Nota, hoje: string): Progresso {
  const de = progresso.agenda[itemId]?.caixa ?? 1;
  const para = caixaNova(de, nota);
  const proxima = somarDias(hoje, INTERVALOS[para] ?? 16);
  return {
    ...progresso,
    agenda: { ...progresso.agenda, [itemId]: { caixa: para, proxima } },
    historico: [...progresso.historico, { data: hoje, itemId, nota, de, para }],
  };
}

export type Situacao =
  | { estado: "novo" }
  | { estado: "revisar"; caixa: number }
  | { estado: "agendado"; caixa: number; proxima: string };

export function situacao(progresso: Progresso, itemId: string, hoje: string): Situacao {
  const a = progresso.agenda[itemId];
  if (!a) return { estado: "novo" };
  if (a.proxima <= hoje) return { estado: "revisar", caixa: a.caixa };
  return { estado: "agendado", caixa: a.caixa, proxima: a.proxima };
}

export interface TreinoDoDia {
  revisoes: Posicao[];
  /** O primeiro item nunca feito, na ordem da trilha. */
  novo: Posicao | undefined;
  /** Quando não há nada para hoje: a próxima data de revisão. */
  proximaRevisao: string | undefined;
}

/** O que fazer hoje: as revisões vencidas e o próximo item novo (como o "gym" sem argumentos). */
export function treinoDeHoje(trilha: Trilha, progresso: Progresso, hoje: string): TreinoDoDia {
  const todos = itensDaTrilha(trilha);
  const revisoes = todos.filter((p) => {
    const a = progresso.agenda[p.item.id];
    return a !== undefined && a.proxima <= hoje;
  });
  const novo = todos.find((p) => progresso.agenda[p.item.id] === undefined);
  const futuras = Object.values(progresso.agenda)
    .map((a) => a.proxima)
    .filter((d) => d > hoje)
    .sort();
  return { revisoes, novo, proximaRevisao: futuras[0] };
}

/** Resumo por caixa, para a tela de progresso. */
export function resumo(trilha: Trilha, progresso: Progresso): { total: number; feitos: number; porCaixa: number[] } {
  const ids = itensDaTrilha(trilha).map((p) => p.item.id);
  const porCaixa = [0, 0, 0, 0, 0];
  let feitos = 0;
  for (const id of ids) {
    const a = progresso.agenda[id];
    if (a) {
      feitos++;
      porCaixa[a.caixa - 1] = (porCaixa[a.caixa - 1] ?? 0) + 1;
    }
  }
  return { total: ids.length, feitos, porCaixa };
}
