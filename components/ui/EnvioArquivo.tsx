"use client";

import { useRef, useState } from "react";
import { salvarDocumento } from "@/lib/arquivos";
import type { ArquivoRef } from "@/lib/dados/tipos";
import { Icone, type NomeIcone } from "./Icone";

/** Envio de um documento (imagem ou PDF). */
export function EnvioArquivo({
  rotulo,
  dica,
  icone,
  arquivo,
  aoMudar,
}: {
  rotulo: string;
  dica: string;
  icone: NomeIcone;
  arquivo?: ArquivoRef;
  aoMudar: (a: ArquivoRef) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  return (
    <div>
      <button
        type="button"
        onClick={() => entrada.current?.click()}
        className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left base-3d ${
          arquivo ? "bg-success-soft border-transparent [--base-3d:var(--line)]" : "bg-surface-card border-line border-dashed [--base-3d:var(--line)]"
        }`}
      >
        <Icone nome={icone} tamanho={48} />
        <span className="min-w-0 flex-1">
          <span className="block text-h3">{rotulo}</span>
          <span className="block text-body-sm text-ink-muted truncate">
            {enviando ? "Enviando…" : arquivo ? `✓ ${arquivo.nome}` : dica}
          </span>
        </span>
        <span className="text-label text-brand-olive-deep">{arquivo ? "Trocar" : "Enviar"}</span>
      </button>
      <input
        ref={entrada}
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        tabIndex={-1}
        aria-label={rotulo}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setErro("");
          setEnviando(true);
          try {
            aoMudar(await salvarDocumento(f));
          } catch (err) {
            setErro(err instanceof Error ? err.message : "Não foi possível enviar.");
          } finally {
            setEnviando(false);
          }
        }}
      />
      {erro && <p className="text-[13px] font-semibold text-danger mt-2">{erro}</p>}
    </div>
  );
}
