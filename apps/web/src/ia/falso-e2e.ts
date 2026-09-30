/**
 * IA de mentira para os testes de ponta a ponta (?ia=falso): responde pelo tipo de pedido,
 * sem rede. Nunca aparece para quem usa o site normalmente.
 */
import type { PedidoIA, ProvedorIA } from "@trilhas/nucleo";

const ROTEIRO = {
  id: "violao-basico",
  titulo: "Violão do zero",
  assunto: "violão",
  objetivo: "tocar músicas simples",
  nivelInicial: "zero",
  horasPorSemana: 3,
  origem: "ia",
  racional: "Começa pelos acordes abertos e pelo ritmo, e termina tocando uma música inteira.",
  meses: [
    {
      numero: 1,
      titulo: "Primeiros acordes",
      objetivo: "Trocar entre quatro acordes no tempo.",
      marco: "Tocar uma música com quatro acordes.",
      semanas: [
        { numero: 1, tema: "Postura e acordes maiores", objetivo: "Montar Dó, Sol e Ré.", gerada: false, itens: [] },
        { numero: 2, tema: "Ritmo básico", objetivo: "Batida para baixo e para cima.", gerada: false, itens: [] },
      ],
    },
  ],
};

const SEMANA_1 = {
  numero: 1,
  tema: "Postura e acordes maiores",
  objetivo: "Montar Dó, Sol e Ré.",
  gerada: true,
  itens: [
    { tipo: "aula", id: "s1-aula-acordes", titulo: "Acordes maiores", nivel: 1, conteudo: "# Acordes maiores\n\nDó, Sol e Ré são os primeiros.", checagem: [] },
    {
      tipo: "quiz",
      id: "s1-quiz-acordes",
      titulo: "Quiz: acordes",
      nivel: 1,
      questoes: [{ enunciado: "Quantas cordas tem o violão?", opcoes: ["4", "6", "12"], resposta: 1, explicacao: "Seis cordas." }],
    },
    { tipo: "local", id: "s1-pratica", titulo: "Troca de acordes", nivel: 1, enunciado: "Troque entre Dó e Sol por 5 minutos." },
  ],
};

export function criarIaFalsaE2E(): ProvedorIA {
  return {
    id: "falso:e2e",
    async *conversar(pedido: PedidoIA) {
      const sistema = pedido.sistema ?? "";
      let texto: string;
      if (sistema.includes("monta roteiros")) texto = JSON.stringify(ROTEIRO);
      else if (sistema.includes("conteúdo de uma semana")) texto = JSON.stringify(SEMANA_1);
      else if (sistema.includes("corrige respostas")) {
        texto = JSON.stringify({
          criterios: [{ criterio: "explica a coerção", atendido: true, comentario: "Bom." }],
          nota: 80,
          resumo: "Boa resposta; faltou um exemplo.",
        });
      } else texto = "**Dica de teste:** pense no caso base e leia a mensagem do teste que falhou.";
      for (let i = 0; i < texto.length; i += 16) {
        if (pedido.sinal?.aborted) return;
        await new Promise((r) => setTimeout(r, 5));
        yield texto.slice(i, i + 16);
      }
    },
  };
}
