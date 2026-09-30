/** O contrato comum dos provedores de IA: conversar e receber o texto aos pedaços. */

export interface Mensagem {
  papel: "user" | "assistant";
  conteudo: string;
}

export type Esforco = "low" | "medium" | "high";

export interface PedidoIA {
  sistema?: string;
  mensagens: Mensagem[];
  /** Limite de tokens da resposta. */
  maxTokens?: number;
  /** Quanto o modelo deve pensar (só onde o provedor aceita). */
  esforco?: Esforco;
  sinal?: AbortSignal;
}

export interface ProvedorIA {
  /** Ex.: "anthropic:claude-opus-5-5". */
  readonly id: string;
  /** O texto chega aos pedaços (streaming). */
  conversar(pedido: PedidoIA): AsyncIterable<string>;
}

export type ConfigProvedor =
  | { tipo: "anthropic"; chave: string; modelo: string; url?: string }
  | { tipo: "openai"; url: string; modelo: string; chave?: string }
  | { tipo: "ollama"; modelo: string; url?: string }
  | { tipo: "falso"; respostas: string[]; atrasoMs?: number };

export class ErroIA extends Error {
  constructor(
    message: string,
    /** Dica em português do que fazer. */
    readonly dica?: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ErroIA";
  }
}

/** Junta a resposta inteira. */
export async function textoCompleto(provedor: ProvedorIA, pedido: PedidoIA): Promise<string> {
  let texto = "";
  for await (const pedaco of provedor.conversar(pedido)) texto += pedaco;
  return texto;
}
