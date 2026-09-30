import type { Questao } from "@trilhas/nucleo";
import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { Markdown } from "../componentes/Markdown.tsx";
import { Botao } from "../componentes/ui.tsx";
import { acertou } from "./correcao.ts";

export function Questoes({
  questoes,
  iniciais,
  aoConferir,
}: {
  questoes: Questao[];
  iniciais?: (number | string | null)[];
  aoConferir?: (respostas: (number | string | null)[], acertos: number) => void;
}) {
  const [respostas, setRespostas] = useState<(number | string | null)[]>(() => questoes.map((_, i) => iniciais?.[i] ?? null));
  const [conferido, setConferido] = useState(false);
  const acertos = questoes.filter((q, i) => acertou(q, respostas[i])).length;

  return (
    <div className="space-y-5">
      {questoes.map((q, i) => {
        const certo = acertou(q, respostas[i]);
        const nome = `questao-${i}`;
        return (
          <fieldset key={i} className="rounded-xl border border-borda bg-superficie p-4">
            <legend className="sr-only">Questão {i + 1}</legend>
            <div className="flex gap-2">
              <span className="font-semibold text-texto-3">{i + 1}.</span>
              <Markdown texto={q.enunciado} className="flex-1" />
            </div>
            {q.opcoes ? (
              <div className="mt-3 space-y-1.5">
                {q.opcoes.map((opcao, j) => (
                  <label
                    key={j}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      conferido && j === q.resposta ? "border-sucesso bg-sucesso-2" : respostas[i] === j ? "border-primaria bg-primaria-2" : "border-borda hover:bg-superficie-2"
                    }`}
                  >
                    <input
                      type="radio"
                      name={nome}
                      checked={respostas[i] === j}
                      disabled={conferido}
                      onChange={() => setRespostas(respostas.map((r, k) => (k === i ? j : r)))}
                    />
                    <span>{opcao}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                aria-label={`Resposta da questão ${i + 1}`}
                className="mt-3 w-full rounded-lg border border-borda bg-fundo px-3 py-2 text-sm"
                value={String(respostas[i] ?? "")}
                disabled={conferido}
                onChange={(e) => setRespostas(respostas.map((r, k) => (k === i ? e.target.value : r)))}
                placeholder="Sua resposta"
              />
            )}
            {conferido && (
              <div className={`mt-3 flex gap-2 text-sm ${certo ? "text-sucesso" : "text-erro"}`}>
                {certo ? <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> : <CircleX className="mt-0.5 size-4 shrink-0" aria-hidden />}
                <div>
                  <p className="font-medium">
                    {certo ? "Certo." : `Resposta: ${typeof q.resposta === "number" ? q.opcoes?.[q.resposta] : q.resposta}`}
                  </p>
                  {q.explicacao && <p className="text-texto-2">{q.explicacao}</p>}
                </div>
              </div>
            )}
          </fieldset>
        );
      })}
      <div className="flex items-center gap-3">
        {conferido ? (
          <>
            <p className="text-sm font-medium">
              {acertos} de {questoes.length} certas.
            </p>
            <Botao variante="fantasma" onClick={() => setConferido(false)}>
              Tentar de novo
            </Botao>
          </>
        ) : (
          <Botao
            variante="primaria"
            disabled={respostas.every((r) => r === null || r === "")}
            onClick={() => {
              setConferido(true);
              aoConferir?.(respostas, acertos);
            }}
          >
            Conferir
          </Botao>
        )}
      </div>
    </div>
  );
}
