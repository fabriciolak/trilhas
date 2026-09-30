/**
 * Configuração do provedor de IA. Fica no localStorage do navegador (e só nele): a chave
 * de API nunca sai do aparelho, a não ser na chamada para o próprio provedor.
 */
import { MODELO_CLAUDE_PADRAO, OLLAMA_URL_PADRAO, type ConfigProvedor } from "@trilhas/nucleo";

export type TipoProvedor = "anthropic" | "openai" | "ollama";

export interface ConfigIA {
  tipo: TipoProvedor;
  anthropic: { chave: string; modelo: string };
  openai: { url: string; chave: string; modelo: string };
  ollama: { url: string; modelo: string };
}

export const CONFIG_PADRAO: ConfigIA = {
  tipo: "anthropic",
  anthropic: { chave: "", modelo: MODELO_CLAUDE_PADRAO },
  openai: { url: "https://api.openai.com/v1", chave: "", modelo: "" },
  ollama: { url: OLLAMA_URL_PADRAO, modelo: "llama3.2" },
};

const CHAVE = "trilhas:ia";

export function lerConfig(): ConfigIA {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return CONFIG_PADRAO;
    const salvo = JSON.parse(bruto) as Partial<ConfigIA>;
    return {
      tipo: salvo.tipo ?? CONFIG_PADRAO.tipo,
      anthropic: { ...CONFIG_PADRAO.anthropic, ...salvo.anthropic },
      openai: { ...CONFIG_PADRAO.openai, ...salvo.openai },
      ollama: { ...CONFIG_PADRAO.ollama, ...salvo.ollama },
    };
  } catch {
    return CONFIG_PADRAO;
  }
}

export function salvarConfig(config: ConfigIA): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(config));
  } catch {
    // Navegador sem armazenamento (janela anônima restrita): a configuração vale só nesta aba.
  }
  window.dispatchEvent(new Event("trilhas:config"));
}

/** A configuração no formato do núcleo, ou o que falta para ela funcionar. */
export function configDoProvedor(c: ConfigIA): { ok: true; config: ConfigProvedor } | { ok: false; falta: string } {
  if (c.tipo === "anthropic") {
    if (!c.anthropic.chave.trim()) return { ok: false, falta: "a chave da API da Anthropic" };
    return { ok: true, config: { tipo: "anthropic", chave: c.anthropic.chave.trim(), modelo: c.anthropic.modelo } };
  }
  if (c.tipo === "openai") {
    if (!c.openai.url.trim() || !c.openai.modelo.trim()) return { ok: false, falta: "a URL e o modelo da API" };
    return { ok: true, config: { tipo: "openai", url: c.openai.url.trim(), modelo: c.openai.modelo.trim(), chave: c.openai.chave.trim() || undefined } };
  }
  if (!c.ollama.modelo.trim()) return { ok: false, falta: "o modelo do Ollama" };
  return { ok: true, config: { tipo: "ollama", url: c.ollama.url.trim() || OLLAMA_URL_PADRAO, modelo: c.ollama.modelo.trim() } };
}

export type Tema = "sistema" | "claro" | "escuro";

export function lerTema(): Tema {
  try {
    const t = localStorage.getItem("trilhas:tema");
    return t === "claro" || t === "escuro" ? t : "sistema";
  } catch {
    return "sistema";
  }
}

export function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement;
  if (tema === "sistema") raiz.removeAttribute("data-tema");
  else raiz.setAttribute("data-tema", tema);
  try {
    localStorage.setItem("trilhas:tema", tema);
  } catch {
    // sem armazenamento: o tema vale só nesta aba
  }
}
