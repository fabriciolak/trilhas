import { resumo, treinoDeHoje, type Posicao } from "@trilhas/nucleo";
import { CalendarCheck, Download, Plus, Sparkles, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Aviso, Barra, Botao, Cartao, Carregando, Etiqueta, IconeTipo, nomeDoTipo } from "../componentes/ui.tsx";
import { carregarExemplo, EXEMPLOS, exportarTudo, hoje, importarArquivo } from "../estado/acoes.ts";
import { useTodosProgressos, useTrilhas } from "../estado/hooks.ts";
import { href, navegar } from "../rota.ts";

function LinhaItem({ trilhaId, p, rotulo }: { trilhaId: string; p: Posicao; rotulo: string }) {
  return (
    <a href={href.item(trilhaId, p.item.id)} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-superficie-2">
      <IconeTipo tipo={p.item.tipo} className="size-4 shrink-0 text-primaria" />
      <span className="min-w-0 flex-1 truncate text-sm">{p.item.titulo}</span>
      <span className="shrink-0 text-xs text-texto-3">
        {rotulo} · {nomeDoTipo(p.item)}
      </span>
    </a>
  );
}

export function Inicio() {
  const trilhas = useTrilhas();
  const progressos = useTodosProgressos();
  const [mensagem, setMensagem] = useState<{ tom: "sucesso" | "erro"; texto: string } | null>(null);
  const [carregandoExemplo, setCarregandoExemplo] = useState<string | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  if (!trilhas) return <Carregando />;
  const dia = hoje();
  const doDia = trilhas.map(({ trilha }) => {
    const progresso = progressos.get(trilha.id) ?? { trilhaId: trilha.id, agenda: {}, historico: [] };
    return { trilha, hoje: treinoDeHoje(trilha, progresso, dia), resumo: resumo(trilha, progresso) };
  });
  const comAlgo = doDia.filter((d) => d.hoje.revisoes.length || d.hoje.novo);
  const faltamExemplos = EXEMPLOS.filter((e) => !trilhas.some((t) => t.id === e.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hoje</h1>
          <p className="mt-1 text-sm text-texto-2">As revisões que venceram e o próximo item de cada trilha.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Botao icone={Upload} onClick={() => entrada.current?.click()}>
            Importar
          </Botao>
          <Botao
            icone={Download}
            onClick={async () => {
              const blob = await exportarTudo();
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `trilhas-${dia}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            Exportar
          </Botao>
          <Botao variante="primaria" icone={Sparkles} onClick={() => navegar(href.nova())}>
            Nova trilha com IA
          </Botao>
          <input
            ref={entrada}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const arquivo = e.target.files?.[0];
              e.target.value = "";
              if (!arquivo) return;
              try {
                const nomes = await importarArquivo(await arquivo.text());
                setMensagem({ tom: "sucesso", texto: `Importado: ${nomes.join(", ") || "nada novo"}.` });
              } catch (erro) {
                setMensagem({ tom: "erro", texto: (erro as Error).message });
              }
            }}
          />
        </div>
      </div>

      {mensagem && (
        <div className="mt-4">
          <Aviso tom={mensagem.tom} titulo={mensagem.texto} />
        </div>
      )}

      {comAlgo.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {comAlgo.map(({ trilha, hoje: h }) => (
            <Cartao key={trilha.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <a href={href.trilha(trilha.id)} className="font-semibold hover:underline">
                  {trilha.titulo}
                </a>
                {h.revisoes.length > 0 && <Etiqueta tom="aviso">{h.revisoes.length} para revisar</Etiqueta>}
              </div>
              <div className="mt-2 -mx-3">
                {h.revisoes.slice(0, 5).map((p) => (
                  <LinhaItem key={p.item.id} trilhaId={trilha.id} p={p} rotulo="revisar" />
                ))}
                {h.novo && <LinhaItem trilhaId={trilha.id} p={h.novo} rotulo={`novo · semana ${h.novo.semana}`} />}
              </div>
            </Cartao>
          ))}
        </div>
      ) : (
        trilhas.length > 0 && (
          <div className="mt-6">
            <Aviso tom="sucesso" titulo="Nada para hoje.">
              <span className="inline-flex items-center gap-1">
                <CalendarCheck className="size-4" aria-hidden /> Quer adiantar? Abra uma trilha abaixo.
              </span>
            </Aviso>
          </div>
        )
      )}

      <h2 className="mt-10 text-lg font-semibold">Suas trilhas</h2>
      {trilhas.length === 0 && (
        <p className="mt-2 text-sm text-texto-2">Nenhuma trilha ainda. Monte uma com a IA ou comece por um exemplo.</p>
      )}
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doDia.map(({ trilha, resumo: r }) => (
          <a key={trilha.id} href={href.trilha(trilha.id)} className="group">
            <Cartao className="flex h-full flex-col p-4 transition group-hover:border-primaria">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{trilha.titulo}</h3>
                <Etiqueta tom={trilha.origem === "ia" ? "primaria" : "neutro"}>{trilha.origem === "ia" ? "IA" : trilha.origem === "importada" ? "importada" : "manual"}</Etiqueta>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-texto-2">{trilha.objetivo || trilha.assunto}</p>
              <div className="mt-auto pt-4">
                <div className="mb-1.5 flex justify-between text-xs text-texto-3">
                  <span>
                    {trilha.meses.length} {trilha.meses.length === 1 ? "mês" : "meses"} · {r.total} itens
                  </span>
                  <span>
                    {r.feitos}/{r.total}
                  </span>
                </div>
                <Barra valor={r.feitos} total={r.total} />
              </div>
            </Cartao>
          </a>
        ))}
        <button
          type="button"
          onClick={() => navegar(href.nova())}
          className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-borda p-4 text-sm text-texto-2 hover:border-primaria hover:text-primaria"
        >
          <Plus className="size-5" aria-hidden />
          Montar uma trilha sobre qualquer assunto
        </button>
      </div>

      {faltamExemplos.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold">Exemplos</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {faltamExemplos.map((e) => (
              <Cartao key={e.id} className="flex flex-col gap-3 p-4">
                <div>
                  <h3 className="font-semibold">{e.titulo}</h3>
                  <p className="mt-1 text-sm text-texto-2">{e.descricao}</p>
                </div>
                <Botao
                  className="self-start"
                  carregando={carregandoExemplo === e.id}
                  onClick={async () => {
                    setCarregandoExemplo(e.id);
                    try {
                      const t = await carregarExemplo(e.id);
                      navegar(href.trilha(t.id));
                    } finally {
                      setCarregandoExemplo(null);
                    }
                  }}
                >
                  Adicionar
                </Botao>
              </Cartao>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
