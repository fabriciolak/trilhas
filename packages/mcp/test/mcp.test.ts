/**
 * Um cliente MCP de verdade conversando com o servidor, pela stdio (o executável gerado
 * pelo build), numa pasta de trabalho temporária.
 */
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const EXEMPLO = resolve(import.meta.dirname, "../../../trilhas/exemplo-js.json");
const BINARIO = resolve(import.meta.dirname, "../dist/trilhas-mcp.js");

let pasta: string;
let cliente: Client;

type ResultadoTexto = { content: { type: string; text?: string }[]; isError?: boolean };
async function chamar(nome: string, args: Record<string, unknown> = {}): Promise<{ texto: string; erro: boolean }> {
  const r = (await cliente.callTool({ name: nome, arguments: args })) as ResultadoTexto;
  return { texto: r.content.map((c) => c.text ?? "").join("\n"), erro: r.isError === true };
}

beforeAll(async () => {
  pasta = await mkdtemp(join(tmpdir(), "trilhas-mcp-"));
  cliente = new Client({ name: "teste", version: "1.0.0" });
  await cliente.connect(new StdioClientTransport({ command: process.execPath, args: [BINARIO, "--pasta", pasta], stderr: "ignore" }));
});

afterAll(async () => {
  await cliente?.close();
  await rm(pasta, { recursive: true, force: true });
});

describe("servidor MCP", () => {
  test("anuncia as ferramentas, os recursos e o prompt", async () => {
    const ferramentas = (await cliente.listTools()).tools.map((t) => t.name).sort();
    expect(ferramentas).toEqual([
      "ler_item", "ler_trilha", "listar_trilhas", "progresso", "proximo_item",
      "registrar_nota", "salvar_semana", "salvar_trilha", "validar_item",
    ]);
    const recursos = (await cliente.listResources()).resources.map((r) => r.uri).sort();
    expect(recursos).toEqual(["trilhas://esquema", "trilhas://guia"]);
    const esquema = await cliente.readResource({ uri: "trilhas://esquema" });
    const conteudo = esquema.contents[0];
    expect(conteudo && "text" in conteudo ? JSON.parse(conteudo.text).type : undefined).toBe("object");
    const prompt = await cliente.getPrompt({ name: "nova_trilha", arguments: { assunto: "violão" } });
    expect(JSON.stringify(prompt.messages)).toContain("violão");
  });

  test("pasta vazia: listar_trilhas explica o que fazer", async () => {
    const r = await chamar("listar_trilhas");
    expect(r.texto).toContain("Nenhuma trilha");
  });

  test("salvar_trilha valida o código e grava a trilha", async () => {
    const trilha = JSON.parse(await readFile(EXEMPLO, "utf8"));
    const r = await chamar("salvar_trilha", { trilha });
    expect(r.erro).toBe(false);
    expect(r.texto).toContain("✔ s1-saudacao");
    expect(r.texto).not.toContain("✘");
    const salva = JSON.parse(await readFile(join(pasta, "trilhas", "exemplo-js.json"), "utf8"));
    expect(salva.id).toBe("exemplo-js");
  }, 120_000);

  test("salvar_trilha recusa JSON fora do esquema, com o caminho do erro", async () => {
    const r = await chamar("salvar_trilha", { trilha: { id: "X Y", meses: [] } });
    expect(r.erro).toBe(true);
    expect(r.texto).toContain("id:");
  });

  test("estudar: próximo item, ler sem a solução, nota e progresso", async () => {
    const hoje = JSON.parse((await chamar("proximo_item", { trilha: "exemplo-js" })).texto);
    expect(hoje.novo.id).toBe("s1-aula-funcoes");

    const item = JSON.parse((await chamar("ler_item", { trilha: "exemplo-js", item: "s2-dois-numeros" })).texto);
    expect(item.item.codigo.solucao).toEqual({});
    expect(item.item.editorial).toContain("escondido");
    const comSolucao = JSON.parse((await chamar("ler_item", { trilha: "exemplo-js", item: "s2-dois-numeros", incluir_solucao: true })).texto);
    expect(comSolucao.item.codigo.solucao["solucao.js"]).toContain("new Map()");

    const nota = await chamar("registrar_nota", { trilha: "exemplo-js", item: "s1-aula-funcoes", nota: "tranquilo" });
    expect(nota.texto).toContain("caixa 2");
    const depois = JSON.parse((await chamar("proximo_item", { trilha: "exemplo-js" })).texto);
    expect(depois.novo.id).toBe("s1-saudacao");
    const progresso = JSON.parse((await chamar("progresso", { trilha: "exemplo-js" })).texto);
    expect(progresso.feitos).toBe(1);
    expect(progresso.porCaixa).toEqual([0, 1, 0, 0, 0]);
  });

  test("validar_item aponta a solução quebrada", async () => {
    const trilha = JSON.parse(await readFile(EXEMPLO, "utf8"));
    const item = trilha.meses[0].semanas[1].itens[1];
    item.codigo.solucao = { "solucao.js": "export function somaPares() { return 1; }\n" };
    const r = await chamar("validar_item", { item });
    expect(r.erro).toBe(true);
    expect(r.texto).toContain("a solução não passa");
  }, 60_000);

  test("salvar_semana preenche uma semana e valida os itens dela", async () => {
    const roteiro = {
      id: "violao",
      titulo: "Violão",
      assunto: "violão",
      meses: [{ numero: 1, titulo: "Base", semanas: [{ numero: 1, tema: "Acordes", gerada: false, itens: [] }] }],
    };
    expect((await chamar("salvar_trilha", { trilha: roteiro })).erro).toBe(false);
    const semana = {
      numero: 1,
      tema: "Acordes",
      itens: [
        { tipo: "aula", id: "s1-aula", titulo: "Acordes maiores", nivel: 1, conteudo: "Dó, Ré, Mi..." },
        { tipo: "local", id: "s1-pratica", titulo: "Pratique Dó e Sol", nivel: 1, enunciado: "10 minutos trocando entre Dó e Sol." },
      ],
    };
    const r = await chamar("salvar_semana", { trilha: "violao", semana });
    expect(r.erro).toBe(false);
    const lida = JSON.parse((await chamar("ler_trilha", { trilha: "violao" })).texto);
    expect(lida.meses[0].semanas[0].gerada).toBe(true);
    expect(lida.meses[0].semanas[0].itens.map((i: { id: string }) => i.id)).toEqual(["s1-aula", "s1-pratica"]);
  });
});
