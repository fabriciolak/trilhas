/** As operações sobre os dados: trilhas, notas, tentativas e conversas. */
import {
  dataIso,
  gravarNota,
  lerTrilha,
  mesclarProgresso,
  progressoVazio,
  type Nota,
  type Progresso,
  type Trilha,
} from "@trilhas/nucleo";
import { chaveItem, db, type Tentativa } from "./db.ts";
import { espelharNaPasta } from "./pasta.ts";

export const hoje = () => dataIso(new Date());

export async function salvarTrilha(trilha: Trilha): Promise<void> {
  await db.trilhas.put({ id: trilha.id, trilha, atualizadaEm: new Date().toISOString() });
  void espelharNaPasta({ trilha });
}

export async function apagarTrilha(id: string): Promise<void> {
  await db.transaction("rw", db.trilhas, db.progresso, async () => {
    await db.trilhas.delete(id);
    await db.progresso.delete(id);
  });
}

export async function lerProgresso(trilhaId: string): Promise<Progresso> {
  return (await db.progresso.get(trilhaId)) ?? progressoVazio(trilhaId);
}

export async function darNota(trilhaId: string, itemId: string, nota: Nota): Promise<Progresso> {
  const novo = gravarNota(await lerProgresso(trilhaId), itemId, nota, hoje());
  await db.progresso.put(novo);
  void espelharNaPasta({ progresso: novo });
  return novo;
}

export async function mesclarProgressoExterno(externo: Progresso): Promise<void> {
  const atual = await lerProgresso(externo.trilhaId);
  await db.progresso.put(mesclarProgresso(atual, externo));
}

export async function lerTentativa(trilhaId: string, itemId: string): Promise<Tentativa | undefined> {
  return db.tentativas.get(chaveItem(trilhaId, itemId));
}

export async function salvarTentativa(trilhaId: string, itemId: string, parcial: Partial<Omit<Tentativa, "chave">>): Promise<void> {
  const chave = chaveItem(trilhaId, itemId);
  const atual = await db.tentativas.get(chave);
  await db.tentativas.put({ ...atual, ...parcial, chave, atualizadaEm: new Date().toISOString() });
}

/** As trilhas que vêm com o site. */
export const EXEMPLOS = [
  { id: "exemplo-js", titulo: "JavaScript do zero (exemplo)", descricao: "Um mês curto com todos os tipos de item: aula, exercício, desafio, quiz, resposta aberta, prática local e chefe." },
  { id: "devops-linux", titulo: "Linux e DevOps em 6 meses", descricao: "O devops_gym: 60 treinos, tickets e chefes para praticar no seu computador, com as aulas aqui." },
] as const;

export async function carregarExemplo(id: (typeof EXEMPLOS)[number]["id"]): Promise<Trilha> {
  const modulo =
    id === "exemplo-js"
      ? await import("../../../../trilhas/exemplo-js.json")
      : await import("../../../../trilhas/devops-linux.json");
  const r = lerTrilha(modulo.default);
  if (!r.ok) throw new Error(`o exemplo ${id} está inválido: ${r.erros[0]}`);
  await salvarTrilha(r.trilha);
  return r.trilha;
}

/** Na primeira visita, a trilha de exemplo já aparece. */
export async function prepararPrimeiraVisita(): Promise<void> {
  const marcada = await db.preferencias.get("primeira-visita");
  if (marcada) return;
  await db.preferencias.put({ chave: "primeira-visita", valor: new Date().toISOString() });
  if ((await db.trilhas.count()) === 0) await carregarExemplo("exemplo-js");
}

/** Tudo num arquivo só (cópia de segurança, ou para levar para outro navegador). */
export async function exportarTudo(): Promise<Blob> {
  const dados = {
    formato: "trilhas-backup/1",
    exportadoEm: new Date().toISOString(),
    trilhas: (await db.trilhas.toArray()).map((r) => r.trilha),
    progresso: await db.progresso.toArray(),
    tentativas: await db.tentativas.toArray(),
  };
  return new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
}

/** Importa uma trilha (JSON) ou uma cópia de segurança. Devolve o que entrou. */
export async function importarArquivo(texto: string): Promise<string[]> {
  const dados = JSON.parse(texto) as { formato?: string; trilhas?: unknown[]; progresso?: Progresso[]; tentativas?: Tentativa[] };
  if (dados.formato === "trilhas-backup/1") {
    const nomes: string[] = [];
    for (const bruta of dados.trilhas ?? []) {
      const r = lerTrilha(bruta);
      if (r.ok) {
        await salvarTrilha(r.trilha);
        nomes.push(r.trilha.titulo);
      }
    }
    for (const p of dados.progresso ?? []) await mesclarProgressoExterno(p);
    if (dados.tentativas?.length) await db.tentativas.bulkPut(dados.tentativas);
    return nomes;
  }
  const r = lerTrilha(dados);
  if (!r.ok) throw new Error(`o arquivo não é uma trilha válida:\n${r.erros.slice(0, 8).join("\n")}`);
  await salvarTrilha(r.trilha);
  return [r.trilha.titulo];
}
