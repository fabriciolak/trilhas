import { extrairJson, gerarRoteiro, linkAbrirNoClaude, lerTrilha, promptRoadmap, type Briefing, type Trilha } from "@trilhas/nucleo";
import { ClipboardPaste, ExternalLink, RotateCcw, Save, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "../componentes/Markdown.tsx";
import { Aviso, Botao, Cartao } from "../componentes/ui.tsx";
import { salvarTrilha } from "../estado/acoes.ts";
import { db } from "../estado/db.ts";
import { mensagemDeErro, obterProvedor } from "../ia/provedor.ts";
import { href, navegar } from "../rota.ts";

const DURACOES = [
  { semanas: 4, nome: "1 mês" },
  { semanas: 8, nome: "2 meses" },
  { semanas: 13, nome: "3 meses" },
  { semanas: 26, nome: "6 meses" },
  { semanas: 52, nome: "1 ano" },
];

const campo = "w-full rounded-lg border border-borda bg-fundo px-3 py-2 text-sm";

async function idLivre(id: string): Promise<string> {
  let candidato = id;
  for (let n = 2; await db.trilhas.get(candidato); n++) candidato = `${id}-${n}`;
  return candidato;
}

function Previa({ trilha }: { trilha: Trilha }) {
  return (
    <Cartao className="p-5">
      <h2 className="text-xl font-semibold">{trilha.titulo}</h2>
      {trilha.objetivo && <p className="mt-1 text-sm text-texto-2">{trilha.objetivo}</p>}
      {trilha.racional && (
        <div className="mt-4 rounded-lg bg-superficie-2 p-3 text-sm">
          <p className="font-semibold">Como o roteiro foi pensado</p>
          <Markdown texto={trilha.racional} className="mt-1 text-texto-2" />
        </div>
      )}
      <ol className="mt-5 space-y-4">
        {trilha.meses.map((m) => (
          <li key={m.numero}>
            <p className="text-xs font-semibold uppercase tracking-wider text-primaria">Mês {m.numero}</p>
            <p className="font-medium">{m.titulo}</p>
            {m.marco && <p className="text-sm text-texto-2">Marco: {m.marco}</p>}
            <ul className="mt-1 space-y-0.5 text-sm">
              {m.semanas.map((s) => (
                <li key={s.numero}>
                  <span className="text-texto-3">Semana {s.numero}:</span> {s.tema}
                  {s.objetivo && <span className="text-texto-3"> · {s.objetivo}</span>}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Cartao>
  );
}

export function NovaTrilha() {
  const [briefing, setBriefing] = useState<Briefing>({ assunto: "", objetivo: "", nivelInicial: "zero", horasPorSemana: 6, semanas: 13, observacoes: "" });
  const [roteiro, setRoteiro] = useState<Trilha | null>(null);
  const [ajuste, setAjuste] = useState("");
  const [gerando, setGerando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [colado, setColado] = useState("");
  const cancelar = useRef<AbortController | null>(null);
  const provedor = obterProvedor();

  useEffect(() => {
    if (!gerando) return;
    setSegundos(0);
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [gerando]);

  async function gerar(observacoesExtras?: string) {
    setErro(null);
    const p = obterProvedor();
    if (!p.ok) {
      setErro(`Configure a IA (falta ${p.falta}), ou monte no claude.ai com o botão abaixo.`);
      return;
    }
    cancelar.current = new AbortController();
    setGerando(true);
    try {
      const pedido: Briefing = {
        ...briefing,
        observacoes: [briefing.observacoes, observacoesExtras].filter(Boolean).join("\n"),
      };
      setRoteiro(await gerarRoteiro(p.provedor, pedido, cancelar.current.signal));
      setAjuste("");
    } catch (e) {
      if (!cancelar.current.signal.aborted) setErro(mensagemDeErro(e));
    } finally {
      setGerando(false);
    }
  }

  async function salvar(trilha: Trilha) {
    const id = await idLivre(trilha.id);
    const final = { ...trilha, id, criadaEm: new Date().toISOString() };
    await salvarTrilha(final);
    navegar(href.trilha(id));
  }

  const pronto = briefing.assunto.trim().length >= 3;
  const pedidoClaude = (() => {
    const { sistema, usuario } = promptRoadmap(briefing);
    return `${sistema}\n\n${usuario}`;
  })();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Nova trilha</h1>
      <p className="mt-1 text-sm text-texto-2">
        Diga o que quer aprender. A IA monta o roteiro do básico até onde dá para chegar no seu prazo; você revisa, pede ajustes e salva. O conteúdo de
        cada semana é escrito quando ela chega, com o código testado aqui mesmo.
      </p>

      {!roteiro && (
        <Cartao className="mt-6 space-y-4 p-5">
          <label className="block">
            <span className="text-sm font-medium">O que você quer aprender?</span>
            <textarea
              className={`${campo} mt-1 min-h-20`}
              value={briefing.assunto}
              onChange={(e) => setBriefing({ ...briefing, assunto: e.target.value })}
              placeholder="Ex.: React com TypeScript; Python para análise de dados; inglês para entrevistas; violão..."
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Para quê?</span>
            <input
              className={`${campo} mt-1`}
              value={briefing.objetivo}
              onChange={(e) => setBriefing({ ...briefing, objetivo: e.target.value })}
              placeholder="Ex.: conseguir uma vaga de front-end júnior; montar um app para a minha loja"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium">Seu nível hoje</span>
              <select className={`${campo} mt-1`} value={briefing.nivelInicial} onChange={(e) => setBriefing({ ...briefing, nivelInicial: e.target.value as Briefing["nivelInicial"] })}>
                <option value="zero">Do zero</option>
                <option value="basico">Básico</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Horas por semana</span>
              <input
                type="number"
                min={1}
                max={60}
                className={`${campo} mt-1`}
                value={briefing.horasPorSemana}
                onChange={(e) => setBriefing({ ...briefing, horasPorSemana: Math.max(1, Number(e.target.value) || 1) })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Prazo</span>
              <select className={`${campo} mt-1`} value={briefing.semanas} onChange={(e) => setBriefing({ ...briefing, semanas: Number(e.target.value) })}>
                {DURACOES.map((d) => (
                  <option key={d.semanas} value={d.semanas}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Algo mais? (opcional)</span>
            <input
              className={`${campo} mt-1`}
              value={briefing.observacoes}
              onChange={(e) => setBriefing({ ...briefing, observacoes: e.target.value })}
              placeholder="Ex.: já sei HTML e CSS; prefiro projetos práticos; sem matemática pesada"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {gerando ? (
              <>
                <Botao variante="primaria" carregando>
                  Montando o roteiro... {segundos}s
                </Botao>
                <Botao variante="fantasma" onClick={() => cancelar.current?.abort()}>
                  Cancelar
                </Botao>
              </>
            ) : (
              <Botao variante="primaria" icone={Sparkles} disabled={!pronto} onClick={() => gerar()}>
                Montar o roteiro com a IA
              </Botao>
            )}
            {!provedor.ok && (
              <span className="text-sm text-texto-2">
                Sem IA configurada.{" "}
                <a className="text-primaria underline" href={href.config()}>
                  Configurar
                </a>
              </span>
            )}
          </div>
          {erro && <Aviso tom="erro" titulo={erro} />}
        </Cartao>
      )}

      {!roteiro && (
        <details className="mt-6 rounded-xl border border-borda bg-superficie p-5">
          <summary className="cursor-pointer font-medium">Sem chave de API? Monte no claude.ai (ou no Claude Desktop, com o MCP)</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-texto-2">
            <li>Preencha o formulário acima.</li>
            <li>
              <Botao
                icone={ExternalLink}
                disabled={!pronto}
                onClick={() => window.open(linkAbrirNoClaude(pedidoClaude, 12000).url, "_blank", "noopener,noreferrer")}
              >
                Abrir o pedido no claude.ai
              </Botao>
            </li>
            <li>Copie o JSON que o Claude responder e cole aqui:</li>
          </ol>
          <textarea className={`${campo} mt-2 min-h-32 font-mono text-xs`} value={colado} onChange={(e) => setColado(e.target.value)} placeholder='{"id": "...", "titulo": "...", "meses": [...]}' aria-label="JSON do roteiro" />
          <Botao
            className="mt-2"
            icone={ClipboardPaste}
            disabled={!colado.trim()}
            onClick={() => {
              setErro(null);
              try {
                const r = lerTrilha(extrairJson(colado));
                if (!r.ok) throw new Error(`O JSON não é um roteiro válido:\n${r.erros.slice(0, 6).join("\n")}`);
                setRoteiro({ ...r.trilha, origem: "ia" });
              } catch (e) {
                setErro((e as Error).message);
              }
            }}
          >
            Usar este roteiro
          </Botao>
          <p className="mt-3 text-xs text-texto-3">
            Com o Claude Desktop ou o Claude Code, o servidor MCP das trilhas faz tudo isso direto na sua pasta de trabalho: veja Configurações.
          </p>
        </details>
      )}

      {roteiro && (
        <div className="mt-6 space-y-4">
          <Previa trilha={roteiro} />
          <Cartao className="space-y-3 p-5">
            <label className="block">
              <span className="text-sm font-medium">Quer mudar alguma coisa?</span>
              <textarea
                className={`${campo} mt-1 min-h-16`}
                value={ajuste}
                onChange={(e) => setAjuste(e.target.value)}
                placeholder="Ex.: mais prática e menos teoria; incluir testes no mês 2; terminar com um projeto de portfólio"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Botao variante="primaria" icone={Save} onClick={() => salvar(roteiro)} disabled={gerando}>
                Salvar a trilha
              </Botao>
              <Botao
                icone={Sparkles}
                carregando={gerando}
                disabled={!ajuste.trim()}
                onClick={() => gerar(`Ajuste pedido sobre o roteiro anterior ("${roteiro.titulo}", ${roteiro.meses.flatMap((m) => m.semanas).length} semanas): ${ajuste}`)}
              >
                Refazer com o ajuste
              </Botao>
              <Botao variante="fantasma" icone={RotateCcw} onClick={() => setRoteiro(null)}>
                Voltar ao formulário
              </Botao>
            </div>
            {erro && <Aviso tom="erro" titulo={erro} />}
          </Cartao>
        </div>
      )}
    </div>
  );
}
