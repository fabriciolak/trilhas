import { criarAnthropic } from "./anthropic.ts";
import { criarFalso } from "./falso.ts";
import { criarOllama, criarOpenAI } from "./openai.ts";
import type { ConfigProvedor, ProvedorIA } from "./tipos.ts";

export * from "./tipos.ts";
export { criarAnthropic, MODELOS_CLAUDE, MODELO_CLAUDE_PADRAO } from "./anthropic.ts";
export { criarOpenAI, criarOllama, linhasSse, OLLAMA_URL_PADRAO } from "./openai.ts";
export { criarFalso } from "./falso.ts";

export function criarProvedor(config: ConfigProvedor, f?: typeof globalThis.fetch): ProvedorIA {
  switch (config.tipo) {
    case "anthropic":
      return criarAnthropic({ chave: config.chave, modelo: config.modelo, url: config.url, fetch: f });
    case "openai":
      return criarOpenAI({ url: config.url, modelo: config.modelo, chave: config.chave, fetch: f });
    case "ollama":
      return criarOllama({ modelo: config.modelo, url: config.url, fetch: f });
    case "falso":
      return criarFalso(config.respostas, config.atrasoMs);
  }
}
