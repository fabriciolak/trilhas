/**
 * Importa o devops_gym como uma trilha: os treinos viram uma aula (a AULA) mais uma prática
 * local; tickets e chefes viram práticas locais (o comando `gym <nome>` abre no terminal,
 * com a verificação automática de lá). A nota é dada pela pessoa, como no gym.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { TrilhaSchema, type Item, type Link, type Trilha } from "../esquema.ts";

const MESES: Record<number, { titulo: string; marco: string }> = {
  1: { titulo: "Linux: terminal, arquivos e texto", marco: "Vencer o chefe auditoria-da-madrugada e explicar pipes e redirecionamento." },
  2: { titulo: "Linux: usuários, processos, pacotes e shell script", marco: "Vencer o plantao-de-sexta; explicar SIGTERM x SIGKILL e permissões." },
  3: { titulo: "Serviços, redes e SSH", marco: "Vencer o servidor-em-chamas e diagnosticar um site fora do ar por camadas." },
  4: { titulo: "Containers: Docker e Compose", marco: "Vencer o compose-de-producao; subir um app com um comando." },
  5: { titulo: "Automação e nuvem: CI/CD, Ansible, Terraform e AWS", marco: "Vencer o deploy-sem-mao; nenhum passo manual no deploy." },
  6: { titulo: "Kubernetes, observabilidade e projeto final", marco: "Vencer a black-friday e contar a história do projeto numa entrevista." },
};

const RACIONAL =
  "A ordem segue o consenso dos mapas de carreira de DevOps (Linux → Git → shell → serviços e redes → containers → CI/CD → automação e IaC → nuvem → Kubernetes → observabilidade); os meses 1 a 3 seguem os objetivos do LPI Linux Essentials. Cada semana tem um treino guiado (aula + passos verificados), tickets de incidente e, no fim do mês, um chefe. A prática roda no seu computador, com o gym e o Docker: o site mostra as aulas e agenda as revisões.";

interface Documento {
  meta: Record<string, string>;
  titulo: string;
  secoes: Record<string, string>;
}

function lerDocumento(texto: string): Documento {
  const linhas = texto.replace(/\r\n/g, "\n").split("\n");
  const meta: Record<string, string> = {};
  let i = 0;
  if (linhas[0]?.trim() === "---") {
    for (i = 1; i < linhas.length && linhas[i]?.trim() !== "---"; i++) {
      const [chave, ...resto] = (linhas[i] ?? "").split(":");
      if (chave) meta[chave.trim()] = resto.join(":").trim();
    }
    i++;
  }
  const corpo = linhas.slice(i);
  const titulo = corpo.find((l) => l.startsWith("# "))?.slice(2).trim() ?? "";
  const secoes: Record<string, string[]> = {};
  let atual: string | undefined;
  for (const linha of corpo) {
    if (linha.startsWith("## ")) {
      atual = linha.slice(3).trim().toUpperCase();
      secoes[atual] = [];
    } else if (atual) {
      secoes[atual]?.push(linha);
    }
  }
  return { meta, titulo, secoes: Object.fromEntries(Object.entries(secoes).map(([k, v]) => [k, v.join("\n").trim()])) };
}

function perguntas(texto = ""): string[] {
  return texto
    .split("\n")
    .map((l) => l.replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean);
}

function links(texto = ""): Link[] {
  return texto
    .split("\n")
    .map((l) => l.replace(/^\s*-\s*/, "").trim())
    .flatMap((l) => {
      const m = /^(.*?):?\s*<?(https?:\/\/\S+?)>?\s*$/.exec(l);
      return m ? [{ titulo: (m[1] ?? "").replace(/[:,]\s*$/, "") || (m[2] ?? ""), url: m[2] ?? "", verificado: true }] : [];
    });
}

