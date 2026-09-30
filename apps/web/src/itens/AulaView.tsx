import type { Aula } from "@trilhas/nucleo";
import { Markdown } from "../componentes/Markdown.tsx";
import { BarraDeNota } from "../componentes/Nota.tsx";
import { salvarTentativa } from "../estado/acoes.ts";
import { Conceitos, Estude, PerguntasEntrevista } from "./Extras.tsx";
import { Questoes } from "./Questoes.tsx";

export function AulaView({ trilhaId, item, respostas }: { trilhaId: string; item: Aula; respostas?: (number | string | null)[] }) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <Conceitos item={item} />
      <article>
        <Markdown texto={item.conteudo} />
      </article>
      {item.checagem.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Checagem rápida</h2>
          <Questoes questoes={item.checagem} iniciais={respostas} aoConferir={(r) => void salvarTentativa(trilhaId, item.id, { respostasQuiz: r })} />
        </section>
      )}
      <PerguntasEntrevista item={item} />
      <Estude item={item} />
      <BarraDeNota trilhaId={trilhaId} itemId={item.id} />
    </div>
  );
}
