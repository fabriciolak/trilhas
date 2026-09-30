/**
 * O layout estilo LeetCode: enunciado à esquerda, editor no meio, testes embaixo.
 * "Executar" roda os testes visíveis; "Enviar" roda também os ocultos e conta como entrega.
 */
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { arquivosDaExecucao, type Arquivos, type Chefe, type Codigo, type Desafio, type ExecucaoTestes, type Exercicio, type Modo, type Projeto } from "@trilhas/nucleo";
import CodeMirror from "@uiw/react-codemirror";
import { CircleCheck, CircleX, Lock, Play, RotateCcw, Send } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Markdown } from "../componentes/Markdown.tsx";
import { BarraDeNota } from "../componentes/Nota.tsx";
import { useEscuro, useLargo } from "../componentes/useTema.ts";
import { Aviso, Botao, Etiqueta } from "../componentes/ui.tsx";
import { salvarTentativa } from "../estado/acoes.ts";
import { execucaoDisponivel, modoExecutorFalso, obterExecutor, ouvirExecutor } from "../executor/index.ts";
import { Conceitos, Estude, PerguntasEntrevista } from "./Extras.tsx";

const Terminal = lazy(() => import("./Terminal.tsx").then((m) => ({ default: m.Terminal })));

type ItemComCodigo = (Exercicio | Desafio | Projeto | Chefe) & { codigo: Codigo };

const DIFICULDADE = { facil: { nome: "Fácil", tom: "sucesso" }, medio: { nome: "Médio", tom: "aviso" }, dificil: { nome: "Difícil", tom: "erro" } } as const;

