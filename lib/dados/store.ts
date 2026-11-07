"use client";

import { useSyncExternalStore } from "react";
import { criarSeed } from "./seed";
import type { Estado } from "./tipos";

/**
 * Armazenamento do MVP de front-end: estado em memória + localStorage.
 * Na fase de back-end, as ações (acoes.ts) passam a chamar o Supabase e este
 * arquivo vira um cache de leitura.
 */
const CHAVE = "aurora-mvp-v1";

let estado: Estado | null = null;
const ouvintes = new Set<() => void>();

function carregar(): Estado {
  if (estado) return estado;
  try {
    const salvo = window.localStorage.getItem(CHAVE);
    if (salvo) {
      const e = JSON.parse(salvo) as Estado;
      if (e.versao === 1) {
        e.avaliacoes ??= []; // dados salvos antes das avaliações existirem
        estado = e;
        return e;
      }
    }
  } catch {
    /* armazenamento indisponível: segue com dados de demonstração */
  }
  estado = criarSeed();
  return estado;
}

function salvar() {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* sem persistência (modo privado / cota cheia) */
  }
}

export function lerEstado(): Estado {
  return carregar();
}

/** Aplica uma mudança de forma imutável e avisa a interface. */
export function mudar(fn: (rascunho: Estado) => void) {
  const rascunho = structuredClone(carregar());
  fn(rascunho);
  estado = rascunho;
  salvar();
  ouvintes.forEach((o) => o());
}

export function reiniciarDemo() {
  estado = criarSeed();
  salvar();
  ouvintes.forEach((o) => o());
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  const aoMudarOutraAba = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      estado = null;
      o();
    }
  };
  window.addEventListener("storage", aoMudarOutraAba);
  return () => {
    ouvintes.delete(o);
    window.removeEventListener("storage", aoMudarOutraAba);
  };
}

let estadoServidor: Estado | null = null;
const lerNoServidor = () => (estadoServidor ??= criarSeed());

export function useEstado(): Estado {
  return useSyncExternalStore(inscrever, carregar, lerNoServidor);
}
