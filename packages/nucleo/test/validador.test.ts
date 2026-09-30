import { describe, expect, test } from "vitest";
import { lerTrilha } from "../src/esquema.ts";
import { criarExecutorNode } from "../src/node/executor-node.ts";
import { lerRelatorioVitest, lerTap } from "../src/templates.ts";
import { marcarVerificados, validarItem, validarTrilha, type Executor } from "../src/validador.ts";
import { exercicioSoma, trilhaMinima } from "./fixtures.ts";

const node = criarExecutorNode();

describe("leitura de resultados", () => {
  test("TAP do node --test: casos, falhas e sem as linhas de arquivo ou suíte", () => {
    const tap = `TAP version 13
# Subtest: soma dois positivos
ok 1 - soma dois positivos
  ---
  duration_ms: 0.5
  type: 'test'
  ...
# Subtest: soma com negativo
not ok 2 - soma com negativo
  ---
  duration_ms: 0.7
  type: 'test'
  location: '/tmp/x/solucao.test.js:9:1'
  failureType: 'testCodeFailure'
  error: 'Expected values to be strictly equal:\\n\\nundefined !== 1\\n'
  code: 'ERR_ASSERTION'
  ...
1..2
# pass 1
# fail 1`;
    const r = lerTap(tap);
    expect(r.map((t) => [t.nome, t.passou])).toEqual([
      ["soma dois positivos", true],
      ["soma com negativo", false],
    ]);
    expect(r[1]?.mensagem).toContain("strictly equal");
  });

  test("relatório JSON do Vitest", () => {
    const json = JSON.stringify({
      testResults: [
        { assertionResults: [
          { fullName: "soma > dois positivos", status: "passed" },
          { fullName: "soma > negativo", status: "failed", failureMessages: ["AssertionError: expected 5 to be 1\n    at ..."] },
        ] },
      ],
    });
    expect(lerRelatorioVitest(json)).toEqual([
      { nome: "soma > dois positivos", passou: true, mensagem: undefined },
      { nome: "soma > negativo", passou: false, mensagem: "AssertionError: expected 5 to be 1" },
    ]);
    expect(lerRelatorioVitest("não é json")).toEqual([]);
  });
});

describe("validador (com o Node de verdade)", () => {
  test("o inicial reprova e a solução aprova", async () => {
    const r = await validarItem(exercicioSoma, node);
    expect(r.motivo).toBeUndefined();
    expect(r.ok).toBe(true);
    expect(r.inicial?.ok).toBe(false);
    expect(r.solucao?.testes.map((t) => t.passou)).toEqual([true, true]);
  });

  test("pega o exercício que já nasce resolvido", async () => {
    const facil = { ...exercicioSoma, codigo: { ...exercicioSoma.codigo, inicial: exercicioSoma.codigo.solucao } };
    const r = await validarItem(facil, node);
    expect(r.ok).toBe(false);
    expect(r.motivo).toContain("já passa");
  });

  test("pega a solução errada e diz qual teste falhou", async () => {
    const errada = {
      ...exercicioSoma,
      codigo: { ...exercicioSoma.codigo, solucao: { "solucao.js": "export const soma = (a, b) => Math.abs(a) + b;\n" } },
    };
    const r = await validarItem(errada, node);
    expect(r.ok).toBe(false);
    expect(r.motivo).toContain("soma com negativo");
  });
});

describe("validarTrilha", () => {
  test("valida só os itens com código e marca os verificados", async () => {
    const t = lerTrilha(trilhaMinima());
    if (!t.ok) throw new Error("trilha inválida");
    const vistos: string[] = [];
    const falso: Executor = {
      async rodar(_template, arquivos) {
        const resolvido = (arquivos["solucao.js"] ?? "").includes("return a + b");
        vistos.push(resolvido ? "solucao" : "inicial");
        return { ok: resolvido, codigo: resolvido ? 0 : 1, saida: "", testes: [{ nome: "x", passou: resolvido }] };
      },
    };
    const resultados = await validarTrilha(t.trilha, falso);
    expect(resultados.map((r) => [r.itemId, r.ok])).toEqual([["soma", true]]);
    expect(vistos).toEqual(["inicial", "solucao"]);
    const marcada = marcarVerificados(t.trilha, resultados);
    expect(marcada.meses[0]?.semanas[0]?.itens.map((i) => i.verificado)).toEqual([false, true]);
  });
});
