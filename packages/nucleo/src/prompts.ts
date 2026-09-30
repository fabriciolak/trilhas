/**
 * Os prompts das trilhas. Ficam aqui (e não na interface) para o site, o MCP e a CLI
 * usarem os mesmos. A pedagogia é a do devops_gym: do básico ao máximo possível no
 * prazo, aula → prática → aplicação, um "chefe" por mês e repetição espaçada.
 */
import type { Item, Semana, Trilha } from "./esquema.ts";

export const PEDAGOGIA = `Princípios pedagógicos (siga todos):
- Do básico ao máximo possível no prazo: cada semana depende da anterior e sobe um pouco o nível.
- Toda semana tem o ciclo aprender → praticar → aplicar: primeiro uma "aula" curta com exemplos, depois
  exercícios pequenos, depois um desafio ou uma questão aberta. Nível 1 = básico, 2 = intermediário, 3 = avançado.
- Todo mês termina com um item "chefe" (nível 3) que combina o mês inteiro com um pouco dos meses anteriores.
- A última semana de cada mês consolida (revisão + chefe), sem tema novo.
- Carga realista: respeite as horas por semana informadas (uma aula leva ~30 min; um exercício, 20-40 min).
- Português do Brasil, frases curtas, exemplos concretos. Nada de enrolação.
- Prática antes de teoria longa. Explique o "porquê" em uma frase.
- Links em "estude": só fontes conhecidas e estáveis (documentação oficial, MDN, livros abertos).
  Marque "verificado": false em todos (quem estuda confere depois).`;

export const TIPOS_DE_ITEM = `Tipos de item e quando usar:
- aula: conteúdo em markdown (conceito + exemplos) e "checagem" com 1 a 3 questões rápidas.
- exercicio: código com testes automáticos (JavaScript/TypeScript/React).
- desafio: estilo LeetCode (dificuldade, tags, exemplos de entrada e saída, restrições, testes, editorial).
- quiz: questões de múltipla escolha (resposta = índice) ou resposta curta (resposta = texto).
- aberta: resposta em texto livre, corrigida pela IA com uma rubrica.
- projeto: algo maior, revisado pela IA com uma rubrica (pode ter código).
- local: prática fora do navegador (terminal, Docker, hardware...), com passo a passo; a pessoa dá a própria nota.
- chefe: o item do fim do mês (enunciado + rubrica, e código se couber).
Assuntos de programação JS/TS/React: use exercicio e desafio com código. Outros assuntos (idiomas, música,
história, DevOps no terminal...): use aula, quiz, aberta, local e projeto.`;

export const FORMATO_CODIGO = `Formato do campo "codigo" (itens com testes):
{"template": "node" | "vitest" | "react",
 "inicial": {"caminho": "conteúdo"},   // o que a pessoa recebe (esqueleto que NÃO passa nos testes)
 "solucao": {"caminho": "conteúdo"},   // arquivos que, por cima do inicial, passam em todos os testes
 "testes": {"caminho": "conteúdo"},    // testes visíveis
 "ocultos": {"caminho": "conteúdo"},   // testes extras (casos de borda), opcional
 "abrir": "caminho do arquivo principal"}
- template "node": JavaScript ESM puro. Testes em arquivos *.test.js com:
    import { test } from "node:test"; import assert from "node:assert/strict";
    import { funcao } from "./solucao.js";
  Sem "describe"; um "test" por caso, com nome em português.
- template "vitest": JS ou TS. Testes *.test.ts com: import { test, expect } from "vitest";
- template "react": componentes .jsx/.tsx testados com vitest + @testing-library/react (jsdom já configurado).
- O inicial precisa REPROVAR nos testes (ex.: a função devolve undefined ou lança "TODO").
- A solução precisa APROVAR. Os testes precisam ser determinísticos (sem rede, sem Date.now, sem aleatório).`;

const JSON_SO = `Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois e sem cercas de código.`;

export interface Briefing {
  assunto: string;
  objetivo: string;
  nivelInicial: "zero" | "basico" | "intermediario" | "avancado";
  horasPorSemana: number;
  semanas: number;
  observacoes?: string;
}

