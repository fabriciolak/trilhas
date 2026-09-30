import { describe, expect, test } from "vitest";
import { z } from "zod";
import { comSemana, extrairJson, gerarSemana, pedirJson } from "../src/gerador.ts";
import { criarAnthropic, criarFalso, criarOllama, criarOpenAI, ErroIA, textoCompleto } from "../src/ia/index.ts";
import { lerTrilha, type Exercicio } from "../src/esquema.ts";
import { linkAbrirNoClaude, promptTutor, resumoDoItem } from "../src/prompts.ts";
import type { Executor } from "../src/validador.ts";
import { exercicioSoma, trilhaMinima } from "./fixtures.ts";

/** Um corpo SSE que chega em pedaços quebrados no meio das linhas. */
function sse(linhas: string[], tamanho = 7): Response {
  const texto = linhas.join("\n") + "\n";
  const bytes = new TextEncoder().encode(texto);
  const corpo = new ReadableStream<Uint8Array>({
    start(c) {
      for (let i = 0; i < bytes.length; i += tamanho) c.enqueue(bytes.slice(i, i + tamanho));
      c.close();
    },
  });
  return new Response(corpo, { status: 200, headers: { "content-type": "text/event-stream" } });
}

describe("provedor compatível com a OpenAI (e Ollama)", () => {
  test("junta os deltas do streaming e manda sistema, modelo e chave", async () => {
    let corpo: Record<string, unknown> = {};
    let cabecalhos: Headers = new Headers();
    let url = "";
    const f: typeof fetch = async (u, init) => {
      url = String(u);
      corpo = JSON.parse(String(init?.body));
      cabecalhos = new Headers(init?.headers);
      return sse([
        'data: {"choices":[{"delta":{"role":"assistant"}}]}',
        "",
        'data: {"choices":[{"delta":{"content":"Olá, "}}]}',
        "",
        'data: {"choices":[{"delta":{"content":"mundo!"}}]}',
        "",
        "data: [DONE]",
      ]);
    };
    const p = criarOpenAI({ url: "https://api.exemplo.com/v1/", modelo: "gpt-x", chave: "sk-1", fetch: f });
    const texto = await textoCompleto(p, { sistema: "seja breve", mensagens: [{ papel: "user", conteudo: "oi" }] });
    expect(texto).toBe("Olá, mundo!");
    expect(url).toBe("https://api.exemplo.com/v1/chat/completions");
    expect(corpo.model).toBe("gpt-x");
    expect(corpo.stream).toBe(true);
    expect(corpo.messages).toEqual([
      { role: "system", content: "seja breve" },
      { role: "user", content: "oi" },
    ]);
    expect(cabecalhos.get("authorization")).toBe("Bearer sk-1");
  });

  test("Ollama sem conexão vira um erro com a dica do OLLAMA_ORIGINS", async () => {
    const f: typeof fetch = async () => {
      throw new TypeError("Failed to fetch");
    };
    const p = criarOllama({ modelo: "llama3.2", fetch: f });
    await expect(textoCompleto(p, { mensagens: [{ papel: "user", conteudo: "oi" }] })).rejects.toMatchObject({
      name: "ErroIA",
      dica: expect.stringContaining("OLLAMA_ORIGINS"),
    });
  });

  test("status de erro vira ErroIA com o status", async () => {
    const f: typeof fetch = async () => new Response("chave inválida", { status: 401 });
    const p = criarOpenAI({ url: "https://x/v1", modelo: "m", fetch: f });
    const erro = await textoCompleto(p, { mensagens: [{ papel: "user", conteudo: "oi" }] }).catch((e) => e);
    expect(erro).toBeInstanceOf(ErroIA);
    expect(erro.status).toBe(401);
  });
});

