/** A nota do item (repetição espaçada): travei, sofri ou tranquilo. */
import { situacao, type Nota as TipoNota } from "@trilhas/nucleo";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { darNota, hoje } from "../estado/acoes.ts";
import { useProgresso } from "../estado/hooks.ts";
import { Botao } from "./ui.tsx";

const OPCOES: { nota: TipoNota; nome: string; explica: string }[] = [
  { nota: "travei", nome: "Travei", explica: "precisei da solução ou de muita ajuda: volta amanhã" },
  { nota: "sofri", nome: "Sofri", explica: "consegui, com esforço: fica na mesma caixa" },
  { nota: "tranquilo", nome: "Tranquilo", explica: "faria de novo sem ajuda e explicaria numa entrevista" },
];

export function BarraDeNota({ trilhaId, itemId, destaque = false }: { trilhaId: string; itemId: string; destaque?: boolean }) {
  const progresso = useProgresso(trilhaId);
  const [enviando, setEnviando] = useState<TipoNota | null>(null);
  const s = situacao(progresso, itemId, hoje());
  return (
    <div className={`rounded-xl border p-4 ${destaque ? "border-primaria bg-primaria-2" : "border-borda bg-superficie"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Como foi? Seja honesto: é isso que agenda a revisão.</p>
        {s.estado !== "novo" && (
          <p className="flex items-center gap-1 text-xs text-texto-2">
            <CalendarCheck className="size-3.5" aria-hidden />
            caixa {s.caixa} · {s.estado === "revisar" ? "revisar hoje" : `próxima revisão em ${s.proxima}`}
          </p>
        )}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {OPCOES.map((o) => (
          <Botao
            key={o.nota}
            variante={o.nota === "tranquilo" ? "primaria" : "secundaria"}
            className="h-auto flex-col items-start py-2 text-left"
            carregando={enviando === o.nota}
            onClick={async () => {
              setEnviando(o.nota);
              try {
                await darNota(trilhaId, itemId, o.nota);
              } finally {
                setEnviando(null);
              }
            }}
          >
            <span>{o.nome}</span>
            <span className="text-xs font-normal opacity-80">{o.explica}</span>
          </Botao>
        ))}
      </div>
    </div>
  );
}
