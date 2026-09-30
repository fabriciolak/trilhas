/**
 * trilhas: a linha de comando das trilhas.
 *
 *   trilhas validar <trilha.json>... [--gravar]   inicial reprova e solução aprova, em cada item com código
 *   trilhas importar-gym <pasta do devops_gym> [-o saida.json]
 */
import { readFile, writeFile } from "node:fs/promises";
import { lerTrilha, marcarVerificados, validarTrilha } from "@trilhas/nucleo";
import { criarExecutorNode, importarDevopsGym } from "@trilhas/nucleo/node";

const cor = process.stdout.isTTY && !process.env.NO_COLOR;
const verde = (s: string) => (cor ? `\x1b[32m${s}\x1b[0m` : s);
const vermelho = (s: string) => (cor ? `\x1b[31m${s}\x1b[0m` : s);
const fraco = (s: string) => (cor ? `\x1b[2m${s}\x1b[0m` : s);

const AJUDA = `trilhas: valida e importa trilhas de estudo

  trilhas validar <trilha.json>... [--gravar]
      Confere o esquema e roda os testes de cada item com código: o inicial precisa
      reprovar e a solução, aprovar. Com --gravar, marca "verificado" no arquivo.

  trilhas importar-gym <pasta do devops_gym> [-o saida.json]
      Converte os treinos, tickets e chefes do devops_gym numa trilha.
`;

async function validar(args: string[]): Promise<number> {
  const gravar = args.includes("--gravar");
  const arquivos = args.filter((a) => !a.startsWith("--"));
  if (arquivos.length === 0) {
    process.stderr.write(AJUDA);
    return 2;
  }
  const executor = criarExecutorNode();
  let falhas = 0;
  for (const arquivo of arquivos) {
    console.log(`\n${arquivo}`);
    let dados: unknown;
    try {
      dados = JSON.parse(await readFile(arquivo, "utf8"));
    } catch (e) {
      console.log(`  ${vermelho("✘")} não consegui ler o JSON: ${(e as Error).message}`);
      falhas++;
      continue;
    }
    const lida = lerTrilha(dados);
    if (!lida.ok) {
      console.log(`  ${vermelho("✘")} o arquivo não segue o esquema:`);
      for (const erro of lida.erros.slice(0, 20)) console.log(`      ${erro}`);
      falhas++;
      continue;
    }
    console.log(`  ${verde("✔")} esquema ok: ${lida.trilha.titulo}`);
    const inicio = Date.now();
    const resultados = await validarTrilha(lida.trilha, executor, (r) => {
      if (r.ok) {
        console.log(`  ${verde("✔")} ${r.itemId} ${fraco(`(${r.solucao?.testes.length ?? 0} testes)`)}`);
      } else {
        console.log(`  ${vermelho("✘")} ${r.itemId}: ${r.motivo}`);
        const saida = (r.solucao?.saida || r.inicial?.saida || "").trim();
        if (saida) console.log(fraco(saida.split("\n").slice(-15).map((l) => `      ${l}`).join("\n")));
      }
    });
    const ruins = resultados.filter((r) => !r.ok).length;
    falhas += ruins;
    console.log(`  ${resultados.length - ruins} de ${resultados.length} itens com código passaram ${fraco(`(${((Date.now() - inicio) / 1000).toFixed(1)} s)`)}`);
    if (gravar) {
      await writeFile(arquivo, JSON.stringify(marcarVerificados(lida.trilha, resultados), null, 2) + "\n");
      console.log(`  ${fraco("verificado gravado no arquivo")}`);
    }
  }
  return falhas === 0 ? 0 : 1;
}

async function importarGym(args: string[]): Promise<number> {
  const pasta = args.find((a) => !a.startsWith("-"));
  const i = args.indexOf("-o");
  const saida = i >= 0 ? args[i + 1] : undefined;
  if (!pasta) {
    process.stderr.write(AJUDA);
    return 2;
  }
  const trilha = await importarDevopsGym(pasta);
  const json = JSON.stringify(trilha, null, 2) + "\n";
  if (saida) {
    await writeFile(saida, json);
    const n = trilha.meses.flatMap((m) => m.semanas).flatMap((s) => s.itens).length;
    console.log(`${verde("✔")} ${saida}: ${trilha.meses.length} meses, ${n} itens`);
  } else {
    process.stdout.write(json);
  }
  return 0;
}

async function main(argv: string[]): Promise<number> {
  const [comando, ...args] = argv;
  if (comando === "validar") return validar(args);
  if (comando === "importar-gym") return importarGym(args);
  process.stdout.write(AJUDA);
  return comando && !["-h", "--help", "ajuda"].includes(comando) ? 2 : 0;
}

main(process.argv.slice(2)).then(
  (codigo) => process.exit(codigo),
  (erro) => {
    console.error(vermelho(`erro: ${(erro as Error).message}`));
    process.exit(1);
  },
);
