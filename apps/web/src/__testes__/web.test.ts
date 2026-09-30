import { describe, expect, it } from "vitest";
import { acertou } from "../itens/correcao.ts";
import { href, lerRota } from "../rota.ts";

describe("rotas pelo hash", () => {
  it("lê cada página", () => {
    expect(lerRota("")).toEqual({ nome: "inicio" });
    expect(lerRota("#/")).toEqual({ nome: "inicio" });
    expect(lerRota("#/nova")).toEqual({ nome: "nova" });
    expect(lerRota("#/config")).toEqual({ nome: "config" });
    expect(lerRota("#/trilha/js")).toEqual({ nome: "trilha", trilhaId: "js" });
    expect(lerRota("#/progresso/js")).toEqual({ nome: "progresso", trilhaId: "js" });
    expect(lerRota("#/trilha/js/item/s1-aula")).toEqual({ nome: "item", trilhaId: "js", itemId: "s1-aula" });
    expect(lerRota("#/qualquer/coisa")).toEqual({ nome: "inicio" });
  });

  it("ida e volta com caracteres especiais", () => {
    expect(lerRota(href.item("violão do zero", "s1/a"))).toEqual({ nome: "item", trilhaId: "violão do zero", itemId: "s1/a" });
    expect(lerRota(href.trilha("c#"))).toEqual({ nome: "trilha", trilhaId: "c#" });
  });
});

describe("correção do quiz", () => {
  it("múltipla escolha compara o índice", () => {
    const q = { enunciado: "?", opcoes: ["a", "b"], resposta: 1, explicacao: "" };
    expect(acertou(q, 1)).toBe(true);
    expect(acertou(q, "1")).toBe(true);
    expect(acertou(q, 0)).toBe(false);
    expect(acertou(q, null)).toBe(false);
  });

  it("resposta curta ignora acentos, caixa e espaços", () => {
    const q = { enunciado: "?", resposta: "Função", explicacao: "" };
    expect(acertou(q, "  funcao ")).toBe(true);
    expect(acertou(q, "FUNÇÃO")).toBe(true);
    expect(acertou(q, "")).toBe(false);
    expect(acertou(q, "método")).toBe(false);
  });
});
