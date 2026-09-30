import { MODELOS_CLAUDE, textoCompleto } from "@trilhas/nucleo";
import { FolderOpen, KeyRound, RefreshCw, Unplug } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Aviso, Botao, Cartao } from "../componentes/ui.tsx";
import { lerConfig, salvarConfig, type ConfigIA, type TipoProvedor } from "../estado/config.ts";
import { escolherPasta, esquecerPasta, nomeDaPasta, sincronizar, suportaPasta } from "../estado/pasta.ts";
import { mensagemDeErro, obterProvedor } from "../ia/provedor.ts";

const campo = "w-full rounded-lg border border-borda bg-fundo px-3 py-2 text-sm";

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: ReactNode; children: ReactNode }) {
  return (
    <Cartao className="p-5">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {descricao && <div className="mt-1 text-sm text-texto-2">{descricao}</div>}
      <div className="mt-4 space-y-4">{children}</div>
    </Cartao>
  );
}

function Bloco({ children }: { children: string }) {
  return <pre className="overflow-x-auto rounded-lg border border-borda bg-codigo p-3 font-mono text-xs">{children}</pre>;
}

const PROVEDORES: { tipo: TipoProvedor; nome: string; explica: string }[] = [
  { tipo: "anthropic", nome: "Claude (API da Anthropic)", explica: "Chave de console.anthropic.com. O padrão é o Claude Opus 5.5." },
  { tipo: "openai", nome: "API compatível com a OpenAI", explica: "OpenAI, OpenRouter, Groq, LM Studio... qualquer /v1/chat/completions." },
  { tipo: "ollama", nome: "Ollama (IA local)", explica: "Roda no seu computador, sem chave e sem mandar nada para fora." },
];