describe("provedor Anthropic (SDK oficial, com fetch falso)", () => {
  const eventos = [
    "event: message_start",
    'data: {"type":"message_start","message":{"id":"msg_1","type":"message","role":"assistant","model":"claude-opus-5-5","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":10,"output_tokens":1}}}',
    "",
    "event: content_block_start",
    'data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}',
    "",
    "event: content_block_delta",
    'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Pense no "}}',
    "",
    "event: content_block_delta",
    'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"caso base."}}',
    "",
    "event: content_block_stop",
    'data: {"type":"content_block_stop","index":0}',
    "",
    "event: message_delta",
    'data: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":6}}',
    "",
    "event: message_stop",
    'data: {"type":"message_stop"}',
    "",
  ];

  test("faz streaming e manda os cabeçalhos do navegador, o esforço e o fallback", async () => {
    let corpo: Record<string, unknown> = {};
    let cabecalhos = new Headers();
    const f: typeof fetch = async (_u, init) => {
      corpo = JSON.parse(String(init?.body));
      cabecalhos = new Headers(init?.headers);
      return sse(eventos, 13);
    };
    const p = criarAnthropic({ chave: "sk-ant-teste", modelo: "claude-opus-5-5", fetch: f });
    const texto = await textoCompleto(p, { sistema: "tutor", mensagens: [{ papel: "user", conteudo: "dica?" }], esforco: "low" });
    expect(texto).toBe("Pense no caso base.");
    expect(cabecalhos.get("x-api-key")).toBe("sk-ant-teste");
    expect(cabecalhos.get("anthropic-dangerous-direct-browser-access")).toBe("true");
    expect(cabecalhos.get("anthropic-beta")).toContain("server-side-fallback-2026-07-01");
    expect(corpo.model).toBe("claude-opus-5-5");
    expect(corpo.stream).toBe(true);
    expect(corpo.system).toBe("tutor");
    expect(corpo.fallbacks).toBe("default");
    expect(corpo.output_config).toEqual({ effort: "low" });
  });

  test("Haiku: sem esforço e sem fallback (o modelo não aceita)", async () => {
    let corpo: Record<string, unknown> = {};
    const f: typeof fetch = async (_u, init) => {
      corpo = JSON.parse(String(init?.body));
      return sse(eventos);
    };
    await textoCompleto(criarAnthropic({ chave: "k", modelo: "claude-haiku-4-5", fetch: f }), {
      mensagens: [{ papel: "user", conteudo: "oi" }],
    });
    expect(corpo.output_config).toBeUndefined();
    expect(corpo.fallbacks).toBeUndefined();
  });

  test("chave recusada vira ErroIA em português", async () => {
    const f: typeof fetch = async () =>
      new Response(JSON.stringify({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    const erro = await textoCompleto(criarAnthropic({ chave: "ruim", modelo: "claude-opus-5-5", fetch: f }), {
      mensagens: [{ papel: "user", conteudo: "oi" }],
    }).catch((e) => e);
    expect(erro).toBeInstanceOf(ErroIA);
    expect(erro.message).toContain("chave");
  });
});

describe("gerador", () => {
  test("extrai JSON de dentro de cercas e texto em volta", () => {
    expect(extrairJson('Aqui está:\n```json\n{"a": 1}\n```\nPronto.')).toEqual({ a: 1 });
    expect(() => extrairJson("sem json")).toThrow();
  });

  test("pedirJson insiste com os erros até o JSON passar no esquema", async () => {
    const ia = criarFalso(['{"nome": 1}', 'não sei', '{"nome": "ana"}']);
    const r = await pedirJson(ia, { sistema: "s", usuario: "u" }, z.object({ nome: z.string() }));
    expect(r).toEqual({ nome: "ana" });
    expect(ia.pedidos).toHaveLength(3);
    const ultima = ia.pedidos[2]?.mensagens.at(-1)?.conteudo ?? "";
    expect(ultima).toContain("JSON inválido");
    expect(ia.pedidos[1]?.mensagens.at(-1)?.conteudo).toContain("nome");
  });

  test("gerarSemana valida o código e manda consertar o que falhou", async () => {
    const t = lerTrilha(trilhaMinima());
    if (!t.ok) throw new Error("trilha inválida");
    const quebrado: Exercicio = { ...exercicioSoma, id: "s2-soma", codigo: { ...exercicioSoma.codigo, solucao: exercicioSoma.codigo.inicial } };
    const consertado: Exercicio = { ...exercicioSoma, id: "s2-soma" };
    const semana = { numero: 2, tema: "Arrays", objetivo: "o", gerada: true, itens: [quebrado] };
    const ia = criarFalso([JSON.stringify(semana), JSON.stringify(consertado)]);
    const executor: Executor = {
      async rodar(_t, arquivos) {
        const ok = (arquivos["solucao.js"] ?? "").includes("return a + b");
        return { ok, codigo: ok ? 0 : 1, saida: ok ? "ok" : "not ok", testes: [{ nome: "soma", passou: ok }] };
      },
    };
    const etapas: string[] = [];
    const r = await gerarSemana(ia, t.trilha, 2, { executor, aoAvancar: (e) => etapas.push(e) });
    expect(r.naoVerificados).toEqual([]);
    expect(r.semana.itens[0]?.verificado).toBe(true);
    expect(r.semana.gerada).toBe(true);
    expect(etapas.some((e) => e.startsWith("Consertando"))).toBe(true);
    const nova = comSemana(t.trilha, r.semana);
    expect(nova.meses[0]?.semanas[1]?.itens.map((i) => i.id)).toEqual(["s2-soma"]);
  });
});

describe("tutor e Abrir no Claude", () => {
  test("o resumo do item para o tutor não leva a solução", () => {
    const resumo = resumoDoItem(exercicioSoma);
    expect(resumo).toContain("Escreva `soma(a, b)`");
    expect(resumo).toContain("soma com negativo");
    expect(resumo).not.toContain("return a + b");
    const sistema = promptTutor("dica", { item: exercicioSoma, dicasDadas: 1 });
    expect(sistema).toContain("dica número 2");
  });

  test("o link do claude.ai leva o texto e corta o que passar do limite", () => {
    const { url, cortado } = linkAbrirNoClaude("olá & tchau");
    expect(url).toBe("https://claude.ai/new?q=ol%C3%A1%20%26%20tchau");
    expect(cortado).toBe(false);
    expect(linkAbrirNoClaude("x".repeat(20), 10).cortado).toBe(true);
  });
});
