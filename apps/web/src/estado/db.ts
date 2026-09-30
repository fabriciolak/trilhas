/**
 * O banco do navegador (IndexedDB, com o Dexie). Tudo fica no aparelho da pessoa; a pasta
 * de trabalho (pasta.ts) é a cópia em disco, compartilhada com o servidor MCP.
 */
import type { Arquivos, Mensagem, Progresso, Trilha } from "@trilhas/nucleo";
import Dexie, { type Table } from "dexie";

export interface RegistroTrilha {
  id: string;
  trilha: Trilha;
  atualizadaEm: string;
}

/** O que a pessoa fez num item: código, respostas, texto. Chave: trilhaId/itemId. */
export interface Tentativa {
  chave: string;
  arquivos?: Arquivos;
  respostasQuiz?: (number | string | null)[];
  texto?: string;
  passou?: boolean;
  dicasVistas?: number;
  correcao?: unknown;
  atualizadaEm: string;
}

export interface Conversa {
  chave: string;
  mensagens: Mensagem[];
}

class Banco extends Dexie {
  trilhas!: Table<RegistroTrilha, string>;
  progresso!: Table<Progresso, string>;
  tentativas!: Table<Tentativa, string>;
  conversas!: Table<Conversa, string>;
  preferencias!: Table<{ chave: string; valor: unknown }, string>;

  constructor() {
    super("trilhas");
    this.version(1).stores({
      trilhas: "id, atualizadaEm",
      progresso: "trilhaId",
      tentativas: "chave",
      conversas: "chave",
      preferencias: "chave",
    });
  }
}

export const db = new Banco();

export const chaveItem = (trilhaId: string, itemId: string) => `${trilhaId}/${itemId}`;