/** Lê pool/<tema>/<cenario>/ticket.md e monta a trilha. */
export async function importarDevopsGym(pastaGym: string): Promise<Trilha> {
  const pool = join(pastaGym, "pool");
  const itens: { mes: number; semana: number; ordem: number; chave: string; itens: Item[]; tituloSemana: string; tipo: string }[] = [];
  const ordemTipo: Record<string, number> = { treino: 0, ticket: 1, chefe: 2 };
  for (const tema of (await readdir(pool)).sort()) {
    let cenarios: string[] = [];
    try {
      cenarios = (await readdir(join(pool, tema))).sort();
    } catch {
      continue;
    }
    for (const cenario of cenarios) {
      let texto: string;
      try {
        texto = await readFile(join(pool, tema, cenario, "ticket.md"), "utf8");
      } catch {
        continue;
      }
      const doc = lerDocumento(texto);
      const nome = cenario.replace(/^\d+-/, "");
      const tipo = (doc.meta.tipo ?? "ticket") as "treino" | "ticket" | "chefe";
      const nivel = Math.min(3, Math.max(1, Number(doc.meta.nivel ?? 2))) as 1 | 2 | 3;
      const conceitos = (doc.meta.conceitos ?? "").split(",").map((c) => c.trim()).filter(Boolean);
      const palco = doc.meta.palco === "host" ? "no seu computador (Docker)" : "no laboratório (`gym lab`, em outro terminal)";
      const comuns = {
        nivel,
        conceitos,
        dicas: doc.secoes.COMANDOS ? [`Comandos em jogo: ${doc.secoes.COMANDOS}`] : [],
        perguntas: perguntas(doc.secoes.PERGUNTAS),
        estude: links(doc.secoes.ESTUDE),
        verificado: true,
      };
      const gerados: Item[] = [];
      if (doc.secoes.AULA) {
        gerados.push({ ...comuns, tipo: "aula", id: `${nome}-aula`, titulo: doc.titulo.replace(/^Treino:\s*/, "Aula: "), conteudo: doc.secoes.AULA, checagem: [] });
      }
      gerados.push({
        ...comuns,
        tipo: "local",
        id: nome,
        titulo: doc.titulo,
        enunciado: `${doc.secoes.TICKET ?? ""}\n\n---\nPratique ${palco}: \`gym ${nome}\`. A verificação automática fica no gym (tecla \`v\`); aqui, dê a sua nota.`,
        comando: `gym ${nome}`,
        origem: `devops_gym/pool/${tema}/${cenario}`,
        estilo: tipo,
      });
      itens.push({
        mes: Number(doc.meta.mes ?? 0),
        semana: Number(doc.meta.semana ?? 0),
        ordem: ordemTipo[tipo] ?? 1,
        chave: `${tema}/${cenario}`,
        itens: gerados,
        tituloSemana: doc.titulo.replace(/^Treino:\s*/, ""),
        tipo,
      });
    }
  }
  itens.sort((a, b) => a.mes - b.mes || a.semana - b.semana || a.ordem - b.ordem || a.chave.localeCompare(b.chave));

  const meses = [...new Set(itens.map((i) => i.mes))].map((numero) => {
    const doMes = itens.filter((i) => i.mes === numero);
    const semanas = [...new Set(doMes.map((i) => i.semana))].map((semana) => {
      const daSemana = doMes.filter((i) => i.semana === semana);
      const treino = daSemana.find((i) => i.tipo === "treino");
      const tema = treino
        ? treino.tituloSemana.replace(/^./, (c) => c.toUpperCase())
        : daSemana.every((i) => i.tipo === "chefe")
          ? `Consolidação e chefe: ${daSemana[0]?.tituloSemana ?? ""}`
          : (daSemana[0]?.tituloSemana ?? "");
      return { numero: semana, tema, objetivo: "", gerada: true, itens: daSemana.flatMap((i) => i.itens) };
    });
    return { numero, titulo: MESES[numero]?.titulo ?? `Mês ${numero}`, objetivo: "", marco: MESES[numero]?.marco ?? "", semanas };
  });

  return TrilhaSchema.parse({
    id: "devops-linux",
    titulo: "Linux e DevOps em 6 meses (devops_gym)",
    assunto: "Linux e DevOps",
    objetivo: "Chegar ao nível de uma vaga júnior de DevOps, SRE ou Cloud, com portfólio.",
    nivelInicial: "zero",
    horasPorSemana: 9,
    origem: "importada",
    criadaEm: "2026-09-30T00:00:00.000Z",
    racional: RACIONAL,
    meses,
  });
}
