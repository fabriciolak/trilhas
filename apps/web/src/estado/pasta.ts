/**
 * A pasta de trabalho: a mesma que o servidor MCP usa (trilhas/<id>.json e
 * progresso/<id>.json). Com ela ligada, o que o Claude Desktop/Code cria aparece aqui, e o
 * que você faz aqui aparece lá. Usa a File System Access API (Chrome e Edge); nos outros
 * navegadores, use exportar e importar.
 */
import { lerTrilha, mesclarProgresso, progressoVazio, type Progresso, type Trilha } from "@trilhas/nucleo";
import { db } from "./db.ts";

type Permissao = "granted" | "denied" | "prompt";
interface PastaComPermissao extends FileSystemDirectoryHandle {
  queryPermission(o: { mode: "readwrite" }): Promise<Permissao>;
  requestPermission(o: { mode: "readwrite" }): Promise<Permissao>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (o?: { mode?: "read" | "readwrite"; id?: string }) => Promise<FileSystemDirectoryHandle>;
  }
}

export const suportaPasta = () => typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";

async function pastaSalva(): Promise<PastaComPermissao | undefined> {
  const r = await db.preferencias.get("pasta");
  return r?.valor as PastaComPermissao | undefined;
}

export async function nomeDaPasta(): Promise<string | undefined> {
  return (await pastaSalva())?.name;
}

async function comPermissao(pedir: boolean): Promise<PastaComPermissao | undefined> {
  const pasta = await pastaSalva();
  if (!pasta) return undefined;
  if ((await pasta.queryPermission({ mode: "readwrite" })) === "granted") return pasta;
  if (pedir && (await pasta.requestPermission({ mode: "readwrite" })) === "granted") return pasta;
  return undefined;
}

export async function escolherPasta(): Promise<string> {
  if (!window.showDirectoryPicker) throw new Error("Este navegador não abre pastas. Use o Chrome ou o Edge, ou exporte e importe arquivos.");
  const pasta = await window.showDirectoryPicker({ mode: "readwrite", id: "trilhas" });
  await db.preferencias.put({ chave: "pasta", valor: pasta });
  return pasta.name;
}

export async function esquecerPasta(): Promise<void> {
  await db.preferencias.delete("pasta");
}

async function subpasta(raiz: FileSystemDirectoryHandle, nome: string) {
  return raiz.getDirectoryHandle(nome, { create: true });
}

async function gravar(pasta: FileSystemDirectoryHandle, nome: string, dados: unknown): Promise<void> {
  const arquivo = await pasta.getFileHandle(nome, { create: true });
  const escrita = await arquivo.createWritable();
  await escrita.write(JSON.stringify(dados, null, 2) + "\n");
  await escrita.close();
}

async function lerJsons(pasta: FileSystemDirectoryHandle): Promise<{ nome: string; dados: unknown }[]> {
  const lista: { nome: string; dados: unknown }[] = [];
  for await (const entrada of pasta.values()) {
    if (entrada.kind !== "file" || !entrada.name.endsWith(".json")) continue;
    try {
      const texto = await (await (entrada as FileSystemFileHandle).getFile()).text();
      lista.push({ nome: entrada.name, dados: JSON.parse(texto) });
    } catch {
      // arquivo quebrado: fica de fora (o MCP mostra o erro)
    }
  }
  return lista;
}

/** Grava na pasta o que mudou aqui (se a pasta estiver ligada e com permissão). */
export async function espelharNaPasta(mudanca: { trilha?: Trilha; progresso?: Progresso }): Promise<void> {
  try {
    const raiz = await comPermissao(false);
    if (!raiz) return;
    if (mudanca.trilha) await gravar(await subpasta(raiz, "trilhas"), `${mudanca.trilha.id}.json`, mudanca.trilha);
    if (mudanca.progresso) await gravar(await subpasta(raiz, "progresso"), `${mudanca.progresso.trilhaId}.json`, mudanca.progresso);
  } catch {
    // sem permissão agora: o próximo "sincronizar" resolve
  }
}

export interface ResultadoSincronia {
  trilhasRecebidas: string[];
  trilhasEnviadas: number;
  invalidas: string[];
}

/**
 * Sincroniza nos dois sentidos. Trilhas: a mais recente vence (a da pasta, se o navegador
 * não tiver a trilha); progresso: os históricos são somados e a agenda é refeita.
 */
export async function sincronizar(): Promise<ResultadoSincronia> {
  const raiz = await comPermissao(true);
  if (!raiz) throw new Error("Sem permissão para a pasta. Escolha a pasta de novo.");
  const pastaTrilhas = await subpasta(raiz, "trilhas");
  const pastaProgresso = await subpasta(raiz, "progresso");
  const r: ResultadoSincronia = { trilhasRecebidas: [], trilhasEnviadas: 0, invalidas: [] };

  for (const { nome, dados } of await lerJsons(pastaTrilhas)) {
    const lida = lerTrilha(dados);
    if (!lida.ok) {
      r.invalidas.push(nome);
      continue;
    }
    const local = await db.trilhas.get(lida.trilha.id);
    const itens = (t: Trilha) => t.meses.flatMap((m) => m.semanas).flatMap((s) => s.itens).length;
    // A da pasta entra quando é nova aqui, ou quando tem pelo menos tantos itens quanto a
    // daqui (o MCP gerou semanas novas); senão, a daqui vai para a pasta logo abaixo.
    const diferente = !local || JSON.stringify(local.trilha) !== JSON.stringify(lida.trilha);
    if (diferente && (!local || itens(lida.trilha) >= itens(local.trilha))) {
      await db.trilhas.put({ id: lida.trilha.id, trilha: lida.trilha, atualizadaEm: new Date().toISOString() });
      r.trilhasRecebidas.push(lida.trilha.titulo);
    }
  }
  for (const { dados } of await lerJsons(pastaProgresso)) {
    const externo = dados as Progresso;
    if (!externo?.trilhaId || !Array.isArray(externo.historico)) continue;
    const local = (await db.progresso.get(externo.trilhaId)) ?? progressoVazio(externo.trilhaId);
    await db.progresso.put(mesclarProgresso(local, externo));
  }
  for (const { trilha } of await db.trilhas.toArray()) {
    await gravar(pastaTrilhas, `${trilha.id}.json`, trilha);
    r.trilhasEnviadas++;
  }
  for (const p of await db.progresso.toArray()) await gravar(pastaProgresso, `${p.trilhaId}.json`, p);
  return r;
}
