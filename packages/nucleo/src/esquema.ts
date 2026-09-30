/**
 * O formato de uma trilha (JSON), validado com zod.
 *
 * Trilha → meses → semanas → itens. Os itens seguem a mesma pedagogia do devops_gym:
 * aprender (aula), praticar (exercício, quiz), aplicar (desafio, aberta, local) e, no fim
 * do mês, combinar (chefe). Tudo o que tem código traz testes: o inicial precisa reprovar e
 * a solução, aprovar (ver validador.ts).
 */
import { z } from "zod";

export const FORMATO = "trilhas/1";

const idValido = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*$/, "use só letras minúsculas, números e hífen (ex.: soma-de-arrays)");

export const NivelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type Nivel = z.infer<typeof NivelSchema>;

export const LinkSchema = z.object({
  titulo: z.string().min(1),
  url: z.url(),
  /** false: sugerido pela IA e ainda não conferido por uma pessoa. */
  verificado: z.boolean().default(false),
});
export type Link = z.infer<typeof LinkSchema>;

/** Caminho do arquivo → conteúdo. */
export const ArquivosSchema = z.record(z.string(), z.string());
export type Arquivos = z.infer<typeof ArquivosSchema>;

/**
 * Como os testes rodam:
 * - node:   JavaScript puro com o executor de testes do próprio Node (node --test). Sem instalar nada.
 * - vitest: JavaScript ou TypeScript com o Vitest.
 * - react:  componentes React com o Vitest, jsdom e Testing Library.
 */
export const TemplateSchema = z.enum(["node", "vitest", "react"]);
export type Template = z.infer<typeof TemplateSchema>;

export const CodigoSchema = z.object({
  template: TemplateSchema,
  /** O que a pessoa recebe para editar. */
  inicial: ArquivosSchema,
  /** Arquivos que, por cima do inicial, resolvem o item. */
  solucao: ArquivosSchema,
  /** Testes que a pessoa vê e roda com "Executar". */
  testes: ArquivosSchema,
  /** Testes a mais, rodados só no "Enviar" (continuam legíveis: é autoestudo). */
  ocultos: ArquivosSchema.default({}),
  /** O arquivo que abre no editor. */
  abrir: z.string(),
});
export type Codigo = z.infer<typeof CodigoSchema>;

const base = {
  id: idValido,
  titulo: z.string().min(1),
  nivel: NivelSchema,
  conceitos: z.array(z.string()).default([]),
  /** Dicas em degraus: da mais vaga à mais direta. */
  dicas: z.array(z.string()).default([]),
  /** Perguntas de entrevista sobre o tema. */
  perguntas: z.array(z.string()).default([]),
  estude: z.array(LinkSchema).default([]),
  /** true: o validador confirmou que o inicial reprova e a solução aprova. */
  verificado: z.boolean().default(false),
};

export const QuestaoSchema = z.object({
  enunciado: z.string().min(1),
  /** Com opções: múltipla escolha (resposta = índice). Sem opções: resposta curta (texto). */
  opcoes: z.array(z.string()).min(2).optional(),
  resposta: z.union([z.number().int().min(0), z.string().min(1)]),
  explicacao: z.string().default(""),
});
export type Questao = z.infer<typeof QuestaoSchema>;

export const ExemploSchema = z.object({
  entrada: z.string(),
  saida: z.string(),
  explicacao: z.string().optional(),
});

export const AulaSchema = z.object({
  ...base,
  tipo: z.literal("aula"),
  /** Markdown. */
  conteudo: z.string().min(1),
  /** Mini-checagem no fim da aula. */
  checagem: z.array(QuestaoSchema).default([]),
});

export const ExercicioSchema = z.object({
  ...base,
  tipo: z.literal("exercicio"),
  enunciado: z.string().min(1),
  codigo: CodigoSchema,
});

export const DesafioSchema = z.object({
  ...base,
  tipo: z.literal("desafio"),
  enunciado: z.string().min(1),
  dificuldade: z.enum(["facil", "medio", "dificil"]),
  tags: z.array(z.string()).default([]),
  exemplos: z.array(ExemploSchema).default([]),
  restricoes: z.array(z.string()).default([]),
  codigo: CodigoSchema,
  /** Explicação da solução, para depois de resolver. */
  editorial: z.string().default(""),
});

export const ProjetoSchema = z.object({
  ...base,
  tipo: z.literal("projeto"),
  enunciado: z.string().min(1),
  codigo: CodigoSchema.optional(),
  /** Critérios que a IA usa para revisar. */
  rubrica: z.array(z.string()).min(1),
});

export const QuizSchema = z.object({
  ...base,
  tipo: z.literal("quiz"),
  questoes: z.array(QuestaoSchema).min(1),
});

export const AbertaSchema = z.object({
  ...base,
  tipo: z.literal("aberta"),
  enunciado: z.string().min(1),
  rubrica: z.array(z.string()).min(1),
});

