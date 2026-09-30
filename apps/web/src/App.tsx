import { itensDaTrilha, temCodigo, type Arquivos } from "@trilhas/nucleo";
import { Monitor, Moon, Plus, Settings, Sun } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { prepararPrimeiraVisita } from "./estado/acoes.ts";
import { aplicarTema, lerTema, type Tema } from "./estado/config.ts";
import { useTrilhas } from "./estado/hooks.ts";
import { definirSolucoesConhecidas } from "./executor/index.ts";
import { Carregando } from "./componentes/ui.tsx";
import { Inicio } from "./paginas/Inicio.tsx";
import { TrilhaPagina } from "./paginas/TrilhaPagina.tsx";
import { href, useRota } from "./rota.ts";

// O editor, o tutor e a IA só carregam quando a página precisa deles.
const ItemPagina = lazy(() => import("./paginas/ItemPagina.tsx").then((m) => ({ default: m.ItemPagina })));
const NovaTrilha = lazy(() => import("./paginas/NovaTrilha.tsx").then((m) => ({ default: m.NovaTrilha })));
const Configuracoes = lazy(() => import("./paginas/Configuracoes.tsx").then((m) => ({ default: m.Configuracoes })));
const ProgressoPagina = lazy(() => import("./paginas/ProgressoPagina.tsx").then((m) => ({ default: m.ProgressoPagina })));

const PROXIMO_TEMA: Record<Tema, Tema> = { sistema: "claro", claro: "escuro", escuro: "sistema" };
const ICONE_TEMA = { sistema: Monitor, claro: Sun, escuro: Moon };

export function App() {
  const rota = useRota();
  const [tema, setTema] = useState<Tema>(lerTema);
  const trilhas = useTrilhas();

  useEffect(() => {
    void prepararPrimeiraVisita();
  }, []);

  // O executor de testes de ponta a ponta conhece as soluções das trilhas carregadas.
  useEffect(() => {
    definirSolucoesConhecidas((): Arquivos[] =>
      (trilhas ?? []).flatMap(({ trilha }) =>
        itensDaTrilha(trilha).flatMap(({ item }) => (temCodigo(item) ? [item.codigo.solucao] : [])),
      ),
    );
  }, [trilhas]);

  const IconeTema = ICONE_TEMA[tema];
  const emItem = rota.nome === "item";

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-borda bg-superficie/90 backdrop-blur">
        <div className={`mx-auto flex h-14 items-center gap-3 px-4 ${emItem ? "" : "max-w-6xl"}`}>
          <a href={href.inicio()} className="flex items-center gap-2 font-semibold tracking-tight">
            <img src="/icone.svg" alt="" className="size-7" />
            <span>Trilhas</span>
          </a>
          <nav className="ml-auto flex items-center gap-1 text-sm" aria-label="Principal">
            <a href={href.inicio()} className="rounded-lg px-3 py-2 text-texto-2 hover:bg-superficie-2 hover:text-texto">
              Hoje
            </a>
            <a href={href.nova()} className="flex items-center gap-1 rounded-lg px-3 py-2 text-texto-2 hover:bg-superficie-2 hover:text-texto">
              <Plus className="size-4" aria-hidden />
              <span className="hidden sm:inline">Nova trilha</span>
            </a>
            <a href={href.config()} className="flex items-center gap-1 rounded-lg px-3 py-2 text-texto-2 hover:bg-superficie-2 hover:text-texto" aria-label="Configurações">
              <Settings className="size-4" aria-hidden />
              <span className="hidden sm:inline">Configurações</span>
            </a>
            <button
              type="button"
              className="rounded-lg p-2 text-texto-2 hover:bg-superficie-2 hover:text-texto"
              onClick={() => {
                const novo = PROXIMO_TEMA[tema];
                setTema(novo);
                aplicarTema(novo);
              }}
              title={`Tema: ${tema}`}
              aria-label={`Trocar o tema (agora: ${tema})`}
            >
              <IconeTema className="size-4" aria-hidden />
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Suspense fallback={<Carregando />}>
          {rota.nome === "inicio" && <Inicio />}
          {rota.nome === "trilha" && <TrilhaPagina trilhaId={rota.trilhaId} />}
          {rota.nome === "item" && <ItemPagina trilhaId={rota.trilhaId} itemId={rota.itemId} />}
          {rota.nome === "nova" && <NovaTrilha />}
          {rota.nome === "config" && <Configuracoes />}
          {rota.nome === "progresso" && <ProgressoPagina trilhaId={rota.trilhaId} />}
        </Suspense>
      </main>
    </div>
  );
}
