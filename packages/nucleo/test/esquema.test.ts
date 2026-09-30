import { describe, expect, test } from "vitest";
import { acharItem, itensDaTrilha, lerTrilha, temCodigo, TrilhaSchema } from "../src/esquema.ts";
import { exercicioSoma, trilhaMinima } from "./fixtures.ts";

describe("esquema", () => {
  test("aceita uma trilha mínima e preenche os padrões", () => {
    const r = lerTrilha(trilhaMinima());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.trilha.formato).toBe("trilhas/1");
    expect(r.trilha.nivelInicial).toBe("zero");
    const aula = r.trilha.meses[0]?.semanas[0]?.itens[0];
    expect(aula?.tipo).toBe("aula");
    expect(aula?.dicas).toEqual([]);
    expect(r.trilha.meses[0]?.semanas[1]?.gerada).toBe(false);
  });

  test("recusa ids repetidos", () => {
    const r = lerTrilha(trilhaMinima([exercicioSoma, { ...exercicioSoma }]));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erros.join("\n")).toContain("id repetido: soma");
  });

  test("recusa id fora do padrão e tipo desconhecido, com o caminho do erro", () => {
    const t = trilhaMinima([{ ...exercicioSoma, id: "Soma Dois" }]);
    const r = lerTrilha(t);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erros.some((e) => e.startsWith("meses.0.semanas.0.itens.1.id"))).toBe(true);
    const outro = TrilhaSchema.safeParse({ ...trilhaMinima(), meses: [{ numero: 1, titulo: "x", semanas: [{ numero: 1, tema: "y", itens: [{ tipo: "video", id: "v" }] }] }] });
    expect(outro.success).toBe(false);
  });

  test("percorre e acha itens", () => {
    const r = lerTrilha(trilhaMinima());
    if (!r.ok) throw new Error("trilha inválida");
    expect(itensDaTrilha(r.trilha).map((p) => p.item.id)).toEqual(["aula-funcoes", "soma"]);
    const p = acharItem(r.trilha, "soma");
    expect(p?.semana).toBe(1);
    expect(p && temCodigo(p.item)).toBe(true);
  });
});
