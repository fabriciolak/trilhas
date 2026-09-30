import { progressoVazio, type Progresso, type Trilha } from "@trilhas/nucleo";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type RegistroTrilha } from "./db.ts";

export function useTrilhas(): RegistroTrilha[] | undefined {
  return useLiveQuery(() => db.trilhas.orderBy("atualizadaEm").reverse().toArray(), []);
}

/** undefined enquanto carrega; null se não existe. */
export function useTrilha(id: string): Trilha | null | undefined {
  return useLiveQuery(async () => (await db.trilhas.get(id))?.trilha ?? null, [id]);
}

export function useProgresso(trilhaId: string): Progresso {
  return useLiveQuery(() => db.progresso.get(trilhaId), [trilhaId]) ?? progressoVazio(trilhaId);
}

export function useTodosProgressos(): Map<string, Progresso> {
  const lista = useLiveQuery(() => db.progresso.toArray(), []) ?? [];
  return new Map(lista.map((p) => [p.trilhaId, p]));
}
