/**
 * O tutor: conversa com streaming, com o contexto do item (enunciado, testes, o código da
 * pessoa e a última saída dos testes), sem a solução. Os modos mudam o jeito de ajudar.
 * "Abrir no Claude" leva o mesmo contexto para o claude.ai, sem chave de API.
 */
import { linkAbrirNoClaude, MODOS_TUTOR, promptTutor, textoParaClaude, type Item, type Mensagem, type ModoTutor, type Trilha } from "@trilhas/nucleo";
import { ExternalLink, Send, Square, Trash, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "../componentes/Markdown.tsx";
import { Aviso, Botao } from "../componentes/ui.tsx";
import { chaveItem, db } from "../estado/db.ts";
import { mensagemDeErro, obterProvedor } from "../ia/provedor.ts";
import { href } from "../rota.ts";

export interface ContextoAtual {
  arquivos?: Record<string, string>;
  saidaTestes?: string;
  texto?: string;
}

const ATALHOS: { modo: ModoTutor; pedido: string }[] = [
  { modo: "dica", pedido: "Me dá uma dica?" },
  { modo: "erro", pedido: "O que esse erro dos testes quer dizer?" },
  { modo: "revisao", pedido: "Pode revisar meu código?" },
  { modo: "sabatina", pedido: "Me sabatina sobre este assunto." },
];

export function BotaoAbrirNoClaude({ trilha, item, contexto, pedido = "Me ajude com este item, sem me dar a solução pronta." }: { trilha: Trilha; item: Item; contexto: ContextoAtual; pedido?: string }) {
  return (
    <Botao
      variante="fantasma"
      icone={ExternalLink}
      onClick={() => {
        const texto = textoParaClaude({ trilha, item, arquivos: contexto.arquivos, saidaTestes: contexto.saidaTestes }, pedido);
        window.open(linkAbrirNoClaude(texto).url, "_blank", "noopener,noreferrer");
      }}
      title="Abre o claude.ai numa aba nova, com o contexto deste item (usa a sua assinatura, sem chave de API)"
    >
      Abrir no Claude
    </Botao>
  );
}

export function Tutor({ trilha, item, contexto, aoFechar }: { trilha: Trilha; item: Item; contexto: ContextoAtual; aoFechar: () => void }) {
  const chave = chaveItem(trilha.id, item.id);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [resposta, setResposta] = useState<string | null>(null);
  const [entrada, setEntrada] = useState("");
  const [modo, setModo] = useState<ModoTutor>("livre");
  const [erro, setErro] = useState<string | null>(null);
  const cancelar = useRef<AbortController | null>(null);
  const fim = useRef<HTMLDivElement>(null);
  const provedor = obterProvedor();

  useEffect(() => {
    let vivo = true;
    void db.conversas.get(chave).then((c) => vivo && setMensagens(c?.mensagens ?? []));
    return () => {
      vivo = false;
      cancelar.current?.abort();
    };
  }, [chave]);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: "end" });
  }, [mensagens, resposta]);

  async function enviar(texto: string, modoDoPedido: ModoTutor) {
    if (!texto.trim() || resposta !== null) return;
    setErro(null);
    const p = obterProvedor();
    if (!p.ok) {
      setErro(`Configure a IA (falta ${p.falta}) ou use "Abrir no Claude".`);
      return;
    }
    const historico: Mensagem[] = [...mensagens, { papel: "user", conteudo: texto.trim() }];
    setMensagens(historico);
    setEntrada("");
    setModo(modoDoPedido);
    setResposta("");
    cancelar.current = new AbortController();
    const dicasDadas = mensagens.filter((m) => m.papel === "user" && m.conteudo === ATALHOS[0]?.pedido).length;
    let acumulado = "";
    try {
      for await (const pedaco of p.provedor.conversar({
        sistema: promptTutor(modoDoPedido, { trilha, item, arquivos: contexto.arquivos, saidaTestes: contexto.saidaTestes, dicasDadas }),
        mensagens: historico.slice(-20),
        maxTokens: 4000,
        esforco: modoDoPedido === "dica" ? "low" : "medium",
        sinal: cancelar.current.signal,
      })) {
        acumulado += pedaco;
        setResposta(acumulado);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError" && !cancelar.current.signal.aborted) setErro(mensagemDeErro(e));
    } finally {
      const final: Mensagem[] = acumulado ? [...historico, { papel: "assistant", conteudo: acumulado }] : historico;
      setMensagens(final);
      setResposta(null);
      await db.conversas.put({ chave, mensagens: final });
    }
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-borda bg-superficie" aria-label="Tutor">
      <div className="flex shrink-0 items-center gap-2 border-b border-borda px-3 py-2">
        <p className="font-semibold">Tutor</p>
        <span className="text-xs text-texto-3">{provedor.ok ? provedor.provedor.id.replace(":", " · ") : "sem IA configurada"}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1.5 text-texto-3 hover:bg-superficie-2 hover:text-texto"
            title="Apagar a conversa"
            aria-label="Apagar a conversa"
            onClick={async () => {
              cancelar.current?.abort();
              setMensagens([]);
              await db.conversas.delete(chave);
            }}
          >
            <Trash className="size-4" aria-hidden />
          </button>
          <button type="button" className="rounded p-1.5 text-texto-3 hover:bg-superficie-2 hover:text-texto" onClick={aoFechar} aria-label="Fechar o tutor">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
        {mensagens.length === 0 && resposta === null && (
          <div className="space-y-2 text-sm text-texto-2">
            <p>Pergunte o que quiser sobre este item. O tutor vê o enunciado, o seu código e a saída dos testes, mas não a solução: ele ensina, não resolve por você.</p>
            {!provedor.ok && (
              <Aviso titulo="Sem IA configurada.">
                Configure uma chave (Claude, OpenAI e compatíveis) ou o Ollama em{" "}
                <a className="underline" href={href.config()}>
                  Configurações
                </a>
                , ou use "Abrir no Claude" (usa a sua conta do claude.ai).
              </Aviso>
            )}
          </div>
        )}
        {mensagens.map((m, i) =>
          m.papel === "user" ? (
            <div key={i} className="ml-8 rounded-xl bg-primaria-2 px-3 py-2 text-sm">
              {m.conteudo}
            </div>
          ) : (
            <Markdown key={i} texto={m.conteudo} className="text-sm" />
          ),
        )}
        {resposta !== null && (resposta ? <Markdown texto={resposta} className="text-sm" /> : <p className="text-sm text-texto-3">Pensando...</p>)}
        {erro && <Aviso tom="erro" titulo={erro} />}
        <div ref={fim} />
      </div>

      <div className="shrink-0 space-y-2 border-t border-borda p-3">
        <div className="flex flex-wrap gap-1.5">
          {ATALHOS.map((a) => (
            <button
              key={a.modo}
              type="button"
              disabled={resposta !== null}
              onClick={() => enviar(a.pedido, a.modo)}
              className="rounded-full border border-borda px-2.5 py-1 text-xs text-texto-2 hover:border-primaria hover:text-primaria disabled:opacity-50"
            >
              {MODOS_TUTOR[a.modo]}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar(entrada, modo === "sabatina" ? "sabatina" : "livre");
          }}
        >
          <textarea
            aria-label="Mensagem para o tutor"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void enviar(entrada, modo === "sabatina" ? "sabatina" : "livre");
              }
            }}
            rows={2}
            placeholder="Escreva a sua dúvida (Enter envia)"
            className="min-w-0 flex-1 resize-none rounded-lg border border-borda bg-fundo px-3 py-2 text-sm"
          />
          {resposta !== null ? (
            <Botao icone={Square} onClick={() => cancelar.current?.abort()} aria-label="Parar a resposta">
              Parar
            </Botao>
          ) : (
            <Botao type="submit" variante="primaria" icone={Send} disabled={!entrada.trim()} aria-label="Enviar">
              Enviar
            </Botao>
          )}
        </form>
        <BotaoAbrirNoClaude trilha={trilha} item={item} contexto={contexto} pedido={entrada.trim() || undefined} />
      </div>
    </aside>
  );
}
