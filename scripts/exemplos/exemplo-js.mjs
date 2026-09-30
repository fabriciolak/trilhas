// Fonte da trilha de exemplo (trilhas/exemplo-js.json). É escrita à mão, validada pelo
// `trilhas validar` e serve também de exemplo para a IA e de teste para o site.
//   node scripts/exemplos/exemplo-js.mjs > trilhas/exemplo-js.json
const t = (nome, corpo) => `test(${JSON.stringify(nome)}, () => {\n${corpo}\n});\n`;
const nodeTeste = (importacao, casos) =>
  `import { test } from "node:test";\nimport assert from "node:assert/strict";\n${importacao}\n\n${casos.join("\n")}`;

const base = { conceitos: [], dicas: [], perguntas: [], estude: [], verificado: false };

const trilha = {
  formato: "trilhas/1",
  id: "exemplo-js",
  titulo: "JavaScript do zero (trilha de exemplo)",
  assunto: "JavaScript, TypeScript e React",
  objetivo: "Mostrar como uma trilha funciona: aula, exercício, desafio, quiz, resposta aberta, prática local e chefe.",
  nivelInicial: "zero",
  horasPorSemana: 4,
  idioma: "pt-BR",
  origem: "manual",
  criadaEm: "2026-09-30T00:00:00.000Z",
  racional:
    "Um mês curto que passa por toda a base: variáveis e funções, arrays, TypeScript com testes e um primeiro componente React. Cada semana começa numa aula, pratica com exercícios de código testados no navegador e termina aplicando num desafio ou numa resposta aberta. A última semana consolida com um chefe. Ficam de fora assincronia, módulos e ferramentas de build, que são o próximo mês de uma trilha de verdade.",
  meses: [
    {
      numero: 1,
      titulo: "A base do JavaScript moderno",
      objetivo: "Escrever funções pequenas, trabalhar com arrays e montar um componente React testado.",
      marco: "Você resolve o chefe do carrinho sozinho e explica cada linha.",
      semanas: [
        {
          numero: 1,
          tema: "Variáveis e funções",
          objetivo: "Declarar variáveis com const e let e escrever funções que devolvem valores.",
          gerada: true,
          itens: [
            {
              ...base,
              tipo: "aula",
              id: "s1-aula-funcoes",
              titulo: "Variáveis e funções",
              nivel: 1,
              conceitos: ["const", "let", "funções", "template string"],
              perguntas: ["Qual a diferença entre const e let? Um objeto declarado com const pode mudar?"],
              estude: [
                { titulo: "MDN: Funções", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Functions", verificado: true },
              ],
              conteudo: `# Variáveis e funções

**Variáveis** guardam valores. Use \`const\` por padrão e \`let\` só quando o valor muda:

\`\`\`js
const nome = "Ana";   // não pode ser reatribuída
let tentativas = 0;    // pode
tentativas = tentativas + 1;
\`\`\`

**Funções** recebem parâmetros e **devolvem** um valor com \`return\`:

\`\`\`js
function dobro(n) {
  return n * 2;
}
const triplo = (n) => n * 3;   // arrow function: o mesmo, mais curto
\`\`\`

**Template string** (escrita entre crases) junta texto e valores: com \`nome = "Ana"\`,
a template string \`Olá, \${nome}!\` vira "Olá, Ana!".

Sem \`return\`, a função devolve \`undefined\`: é o erro mais comum de quem começa.`,
              checagem: [
                { enunciado: "O que `function f() { 1 + 1; }` devolve?", opcoes: ["2", "undefined", "null", "um erro"], resposta: 1, explicacao: "Sem return, toda função devolve undefined." },
              ],
            },
            {
              ...base,
              tipo: "exercicio",
              id: "s1-saudacao",
              titulo: "Saudação",
              nivel: 1,
              conceitos: ["funções", "template string", "valor padrão"],
              dicas: ["Parâmetros podem ter valor padrão: function f(x = 1) {}", "Use uma template string com crase."],
              enunciado:
                "Escreva `saudacao(nome)`, que devolve `\"Olá, <nome>!\"`. Sem nome, devolve `\"Olá, mundo!\"`.",
              codigo: {
                template: "node",
                inicial: { "solucao.js": "export function saudacao(nome) {\n  // escreva aqui\n}\n" },
                solucao: { "solucao.js": "export function saudacao(nome = \"mundo\") {\n  return `Olá, ${nome}!`;\n}\n" },
                testes: {
                  "solucao.test.js": nodeTeste('import { saudacao } from "./solucao.js";', [
                    t("cumprimenta pelo nome", '  assert.equal(saudacao("Ana"), "Olá, Ana!");'),
                    t("sem nome, cumprimenta o mundo", '  assert.equal(saudacao(), "Olá, mundo!");'),
                  ]),
                },
                ocultos: {},
                abrir: "solucao.js",
              },
            },
            {
              ...base,
              tipo: "quiz",
              id: "s1-quiz",
              titulo: "Quiz: variáveis e funções",
              nivel: 1,
              questoes: [
                { enunciado: "Qual declaração não pode ser reatribuída?", opcoes: ["var", "let", "const"], resposta: 2, explicacao: "const impede a reatribuição (mas o conteúdo de um objeto ainda pode mudar)." },
                { enunciado: "Complete: `const f = (n) => n * 2;` é uma ____ function.", resposta: "arrow", explicacao: "Arrow functions usam =>." },
                { enunciado: "O que `typeof undefined` devolve?", opcoes: ["\"null\"", "\"undefined\"", "\"object\""], resposta: 1, explicacao: "typeof undefined é \"undefined\" (e typeof null é \"object\", uma esquisitice histórica)." },
              ],
            },
          ],
        },
        {
          numero: 2,
          tema: "Arrays",
          objetivo: "Percorrer, filtrar e transformar listas com filter, map e reduce.",
          gerada: true,
          itens: [
            {
              ...base,
              tipo: "aula",
              id: "s2-aula-arrays",
              titulo: "Arrays: filter, map e reduce",
              nivel: 1,
              conceitos: ["arrays", "filter", "map", "reduce"],
              perguntas: ["Por que map e filter não mudam o array original? Por que isso é bom?"],
              estude: [
                { titulo: "MDN: Array", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array", verificado: true },
              ],
              conteudo: `# Arrays

\`\`\`js
const precos = [10, 25, 40];
precos.filter((p) => p > 20);            // [25, 40]  fica quem passa no teste
precos.map((p) => p * 2);                 // [20, 50, 80]  transforma cada um
precos.reduce((soma, p) => soma + p, 0);  // 75  junta tudo num valor só
\`\`\`

Os três devolvem um **novo** valor e não mexem no array original. Encadeie:

\`\`\`js
precos.filter((p) => p > 20).map((p) => p * 2);   // [50, 80]
\`\`\`

\`for (const p of precos) { ... }\` continua valendo quando você precisa de mais controle.`,
              checagem: [
                { enunciado: "Qual método devolve um array do mesmo tamanho?", opcoes: ["filter", "map", "reduce"], resposta: 1, explicacao: "map transforma cada item, então o tamanho se mantém." },
              ],
            },
            {
              ...base,
              tipo: "exercicio",
              id: "s2-soma-pares",
              titulo: "Soma dos pares",
              nivel: 1,
              conceitos: ["filter", "reduce", "resto da divisão"],
              dicas: ["Um número é par quando n % 2 === 0.", "filter para escolher, reduce para somar (comece do 0)."],
              enunciado: "Escreva `somaPares(numeros)`, que devolve a soma dos números pares da lista (lista vazia: 0).",
              codigo: {
                template: "node",
                inicial: { "solucao.js": "export function somaPares(numeros) {\n  return 0;\n}\n" },
                solucao: { "solucao.js": "export function somaPares(numeros) {\n  return numeros.filter((n) => n % 2 === 0).reduce((s, n) => s + n, 0);\n}\n" },
                testes: {
                  "solucao.test.js": nodeTeste('import { somaPares } from "./solucao.js";', [
                    t("soma só os pares", "  assert.equal(somaPares([1, 2, 3, 4]), 6);"),
                    t("lista vazia dá zero", "  assert.equal(somaPares([]), 0);"),
                    t("pares negativos também contam", "  assert.equal(somaPares([-2, 5]), -2);"),
                  ]),
                },
                ocultos: {},
                abrir: "solucao.js",
              },
            },
            {
              ...base,
              tipo: "desafio",
              id: "s2-dois-numeros",
              titulo: "Dois números que somam o alvo",
              nivel: 2,
              dificuldade: "facil",
              tags: ["array", "hash map"],
              conceitos: ["Map", "complexidade"],
              dicas: [
                "A força bruta testa todos os pares: O(n²). Dá para fazer numa passada só.",
                "Guarde num Map os números que já passaram e a posição de cada um.",
                "Para cada número x, procure alvo - x no Map antes de guardar x.",
              ],
              perguntas: ["Qual a complexidade de tempo e de memória da sua solução? Dá para fazer com O(1) de memória?"],
              enunciado:
                "Dada uma lista de inteiros `numeros` e um inteiro `alvo`, devolva os **índices** dos dois números que somam `alvo`, em ordem crescente. Existe exatamente uma resposta, e o mesmo elemento não pode ser usado duas vezes.",
              exemplos: [
                { entrada: "numeros = [2, 7, 11, 15], alvo = 9", saida: "[0, 1]", explicacao: "2 + 7 = 9" },
                { entrada: "numeros = [3, 2, 4], alvo = 6", saida: "[1, 2]" },
              ],
              restricoes: ["2 ≤ numeros.length ≤ 10⁴", "-10⁹ ≤ numeros[i], alvo ≤ 10⁹", "Existe exatamente uma resposta"],
              editorial:
                "Percorra a lista uma vez guardando num `Map` cada número já visto e o índice dele. Para cada `x` na posição `i`, se `alvo - x` já está no mapa, a resposta é `[mapa.get(alvo - x), i]`. Tempo O(n), memória O(n). A força bruta com dois laços também passa nos testes, mas é O(n²).",
              codigo: {
                template: "node",
                inicial: { "solucao.js": "export function doisNumeros(numeros, alvo) {\n  // devolva [i, j]\n  return [];\n}\n" },
                solucao: {
                  "solucao.js":
                    "export function doisNumeros(numeros, alvo) {\n  const vistos = new Map();\n  for (let i = 0; i < numeros.length; i++) {\n    const falta = alvo - numeros[i];\n    if (vistos.has(falta)) return [vistos.get(falta), i];\n    vistos.set(numeros[i], i);\n  }\n  return [];\n}\n",
                },
                testes: {
                  "solucao.test.js": nodeTeste('import { doisNumeros } from "./solucao.js";', [
                    t("exemplo 1", "  assert.deepEqual(doisNumeros([2, 7, 11, 15], 9), [0, 1]);"),
                    t("exemplo 2", "  assert.deepEqual(doisNumeros([3, 2, 4], 6), [1, 2]);"),
                  ]),
                },
                ocultos: {
                  "ocultos.test.js": nodeTeste('import { doisNumeros } from "./solucao.js";', [
                    t("números repetidos", "  assert.deepEqual(doisNumeros([3, 3], 6), [0, 1]);"),
                    t("negativos", "  assert.deepEqual(doisNumeros([-3, 4, 3, 90], 0), [0, 2]);"),
                    t(
                      "lista grande (rápido o bastante)",
                      "  const lista = Array.from({ length: 10000 }, (_, i) => i);\n  assert.deepEqual(doisNumeros(lista, 19997), [9998, 9999]);",
                    ),
                  ]),
                },
                abrir: "solucao.js",
              },
            },
          ],
        },
        {
          numero: 3,
          tema: "TypeScript e testes",
          objetivo: "Tipar funções e ler um teste do Vitest.",
          gerada: true,
          itens: [
            {
              ...base,
              tipo: "aula",
              id: "s3-aula-typescript",
              titulo: "TypeScript em 10 minutos",
              nivel: 1,
              conceitos: ["tipos", "anotações", "Vitest"],
              estude: [{ titulo: "Documentação do TypeScript", url: "https://www.typescriptlang.org/pt/docs/", verificado: true }],
              conteudo: `# TypeScript em 10 minutos

TypeScript é JavaScript com **tipos**: o editor avisa do erro antes de rodar.

\`\`\`ts
function area(largura: number, altura: number): number {
  return largura * altura;
}
area(2, "3");   // erro: "3" não é number
\`\`\`

Um teste do **Vitest** descreve o que o código deve fazer:

\`\`\`ts
import { test, expect } from "vitest";
test("área de 2 por 3", () => {
  expect(area(2, 3)).toBe(6);
});
\`\`\``,
              checagem: [
                { enunciado: "Em `function f(x: string): number`, o que `: number` diz?", opcoes: ["o tipo do parâmetro", "o tipo do retorno", "nada"], resposta: 1, explicacao: "Depois dos parênteses vem o tipo de retorno." },
              ],
            },
            {
              ...base,
              tipo: "exercicio",
              id: "s3-formatar-preco",
              titulo: "Formatar preço",
              nivel: 2,
              conceitos: ["TypeScript", "números", "strings"],
              dicas: ["Divida por 100 e use toFixed(2).", "Troque o ponto pela vírgula com replace."],
              enunciado: "Em TypeScript, escreva `formatarPreco(centavos: number): string`: `1990` vira `\"R$ 19,90\"` e `5` vira `\"R$ 0,05\"`.",
              codigo: {
                template: "vitest",
                inicial: { "preco.ts": "export function formatarPreco(centavos: number): string {\n  return \"\";\n}\n" },
                solucao: {
                  "preco.ts": "export function formatarPreco(centavos: number): string {\n  return `R$ ${(centavos / 100).toFixed(2).replace(\".\", \",\")}`;\n}\n",
                },
                testes: {
                  "preco.test.ts":
                    'import { expect, test } from "vitest";\nimport { formatarPreco } from "./preco";\n\ntest("reais e centavos", () => {\n  expect(formatarPreco(1990)).toBe("R$ 19,90");\n});\n\ntest("só centavos", () => {\n  expect(formatarPreco(5)).toBe("R$ 0,05");\n});\n',
                },
                ocultos: {},
                abrir: "preco.ts",
              },
            },
            {
              ...base,
              tipo: "aberta",
              id: "s3-igualdade",
              titulo: "== ou ===?",
              nivel: 2,
              conceitos: ["coerção de tipos", "igualdade"],
              enunciado: "Explique, com um exemplo, a diferença entre `==` e `===` em JavaScript, e diga qual você usaria no dia a dia e por quê.",
              rubrica: [
                "Diz que == converte os tipos antes de comparar (coerção) e === não",
                "Dá um exemplo concreto em que os dois dão resultados diferentes (ex.: 0 == \"0\")",
                "Recomenda === e justifica (previsibilidade, menos bugs)",
              ],
            },
          ],
        },
        {
          numero: 4,
          tema: "React e consolidação",
          objetivo: "Montar um componente com estado e juntar tudo no chefe.",
          gerada: true,
          itens: [
            {
              ...base,
              tipo: "aula",
              id: "s4-aula-react",
              titulo: "Componentes e estado no React",
              nivel: 1,
              conceitos: ["componente", "JSX", "useState", "eventos"],
              estude: [{ titulo: "React: Aprenda (em português)", url: "https://pt-br.react.dev/learn", verificado: true }],
              conteudo: `# Componentes e estado

Um **componente** é uma função que devolve JSX. O **estado** (\`useState\`) é o que muda na tela:

\`\`\`jsx
import { useState } from "react";

export function Curtir() {
  const [curtidas, setCurtidas] = useState(0);
  return <button onClick={() => setCurtidas(curtidas + 1)}>❤ {curtidas}</button>;
}
\`\`\`

Mudou o estado, o React desenha de novo. Nunca altere o estado direto (\`curtidas++\`): use a função \`set\`.`,
              checagem: [
                { enunciado: "Como se muda o valor de um estado criado com useState?", opcoes: ["atribuindo direto", "com a função set que o useState devolve", "com this.setState"], resposta: 1, explicacao: "useState devolve [valor, setValor]." },
              ],
            },
            {
              ...base,
              tipo: "exercicio",
              id: "s4-contador",
              titulo: "Contador com limite",
              nivel: 2,
              conceitos: ["useState", "eventos", "props"],
              dicas: ["Guarde o número com useState(0).", "Desabilite o botão com disabled={...} quando chegar no limite."],
              enunciado:
                "Complete o componente `Contador({ limite })`: mostra `Cliques: N` e um botão `Somar` que soma 1. Ao chegar em `limite`, o botão fica desabilitado.",
              codigo: {
                template: "react",
                inicial: {
                  "Contador.jsx": "export function Contador({ limite }) {\n  return (\n    <div>\n      <p>Cliques: 0</p>\n      <button>Somar</button>\n    </div>\n  );\n}\n",
                },
                solucao: {
                  "Contador.jsx":
                    'import { useState } from "react";\n\nexport function Contador({ limite }) {\n  const [cliques, setCliques] = useState(0);\n  return (\n    <div>\n      <p>Cliques: {cliques}</p>\n      <button disabled={cliques >= limite} onClick={() => setCliques(cliques + 1)}>\n        Somar\n      </button>\n    </div>\n  );\n}\n',
                },
                testes: {
                  "Contador.test.jsx":
                    'import { afterEach, expect, test } from "vitest";\nimport { cleanup, fireEvent, render, screen } from "@testing-library/react";\nimport { Contador } from "./Contador.jsx";\n\nafterEach(cleanup);\n\ntest("começa em zero e soma a cada clique", () => {\n  render(<Contador limite={5} />);\n  fireEvent.click(screen.getByText("Somar"));\n  fireEvent.click(screen.getByText("Somar"));\n  expect(screen.getByText("Cliques: 2")).toBeTruthy();\n});\n\ntest("para no limite", () => {\n  render(<Contador limite={1} />);\n  const botao = screen.getByText("Somar");\n  fireEvent.click(botao);\n  fireEvent.click(botao);\n  expect(screen.getByText("Cliques: 1")).toBeTruthy();\n  expect(botao.disabled).toBe(true);\n});\n',
                },
                ocultos: {},
                abrir: "Contador.jsx",
              },
            },
            {
              ...base,
              tipo: "local",
              id: "s4-vite-local",
              titulo: "Seu primeiro projeto no computador",
              nivel: 1,
              conceitos: ["npm", "Vite", "ambiente local"],
              enunciado:
                "No seu computador (com Node.js instalado), crie um projeto React com o Vite, rode e troque o texto da página:\n\n1. `npm create vite@latest meu-app -- --template react`\n2. `cd meu-app && npm install && npm run dev`\n3. Abra o endereço que aparecer, edite `src/App.jsx` e veja a página mudar sozinha.\n\nDê a nota quando conseguir.",
              comando: "npm create vite@latest meu-app -- --template react",
            },
            {
              ...base,
              tipo: "chefe",
              id: "s4-chefe-carrinho",
              titulo: "Chefe: o carrinho de compras",
              nivel: 3,
              conceitos: ["funções", "arrays", "reduce", "arredondamento"],
              dicas: ["Comece pelo subtotal: reduce com preço × quantidade.", "O cupom vale sobre o subtotal; o frete entra depois.", "Trabalhe em centavos para não errar arredondamento."],
              perguntas: ["Por que trabalhar em centavos (inteiros) em vez de reais (decimais)?"],
              enunciado:
                "Escreva `totalDoCarrinho(itens, cupom)`. Cada item é `{ preco, quantidade }` com o preço em **centavos**. Regras:\n\n- subtotal = soma de preço × quantidade;\n- cupom `\"DEZ\"`: 10% de desconto no subtotal (arredonde para baixo); outro cupom ou nenhum: sem desconto;\n- frete: 1500 centavos, grátis quando o subtotal **com desconto** for 20000 ou mais;\n- carrinho vazio: total 0, sem frete.\n\nDevolva o total em centavos.",
              rubrica: ["Separa subtotal, desconto e frete em passos claros", "Trata carrinho vazio e cupom desconhecido"],
              codigo: {
                template: "node",
                inicial: { "carrinho.js": "export function totalDoCarrinho(itens, cupom) {\n  // subtotal, desconto, frete...\n}\n" },
                solucao: {
                  "carrinho.js":
                    "export function totalDoCarrinho(itens, cupom) {\n  if (itens.length === 0) return 0;\n  const subtotal = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);\n  const desconto = cupom === \"DEZ\" ? Math.floor(subtotal * 0.1) : 0;\n  const comDesconto = subtotal - desconto;\n  const frete = comDesconto >= 20000 ? 0 : 1500;\n  return comDesconto + frete;\n}\n",
                },
                testes: {
                  "carrinho.test.js": nodeTeste('import { totalDoCarrinho } from "./carrinho.js";', [
                    t("soma e cobra frete", "  assert.equal(totalDoCarrinho([{ preco: 1000, quantidade: 2 }], undefined), 3500);"),
                    t("cupom DEZ", "  assert.equal(totalDoCarrinho([{ preco: 10000, quantidade: 1 }], \"DEZ\"), 10500);"),
                    t("frete grátis a partir de 20000 com desconto", "  assert.equal(totalDoCarrinho([{ preco: 25000, quantidade: 1 }], \"DEZ\"), 22500);"),
                    t("carrinho vazio", "  assert.equal(totalDoCarrinho([], \"DEZ\"), 0);"),
                  ]),
                },
                ocultos: {
                  "ocultos.test.js": nodeTeste('import { totalDoCarrinho } from "./carrinho.js";', [
                    t("o desconto pode tirar o frete grátis", "  assert.equal(totalDoCarrinho([{ preco: 21000, quantidade: 1 }], \"DEZ\"), 18900 + 1500);"),
                    t("cupom desconhecido não dá desconto", "  assert.equal(totalDoCarrinho([{ preco: 999, quantidade: 3 }], \"MIL\"), 2997 + 1500);"),
                    t("arredonda o desconto para baixo", "  assert.equal(totalDoCarrinho([{ preco: 1005, quantidade: 1 }], \"DEZ\"), 1005 - 100 + 1500);"),
                  ]),
                },
                abrir: "carrinho.js",
              },
            },
          ],
        },
      ],
    },
  ],
};

process.stdout.write(JSON.stringify(trilha, null, 2) + "\n");