export function Configuracoes() {
  const [config, setConfig] = useState<ConfigIA>(lerConfig);
  const [teste, setTeste] = useState<{ tom: "sucesso" | "erro"; texto: string } | null>(null);
  const [testando, setTestando] = useState(false);
  const [pasta, setPasta] = useState<string | undefined>();
  const [sincronia, setSincronia] = useState<{ tom: "sucesso" | "erro"; texto: string } | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const origem = window.location.origin;

  useEffect(() => {
    void nomeDaPasta().then(setPasta);
  }, []);

  function mudar(novo: ConfigIA) {
    setConfig(novo);
    salvarConfig(novo);
    setTeste(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>

      <Secao
        titulo="Inteligência artificial"
        descricao="Monta as trilhas, escreve as semanas, corrige respostas abertas e faz o papel de tutor. A chave fica só neste navegador; as chamadas vão direto daqui para o provedor que você escolher."
      >
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Provedor de IA">
          {PROVEDORES.map((p) => (
            <button
              key={p.tipo}
              type="button"
              role="radio"
              aria-checked={config.tipo === p.tipo}
              onClick={() => mudar({ ...config, tipo: p.tipo })}
              className={`rounded-xl border p-3 text-left text-sm transition ${config.tipo === p.tipo ? "border-primaria bg-primaria-2" : "border-borda hover:bg-superficie-2"}`}
            >
              <p className="font-medium">{p.nome}</p>
              <p className="mt-1 text-xs text-texto-2">{p.explica}</p>
            </button>
          ))}
        </div>

        {config.tipo === "anthropic" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Chave da API</span>
              <input
                type="password"
                autoComplete="off"
                className={`${campo} mt-1 font-mono`}
                value={config.anthropic.chave}
                onChange={(e) => mudar({ ...config, anthropic: { ...config.anthropic, chave: e.target.value } })}
                placeholder="sk-ant-..."
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Modelo</span>
              <input
                list="modelos-claude"
                className={`${campo} mt-1`}
                value={config.anthropic.modelo}
                onChange={(e) => mudar({ ...config, anthropic: { ...config.anthropic, modelo: e.target.value } })}
              />
              <datalist id="modelos-claude">
                {MODELOS_CLAUDE.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </datalist>
              <span className="mt-1 block text-xs text-texto-3">{MODELOS_CLAUDE.map((m) => m.nome).join(" · ")}</span>
            </label>
          </div>
        )}

        {config.tipo === "openai" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">URL base (até o /v1)</span>
              <input className={`${campo} mt-1 font-mono`} value={config.openai.url} onChange={(e) => mudar({ ...config, openai: { ...config.openai, url: e.target.value } })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Modelo</span>
              <input className={`${campo} mt-1`} value={config.openai.modelo} onChange={(e) => mudar({ ...config, openai: { ...config.openai, modelo: e.target.value } })} placeholder="ex.: gpt-5.1" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Chave (se o serviço pedir)</span>
              <input
                type="password"
                autoComplete="off"
                className={`${campo} mt-1 font-mono`}
                value={config.openai.chave}
                onChange={(e) => mudar({ ...config, openai: { ...config.openai, chave: e.target.value } })}
              />
            </label>
          </div>
        )}

        {config.tipo === "ollama" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">URL do Ollama</span>
                <input className={`${campo} mt-1 font-mono`} value={config.ollama.url} onChange={(e) => mudar({ ...config, ollama: { ...config.ollama, url: e.target.value } })} />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Modelo</span>
                <input className={`${campo} mt-1`} value={config.ollama.modelo} onChange={(e) => mudar({ ...config, ollama: { ...config.ollama, modelo: e.target.value } })} placeholder="ex.: llama3.2, qwen2.5-coder" />
              </label>
            </div>
            <details className="rounded-lg border border-borda p-3 text-sm">
              <summary className="cursor-pointer font-medium">Como deixar o Ollama aceitar este site</summary>
              <p className="mt-2 text-texto-2">
                Por segurança, o Ollama só responde a sites que você autorizar, pela variável <code>OLLAMA_ORIGINS</code>. Baixe um modelo (
                <code>ollama pull llama3.2</code>) e reinicie o Ollama com a origem deste site:
              </p>
              <p className="mt-3 font-medium">Linux (serviço do systemd)</p>
              <Bloco>{`sudo systemctl edit ollama\n# acrescente, salve e saia:\n[Service]\nEnvironment="OLLAMA_ORIGINS=${origem}"\n\nsudo systemctl restart ollama`}</Bloco>
              <p className="mt-3 font-medium">macOS</p>
              <Bloco>{`launchctl setenv OLLAMA_ORIGINS "${origem}"\n# depois, feche e abra o app do Ollama`}</Bloco>
              <p className="mt-3 font-medium">Windows (PowerShell)</p>
              <Bloco>{`setx OLLAMA_ORIGINS "${origem}"\n# depois, saia do Ollama (ícone perto do relógio) e abra de novo`}</Bloco>
              <p className="mt-2 text-xs text-texto-3">Modelos pequenos erram mais ao montar trilhas; para o tutor, funcionam bem.</p>
            </details>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Botao
            icone={KeyRound}
            carregando={testando}
            onClick={async () => {
              setTeste(null);
              const p = obterProvedor();
              if (!p.ok) {
                setTeste({ tom: "erro", texto: `Falta ${p.falta}.` });
                return;
              }
              setTestando(true);
              try {
                const r = await textoCompleto(p.provedor, { mensagens: [{ papel: "user", conteudo: "Responda só com a palavra: funcionando" }], maxTokens: 50, esforco: "low" });
                setTeste({ tom: "sucesso", texto: `Resposta: ${r.trim().slice(0, 80)}` });
              } catch (e) {
                setTeste({ tom: "erro", texto: mensagemDeErro(e) });
              } finally {
                setTestando(false);
              }
            }}
          >
            Testar a conexão
          </Botao>
          {teste && <span className={`text-sm ${teste.tom === "sucesso" ? "text-sucesso" : "text-erro"}`}>{teste.texto}</span>}
        </div>
        <p className="text-xs text-texto-3">
          Atenção: qualquer extensão ou script que rode nesta página consegue ler a chave. Use uma chave só para isto, com limite de gastos no painel do provedor.
        </p>
      </Secao>

      <Secao
        titulo="Claude sem chave de API"
        descricao="Se você assina o Claude, dá para usar a assinatura em vez de uma chave de API."
      >
        <p className="text-sm">
          <span className="font-medium">No site:</span> o botão <em>Abrir no Claude</em> (em cada item e na Nova trilha) abre o claude.ai com o contexto já escrito.
        </p>
        <div className="text-sm">
          <p className="font-medium">No Claude Code ou no Claude Desktop, com o servidor MCP das trilhas:</p>
          <p className="mt-1 text-texto-2">
            Ele monta trilhas, escreve e testa as semanas, faz o papel de tutor e registra as notas numa pasta de trabalho. Ligue a mesma pasta abaixo para
            ver tudo aqui. No repositório: <code>pnpm install && pnpm build</code>, depois:
          </p>
          <p className="mt-3 font-medium">Claude Code</p>
          <Bloco>{`claude mcp add trilhas -- node <repositório>/packages/mcp/dist/trilhas-mcp.js --pasta <sua pasta de trabalho>`}</Bloco>
          <p className="mt-3 font-medium">Claude Desktop (claude_desktop_config.json)</p>
          <Bloco>{`{\n  "mcpServers": {\n    "trilhas": {\n      "command": "node",\n      "args": ["<repositório>/packages/mcp/dist/trilhas-mcp.js", "--pasta", "<sua pasta de trabalho>"]\n    }\n  }\n}`}</Bloco>
          <p className="mt-2 text-texto-2">
            Depois, peça: <em>"Use o prompt nova_trilha das trilhas para montar uma trilha de ..."</em>
          </p>
        </div>
      </Secao>

      <Secao
        titulo="Pasta de trabalho"
        descricao="Uma pasta no seu computador com as trilhas (trilhas/*.json) e o progresso (progresso/*.json), compartilhada com o servidor MCP. Serve também de cópia de segurança."
      >
        {suportaPasta() ? (
          <>
            <p className="text-sm">{pasta ? <>Pasta ligada: <code>{pasta}</code></> : "Nenhuma pasta ligada."}</p>
            <div className="flex flex-wrap gap-2">
              <Botao
                icone={FolderOpen}
                onClick={async () => {
                  setSincronia(null);
                  try {
                    setPasta(await escolherPasta());
                  } catch (e) {
                    if ((e as Error).name !== "AbortError") setSincronia({ tom: "erro", texto: (e as Error).message });
                  }
                }}
              >
                {pasta ? "Trocar a pasta" : "Escolher a pasta"}
              </Botao>
              {pasta && (
                <>
                  <Botao
                    variante="primaria"
                    icone={RefreshCw}
                    carregando={sincronizando}
                    onClick={async () => {
                      setSincronia(null);
                      setSincronizando(true);
                      try {
                        const r = await sincronizar();
                        setSincronia({
                          tom: "sucesso",
                          texto: `Sincronizado: ${r.trilhasRecebidas.length} trilha(s) vieram da pasta, ${r.trilhasEnviadas} gravada(s) nela.${r.invalidas.length ? ` Inválidas (ficaram de fora): ${r.invalidas.join(", ")}.` : ""}`,
                        });
                      } catch (e) {
                        setSincronia({ tom: "erro", texto: (e as Error).message });
                      } finally {
                        setSincronizando(false);
                      }
                    }}
                  >
                    Sincronizar agora
                  </Botao>
                  <Botao
                    variante="fantasma"
                    icone={Unplug}
                    onClick={async () => {
                      await esquecerPasta();
                      setPasta(undefined);
                    }}
                  >
                    Desligar
                  </Botao>
                </>
              )}
            </div>
            <p className="text-xs text-texto-3">Com a pasta ligada, cada nota e cada trilha salva também vão para ela. O que o MCP criar lá aparece aqui ao sincronizar.</p>
          </>
        ) : (
          <Aviso titulo="Este navegador não abre pastas (a API existe no Chrome e no Edge).">
            Use Exportar e Importar, na tela inicial, para levar as trilhas e o progresso de um lugar para outro.
          </Aviso>
        )}
        {sincronia && <Aviso tom={sincronia.tom} titulo={sincronia.texto} />}
      </Secao>
    </div>
  );
}
