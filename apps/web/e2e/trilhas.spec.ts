import { expect, test, type Page } from "@playwright/test";

const FALSOS = "/?executor=falso&ia=falso";

async function abrir(page: Page, rota = "") {
  await page.goto(`${FALSOS}#/${rota}`);
  // Na primeira visita, a trilha de exemplo é carregada: espera ela existir.
  if (rota) {
    await page.goto(`${FALSOS}#/`);
    await expect(page.getByText("JavaScript do zero (trilha de exemplo)").first()).toBeVisible();
    await page.goto(`${FALSOS}#/${rota}`);
  }
}

test("a trilha de exemplo aparece e a aula registra a nota na repetição espaçada", async ({ page }) => {
  await abrir(page);
  await expect(page.getByRole("heading", { name: "Hoje" })).toBeVisible();
  await page.getByRole("link", { name: /Variáveis e funções/ }).first().click();
  await expect(page.getByRole("heading", { name: "Variáveis e funções", level: 1 }).last()).toBeVisible();
  await page.getByRole("radio", { name: "undefined" }).check();
  await page.getByRole("button", { name: "Conferir" }).click();
  await expect(page.getByText("1 de 1 certas.")).toBeVisible();
  await page.getByRole("button", { name: /Tranquilo/ }).click();
  await expect(page.getByText(/caixa 2 · próxima revisão em/)).toBeVisible();

  await page.getByRole("link", { name: "Hoje" }).click();
  await expect(page.getByRole("link", { name: /Saudação/ })).toBeVisible();
});

test("exercício: Executar reprova, a solução passa e o Enviar aceita", async ({ page }) => {
  await abrir(page, "trilha/exemplo-js/item/s1-saudacao");
  await expect(page.getByText("Escreva saudacao(nome)", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Executar" }).click();
  await expect(page.getByText("0 de 2 testes passaram.")).toBeVisible();
  await expect(page.getByText("cumprimenta pelo nome")).toBeVisible();

  await page.locator(".cm-content").first().click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText('export function saudacao(nome = "mundo") {\n  return `Olá, ${nome}!`;\n}\n');
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText(/Aceito: passou em todos os testes/)).toBeVisible();
  await expect(page.getByText(/Como foi\?/)).toBeVisible();

  // O código fica salvo: recarregar mostra o que a pessoa escreveu.
  await page.reload();
  await expect(page.locator(".cm-content").first()).toContainText("Olá, ${nome}!");
});

test("desafio: dicas em degraus e editorial escondido até resolver", async ({ page }) => {
  await abrir(page, "trilha/exemplo-js/item/s2-dois-numeros");
  await expect(page.getByText("Fácil")).toBeVisible();
  await page.getByRole("tab", { name: /Dicas/ }).click();
  await page.getByRole("button", { name: "Ver a primeira dica" }).click();
  await expect(page.getByText("A força bruta testa todos os pares")).toBeVisible();
  await expect(page.getByText("Guarde num Map")).toHaveCount(0);
  await page.getByRole("tab", { name: "Editorial" }).click();
  await expect(page.getByText("O editorial explica a solução.")).toBeVisible();
});

test("tutor responde com streaming e a conversa fica salva", async ({ page }) => {
  await abrir(page, "trilha/exemplo-js/item/s1-saudacao");
  await page.getByRole("button", { name: "Tutor" }).click();
  await page.getByRole("button", { name: "Dica" }).click();
  await expect(page.getByText("Dica de teste:")).toBeVisible();
  await page.getByRole("button", { name: "Fechar o tutor" }).click();
  await page.getByRole("button", { name: "Tutor" }).click();
  await expect(page.getByText("Me dá uma dica?")).toBeVisible();
});

test("resposta aberta corrigida pela IA com a rubrica", async ({ page }) => {
  await abrir(page, "trilha/exemplo-js/item/s3-igualdade");
  await page.getByLabel("Sua resposta").fill("== converte os tipos antes de comparar (0 == '0' é true); === compara tipo e valor. Uso === sempre.");
  await page.getByRole("button", { name: "Corrigir com a IA" }).click();
  await expect(page.getByText("80/100")).toBeVisible();
  await expect(page.getByText("Boa resposta; faltou um exemplo.")).toBeVisible();
});

test("nova trilha: a IA monta o roteiro, salva e escreve a primeira semana", async ({ page }) => {
  await abrir(page, "nova");
  await page.getByLabel("O que você quer aprender?").fill("violão");
  await page.getByRole("button", { name: "Montar o roteiro com a IA" }).click();
  await expect(page.getByRole("heading", { name: "Violão do zero" })).toBeVisible();
  await expect(page.getByText("Começa pelos acordes abertos")).toBeVisible();
  await page.getByRole("button", { name: "Salvar a trilha" }).click();
  await expect(page.getByRole("heading", { name: "Violão do zero", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Gerar o conteúdo desta semana" }).first().click();
  await expect(page.getByRole("link", { name: /Acordes maiores/ })).toBeVisible();
  await page.getByRole("link", { name: /Quiz: acordes/ }).click();
  await page.getByRole("radio", { name: "6" }).check();
  await page.getByRole("button", { name: "Conferir" }).click();
  await expect(page.getByText("1 de 1 certas.")).toBeVisible();
});

test("configurações: o guia do Ollama traz a origem deste site", async ({ page }) => {
  await abrir(page, "config");
  await page.getByRole("radio", { name: /Ollama/ }).click();
  await page.getByText("Como deixar o Ollama aceitar este site").click();
  await expect(page.getByText('OLLAMA_ORIGINS=http://localhost:4173', { exact: false }).first()).toBeVisible();
});

test("no celular, sem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await abrir(page);
  await expect(page.getByRole("heading", { name: "Hoje" })).toBeVisible();
  const larguras = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(larguras[0]).toBeLessThanOrEqual(larguras[1] ?? 0);
  await page.goto(`${FALSOS}#/trilha/exemplo-js/item/s1-saudacao`);
  await expect(page.getByRole("button", { name: "Executar" })).toBeVisible();
  const noItem = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(noItem[0]).toBeLessThanOrEqual(noItem[1] ?? 0);
});
