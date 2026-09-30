/** Um terminal de verdade (jsh) dentro do WebContainer, na pasta do exercício. */
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import { iniciarWebContainer } from "../executor/webcontainer.ts";

export function Terminal({ pasta, escuro }: { pasta: string; escuro: boolean }) {
  const elemento = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!elemento.current) return;
    const term = new XTerm({
      convertEol: true,
      fontSize: 13,
      fontFamily: "ui-monospace, Menlo, Consolas, monospace",
      theme: escuro ? { background: "#0f1522", foreground: "#e7eaf2" } : { background: "#f3f4f8", foreground: "#111827", cursor: "#111827" },
    });
    const ajuste = new FitAddon();
    term.loadAddon(ajuste);
    term.open(elemento.current);
    ajuste.fit();
    let encerrado = false;
    let matar: (() => void) | undefined;
    term.writeln("Ligando o terminal do navegador...");
    void (async () => {
      const wc = await iniciarWebContainer();
      await wc.fs.mkdir(pasta, { recursive: true });
      if (encerrado) return;
      const shell = await wc.spawn("jsh", { cwd: pasta, terminal: { cols: term.cols, rows: term.rows } });
      matar = () => shell.kill();
      void shell.output.pipeTo(new WritableStream({ write: (d) => term.write(d) }));
      const escrita = shell.input.getWriter();
      term.onData((d) => void escrita.write(d));
      term.onResize(({ cols, rows }) => shell.resize({ cols, rows }));
    })().catch((e) => term.writeln(`\r\nNão consegui abrir o terminal: ${(e as Error).message}`));
    const observador = new ResizeObserver(() => ajuste.fit());
    observador.observe(elemento.current);
    return () => {
      encerrado = true;
      observador.disconnect();
      matar?.();
      term.dispose();
    };
  }, [pasta, escuro]);
  return <div ref={elemento} className="h-full w-full p-2" aria-label="Terminal" />;
}
