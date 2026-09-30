/** Rotas pelo hash da URL (#/trilha/x): funciona em qualquer hospedagem estática. */
import { useEffect, useState } from "react";

export type Rota =
  | { nome: "inicio" }
  | { nome: "trilha"; trilhaId: string }
  | { nome: "item"; trilhaId: string; itemId: string }
  | { nome: "nova" }
  | { nome: "config" }
  | { nome: "progresso"; trilhaId: string };

export function lerRota(hash: string): Rota {
  const partes = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (partes[0] === "trilha" && partes[1] && partes[2] === "item" && partes[3]) {
    return { nome: "item", trilhaId: partes[1], itemId: partes[3] };
  }
  if (partes[0] === "trilha" && partes[1]) return { nome: "trilha", trilhaId: partes[1] };
  if (partes[0] === "progresso" && partes[1]) return { nome: "progresso", trilhaId: partes[1] };
  if (partes[0] === "nova") return { nome: "nova" };
  if (partes[0] === "config") return { nome: "config" };
  return { nome: "inicio" };
}

export const href = {
  inicio: () => "#/",
  trilha: (id: string) => `#/trilha/${encodeURIComponent(id)}`,
  item: (trilhaId: string, itemId: string) => `#/trilha/${encodeURIComponent(trilhaId)}/item/${encodeURIComponent(itemId)}`,
  nova: () => "#/nova",
  config: () => "#/config",
  progresso: (id: string) => `#/progresso/${encodeURIComponent(id)}`,
};

export function navegar(destino: string): void {
  window.location.hash = destino;
}

export function useRota(): Rota {
  const [rota, setRota] = useState(() => lerRota(window.location.hash));
  useEffect(() => {
    const aoMudar = () => {
      setRota(lerRota(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);
  return rota;
}
