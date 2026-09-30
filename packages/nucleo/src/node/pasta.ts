/**
 * A pasta de trabalho no disco, compartilhada entre o site (que a abre pela File System
 * Access API) e o servidor MCP (Claude Desktop/Code):
 *
 *   <pasta>/trilhas/<id>.json      as trilhas
 *   <pasta>/progresso/<id>.json    a agenda de repetição espaçada de cada trilha
 */
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { lerTrilha, type Trilha } from "../esquema.ts";
import { progressoVazio, type Progresso } from "../leitner.ts";

export class PastaDeTrabalho {
  constructor(readonly raiz: string) {}

  private caminhoTrilha(id: string) {
    return join(this.raiz, "trilhas", `${id}.json`);
  }

  private caminhoProgresso(id: string) {
    return join(this.raiz, "progresso", `${id}.json`);
  }

  private async gravar(caminho: string, dados: unknown): Promise<void> {
    await mkdir(join(caminho, ".."), { recursive: true });
    const temporario = `${caminho}.tmp`;
    await writeFile(temporario, JSON.stringify(dados, null, 2) + "\n");
    await rename(temporario, caminho);
  }

  async listarTrilhas(): Promise<{ id: string; titulo: string; assunto: string; erro?: string }[]> {
    let nomes: string[] = [];
    try {
      nomes = (await readdir(join(this.raiz, "trilhas"))).filter((n) => n.endsWith(".json")).sort();
    } catch {
      return [];
    }
    const lista = [];
    for (const nome of nomes) {
      const id = nome.replace(/\.json$/, "");
      try {
        const t = await this.lerTrilha(id);
        lista.push({ id: t.id, titulo: t.titulo, assunto: t.assunto });
      } catch (e) {
        lista.push({ id, titulo: id, assunto: "", erro: (e as Error).message });
      }
    }
    return lista;
  }

  async lerTrilha(id: string): Promise<Trilha> {
    const dados = JSON.parse(await readFile(this.caminhoTrilha(id), "utf8"));
    const r = lerTrilha(dados);
    if (!r.ok) throw new Error(`trilhas/${id}.json é inválida:\n${r.erros.join("\n")}`);
    return r.trilha;
  }

  async salvarTrilha(trilha: Trilha): Promise<string> {
    const caminho = this.caminhoTrilha(trilha.id);
    await this.gravar(caminho, trilha);
    return caminho;
  }

  async lerProgresso(trilhaId: string): Promise<Progresso> {
    try {
      const dados = JSON.parse(await readFile(this.caminhoProgresso(trilhaId), "utf8")) as Progresso;
      return { trilhaId, agenda: dados.agenda ?? {}, historico: dados.historico ?? [] };
    } catch {
      return progressoVazio(trilhaId);
    }
  }

  async salvarProgresso(progresso: Progresso): Promise<void> {
    await this.gravar(this.caminhoProgresso(progresso.trilhaId), progresso);
  }
}
