/**
 * trilhas-mcp --pasta <pasta de trabalho>
 *
 * Claude Code:    claude mcp add trilhas -- node <repo>/packages/mcp/dist/trilhas-mcp.js --pasta <pasta>
 * Claude Desktop: em claude_desktop_config.json, "mcpServers": {"trilhas": {"command": "node",
 *                 "args": ["<repo>/packages/mcp/dist/trilhas-mcp.js", "--pasta", "<pasta>"]}}
 */
import { resolve } from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { criarExecutorNode, PastaDeTrabalho } from "@trilhas/nucleo/node";
import { criarServidor } from "./servidor.ts";

const args = process.argv.slice(2);
const i = args.indexOf("--pasta");
const informada = i >= 0 ? args[i + 1] : undefined;
const pasta = resolve(informada ?? process.env.TRILHAS_PASTA ?? ".");

const servidor = criarServidor(new PastaDeTrabalho(pasta), criarExecutorNode());
await servidor.connect(new StdioServerTransport());
// stdout é do protocolo: mensagens para gente vão para stderr.
console.error(`trilhas-mcp: pasta de trabalho ${pasta}`);
