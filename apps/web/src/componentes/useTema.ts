import { useEffect, useState } from "react";

/** A página está no tema escuro agora (pela escolha da pessoa ou pelo sistema)? */
export function useEscuro(): boolean {
  const calcular = () => {
    const escolhido = document.documentElement.getAttribute("data-tema");
    if (escolhido) return escolhido === "escuro";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  const [escuro, setEscuro] = useState(calcular);
  useEffect(() => {
    const atualizar = () => setEscuro(calcular());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", atualizar);
    const observador = new MutationObserver(atualizar);
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
    return () => {
      media.removeEventListener("change", atualizar);
      observador.disconnect();
    };
  }, []);
  return escuro;
}

export function useLargo(minimo = 900): boolean {
  const [largo, setLargo] = useState(() => window.innerWidth >= minimo);
  useEffect(() => {
    const aoMudar = () => setLargo(window.innerWidth >= minimo);
    window.addEventListener("resize", aoMudar);
    return () => window.removeEventListener("resize", aoMudar);
  }, [minimo]);
  return largo;
}
