import { describe, expect, test } from "vitest";
import { lerTrilha } from "../src/esquema.ts";
import { caixaNova, gravarNota, progressoVazio, resumo, situacao, somarDias, treinoDeHoje } from "../src/leitner.ts";
import { trilhaMinima } from "./fixtures.ts";

// Os mesmos casos do devops_gym (gym.py: gravar_nota).
describe("Leitner", () => {
  test("travei volta para a caixa 1; sofri mantém; tranquilo sobe até 5", () => {
    expect(caixaNova(4, "travei")).toBe(1);
    expect(caixaNova(3, "sofri")).toBe(3);
    expect(caixaNova(2, "tranquilo")).toBe(3);
    expect(caixaNova(5, "tranquilo")).toBe(5);
  });

  test("item novo começa na caixa 1: tranquilo vai para a 2 e volta em 2 dias", () => {
    const p = gravarNota(progressoVazio("t"), "a", "tranquilo", "2026-09-30");
    expect(p.agenda.a).toEqual({ caixa: 2, proxima: "2026-10-02" });
    expect(p.historico).toEqual([{ data: "2026-09-30", itemId: "a", nota: "tranquilo", de: 1, para: 2 }]);
  });

  test("intervalos por caixa: 1, 2, 4, 8, 16 dias (virando o mês e o ano)", () => {
    let p = progressoVazio("t");
    const datas: string[] = [];
    for (let i = 0; i < 5; i++) {
      p = gravarNota(p, "a", "tranquilo", "2026-12-30");
      datas.push(p.agenda.a?.proxima ?? "");
    }
    expect(datas).toEqual(["2027-01-01", "2027-01-03", "2027-01-07", "2027-01-15", "2027-01-15"]);
    p = gravarNota(p, "a", "travei", "2026-12-30");
    expect(p.agenda.a).toEqual({ caixa: 1, proxima: "2026-12-31" });
    expect(somarDias("2028-02-28", 1)).toBe("2028-02-29");
  });

  test("não muda o progresso recebido", () => {
    const antes = progressoVazio("t");
    gravarNota(antes, "a", "sofri", "2026-09-30");
    expect(antes.agenda).toEqual({});
  });

  test("treino de hoje: revisões vencidas e o próximo item novo, na ordem da trilha", () => {
    const r = lerTrilha(trilhaMinima());
    if (!r.ok) throw new Error("trilha inválida");
    let p = progressoVazio("js-teste");
    let hoje = treinoDeHoje(r.trilha, p, "2026-09-30");
    expect(hoje.revisoes).toEqual([]);
    expect(hoje.novo?.item.id).toBe("aula-funcoes");

    p = gravarNota(p, "aula-funcoes", "travei", "2026-09-30");
    hoje = treinoDeHoje(r.trilha, p, "2026-09-30");
    expect(hoje.novo?.item.id).toBe("soma");
    expect(hoje.revisoes).toEqual([]);
    expect(hoje.proximaRevisao).toBe("2026-10-01");
    expect(situacao(p, "aula-funcoes", "2026-10-01")).toEqual({ estado: "revisar", caixa: 1 });

    hoje = treinoDeHoje(r.trilha, p, "2026-10-01");
    expect(hoje.revisoes.map((x) => x.item.id)).toEqual(["aula-funcoes"]);
    expect(resumo(r.trilha, p)).toEqual({ total: 2, feitos: 1, porCaixa: [1, 0, 0, 0, 0] });
  });
});