function Abas<T extends string>({ abas, ativa, aoMudar }: { abas: { id: T; nome: string }[]; ativa: T; aoMudar: (a: T) => void }) {
  return (
    <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-borda px-2" role="tablist">
      {abas.map((a) => (
        <button
          key={a.id}
          type="button"
          role="tab"
          aria-selected={ativa === a.id}
          onClick={() => aoMudar(a.id)}
          className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${ativa === a.id ? "border-primaria font-medium text-texto" : "border-transparent text-texto-2 hover:text-texto"}`}
        >
          {a.nome}
        </button>
      ))}
    </div>
  );
}

function Descricao({ item, dicasVistas, aoVerDica, passou }: { item: ItemComCodigo; dicasVistas: number; aoVerDica: () => void; passou: boolean }) {
  const [aba, setAba] = useState<"descricao" | "dicas" | "editorial" | "mais">("descricao");
  const [editorialLiberado, setEditorialLiberado] = useState(false);
  const abas: { id: typeof aba; nome: string }[] = [
    { id: "descricao", nome: "Descrição" },
    { id: "dicas", nome: `Dicas (${Math.min(dicasVistas, item.dicas.length)}/${item.dicas.length})` },
    ...(item.tipo === "desafio" && item.editorial ? [{ id: "editorial" as const, nome: "Editorial" }] : []),
    { id: "mais", nome: "Entrevista e estudo" },
  ];
  return (
    <div className="flex h-full flex-col">
      <Abas abas={abas} ativa={aba} aoMudar={setAba} />
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        {aba === "descricao" && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {item.tipo === "desafio" && <Etiqueta tom={DIFICULDADE[item.dificuldade].tom}>{DIFICULDADE[item.dificuldade].nome}</Etiqueta>}
              {item.tipo === "desafio" && item.tags.map((t) => <Etiqueta key={t}>{t}</Etiqueta>)}
              {passou && (
                <Etiqueta tom="sucesso">
                  <CircleCheck className="size-3.5" aria-hidden /> resolvido
                </Etiqueta>
              )}
            </div>
            <Markdown texto={item.enunciado} />
            {item.tipo === "desafio" &&
              item.exemplos.map((ex, i) => (
                <div key={i} className="rounded-lg border border-borda bg-codigo p-3 font-mono text-sm">
                  <p className="font-sans text-xs font-semibold text-texto-3">Exemplo {i + 1}</p>
                  <p className="mt-1">
                    <span className="text-texto-3">Entrada:</span> {ex.entrada}
                  </p>
                  <p>
                    <span className="text-texto-3">Saída:</span> {ex.saida}
                  </p>
                  {ex.explicacao && <p className="font-sans text-texto-2">{ex.explicacao}</p>}
                </div>
              ))}
            {item.tipo === "desafio" && item.restricoes.length > 0 && (
              <div>
                <p className="text-sm font-semibold">Restrições</p>
                <ul className="mt-1 list-disc pl-5 font-mono text-xs text-texto-2">
                  {item.restricoes.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {(item.tipo === "chefe" || item.tipo === "projeto") && item.rubrica.length > 0 && (
              <div>
                <p className="text-sm font-semibold">O que também conta</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-texto-2">
                  {item.rubrica.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <Conceitos item={item} />
          </>
        )}
        {aba === "dicas" && (
          <div className="space-y-3">
            {item.dicas.length === 0 && <p className="text-sm text-texto-2">Este item não tem dicas escritas. Peça uma ao tutor.</p>}
            {item.dicas.slice(0, dicasVistas).map((d, i) => (
              <div key={i} className="rounded-lg border border-borda bg-superficie-2 p-3 text-sm">
                <p className="text-xs font-semibold text-texto-3">Dica {i + 1}</p>
                <Markdown texto={d} />
              </div>
            ))}
            {dicasVistas < item.dicas.length && (
              <Botao onClick={aoVerDica}>{dicasVistas === 0 ? "Ver a primeira dica" : "Ver a próxima dica (mais direta)"}</Botao>
            )}
          </div>
        )}
        {aba === "editorial" &&
          item.tipo === "desafio" &&
          (passou || editorialLiberado ? (
            <Markdown texto={item.editorial} />
          ) : (
            <Aviso titulo="O editorial explica a solução.">
              Resolva antes, ou abra mesmo assim (conta como "travei" na nota).
              <div className="mt-2">
                <Botao onClick={() => setEditorialLiberado(true)}>Abrir o editorial</Botao>
              </div>
            </Aviso>
          ))}
        {aba === "mais" && (
          <>
            <PerguntasEntrevista item={item} />
            <Estude item={item} />
          </>
        )}
      </div>
    </div>
  );
}

function Resultado({ resultado, rodando, etapa }: { resultado: (ExecucaoTestes & { modo: Modo }) | null; rodando: Modo | null; etapa: string | null }) {
  if (rodando) return <p className="p-4 text-sm text-texto-2">{etapa ?? "Rodando..."}</p>;
  if (!resultado) return <p className="p-4 text-sm text-texto-3">Rode os testes para ver o resultado aqui.</p>;
  const passaram = resultado.testes.filter((t) => t.passou).length;
  return (
    <div className="space-y-3 p-4">
      <p className={`text-base font-semibold ${resultado.ok ? "text-sucesso" : "text-erro"}`} role="status">
        {resultado.ok
          ? resultado.modo === "enviar"
            ? "Aceito: passou em todos os testes, inclusive os ocultos."
            : "Passou nos testes visíveis. Agora envie (os ocultos testam casos de borda)."
          : resultado.testes.length
            ? `${passaram} de ${resultado.testes.length} testes passaram.`
            : "Os testes não rodaram: veja o console."}
      </p>
      <ul className="space-y-1.5">
        {resultado.testes.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm">
            {t.passou ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-sucesso" aria-hidden /> : <CircleX className="mt-0.5 size-4 shrink-0 text-erro" aria-hidden />}
            <div className="min-w-0">
              <p>{t.nome}</p>
              {!t.passou && t.mensagem && <p className="break-words font-mono text-xs text-texto-2">{t.mensagem}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CodigoView({
  trilhaId,
  item,
  arquivosSalvos,
  dicasSalvas,
  passouSalvo,
  aoMudarContexto,
}: {
  trilhaId: string;
  item: ItemComCodigo;
  arquivosSalvos?: Arquivos;
  dicasSalvas?: number;
  passouSalvo?: boolean;
  aoMudarContexto: (ctx: { arquivos?: Arquivos; saidaTestes?: string }) => void;
}) {
  const c = item.codigo;
  const editaveis = Object.keys(c.inicial);
  const somenteLeitura = Object.keys(c.testes);
  const [arquivos, setArquivos] = useState<Arquivos>(() => ({ ...c.inicial, ...arquivosSalvos }));
  const [ativo, setAtivo] = useState(c.abrir);
  const [resultado, setResultado] = useState<(ExecucaoTestes & { modo: Modo }) | null>(null);
  const [rodando, setRodando] = useState<Modo | null>(null);
  const [etapa, setEtapa] = useState<string | null>(null);
  const [saida, setSaida] = useState("");
  const [aba, setAba] = useState<"resultado" | "console" | "terminal">("resultado");
  const [dicasVistas, setDicasVistas] = useState(dicasSalvas ?? 0);
  const [passou, setPassou] = useState(Boolean(passouSalvo));
  const [erro, setErro] = useState<string | null>(null);
  const escuro = useEscuro();
  const largo = useLargo();
  const disponivel = execucaoDisponivel();
  const salvar = useRef<ReturnType<typeof setTimeout>>(undefined);

  // O tutor recebe o código ao abrir o item; depois, a cada edição (em editar).
  useEffect(() => {
    aoMudarContexto({ arquivos });
  }, []);
  useEffect(() => () => clearTimeout(salvar.current), []);

  const extensoes = useMemo(
    () => [javascript({ jsx: /\.[jt]sx$/.test(ativo), typescript: /\.tsx?$/.test(ativo) })],
    [ativo],
  );
  const conteudoAtivo = ativo in arquivos ? arquivos[ativo] : c.testes[ativo];
  const ehLeitura = !editaveis.includes(ativo);

  function editar(valor: string) {
    const novos = { ...arquivos, [ativo]: valor };
    setArquivos(novos);
    aoMudarContexto({ arquivos: novos });
    clearTimeout(salvar.current);
    salvar.current = setTimeout(() => void salvarTentativa(trilhaId, item.id, { arquivos: novos }), 500);
  }

  async function rodar(modo: Modo) {
    setErro(null);
    setRodando(modo);
    setSaida("");
    setAba("resultado");
    const parar = ouvirExecutor((e) => (e.tipo === "saida" ? setSaida((s) => s + e.texto) : setEtapa(e.texto)));
    try {
      const r = await obterExecutor().rodar(c.template, arquivosDaExecucao(item, arquivos, modo));
      setResultado({ ...r, modo });
      setSaida((s) => s || r.saida); // sem streaming (executor falso), mostra a saída final
      aoMudarContexto({ arquivos, saidaTestes: r.saida });
      if (modo === "enviar" && r.ok) {
        setPassou(true);
        await salvarTentativa(trilhaId, item.id, { arquivos, passou: true });
      }
    } catch (e) {
      setErro((e as Error).message);
      setAba("console");
    } finally {
      parar();
      setRodando(null);
      setEtapa(null);
    }
  }

  const barraDeAcoes = (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-borda bg-superficie px-3 py-2">
      <Botao
        variante="fantasma"
        icone={RotateCcw}
        onClick={() => {
          if (window.confirm("Voltar ao código inicial? O que você escreveu neste item se perde.")) {
            setArquivos({ ...c.inicial });
            void salvarTentativa(trilhaId, item.id, { arquivos: { ...c.inicial } });
          }
        }}
      >
        Recomeçar
      </Botao>
      <div className="ml-auto flex gap-2">
        <Botao icone={Play} onClick={() => rodar("executar")} carregando={rodando === "executar"} disabled={!disponivel.ok || rodando !== null}>
          Executar
        </Botao>
        <Botao variante="primaria" icone={Send} onClick={() => rodar("enviar")} carregando={rodando === "enviar"} disabled={!disponivel.ok || rodando !== null}>
          Enviar
        </Botao>
      </div>
    </div>
  );

  const editor = (
    <div className="flex h-full min-h-0 flex-col bg-superficie">
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-borda px-2" role="tablist" aria-label="Arquivos">
        {[...editaveis, ...somenteLeitura].map((nome) => (
          <button
            key={nome}
            type="button"
            role="tab"
            aria-selected={ativo === nome}
            onClick={() => setAtivo(nome)}
            className={`flex items-center gap-1 whitespace-nowrap border-b-2 px-3 py-2 font-mono text-xs ${ativo === nome ? "border-primaria text-texto" : "border-transparent text-texto-2 hover:text-texto"}`}
          >
            {!editaveis.includes(nome) && <Lock className="size-3" aria-label="somente leitura" />}
            {nome}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden" data-testid="editor">
        <CodeMirror
          value={conteudoAtivo ?? ""}
          height="100%"
          className="h-full"
          theme={escuro ? oneDark : "light"}
          extensions={extensoes}
          editable={!ehLeitura}
          readOnly={ehLeitura}
          onChange={editar}
          basicSetup={{ tabSize: 2 }}
          aria-label={`Editor: ${ativo}`}
        />
      </div>
      {barraDeAcoes}
    </div>
  );

  const painelDeResultados = (
    <div className="flex h-full min-h-0 flex-col bg-superficie">
      <Abas
        abas={[
          { id: "resultado" as const, nome: "Resultado" },
          { id: "console" as const, nome: "Console" },
          ...(disponivel.ok && !modoExecutorFalso() ? [{ id: "terminal" as const, nome: "Terminal" }] : []),
        ]}
        ativa={aba}
        aoMudar={setAba}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!disponivel.ok && (
          <div className="p-4">
            <Aviso titulo="Este navegador não roda os testes aqui.">
              Motivo: {disponivel.motivo}. Use o Chrome ou o Edge, ou valide pela linha de comando (<code>trilhas validar</code>).
            </Aviso>
          </div>
        )}
        {erro && (
          <div className="p-4">
            <Aviso tom="erro" titulo="Não deu para rodar.">
              {erro}
            </Aviso>
          </div>
        )}
        {aba === "resultado" && <Resultado resultado={resultado} rodando={rodando} etapa={etapa} />}
        {aba === "console" && <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs text-texto-2">{saida || "(nada ainda)"}</pre>}
        {aba === "terminal" && (
          <Suspense fallback={<p className="p-4 text-sm text-texto-2">Abrindo o terminal...</p>}>
            <div className="h-full min-h-48">
              <Terminal pasta={c.template} escuro={escuro} />
            </div>
          </Suspense>
        )}
        {passou && (
          <div className="p-4 pt-0">
            <BarraDeNota trilhaId={trilhaId} itemId={item.id} destaque />
          </div>
        )}
      </div>
    </div>
  );

  const descricao = (
    <div className="h-full min-h-0 bg-superficie">
      <Descricao
        item={item}
        passou={passou}
        dicasVistas={dicasVistas}
        aoVerDica={() => {
          const n = dicasVistas + 1;
          setDicasVistas(n);
          void salvarTentativa(trilhaId, item.id, { dicasVistas: n });
        }}
      />
    </div>
  );

  if (!largo) {
    return (
      <div className="flex flex-col gap-3 p-3">
        <div className="max-h-[60vh] overflow-hidden rounded-xl border border-borda">{descricao}</div>
        <div className="h-[55vh] overflow-hidden rounded-xl border border-borda">{editor}</div>
        <div className="min-h-64 overflow-hidden rounded-xl border border-borda">{painelDeResultados}</div>
      </div>
    );
  }

  return (
    <Group orientation="horizontal" className="h-full">
      <Panel defaultSize="38%" minSize="22%">
        {descricao}
      </Panel>
      <Separator className="separador w-1" />
      <Panel minSize="30%">
        <Group orientation="vertical" className="h-full">
          <Panel defaultSize="62%" minSize="20%">
            {editor}
          </Panel>
          <Separator className="separador h-1" />
          <Panel minSize="15%">{painelDeResultados}</Panel>
        </Group>
      </Panel>
    </Group>
  );
}
