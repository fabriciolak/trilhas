import type { Questao } from "@trilhas/nucleo";

/** Resposta curta: sem acentos, caixa, pontuação e espaços extras. */
const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[`"'.,;:!?()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function acertou(q: Questao, resposta: number | string | null | undefined): boolean {
  if (resposta === null || resposta === undefined || resposta === "") return false;
  if (typeof q.resposta === "number") return Number(resposta) === q.resposta;
  return normalizar(String(resposta)) === normalizar(q.resposta);
}
