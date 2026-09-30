/**
 * Executor de mentira, para os testes de ponta a ponta (?executor=falso): aprova quando os
 * arquivos da pessoa são iguais aos de alguma solução conhecida. Não roda código nenhum.
 */
import type { Arquivos, ExecucaoTestes, Executor } from "@trilhas/nucleo";

export function criarExecutorFalso(solucoes: () => Arquivos[]): Executor {
  return {
    async rodar(_template, arquivos): Promise<ExecucaoTestes> {
      await new Promise((r) => setTimeout(r, 150));
      const limpa = (s: string) => s.replace(/\s+/g, " ").trim();
      const resolvido = solucoes().some(
        (s) => Object.keys(s).length > 0 && Object.entries(s).every(([k, v]) => limpa(arquivos[k] ?? "") === limpa(v)),
      );
      const nomes = Object.entries(arquivos)
        .filter(([k]) => /\.test\.[jt]sx?$/.test(k))
        .flatMap(([, v]) => [...v.matchAll(/\btest\(\s*"([^"]+)"/g)].map((m) => m[1] ?? ""));
      const testes = nomes.map((nome) => ({ nome, passou: resolvido, mensagem: resolvido ? undefined : "Expected values to be strictly equal" }));
      const saida = testes.map((t, i) => `${t.passou ? "ok" : "not ok"} ${i + 1} - ${t.nome}`).join("\n");
      return { ok: resolvido, codigo: resolvido ? 0 : 1, saida: `TAP version 13\n${saida}\n`, testes };
    },
  };
}
