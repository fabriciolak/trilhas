import { comSemana, gerarSemana, itensDaTrilha, resumo, situacao, treinoDeHoje, type Progresso, type Semana, type Trilha } from "@trilhas/nucleo";
import { ChartColumn, ChevronRight, Download, Play, Sparkles, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { Markdown } from "../componentes/Markdown.tsx";
import { Aviso, Barra, Botao, Cartao, Carregando, Etiqueta, IconeTipo, Nivel, nomeDoTipo } from "../componentes/ui.tsx";
import { apagarTrilha, hoje, salvarTrilha } from "../estado/acoes.ts";
import { useProgresso, useTrilha } from "../estado/hooks.ts";
import { execucaoDisponivel, obterExecutor } from "../executor/index.ts";
import { mensagemDeErro, obterProvedor } from "../ia/provedor.ts";
import { href, navegar } from "../rota.ts";

/** Um resumo das notas para a IA ajustar a dificuldade da próxima semana. */
function notasParaIa(progresso: Progresso): string | undefined {
  const recentes = progresso.historico.slice(-12);
  if (recentes.length === 0) return undefined;
  const conta = { travei: 0, sofri: 0, tranquilo: 0 };
  for (const r of recentes) conta[r.nota]++;
  return `nas últimas ${recentes.length} notas: ${conta.tranquilo} tranquilo, ${conta.sofri} sofri, ${conta.travei} travei`;
}

function SemanaBloco({ trilha, semana, progresso }: { trilha: Trilha; semana: Semana; progresso: Progresso }) {
  const [etapa, setEtapa] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const cancelar = useRef<AbortController | null>(null);
  const dia = hoje();

  async function gerar() {
    setErro(null);
    const p = obterProvedor();
    if (!p.ok) {
      setErro(`Configure a IA primeiro: falta ${p.falta}.`);
      return;
    }
    cancelar.current = new AbortController();
    try {
      setEtapa("Pedindo o conteúdo para a IA...");
      const temExecucao = execucaoDisponivel().ok;
      const r = await gerarSemana(p.provedor, trilha, semana.numero, {
        executor: temExecucao ? obterExecutor() : undefined,
        notas: notasParaIa(progresso),
        aoAvancar: setEtapa,
        sinal: cancelar.current.signal,
      });
      await salvarTrilha(comSemana(trilha, r.semana));
      if (r.naoVerificados.length) setErro(`${r.naoVerificados.length} item(ns) não passaram na validação e ficaram marcados como "não verificado".`);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setErro(mensagemDeErro(e));
    } finally {
      setEtapa(null);
    }
  }

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-medium">
          <span className="text-texto-3">Semana {semana.numero} · </span>
          {semana.tema}
        </h4>
        {semana.gerada && semana.itens.length > 0 && (
          <span className="text-xs text-texto-3">
            {semana.itens.filter((i) => progresso.agenda[i.id]).length}/{semana.itens.length} feitos
          </span>
        )}
      </div>
      {semana.objetivo && <p className="mt-0.5 text-sm text-texto-2">{semana.objetivo}</p>}
      {!semana.gerada || semana.itens.length === 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {etapa ? (
            <>
              <Botao carregando>{etapa}</Botao>
              <Botao variante="fantasma" onClick={() => cancelar.current?.abort()}>
                Cancelar
              </Botao>
            </>
          ) : (
            <Botao icone={Sparkles} onClick={gerar}>
              Gerar o conteúdo desta semana
            </Botao>
          )}
        </div>
      ) : (
        <ul className="mt-2 -mx-3">
          {semana.itens.map((item) => {
            const s = situacao(progresso, item.id, dia);
            return (
              <li key={item.id}>
                <a href={href.item(trilha.id, item.id)} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-superficie-2">
                  <IconeTipo tipo={item.tipo} className={`size-4 shrink-0 ${item.tipo === "chefe" ? "text-aviso" : "text-primaria"}`} />
                  <span className="min-w-0 flex-1 truncate text-sm">{item.titulo}</span>
                  <span className="hidden text-xs text-texto-3 sm:inline">{nomeDoTipo(item)}</span>
                  <Nivel nivel={item.nivel} />
                  {s.estado === "revisar" && <Etiqueta tom="aviso">revisar</Etiqueta>}
                  {s.estado === "agendado" && <Etiqueta tom="sucesso">caixa {s.caixa}</Etiqueta>}
                  {"codigo" in item && item.codigo && !item.verificado && <Etiqueta tom="erro">não verificado</Etiqueta>}
                  <ChevronRight className="size-4 shrink-0 text-texto-3" aria-hidden />
                </a>
              </li>
            );
          })}
        </ul>
      )}
      {erro && (
        <div className="mt-3">
          <Aviso tom="erro" titulo={erro} />
        </div>
      )}
    </li>
  );
}

