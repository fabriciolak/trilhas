import type { Quiz } from "@trilhas/nucleo";
import { useState } from "react";
import { BarraDeNota } from "../componentes/Nota.tsx";
import { salvarTentativa } from "../estado/acoes.ts";
import { Conceitos, Estude, PerguntasEntrevista } from "./Extras.tsx";
import { Questoes } from "./Questoes.tsx";

export function QuizView({ trilhaId, item, respostas }: { trilhaId: string; item: Quiz; respostas?: (number | string | null)[] }) {
  const [feito, setFeito] = useState(false);
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <Conceitos item={item} />
      <Questoes
        questoes={item.questoes}
        iniciais={respostas}
        aoConferir={(r, acertos) => {
          setFeito(true);
          void salvarTentativa(trilhaId, item.id, { respostasQuiz: r, passou: acertos === item.questoes.length });
        }}
      />
      <PerguntasEntrevista item={item} />
      <Estude item={item} />
      <BarraDeNota trilhaId={trilhaId} itemId={item.id} destaque={feito} />
    </div>
  );
}