export function promptRoadmap(b: Briefing): { sistema: string; usuario: string } {
  const meses = Math.max(1, Math.round(b.semanas / 4.33));
  return {
    sistema: `Você monta roteiros de estudo guiados, como um mentor sênior que já ensinou o assunto muitas vezes.
${PEDAGOGIA}

${JSON_SO}`,
    usuario: `Monte o ROTEIRO (só o esboço, sem o conteúdo dos itens) de uma trilha de estudo.

Assunto: ${b.assunto}
Objetivo: ${b.objetivo || "(não informado)"}
Nível atual: ${b.nivelInicial}
Horas por semana: ${b.horasPorSemana}
Duração: ${b.semanas} semanas (${meses} ${meses === 1 ? "mês" : "meses"}, 4 a 5 semanas por mês)
${b.observacoes ? `Observações: ${b.observacoes}\n` : ""}
Formato (todas as semanas com "gerada": false e "itens": []):
{"id": "slug-curto-do-assunto", "titulo": "...", "assunto": ${JSON.stringify(b.assunto)}, "objetivo": "...",
 "nivelInicial": ${JSON.stringify(b.nivelInicial)}, "horasPorSemana": ${b.horasPorSemana}, "origem": "ia",
 "racional": "3 a 6 frases: como a sequência foi pensada, o que fica de fora e por quê, e até onde dá para chegar no prazo",
 "meses": [{"numero": 1, "titulo": "...", "objetivo": "...", "marco": "o que a pessoa consegue fazer no fim do mês",
   "semanas": [{"numero": 1, "tema": "...", "objetivo": "o que a pessoa sabe fazer no fim da semana", "gerada": false, "itens": []}]}]}
Numere as semanas de 1 a ${b.semanas}, contínuas entre os meses.`,
  };
}

export function promptSemana(trilha: Trilha, semana: Semana, contexto: { notas?: string } = {}): { sistema: string; usuario: string } {
  const esboco = trilha.meses
    .map((m) => `Mês ${m.numero}: ${m.titulo}\n${m.semanas.map((s) => `  Semana ${s.numero}: ${s.tema}`).join("\n")}`)
    .join("\n");
  const mes = trilha.meses.find((m) => m.semanas.some((s) => s.numero === semana.numero));
  const ultimaDoMes = mes ? mes.semanas[mes.semanas.length - 1]?.numero === semana.numero : false;
  return {
    sistema: `Você escreve o conteúdo de uma semana de uma trilha de estudo guiada.
${PEDAGOGIA}

${TIPOS_DE_ITEM}

${FORMATO_CODIGO}

${JSON_SO}`,
    usuario: `Trilha: ${trilha.titulo} (${trilha.assunto}). Nível inicial: ${trilha.nivelInicial}. ${trilha.horasPorSemana} h por semana.
Roteiro completo:
${esboco}

Escreva a SEMANA ${semana.numero}: "${semana.tema}". Objetivo: ${semana.objetivo || "(derive do tema)"}.
${ultimaDoMes ? `É a última semana do mês ${mes?.numero}: inclua o item "chefe" do mês (nível 3), que combina as semanas do mês.\n` : ""}${contexto.notas ? `Como a pessoa foi até aqui: ${contexto.notas}\nAjuste a dificuldade a isso.\n` : ""}
Entre 3 e 6 itens, começando por uma "aula". ids únicos no formato "s${semana.numero}-nome-curto".
Formato:
{"numero": ${semana.numero}, "tema": ${JSON.stringify(semana.tema)}, "objetivo": "...", "gerada": true,
 "itens": [ {"tipo": "aula", "id": "...", "titulo": "...", "nivel": 1, "conceitos": ["..."], "conteudo": "markdown",
             "checagem": [{"enunciado": "...", "opcoes": ["...", "..."], "resposta": 0, "explicacao": "..."}],
             "dicas": [], "perguntas": ["pergunta de entrevista"], "estude": [{"titulo": "...", "url": "https://...", "verificado": false}]},
            ... ]}`,
  };
}

/** Quando o validador reprova um item gerado: devolve os erros para a IA consertar. */
export function promptConsertar(item: Item, motivo: string, saida: string): { sistema: string; usuario: string } {
  return {
    sistema: `Você conserta itens de uma trilha de estudo que falharam na validação automática.
${FORMATO_CODIGO}

${JSON_SO}`,
    usuario: `Este item falhou na validação: ${motivo}

Saída dos testes (cortada):
${saida.slice(-3000)}

Item atual:
${JSON.stringify(item)}

Devolva o item inteiro corrigido (mesmo id e tipo). O inicial precisa reprovar; a solução, aprovar.`,
  };
}

export type ModoTutor = "dica" | "erro" | "revisao" | "sabatina" | "livre";

export const MODOS_TUTOR: Record<ModoTutor, string> = {
  dica: "Dica",
  erro: "Explique o erro",
  revisao: "Revise meu código",
  sabatina: "Me sabatine",
  livre: "Conversa livre",
};

export interface ContextoTutor {
  trilha?: Pick<Trilha, "titulo" | "assunto">;
  item?: Item;
  /** O código atual da pessoa. */
  arquivos?: Record<string, string>;
  /** A última saída dos testes. */
  saidaTestes?: string;
  /** Quantas dicas já foram dadas neste item. */
  dicasDadas?: number;
}

