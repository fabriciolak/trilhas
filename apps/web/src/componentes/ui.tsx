import type { Item, TipoItem } from "@trilhas/nucleo";
import {
  BookOpen,
  CircleQuestionMark,
  Code,
  Crown,
  FolderOpen,
  ListChecks,
  LoaderCircle,
  PenLine,
  Swords,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primaria" | "secundaria" | "fantasma" | "perigo";

const VARIANTES: Record<Variante, string> = {
  primaria: "bg-primaria text-primaria-texto hover:opacity-90 border border-transparent",
  secundaria: "bg-superficie text-texto border border-borda hover:bg-superficie-2",
  fantasma: "bg-transparent text-texto-2 border border-transparent hover:bg-superficie-2 hover:text-texto",
  perigo: "bg-transparent text-erro border border-borda hover:bg-erro-2",
};

export function Botao({
  variante = "secundaria",
  carregando = false,
  icone: Icone,
  children,
  className = "",
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; carregando?: boolean; icone?: LucideIcon }) {
  return (
    <button
      type="button"
      {...resto}
      disabled={resto.disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
    >
      {carregando ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : Icone ? <Icone className="size-4" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-borda bg-superficie ${className}`}>{children}</div>;
}

export function Etiqueta({ children, tom = "neutro" }: { children: ReactNode; tom?: "neutro" | "primaria" | "sucesso" | "erro" | "aviso" }) {
  const cores = {
    neutro: "bg-superficie-2 text-texto-2",
    primaria: "bg-primaria-2 text-primaria",
    sucesso: "bg-sucesso-2 text-sucesso",
    erro: "bg-erro-2 text-erro",
    aviso: "bg-aviso-2 text-aviso",
  }[tom];
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${cores}`}>{children}</span>;
}

export const NOMES_NIVEL = { 1: "básico", 2: "intermediário", 3: "avançado" } as const;

export function Nivel({ nivel }: { nivel: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`nível ${NOMES_NIVEL[nivel]}`} aria-label={`nível ${NOMES_NIVEL[nivel]}`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`size-1.5 rounded-full ${n <= nivel ? "bg-primaria" : "bg-borda"}`} />
      ))}
    </span>
  );
}

export const TIPOS: Record<TipoItem, { nome: string; icone: LucideIcon }> = {
  aula: { nome: "Aula", icone: BookOpen },
  exercicio: { nome: "Exercício", icone: Code },
  desafio: { nome: "Desafio", icone: Swords },
  projeto: { nome: "Projeto", icone: FolderOpen },
  quiz: { nome: "Quiz", icone: ListChecks },
  aberta: { nome: "Resposta aberta", icone: PenLine },
  local: { nome: "Prática local", icone: Terminal },
  chefe: { nome: "Chefe", icone: Crown },
};

export function nomeDoTipo(item: Item): string {
  if (item.tipo === "local" && item.estilo) return { treino: "Treino (local)", ticket: "Ticket (local)", chefe: "Chefe (local)" }[item.estilo];
  return TIPOS[item.tipo].nome;
}

export function IconeTipo({ tipo, className = "size-4" }: { tipo: TipoItem; className?: string }) {
  const Icone = TIPOS[tipo]?.icone ?? CircleQuestionMark;
  return <Icone className={className} aria-hidden />;
}

export function Aviso({ tom = "aviso", titulo, children }: { tom?: "aviso" | "erro" | "sucesso" | "primaria"; titulo?: string; children?: ReactNode }) {
  const cores = {
    aviso: "border-aviso/40 bg-aviso-2",
    erro: "border-erro/40 bg-erro-2",
    sucesso: "border-sucesso/40 bg-sucesso-2",
    primaria: "border-primaria/40 bg-primaria-2",
  }[tom];
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${cores}`} role={tom === "erro" ? "alert" : "status"}>
      {titulo && <p className="font-semibold">{titulo}</p>}
      {children && <div className={titulo ? "mt-1 text-texto-2" : "text-texto-2"}>{children}</div>}
    </div>
  );
}

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex items-center gap-2 p-8 text-sm text-texto-2">
      <LoaderCircle className="size-4 animate-spin" aria-hidden /> {texto}
    </div>
  );
}

export function Barra({ valor, total }: { valor: number; total: number }) {
  const pct = total ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-superficie-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primaria transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
