import { acharItem, itensDaTrilha, temCodigo, type Correcao, type Item } from "@trilhas/nucleo";
import { Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLargo } from "../componentes/useTema.ts";
import { Aviso, Botao, Carregando, IconeTipo, Nivel, nomeDoTipo } from "../componentes/ui.tsx";
import { lerTentativa } from "../estado/acoes.ts";
import type { Tentativa } from "../estado/db.ts";
import { useTrilha } from "../estado/hooks.ts";
import { AbertaView } from "../itens/AbertaView.tsx";
import { AulaView } from "../itens/AulaView.tsx";
import { CodigoView } from "../itens/CodigoView.tsx";
import { LocalView } from "../itens/LocalView.tsx";
import { QuizView } from "../itens/QuizView.tsx";
import { href } from "../rota.ts";
import { BotaoAbrirNoClaude, Tutor, type ContextoAtual } from "../tutor/Tutor.tsx";

function Conteudo({ trilhaId, item, tentativa, aoMudarContexto }: { trilhaId: string; item: Item; tentativa?: Tentativa; aoMudarContexto: (c: ContextoAtual) => void }) {
  if (temCodigo(item) && item.tipo !== "aula" && item.tipo !== "quiz" && item.tipo !== "aberta" && item.tipo !== "local") {
    return (
      <CodigoView
        trilhaId={trilhaId}
        item={item}
        arquivosSalvos={tentativa?.arquivos}
        dicasSalvas={tentativa?.dicasVistas}
        passouSalvo={tentativa?.passou}
        aoMudarContexto={aoMudarContexto}
      />
    );
  }
  switch (item.tipo) {
    case "aula":
      return <AulaView trilhaId={trilhaId} item={item} respostas={tentativa?.respostasQuiz} />;
    case "quiz":
      return <QuizView trilhaId={trilhaId} item={item} respostas={tentativa?.respostasQuiz} />;
    case "local":
      return <LocalView trilhaId={trilhaId} item={item} />;
    case "aberta":
    case "projeto":
    case "chefe":
      return (
        <AbertaView
          trilhaId={trilhaId}
          item={item}
          textoSalvo={tentativa?.texto}
          correcaoSalva={tentativa?.correcao as Correcao | undefined}
          aoMudarTexto={(texto) => aoMudarContexto({ texto })}
        />
      );
    default:
      return <Aviso tom="erro" titulo="Tipo de item desconhecido." />;
  }
}

export function ItemPagina({ trilhaId, itemId }: { trilhaId: string; itemId: string }) {
  const trilha = useTrilha(trilhaId);
  const [tentativa, setTentativa] = useState<Tentativa | undefined | null>(null);
  const [tutorAberto, setTutorAberto] = useState(false);
  const [contexto, setContexto] = useState<ContextoAtual>({});
  const contextoRef = useRef<ContextoAtual>({});
  const largo = useLargo(1100);

  useEffect(() => {
    let vivo = true;
    setTentativa(null);
    setContexto({});
    contextoRef.current = {};
    void lerTentativa(trilhaId, itemId).then((t) => vivo && setTentativa(t));
    return () => {
      vivo = false;
    };
  }, [trilhaId, itemId]);

  const aoMudarContexto = useCallback((parcial: ContextoAtual) => {
    contextoRef.current = { ...contextoRef.current, ...parcial };
    setContexto(contextoRef.current);
  }, []);

  if (trilha === undefined || tentativa === null) return <Carregando />;
  const posicao = trilha ? acharItem(trilha, itemId) : undefined;
  if (!trilha || !posicao)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Aviso tom="erro" titulo="Item não encontrado.">
          <a className="underline" href={trilha ? href.trilha(trilha.id) : href.inicio()}>
            Voltar
          </a>
        </Aviso>
      </div>
    );

  const { item } = posicao;
  const todos = itensDaTrilha(trilha);
  const i = todos.findIndex((p) => p.item.id === item.id);
  const anterior = todos[i - 1];
  const proximo = todos[i + 1];
  const comCodigo = temCodigo(item) && ["exercicio", "desafio", "projeto", "chefe"].includes(item.tipo);
  const semana = trilha.meses.flatMap((m) => m.semanas).find((s) => s.numero === posicao.semana);

  return (
    <div className={`flex flex-col ${comCodigo && largo ? "h-[calc(100dvh-3.5rem)]" : ""}`}>
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-borda bg-superficie px-4 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-texto-3">
            <a href={href.trilha(trilha.id)} className="hover:underline">
              {trilha.titulo}
            </a>{" "}
            › Mês {posicao.mes} › Semana {posicao.semana}
            {semana ? `: ${semana.tema}` : ""}
          </p>
          <h1 className="flex items-center gap-2 truncate font-semibold">
            <IconeTipo tipo={item.tipo} className={`size-4 shrink-0 ${item.tipo === "chefe" ? "text-aviso" : "text-primaria"}`} />
            <span className="truncate">{item.titulo}</span>
            <span className="hidden shrink-0 text-xs font-normal text-texto-3 sm:inline">{nomeDoTipo(item)}</span>
            <Nivel nivel={item.nivel} />
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {!tutorAberto && <BotaoAbrirNoClaude trilha={trilha} item={item} contexto={contexto} />}
          <Botao variante={tutorAberto ? "primaria" : "secundaria"} icone={Bot} onClick={() => setTutorAberto(!tutorAberto)} aria-pressed={tutorAberto}>
            Tutor
          </Botao>
          <a
            href={anterior ? href.item(trilha.id, anterior.item.id) : undefined}
            aria-disabled={!anterior}
            className={`rounded-lg p-2 ${anterior ? "text-texto-2 hover:bg-superficie-2" : "pointer-events-none text-texto-3 opacity-40"}`}
            aria-label="Item anterior"
            title={anterior?.item.titulo}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </a>
          <a
            href={proximo ? href.item(trilha.id, proximo.item.id) : undefined}
            aria-disabled={!proximo}
            className={`rounded-lg p-2 ${proximo ? "text-texto-2 hover:bg-superficie-2" : "pointer-events-none text-texto-3 opacity-40"}`}
            aria-label="Próximo item"
            title={proximo?.item.titulo}
          >
            <ChevronRight className="size-4" aria-hidden />
          </a>
        </div>
      </div>
      <div className={`flex min-h-0 flex-1 ${largo ? "flex-row" : "flex-col"}`}>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <Conteudo key={item.id} trilhaId={trilha.id} item={item} tentativa={tentativa} aoMudarContexto={aoMudarContexto} />
        </div>
        {tutorAberto && (
          <div className={largo ? "w-[400px] shrink-0" : "h-[70vh] border-t border-borda"}>
            <Tutor trilha={trilha} item={item} contexto={contexto} aoFechar={() => setTutorAberto(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
