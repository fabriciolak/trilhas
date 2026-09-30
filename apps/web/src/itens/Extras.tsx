import type { Item } from "@trilhas/nucleo";
import { ExternalLink } from "lucide-react";
import { Etiqueta } from "../componentes/ui.tsx";

export function PerguntasEntrevista({ item }: { item: Item }) {
  if (item.perguntas.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold">Perguntas de entrevista</h3>
      <p className="mt-0.5 text-xs text-texto-3">Responda em voz alta, ou peça para o tutor sabatinar você.</p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-texto-2">
        {item.perguntas.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
    </section>
  );
}

export function Estude({ item }: { item: Item }) {
  if (item.estude.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold">Para estudar</h3>
      <ul className="mt-2 space-y-1.5 text-sm">
        {item.estude.map((l) => (
          <li key={l.url} className="flex flex-wrap items-center gap-2">
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primaria hover:underline">
              {l.titulo}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
            {!l.verificado && <Etiqueta tom="aviso">sugerido pela IA: confira</Etiqueta>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Conceitos({ item }: { item: Item }) {
  if (item.conceitos.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {item.conceitos.map((c) => (
        <Etiqueta key={c}>{c}</Etiqueta>
      ))}
    </div>
  );
}