/** Prática fora do navegador (ex.: um item do devops_gym). A nota é dada pela pessoa. */
export const LocalSchema = z.object({
  ...base,
  tipo: z.literal("local"),
  enunciado: z.string().min(1),
  /** O comando que abre a prática (ex.: "gym treino-pipes"). */
  comando: z.string().optional(),
  /** De onde veio (ex.: "devops_gym/pool/03-texto/00-treino-pipes"). */
  origem: z.string().optional(),
  /** Tipo original, quando importado (treino, ticket, chefe). */
  estilo: z.enum(["treino", "ticket", "chefe"]).optional(),
});

export const ChefeSchema = z.object({
  ...base,
  tipo: z.literal("chefe"),
  enunciado: z.string().min(1),
  codigo: CodigoSchema.optional(),
  rubrica: z.array(z.string()).default([]),
});

export const ItemSchema = z.discriminatedUnion("tipo", [
  AulaSchema,
  ExercicioSchema,
  DesafioSchema,
  ProjetoSchema,
  QuizSchema,
  AbertaSchema,
  LocalSchema,
  ChefeSchema,
]);
export type Item = z.infer<typeof ItemSchema>;
export type TipoItem = Item["tipo"];
export type Aula = z.infer<typeof AulaSchema>;
export type Exercicio = z.infer<typeof ExercicioSchema>;
export type Desafio = z.infer<typeof DesafioSchema>;
export type Projeto = z.infer<typeof ProjetoSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type Aberta = z.infer<typeof AbertaSchema>;
export type Local = z.infer<typeof LocalSchema>;
export type Chefe = z.infer<typeof ChefeSchema>;

export const SemanaSchema = z.object({
  numero: z.number().int().min(1),
  tema: z.string().min(1),
  objetivo: z.string().default(""),
  /** false: só o esboço (tema e objetivo); o conteúdo é gerado quando a semana abre. */
  gerada: z.boolean().default(true),
  itens: z.array(ItemSchema).default([]),
});
export type Semana = z.infer<typeof SemanaSchema>;

export const MesSchema = z.object({
  numero: z.number().int().min(1),
  titulo: z.string().min(1),
  objetivo: z.string().default(""),
  /** O que a pessoa consegue fazer no fim do mês. */
  marco: z.string().default(""),
  semanas: z.array(SemanaSchema).min(1),
});
export type Mes = z.infer<typeof MesSchema>;

export const TrilhaSchema = z
  .object({
    formato: z.literal(FORMATO).default(FORMATO),
    id: idValido,
    titulo: z.string().min(1),
    /** O que a pessoa quer aprender, com as palavras dela. */
    assunto: z.string().min(1),
    /** Para quê (vaga, projeto, curiosidade). */
    objetivo: z.string().default(""),
    nivelInicial: z.enum(["zero", "basico", "intermediario", "avancado"]).default("zero"),
    horasPorSemana: z.number().positive().default(8),
    idioma: z.string().default("pt-BR"),
    origem: z.enum(["ia", "manual", "importada"]).default("manual"),
    criadaEm: z.string().default(() => new Date().toISOString()),
    /** Como a sequência foi pensada (a IA explica o roteiro aqui). */
    racional: z.string().default(""),
    meses: z.array(MesSchema).min(1),
  })
  .superRefine((trilha, ctx) => {
    const vistos = new Set<string>();
    for (const mes of trilha.meses) {
      for (const semana of mes.semanas) {
        for (const item of semana.itens) {
          if (vistos.has(item.id)) {
            ctx.addIssue({ code: "custom", message: `id repetido: ${item.id}`, path: ["meses"] });
          }
          vistos.add(item.id);
        }
      }
    }
  });
export type Trilha = z.infer<typeof TrilhaSchema>;
export type TrilhaEntrada = z.input<typeof TrilhaSchema>;

/** Onde um item está dentro da trilha. */
export interface Posicao {
  mes: number;
  semana: number;
  item: Item;
}

export function itensDaTrilha(trilha: Trilha): Posicao[] {
  return trilha.meses.flatMap((mes) =>
    mes.semanas.flatMap((semana) => semana.itens.map((item) => ({ mes: mes.numero, semana: semana.numero, item }))),
  );
}

export function acharItem(trilha: Trilha, id: string): Posicao | undefined {
  return itensDaTrilha(trilha).find((p) => p.item.id === id);
}

export function temCodigo(item: Item): item is Item & { codigo: Codigo } {
  return "codigo" in item && item.codigo !== undefined;
}

/** Lê e valida uma trilha; devolve os erros em português, um por linha. */
export function lerTrilha(dados: unknown): { ok: true; trilha: Trilha } | { ok: false; erros: string[] } {
  const r = TrilhaSchema.safeParse(dados);
  if (r.success) return { ok: true, trilha: r.data };
  return {
    ok: false,
    erros: r.error.issues.map((i) => `${i.path.length ? i.path.join(".") : "(raiz)"}: ${i.message}`),
  };
}
