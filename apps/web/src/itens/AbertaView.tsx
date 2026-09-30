import { corrigirPorRubrica, type Aberta, type Chefe, type Correcao, type Projeto } from "@trilhas/nucleo";
import { CircleCheck, CircleX, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "../componentes/Markdown.tsx";
import { BarraDeNota } from "../componentes/Nota.tsx";
import { Aviso, Botao } from "../componentes/ui.tsx";
import { salvarTentativa } from "../estado/acoes.ts";
import { href } from "../rota.ts";
import { mensagemDeErro, obterProvedor } from "../ia/provedor.ts";
import { Conceitos, Estude, PerguntasEntrevista } from "./Extras.tsx";

/** Resposta em texto, corrigida pela IA com a rubrica do item. */
export function AbertaView({
  trilhaId,
  item,
  textoSalvo,
  correcaoSalva,
  aoMudarTexto,
}: {
  trilhaId: string;
  item: Aberta | Projeto | Chefe;
  textoSalvo?: string;
  correcaoSalva?: Correcao;
  aoMudarTexto?: (texto: string) => void;
}) {
  const [texto, setTexto] = useState(textoSalvo ?? "");
  const [correcao, setCorrecao] = useState<Correcao | undefined>(correcaoSalva);
  const [corrigindo, setCorrigindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const salvar = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(salvar.current), []);

  const rubrica = item.rubrica.length ? item.rubrica : ["Responde ao que foi pedido, com clareza e exemplos"];
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Conceitos item={item} />
      <Markdown texto={item.enunciado} />
      <details className="rounded-lg border border-borda bg-superficie px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">O que conta na correção</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-texto-2">
          {rubrica.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </details>
      <textarea
        aria-label="Sua resposta"
        className="min-h-48 w-full rounded-xl border border-borda bg-superficie p-4 text-sm leading-relaxed"
        placeholder="Escreva com as suas palavras. Explicar é a melhor forma de descobrir o que você ainda não entendeu."
        value={texto}
        onChange={(e) => {
          const novo = e.target.value;
          setTexto(novo);
          aoMudarTexto?.(novo);
          clearTimeout(salvar.current);
          salvar.current = setTimeout(() => void salvarTentativa(trilhaId, item.id, { texto: novo }), 500);
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Botao
          variante="primaria"
          icone={Sparkles}
          carregando={corrigindo}
          disabled={texto.trim().length < 10}
          onClick={async () => {
            setErro(null);
            const p = obterProvedor();
            if (!p.ok) {
              setErro(`Configure a IA para corrigir (falta ${p.falta}).`);
              return;
            }
            setCorrigindo(true);
            try {
              const c = await corrigirPorRubrica(p.provedor, item.enunciado, rubrica, texto);
              setCorrecao(c);
              await salvarTentativa(trilhaId, item.id, { texto, correcao: c, passou: c.nota >= 70 });
            } catch (e) {
              setErro(mensagemDeErro(e));
            } finally {
              setCorrigindo(false);
            }
          }}
        >
          Corrigir com a IA
        </Botao>
        {erro && (
          <span className="text-sm text-erro">
            {erro}{" "}
            <a className="underline" href={href.config()}>
              Configurações
            </a>
          </span>
        )}
      </div>
      {correcao && (
        <section className="rounded-xl border border-borda bg-superficie p-4" aria-live="polite">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold">Correção</h3>
            <span className={`text-lg font-bold ${correcao.nota >= 70 ? "text-sucesso" : "text-aviso"}`}>{correcao.nota}/100</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {correcao.criterios.map((c) => (
              <li key={c.criterio} className="flex gap-2">
                {c.atendido ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-sucesso" aria-hidden /> : <CircleX className="mt-0.5 size-4 shrink-0 text-erro" aria-hidden />}
                <span>
                  <span className="font-medium">{c.criterio}.</span> <span className="text-texto-2">{c.comentario}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-texto-2">{correcao.resumo}</p>
        </section>
      )}
      {!obterProvedor().ok && (
        <Aviso titulo="Sem IA configurada, a correção automática não funciona.">
          Você ainda pode comparar a sua resposta com os critérios acima e dar a sua nota, ou usar o botão "Abrir no Claude".
        </Aviso>
      )}
      <PerguntasEntrevista item={item} />
      <Estude item={item} />
      <BarraDeNota trilhaId={trilhaId} itemId={item.id} destaque={Boolean(correcao)} />
    </div>
  );
}
