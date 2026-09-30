import type { Local } from "@trilhas/nucleo";
import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { Markdown } from "../componentes/Markdown.tsx";
import { BarraDeNota } from "../componentes/Nota.tsx";
import { Aviso, Botao } from "../componentes/ui.tsx";
import { Conceitos, Estude, PerguntasEntrevista } from "./Extras.tsx";

/** Prática fora do navegador: o passo a passo, o comando e a nota que a pessoa dá. */
export function LocalView({ trilhaId, item }: { trilhaId: string; item: Local }) {
  const [copiado, setCopiado] = useState(false);
  const doGym = item.comando?.startsWith("gym ");
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Conceitos item={item} />
      <Markdown texto={item.enunciado} />
      {item.comando && (
        <div className="flex items-center gap-2 rounded-xl border border-borda bg-codigo p-3 font-mono text-sm">
          <Terminal className="size-4 shrink-0 text-texto-3" aria-hidden />
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{item.comando}</code>
          <Botao
            variante="fantasma"
            icone={copiado ? Check : Copy}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(item.comando ?? "");
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1500);
              } catch {
                // sem permissão de área de transferência: o texto está na tela para copiar à mão
              }
            }}
          >
            {copiado ? "Copiado" : "Copiar"}
          </Botao>
        </div>
      )}
      {doGym && (
        <Aviso tom="primaria" titulo="Prática no devops_gym, no seu computador.">
          Na pasta <code>devops_gym</code> deste repositório: <code>./gym lab</code> em um terminal (o laboratório) e o comando acima em outro. A tecla{" "}
          <code>v</code> verifica a solução lá; depois, dê a nota aqui.
        </Aviso>
      )}
      {item.dicas.length > 0 && (
        <details className="rounded-lg border border-borda bg-superficie px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">Dica</summary>
          <ul className="mt-2 space-y-1 text-texto-2">
            {item.dicas.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </details>
      )}
      <PerguntasEntrevista item={item} />
      <Estude item={item} />
      <BarraDeNota trilhaId={trilhaId} itemId={item.id} />
    </div>
  );
}
