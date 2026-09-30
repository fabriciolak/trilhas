import { criarProvedor, ErroIA, type ProvedorIA } from "@trilhas/nucleo";
import { configDoProvedor, lerConfig } from "../estado/config.ts";
import { criarIaFalsaE2E } from "./falso-e2e.ts";

export const modoIaFalsa = () => new URLSearchParams(window.location.search).get("ia") === "falso";

/** O provedor configurado, ou o que falta configurar. */
export function obterProvedor(): { ok: true; provedor: ProvedorIA } | { ok: false; falta: string } {
  if (modoIaFalsa()) return { ok: true, provedor: criarIaFalsaE2E() };
  const r = configDoProvedor(lerConfig());
  return r.ok ? { ok: true, provedor: criarProvedor(r.config) } : r;
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroIA) return erro.dica ? `${erro.message} ${erro.dica}` : erro.message;
  if (erro instanceof Error) return erro.message;
  return String(erro);
}
