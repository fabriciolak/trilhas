import { acharItem, resumo, situacao } from "@trilhas/nucleo";
import { Aviso, Barra, Cartao, Carregando, IconeTipo } from "../componentes/ui.tsx";
import { hoje } from "../estado/acoes.ts";
import { useProgresso, useTrilha } from "../estado/hooks.ts";
import { href } from "../rota.ts";

const NOTA = { travei: "travei", sofri: "sofri", tranquilo: "tranquilo" } as const;
const COR_NOTA = { travei: "text-erro", sofri: "text-aviso", tranquilo: "text-sucesso" } as const;

export function ProgressoPagina({ trilhaId }: { trilhaId: string }) {
  const trilha = useTrilha(trilhaId);
  const progresso = useProgresso(trilhaId);
  if (trilha === undefined) return <Carregando />;
  if (trilha === null) return <div className="mx-auto max-w-3xl px-4 py-10"><Aviso tom="erro" titulo="Trilha não encontrada." /></div>;
  const r = resumo(trilha, progresso);
  const dia = hoje();
  const maxCaixa = Math.max(1, ...r.porCaixa);
  const recentes = [...progresso.historico].reverse().slice(0, 40);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm text-texto-3">
          <a href={href.trilha(trilha.id)} className="hover:underline">
            {trilha.titulo}
          </a>{" "}
          › Progresso
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Progresso</h1>
      </div>

      <Cartao className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold">
            {r.feitos} de {r.total} itens já treinados
          </p>
          <p className="text-sm text-texto-2">{r.total ? Math.round((r.feitos / r.total) * 100) : 0}%</p>
        </div>
        <div className="mt-3">
          <Barra valor={r.feitos} total={r.total} />
        </div>
      </Cartao>

      <Cartao className="p-5">
        <h2 className="font-semibold">Itens por caixa</h2>
        <p className="mt-1 text-sm text-texto-2">
          Caixa 1 volta amanhã; a 5, em 16 dias. "Tranquilo" sobe uma caixa, "sofri" mantém e "travei" volta para a 1.
        </p>
        <div className="mt-4 flex h-40 items-end gap-3" role="img" aria-label={`Itens por caixa: ${r.porCaixa.map((n, i) => `caixa ${i + 1}: ${n}`).join(", ")}`}>
          {r.porCaixa.map((n, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium tabular-nums">{n}</span>
              <div className="w-full rounded-t-md bg-primaria" style={{ height: `${(n / maxCaixa) * 100}%`, minHeight: n ? 4 : 0, opacity: 0.45 + i * 0.13 }} />
              <span className="text-xs text-texto-3">caixa {i + 1}</span>
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao className="p-5">
        <h2 className="font-semibold">Últimas notas</h2>
        {recentes.length === 0 ? (
          <p className="mt-2 text-sm text-texto-2">Nenhuma nota ainda. Termine um item e diga como foi.</p>
        ) : (
          <ul className="mt-3 divide-y divide-borda">
            {recentes.map((reg, i) => {
              const p = acharItem(trilha, reg.itemId);
              const s = situacao(progresso, reg.itemId, dia);
              return (
                <li key={`${reg.data}-${reg.itemId}-${i}`} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-24 shrink-0 tabular-nums text-texto-3">{reg.data}</span>
                  {p && <IconeTipo tipo={p.item.tipo} className="size-4 shrink-0 text-texto-3" />}
                  <a href={href.item(trilha.id, reg.itemId)} className="min-w-0 flex-1 truncate hover:underline">
                    {p?.item.titulo ?? reg.itemId}
                  </a>
                  <span className={`shrink-0 ${COR_NOTA[reg.nota]}`}>{NOTA[reg.nota]}</span>
                  <span className="hidden shrink-0 text-xs text-texto-3 sm:inline">
                    caixa {reg.de} → {reg.para}
                    {s.estado === "agendado" ? ` · volta em ${s.proxima}` : s.estado === "revisar" ? " · revisar hoje" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Cartao>
    </div>
  );
}
