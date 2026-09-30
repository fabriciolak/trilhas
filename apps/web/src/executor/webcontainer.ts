/**
 * O executor do navegador: um Node de verdade rodando dentro da página (WebContainer).
 * Cada template tem a sua pasta; as dependências (vitest, react...) são instaladas uma vez
 * por sessão, e cada execução troca só os arquivos do exercício.
 */
import { lerRelatorioVitest, lerTap, TEMPLATES, type Arquivos, type ExecucaoTestes, type Executor, type Template } from "@trilhas/nucleo";
import type { WebContainer, WebContainerProcess } from "@webcontainer/api";

export type Ouvinte = (pedaco: string) => void;

const ANSI = /\x1b\[[0-9;?]*[A-Za-z]|\x1b\][^\x07]*\x07/g;
export const semAnsi = (texto: string) => texto.replace(ANSI, "").replace(/\r(?!\n)/g, "");

let instancia: Promise<WebContainer> | undefined;

export function suportaWebContainer(): { ok: boolean; motivo?: string } {
  if (typeof window === "undefined") return { ok: false, motivo: "fora do navegador" };
  if (!window.crossOriginIsolated) {
    return { ok: false, motivo: "a página não está isolada (faltam os cabeçalhos COOP/COEP no servidor)" };
  }
  if (typeof SharedArrayBuffer === "undefined") return { ok: false, motivo: "o navegador não tem SharedArrayBuffer" };
  return { ok: true };
}

const LIMITE_BOOT_MS = 60_000;

export function iniciarWebContainer(): Promise<WebContainer> {
  instancia ??= Promise.race([
    import("@webcontainer/api").then(({ WebContainer }) => WebContainer.boot({ coep: "require-corp", workdirName: "trilhas" })),
    new Promise<never>((_, rejeitar) =>
      setTimeout(
        () =>
          rejeitar(
            new Error(
              "Não consegui ligar o Node no navegador em 60 s. O WebContainer precisa acessar stackblitz.com: confira a internet, bloqueadores de anúncio e a rede da empresa, e recarregue a página.",
            ),
          ),
        LIMITE_BOOT_MS,
      ),
    ),
  ]);
  instancia.catch(() => {
    instancia = undefined;
  });
  return instancia;
}

async function acompanhar(processo: WebContainerProcess, ouvinte?: Ouvinte): Promise<{ codigo: number; saida: string }> {
  let saida = "";
  void processo.output.pipeTo(
    new WritableStream({
      write(pedaco) {
        saida += pedaco;
        ouvinte?.(pedaco);
      },
    }),
  );
  const codigo = await processo.exit;
  return { codigo, saida: semAnsi(saida) };
}

export function criarExecutorWebContainer(opcoes: { aoEscrever?: Ouvinte; aoMudarEtapa?: (etapa: string) => void } = {}): Executor & {
  pasta(template: Template): string;
} {
  const instalados = new Map<string, Promise<void>>();
  const escritos = new Map<Template, Set<string>>();

  async function preparar(wc: WebContainer, template: Template, pacote: string): Promise<void> {
    const pasta = template;
    const chave = `${template}:${pacote}`;
    let pronto = instalados.get(chave);
    if (!pronto) {
      pronto = (async () => {
        await wc.fs.mkdir(pasta, { recursive: true });
        await wc.fs.writeFile(`${pasta}/package.json`, pacote);
        if (TEMPLATES[template].instalar) {
          opcoes.aoMudarEtapa?.("Instalando as dependências (só na primeira vez)...");
          const r = await acompanhar(await wc.spawn("npm", ["install", "--no-audit", "--no-fund"], { cwd: pasta }), opcoes.aoEscrever);
          if (r.codigo !== 0) throw new Error(`npm install falhou:\n${r.saida.slice(-2000)}`);
        }
      })();
      instalados.set(chave, pronto);
      pronto.catch(() => instalados.delete(chave));
    }
    return pronto;
  }

  return {
    pasta: (template) => template,
    async rodar(template: Template, arquivos: Arquivos): Promise<ExecucaoTestes> {
      const def = TEMPLATES[template];
      opcoes.aoMudarEtapa?.("Ligando o Node no navegador...");
      const wc = await iniciarWebContainer();
      const pacote = arquivos["package.json"] ?? def.base["package.json"] ?? "{}";
      await preparar(wc, template, pacote);

      // Tira os arquivos do exercício anterior e escreve os deste.
      const anteriores = escritos.get(template) ?? new Set<string>();
      for (const caminho of anteriores) {
        if (!(caminho in arquivos)) await wc.fs.rm(`${template}/${caminho}`, { force: true });
      }
      for (const [caminho, conteudo] of Object.entries(arquivos)) {
        if (caminho === "package.json") continue;
        const partes = caminho.split("/");
        if (partes.length > 1) await wc.fs.mkdir(`${template}/${partes.slice(0, -1).join("/")}`, { recursive: true });
        await wc.fs.writeFile(`${template}/${caminho}`, conteudo);
      }
      escritos.set(template, new Set(Object.keys(arquivos)));
      if (def.relatorio) await wc.fs.rm(`${template}/${def.relatorio}`, { force: true });

      opcoes.aoMudarEtapa?.("Rodando os testes...");
      const [comando, ...args] = def.comando;
      const r = await acompanhar(await wc.spawn(comando, args, { cwd: template, env: { CI: "1", FORCE_COLOR: "0" } }), opcoes.aoEscrever);
      let testes = lerTap(r.saida);
      if (def.relatorio) {
        const relatorio = await wc.fs.readFile(`${template}/${def.relatorio}`, "utf-8").catch(() => "");
        testes = lerRelatorioVitest(relatorio);
      }
      return { ok: r.codigo === 0, codigo: r.codigo, saida: r.saida, testes };
    },
  };
}
