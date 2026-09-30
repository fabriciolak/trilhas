/**
 * Executor local (Node): roda os testes de um item numa pasta temporária. É o que a CLI e o
 * servidor MCP usam; no navegador, quem faz isso é o WebContainer.
 *
 * Templates com dependências (vitest, react) instalam uma vez numa pasta de cache e
 * reaproveitam o node_modules por link simbólico.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Arquivos, Template } from "../esquema.ts";
import { lerRelatorioVitest, lerTap, TEMPLATES } from "../templates.ts";
import type { ExecucaoTestes, Executor } from "../validador.ts";

export interface OpcoesExecutorNode {
  /** Onde ficam as dependências instaladas de cada template. */
  cache?: string;
  tempoLimiteMs?: number;
}

function rodarProcesso(
  comando: string,
  args: string[],
  cwd: string,
  tempoLimiteMs: number,
  sinal?: AbortSignal,
): Promise<{ codigo: number; saida: string }> {
  return new Promise((resolver) => {
    const filho = spawn(comando, args, {
      cwd,
      env: { ...process.env, CI: "1", FORCE_COLOR: "0", NO_COLOR: "1" },
      shell: process.platform === "win32",
    });
    let saida = "";
    const juntar = (d: Buffer) => {
      saida += d.toString();
    };
    filho.stdout.on("data", juntar);
    filho.stderr.on("data", juntar);
    const relogio = setTimeout(() => {
      saida += `\n(tempo esgotado: ${tempoLimiteMs / 1000} s)\n`;
      filho.kill("SIGKILL");
    }, tempoLimiteMs);
    sinal?.addEventListener("abort", () => filho.kill("SIGKILL"), { once: true });
    filho.on("close", (codigo) => {
      clearTimeout(relogio);
      resolver({ codigo: codigo ?? 1, saida });
    });
    filho.on("error", (erro) => {
      clearTimeout(relogio);
      resolver({ codigo: 127, saida: `${saida}\n${erro.message}` });
    });
  });
}

async function existe(caminho: string): Promise<boolean> {
  try {
    await access(caminho);
    return true;
  } catch {
    return false;
  }
}

export async function escreverArquivos(pasta: string, arquivos: Arquivos): Promise<void> {
  for (const [caminho, conteudo] of Object.entries(arquivos)) {
    if (caminho.includes("..") || caminho.startsWith("/")) throw new Error(`caminho inválido: ${caminho}`);
    const destino = join(pasta, caminho);
    await mkdir(dirname(destino), { recursive: true });
    await writeFile(destino, conteudo);
  }
}

export function criarExecutorNode(opcoes: OpcoesExecutorNode = {}): Executor {
  const cache = opcoes.cache ?? join(homedir(), ".cache", "trilhas", "templates");
  const tempoLimiteMs = opcoes.tempoLimiteMs ?? 180_000;
  const instalando = new Map<string, Promise<string>>();

  async function dependencias(template: Template, pacote: string): Promise<string> {
    const hash = createHash("sha256").update(pacote).digest("hex").slice(0, 12);
    const pasta = join(cache, `${template}-${hash}`);
    let pronto = instalando.get(pasta);
    if (!pronto) {
      pronto = (async () => {
        if (!(await existe(join(pasta, "node_modules", ".bin")))) {
          await mkdir(pasta, { recursive: true });
          await writeFile(join(pasta, "package.json"), pacote);
          const r = await rodarProcesso("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], pasta, 600_000);
          if (r.codigo !== 0) throw new Error(`npm install falhou para o template ${template}:\n${r.saida}`);
        }
        return join(pasta, "node_modules");
      })();
      instalando.set(pasta, pronto);
    }
    return pronto;
  }

  return {
    async rodar(template, arquivos, extra): Promise<ExecucaoTestes> {
      const def = TEMPLATES[template];
      const pasta = await mkdtemp(join(tmpdir(), "trilhas-"));
      try {
        await escreverArquivos(pasta, arquivos);
        let [comando, ...args] = def.comando;
        if (def.instalar) {
          const modulos = await dependencias(template, arquivos["package.json"] ?? def.base["package.json"] ?? "{}");
          await symlink(modulos, join(pasta, "node_modules"), "dir");
          if (comando === "npx" && args[0]) {
            comando = join(pasta, "node_modules", ".bin", args[0]);
            args = args.slice(1);
          }
        }
        const r = await rodarProcesso(comando, args, pasta, tempoLimiteMs, extra?.sinal);
        let testes = lerTap(r.saida);
        if (def.relatorio) {
          const relatorio = await readFile(join(pasta, def.relatorio), "utf8").catch(() => "");
          testes = lerRelatorioVitest(relatorio);
        }
        return { ok: r.codigo === 0, codigo: r.codigo, saida: r.saida, testes };
      } finally {
        await rm(pasta, { recursive: true, force: true });
      }
    },
  };
}