/** O resumo do item para o tutor: sem a solução nem o editorial (o tutor não entrega a resposta). */
export function resumoDoItem(item: Item): string {
  const partes = [`Item: ${item.titulo} (tipo ${item.tipo}, nível ${item.nivel})`];
  if ("enunciado" in item) partes.push(`Enunciado:\n${item.enunciado}`);
  if (item.tipo === "aula") partes.push(`Aula:\n${item.conteudo.slice(0, 4000)}`);
  if (item.tipo === "quiz") partes.push(`Questões:\n${item.questoes.map((q, i) => `${i + 1}. ${q.enunciado}`).join("\n")}`);
  if ("codigo" in item && item.codigo) {
    partes.push(`Testes visíveis:\n${Object.entries(item.codigo.testes).map(([k, v]) => `--- ${k}\n${v}`).join("\n")}`);
  }
  if (item.perguntas.length) partes.push(`Perguntas de entrevista do item:\n${item.perguntas.join("\n")}`);
  return partes.join("\n\n");
}

export function promptTutor(modo: ModoTutor, ctx: ContextoTutor): string {
  const regras: Record<ModoTutor, string> = {
    dica: `Dê UMA dica, em degraus: esta é a dica número ${(ctx.dicasDadas ?? 0) + 1}.
1ª: aponte a ideia ou o conceito a usar. 2ª: o caminho, sem código. 3ª em diante: um trecho mínimo, nunca a solução inteira.`,
    erro: `Explique o que a saída dos testes quer dizer e onde, no código da pessoa, está a causa provável.
Não reescreva o código inteiro: mostre só a linha ou o trecho que precisa mudar e explique por quê.`,
    revisao: `A pessoa já passou nos testes. Revise como um sênior gentil: legibilidade, casos de borda, complexidade
(em notação O quando fizer sentido) e uma sugestão de melhoria. Termine com um elogio sincero e específico.`,
    sabatina: `Faça UMA pergunta de entrevista por vez sobre o tema do item (use as perguntas do item se houver).
Espere a resposta, corrija com gentileza, aprofunde, e só então faça a próxima.`,
    livre: `Responda a dúvida. Se for sobre o exercício, não entregue a solução completa: ensine a chegar lá.`,
  };
  const partes = [
    `Você é o tutor da trilha${ctx.trilha ? ` "${ctx.trilha.titulo}" (${ctx.trilha.assunto})` : ""}. Fale em português do Brasil,
de forma curta e direta, como um mentor paciente. Use markdown. Modo: ${MODOS_TUTOR[modo]}.
${regras[modo]}`,
  ];
  if (ctx.item) partes.push(resumoDoItem(ctx.item));
  if (ctx.arquivos && Object.keys(ctx.arquivos).length) {
    partes.push(`Código atual da pessoa:\n${Object.entries(ctx.arquivos).map(([k, v]) => `--- ${k}\n${v}`).join("\n")}`);
  }
  if (ctx.saidaTestes) partes.push(`Última saída dos testes:\n${ctx.saidaTestes.slice(-3000)}`);
  return partes.join("\n\n");
}

/** Correção de resposta aberta (ou projeto) por rubrica. */
export function promptRubrica(enunciado: string, rubrica: string[], resposta: string): { sistema: string; usuario: string } {
  return {
    sistema: `Você corrige respostas de estudantes com uma rubrica, com rigor e gentileza, em português do Brasil.
${JSON_SO}`,
    usuario: `Enunciado:
${enunciado}

Rubrica (cada critério vale 1 ponto):
${rubrica.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Resposta da pessoa:
${resposta}

Formato: {"criterios": [{"criterio": "...", "atendido": true, "comentario": "..."}], "nota": 0-100, "resumo": "2 a 4 frases com o que melhorar"}`,
  };
}

/** O texto que vai para o claude.ai ("Abrir no Claude"): contexto do item, sem a solução. */
export function textoParaClaude(ctx: ContextoTutor, pedido: string): string {
  const partes = [
    `Estou estudando${ctx.trilha ? ` "${ctx.trilha.titulo}"` : ""} numa trilha guiada. Seja meu tutor: não me dê a solução completa, me ajude a chegar lá.`,
  ];
  if (ctx.item) partes.push(resumoDoItem(ctx.item));
  if (ctx.arquivos && Object.keys(ctx.arquivos).length) {
    partes.push(`Meu código:\n${Object.entries(ctx.arquivos).map(([k, v]) => `--- ${k}\n${v}`).join("\n")}`);
  }
  if (ctx.saidaTestes) partes.push(`Saída dos testes:\n${ctx.saidaTestes.slice(-2000)}`);
  partes.push(pedido);
  return partes.join("\n\n");
}

/** Link do claude.ai com o texto já no campo (limite prudente de tamanho de URL). */
export function linkAbrirNoClaude(texto: string, limite = 6000): { url: string; cortado: boolean } {
  const cortado = texto.length > limite;
  const final = cortado ? `${texto.slice(0, limite)}\n\n(contexto cortado)` : texto;
  return { url: `https://claude.ai/new?q=${encodeURIComponent(final)}`, cortado };
}
