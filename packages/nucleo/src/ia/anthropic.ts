/**
 * Claude pela API da Anthropic, com o SDK oficial. Roda no navegador com a chave da
 * própria pessoa (BYOK): `dangerouslyAllowBrowser` liga o cabeçalho de acesso direto
 * do navegador. A chave fica só no aparelho dela.
 */
import Anthropic from "@anthropic-ai/sdk";
import { ErroIA, type PedidoIA, type ProvedorIA } from "./tipos.ts";

export const MODELOS_CLAUDE = [
  { id: "claude-opus-5-5", nome: "Claude Opus 5.5 (o mais capaz; padrão)" },
  { id: "claude-sonnet-5-5", nome: "Claude Sonnet 5.5 (rápido e mais barato)" },
  { id: "claude-haiku-4-5", nome: "Claude Haiku 4.5 (o mais rápido; bom para dicas)" },
] as const;

export const MODELO_CLAUDE_PADRAO = "claude-opus-5-5";

/** Modelos com controle de esforço (output_config.effort). */
function aceitaEsforco(modelo: string): boolean {
  return /^claude-(opus-5|sonnet-5|fable-5)/.test(modelo);
}

/** Modelos em que ligamos o fallback do servidor para recusas (fallbacks: "default"). */
function aceitaFallback(modelo: string): boolean {
  return /^claude-(opus-5|sonnet-5-5|fable-5)/.test(modelo);
}

export interface OpcoesAnthropic {
  chave: string;
  modelo: string;
  url?: string;
  /** Para testes: um fetch falso. */
  fetch?: typeof globalThis.fetch;
}

export function criarAnthropic(opcoes: OpcoesAnthropic): ProvedorIA {
  const cliente = new Anthropic({
    apiKey: opcoes.chave,
    baseURL: opcoes.url,
    dangerouslyAllowBrowser: true,
    maxRetries: 2,
    ...(opcoes.fetch ? { fetch: opcoes.fetch } : {}),
  });
  const modelo = opcoes.modelo;

  return {
    id: `anthropic:${modelo}`,
    async *conversar(pedido: PedidoIA) {
      const stream = cliente.beta.messages.stream(
        {
          model: modelo,
          max_tokens: pedido.maxTokens ?? 16000,
          ...(pedido.sistema ? { system: pedido.sistema } : {}),
          messages: pedido.mensagens.map((m) => ({ role: m.papel, content: m.conteudo })),
          ...(aceitaEsforco(modelo) ? { output_config: { effort: pedido.esforco ?? "medium" } } : {}),
          // Recusa por engano de um classificador de segurança vira resposta de outro
          // modelo, em vez de um erro para quem está estudando.
          ...(aceitaFallback(modelo) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
        },
        { signal: pedido.sinal },
      );
      try {
        for await (const evento of stream) {
          if (evento.type === "content_block_delta" && evento.delta.type === "text_delta") {
            yield evento.delta.text;
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          throw new ErroIA(
            "O modelo recusou este pedido.",
            final.stop_details?.explanation ?? "Reformule o pedido ou tente outro modelo nas configurações.",
          );
        }
      } catch (erro) {
        throw traduzir(erro);
      }
    },
  };
}

function traduzir(erro: unknown): unknown {
  if (erro instanceof ErroIA || erro instanceof Anthropic.APIUserAbortError) return erro;
  if (erro instanceof Anthropic.AuthenticationError) {
    return new ErroIA("A chave da API foi recusada.", "Confira a chave em Configurações (console.anthropic.com → API keys).", 401);
  }
  if (erro instanceof Anthropic.PermissionDeniedError) {
    return new ErroIA("A chave não tem permissão para este modelo.", "Troque o modelo ou confira a conta.", 403);
  }
  if (erro instanceof Anthropic.NotFoundError) {
    return new ErroIA("Modelo não encontrado.", "Escolha outro modelo em Configurações.", 404);
  }
  if (erro instanceof Anthropic.RateLimitError) {
    return new ErroIA("Limite de uso atingido.", "Espere um pouco e tente de novo.", 429);
  }
  if (erro instanceof Anthropic.APIConnectionError) {
    return new ErroIA("Sem conexão com a API da Anthropic.", "Confira a internet (e o bloqueador de anúncios).");
  }
  if (erro instanceof Anthropic.APIError) {
    return new ErroIA(`Erro da API (${erro.status ?? "?"}): ${erro.message}`, undefined, erro.status);
  }
  return erro;
}
