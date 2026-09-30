/**
 * Qualquer API compatível com a da OpenAI (/v1/chat/completions com streaming): OpenAI,
 * OpenRouter, Groq, LM Studio... e o Ollama, que expõe a mesma API em /v1.
 */
import { ErroIA, type PedidoIA, type ProvedorIA } from "./tipos.ts";

export const OLLAMA_URL_PADRAO = "http://localhost:11434/v1";

export interface OpcoesOpenAI {
  /** A URL base, até o /v1 (ex.: https://api.openai.com/v1). */
  url: string;
  modelo: string;
  chave?: string;
  /** Nome para mensagens de erro e para o id. */
  rotulo?: string;
  fetch?: typeof globalThis.fetch;
}

/** Lê um corpo SSE e devolve o conteúdo de cada linha "data:". */
export async function* linhasSse(corpo: ReadableStream<Uint8Array>): AsyncIterable<string> {
  const leitor = corpo.getReader();
  const decodificador = new TextDecoder();
  let resto = "";
  for (;;) {
    const { value, done } = await leitor.read();
    if (done) break;
    resto += decodificador.decode(value, { stream: true });
    let fim: number;
    while ((fim = resto.indexOf("\n")) >= 0) {
      const linha = resto.slice(0, fim).replace(/\r$/, "");
      resto = resto.slice(fim + 1);
      if (linha.startsWith("data:")) yield linha.slice(5).trimStart();
    }
  }
  if (resto.startsWith("data:")) yield resto.slice(5).trimStart();
}

export function criarOpenAI(opcoes: OpcoesOpenAI): ProvedorIA {
  const rotulo = opcoes.rotulo ?? "openai";
  const url = opcoes.url.replace(/\/+$/, "");
  const f = opcoes.fetch ?? globalThis.fetch.bind(globalThis);

  return {
    id: `${rotulo}:${opcoes.modelo}`,
    async *conversar(pedido: PedidoIA) {
      const mensagens = [
        ...(pedido.sistema ? [{ role: "system", content: pedido.sistema }] : []),
        ...pedido.mensagens.map((m) => ({ role: m.papel, content: m.conteudo })),
      ];
      let resposta: Response;
      try {
        resposta = await f(`${url}/chat/completions`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(opcoes.chave ? { authorization: `Bearer ${opcoes.chave}` } : {}),
          },
          body: JSON.stringify({
            model: opcoes.modelo,
            messages: mensagens,
            stream: true,
            ...(pedido.maxTokens ? { max_tokens: pedido.maxTokens } : {}),
          }),
          signal: pedido.sinal,
        });
      } catch (erro) {
        if ((erro as Error)?.name === "AbortError") throw erro;
        throw new ErroIA(
          `Não consegui falar com ${url}.`,
          rotulo === "ollama"
            ? "O Ollama está rodando? E aceita esta origem? Veja o guia do Ollama em Configurações (OLLAMA_ORIGINS)."
            : "Confira a URL e a internet.",
        );
      }
      if (!resposta.ok || !resposta.body) {
        const texto = await resposta.text().catch(() => "");
        throw new ErroIA(
          `${rotulo} respondeu ${resposta.status}: ${texto.slice(0, 200)}`,
          resposta.status === 401 ? "Confira a chave da API." : resposta.status === 404 ? "Confira o nome do modelo." : undefined,
          resposta.status,
        );
      }
      for await (const dado of linhasSse(resposta.body)) {
        if (dado === "[DONE]") return;
        let evento: { choices?: { delta?: { content?: string } }[]; error?: { message?: string } };
        try {
          evento = JSON.parse(dado);
        } catch {
          continue;
        }
        if (evento.error) throw new ErroIA(`${rotulo}: ${evento.error.message ?? "erro"}`);
        const pedaco = evento.choices?.[0]?.delta?.content;
        if (pedaco) yield pedaco;
      }
    },
  };
}

export function criarOllama(opcoes: { modelo: string; url?: string; fetch?: typeof globalThis.fetch }): ProvedorIA {
  return criarOpenAI({ url: opcoes.url ?? OLLAMA_URL_PADRAO, modelo: opcoes.modelo, rotulo: "ollama", fetch: opcoes.fetch });
}
