import type { Exercicio, TrilhaEntrada } from "../src/esquema.ts";

export const exercicioSoma: Exercicio = {
  tipo: "exercicio",
  id: "soma",
  titulo: "Soma",
  nivel: 1,
  conceitos: ["funções"],
  dicas: [],
  perguntas: [],
  estude: [],
  verificado: false,
  enunciado: "Escreva `soma(a, b)`.",
  codigo: {
    template: "node",
    inicial: { "solucao.js": "export function soma(a, b) {\n  // TODO\n}\n" },
    solucao: { "solucao.js": "export function soma(a, b) {\n  return a + b;\n}\n" },
    testes: {
      "solucao.test.js":
        'import { test } from "node:test";\nimport assert from "node:assert/strict";\nimport { soma } from "./solucao.js";\n\ntest("soma dois positivos", () => {\n  assert.equal(soma(2, 3), 5);\n});\n\ntest("soma com negativo", () => {\n  assert.equal(soma(-2, 3), 1);\n});\n',
    },
    ocultos: {},
    abrir: "solucao.js",
  },
};

export function trilhaMinima(itens: TrilhaEntrada["meses"][number]["semanas"][number]["itens"] = [exercicioSoma]): TrilhaEntrada {
  return {
    id: "js-teste",
    titulo: "JS de teste",
    assunto: "JavaScript",
    meses: [
      {
        numero: 1,
        titulo: "Base",
        semanas: [
          {
            numero: 1,
            tema: "Funções",
            itens: [
              {
                tipo: "aula",
                id: "aula-funcoes",
                titulo: "Funções",
                nivel: 1,
                conteudo: "# Funções\n\n`function f() {}`",
              },
              ...itens,
            ],
          },
          { numero: 2, tema: "Arrays", gerada: false, itens: [] },
        ],
      },
    ],
  };
}
