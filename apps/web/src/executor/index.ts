/** Um executor por página, com eventos de saída para o console e o terminal. */
import type { Arquivos, Executor } from "@trilhas/nucleo";
import { criarExecutorFalso } from "./falso.ts";
import { criarExecutorWebContainer, semAnsi, suportaWebContainer } from "./webcontainer.ts";

export type EventoExecutor = { tipo: "saida"; texto: string } | { tipo: "etapa"; texto: string };

const ouvintes = new Set<(e: EventoExecutor) => void>();
const emitir = (e: EventoExecutor) => ouvintes.forEach((f) => f(e));

export function ouvirExecutor(f: (e: EventoExecutor) => void): () => void {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

let solucoes: () => Arquivos[] = () => [];
export function definirSolucoesConhecidas(f: () => Arquivos[]): void {
  solucoes = f;
}

export const modoExecutorFalso = () => new URLSearchParams(window.location.search).get("executor") === "falso";

let executor: Executor | undefined;

export function obterExecutor(): Executor {
  executor ??= modoExecutorFalso()
    ? criarExecutorFalso(() => solucoes())
    : criarExecutorWebContainer({
        aoEscrever: (texto) => emitir({ tipo: "saida", texto: semAnsi(texto) }),
        aoMudarEtapa: (texto) => emitir({ tipo: "etapa", texto }),
      });
  return executor;
}

/** Dá para rodar código neste navegador? */
export function execucaoDisponivel(): { ok: boolean; motivo?: string } {
  return modoExecutorFalso() ? { ok: true } : suportaWebContainer();
}
