/** Um provedor de mentira, para testes e para experimentar a interface sem chave. */
import type { PedidoIA, ProvedorIA } from "./tipos.ts";

export function criarFalso(respostas: string[], atrasoMs = 0): ProvedorIA & { pedidos: PedidoIA[] } {
  const pedidos: PedidoIA[] = [];
  let i = 0;
  return {
    id: "falso:roteiro",
    pedidos,
    async *conversar(pedido: PedidoIA) {
      pedidos.push(pedido);
      const texto = respostas[Math.min(i, respostas.length - 1)] ?? "";
      i++;
      // Em pedaços de até 12 caracteres, como um streaming de verdade.
      for (let p = 0; p < texto.length; p += 12) {
        if (pedido.sinal?.aborted) return;
        if (atrasoMs) await new Promise((r) => setTimeout(r, atrasoMs));
        yield texto.slice(p, p + 12);
      }
    },
  };
}