export function TrilhaPagina({ trilhaId }: { trilhaId: string }) {
  const trilha = useTrilha(trilhaId);
  const progresso = useProgresso(trilhaId);
  const [racionalAberto, setRacionalAberto] = useState(false);
  if (trilha === undefined) return <Carregando />;
  if (trilha === null)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Aviso tom="erro" titulo="Trilha não encontrada.">
          <a className="underline" href={href.inicio()}>
            Voltar para o início
          </a>
        </Aviso>
      </div>
    );

  const r = resumo(trilha, progresso);
  const h = treinoDeHoje(trilha, progresso, hoje());
  const continuar = h.revisoes[0] ?? h.novo;
  const totalCodigo = itensDaTrilha(trilha).filter(({ item }) => "codigo" in item && item.codigo).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm text-texto-3">
        <a href={href.inicio()} className="hover:underline">
          Início
        </a>{" "}
        › Trilha
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{trilha.titulo}</h1>
      <p className="mt-1 text-texto-2">{trilha.objetivo || trilha.assunto}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {continuar && (
          <Botao variante="primaria" icone={Play} onClick={() => navegar(href.item(trilha.id, continuar.item.id))}>
            {h.revisoes.length ? `Revisar (${h.revisoes.length})` : "Continuar"}
          </Botao>
        )}
        <Botao icone={ChartColumn} onClick={() => navegar(href.progresso(trilha.id))}>
          Progresso
        </Botao>
        <Botao
          icone={Download}
          onClick={() => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([JSON.stringify(trilha, null, 2)], { type: "application/json" }));
            a.download = `${trilha.id}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          Baixar JSON
        </Botao>
        <Botao
          variante="perigo"
          icone={Trash}
          onClick={async () => {
            if (window.confirm(`Apagar "${trilha.titulo}" e o progresso dela deste navegador?`)) {
              await apagarTrilha(trilha.id);
              navegar(href.inicio());
            }
          }}
        >
          Apagar
        </Botao>
      </div>

      <Cartao className="mt-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>
            {r.feitos} de {r.total} itens feitos · {trilha.horasPorSemana} h por semana · nível inicial {trilha.nivelInicial}
            {totalCodigo > 0 && ` · ${totalCodigo} com código testado`}
          </span>
          {trilha.racional && (
            <button type="button" className="text-primaria hover:underline" onClick={() => setRacionalAberto(!racionalAberto)} aria-expanded={racionalAberto}>
              {racionalAberto ? "Esconder" : "Como este roteiro foi montado"}
            </button>
          )}
        </div>
        <div className="mt-3">
          <Barra valor={r.feitos} total={r.total} />
        </div>
        {racionalAberto && <Markdown texto={trilha.racional} className="mt-3 text-sm text-texto-2" />}
      </Cartao>

      <div className="mt-6 space-y-6">
        {trilha.meses.map((mes) => (
          <Cartao key={mes.numero} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primaria">Mês {mes.numero}</p>
            <h2 className="mt-1 text-lg font-semibold">{mes.titulo}</h2>
            {mes.objetivo && <p className="mt-1 text-sm text-texto-2">{mes.objetivo}</p>}
            {mes.marco && (
              <p className="mt-2 text-sm">
                <span className="font-medium">Marco:</span> <span className="text-texto-2">{mes.marco}</span>
              </p>
            )}
            <ul className="mt-2 divide-y divide-borda">
              {mes.semanas.map((semana) => (
                <SemanaBloco key={semana.numero} trilha={trilha} semana={semana} progresso={progresso} />
              ))}
            </ul>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
