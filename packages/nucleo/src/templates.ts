/**
 * Os ambientes em que o código dos itens roda. O mesmo template serve para o navegador
 * (WebContainer) e para o validador local (Node): arquivos de base, dependências e o
 * comando de teste.
 */
import type { Arquivos, Template } from "./esquema.ts";

export interface DefinicaoTemplate {
  /** Arquivos de base, que o item pode sobrescrever. */
  base: Arquivos;
  /** Precisa de `npm install` antes do primeiro teste? */
  instalar: boolean;
  /** O comando de teste: programa e argumentos. */
  comando: [string, ...string[]];
  /** Onde o comando grava o resultado detalhado (lido depois), quando grava. */
  relatorio?: string;
}

const pacote = (dependencias: Record<string, string> = {}) =>
  JSON.stringify(
    { name: "exercicio", private: true, type: "module", devDependencies: dependencias },
    null,
    2,
  ) + "\n";

export const TEMPLATES: Record<Template, DefinicaoTemplate> = {
  node: {
    base: { "package.json": pacote() },
    instalar: false,
    comando: ["node", "--test", "--test-reporter=tap"],
  },
  vitest: {
    base: {
      "package.json": pacote({ vitest: "3.2.4" }),
      "vitest.config.js": "export default { test: { include: ['**/*.test.{js,ts}'] } };\n",
    },
    instalar: true,
    comando: ["npx", "vitest", "run", "--reporter=json", "--outputFile=.resultado.json"],
    relatorio: ".resultado.json",
  },
  react: {
    base: {
      "package.json": pacote({
        vitest: "3.2.4",
        jsdom: "26.1.0",
        react: "19.1.0",
        "react-dom": "19.1.0",
        "@testing-library/react": "16.3.0",
        "@testing-library/dom": "10.4.0",
      }),
      "vitest.config.js":
        "export default { esbuild: { jsx: 'automatic' }, test: { environment: 'jsdom', include: ['**/*.test.{js,jsx,ts,tsx}'] } };\n",
    },
    instalar: true,
    comando: ["npx", "vitest", "run", "--reporter=json", "--outputFile=.resultado.json"],
    relatorio: ".resultado.json",
  },
};

export interface ResultadoTeste {
  nome: string;
  passou: boolean;
  mensagem?: string;
}

/** Lê a saída TAP do `node --test`. */
export function lerTap(saida: string): ResultadoTeste[] {
  const linhas = saida.split(/\r?\n/);
  const resultados: ResultadoTeste[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const m = /^(\s*)(not )?ok \d+ - (.+?)(?:\s+#.*)?$/.exec(linhas[i] ?? "");
    if (!m) continue;
    // O node --test também imprime uma linha por arquivo ou "describe": ela vem com
    // "type: 'suite'" (ou é o próprio arquivo) no bloco YAML logo abaixo.
    const bloco: string[] = [];
    for (let j = i + 1; j < linhas.length && !/^\s*(not )?ok \d+ - /.test(linhas[j] ?? ""); j++) {
      bloco.push(linhas[j] ?? "");
      if (/^\s*\.\.\.\s*$/.test(linhas[j] ?? "")) break;
    }
    const texto = bloco.join("\n");
    if (/type: 'suite'/.test(texto) || /\.(test|spec)\.[cm]?js$/.test(m[3] ?? "")) continue;
    const erro = /error: \|-?\s*\n\s*(.+)|error: '([^']*)'/.exec(texto);
    resultados.push({ nome: m[3] ?? "", passou: !m[2], mensagem: erro ? (erro[1] ?? erro[2]) : undefined });
  }
  return resultados;
}

interface RelatorioVitest {
  testResults?: { assertionResults?: { fullName?: string; title?: string; status?: string; failureMessages?: string[] }[] }[];
}

/** Lê o relatório JSON do Vitest (--reporter=json). */
export function lerRelatorioVitest(json: string): ResultadoTeste[] {
  let dados: RelatorioVitest;
  try {
    dados = JSON.parse(json) as RelatorioVitest;
  } catch {
    return [];
  }
  return (dados.testResults ?? []).flatMap((arquivo) =>
    (arquivo.assertionResults ?? []).map((t) => ({
      nome: t.fullName ?? t.title ?? "(sem nome)",
      passou: t.status === "passed",
      mensagem: t.failureMessages?.[0]?.split("\n")[0],
    })),
  );
}

/** Junta os arquivos na ordem: base do template, depois cada camada por cima. */
export function montarArquivos(template: Template, ...camadas: Arquivos[]): Arquivos {
  return Object.assign({}, TEMPLATES[template].base, ...camadas);
}
