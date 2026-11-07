"use client";

import { useRef, useState } from "react";
import { processarFoto, useArquivoUrl } from "@/lib/arquivos";
import { Icone } from "./Icone";

/** Miniatura de uma foto salva (ou um espaço reservado nas demonstrações). */
export function Foto({ id, alt, className = "" }: { id: string; alt: string; className?: string }) {
  const url = useArquivoUrl(id);
  return (
    <div className={`relative overflow-hidden rounded-md bg-surface-sunken aspect-square ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob local, sem otimização do Next
        <img src={url} alt={alt} className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center" aria-label={alt} role="img">
          <Icone nome="camera" tamanho={32} inativo />
        </div>
      )}
    </div>
  );
}

/** Envio de fotos: redimensiona e remove EXIF/GPS antes de salvar. */
export function EnvioFotos({
  rotulo,
  dica,
  fotos,
  aoAdicionar,
  aoRemover,
  maximo = 6,
  desabilitado,
}: {
  rotulo: string;
  dica?: string;
  fotos: string[];
  aoAdicionar: (ids: string[]) => void;
  aoRemover?: (id: string) => void;
  maximo?: number;
  desabilitado?: boolean;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  async function aoEscolher(lista: FileList | null) {
    if (!lista?.length) return;
    setErro("");
    setProcessando(true);
    try {
      const restantes = Array.from(lista).slice(0, maximo - fotos.length);
      const ids: string[] = [];
      for (const f of restantes) ids.push(await processarFoto(f));
      aoAdicionar(ids);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível ler a foto.");
    } finally {
      setProcessando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-label">{rotulo}</p>
      {dica && <p className="text-[13px] text-ink-muted mt-0.5">{dica}</p>}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
        {fotos.map((id, i) => (
          <div key={id} className="relative">
            <Foto id={id} alt={`${rotulo} — foto ${i + 1}`} />
            {aoRemover && !desabilitado && (
              <button
                type="button"
                onClick={() => aoRemover(id)}
                className="absolute top-1 right-1 size-8 rounded-full bg-surface-card/90 text-danger font-bold shadow-card"
                aria-label={`Remover foto ${i + 1}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
        {fotos.length < maximo && !desabilitado && (
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            disabled={processando}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-line-strong bg-surface-card text-caption text-ink-muted hover:bg-surface-sunken"
          >
            <Icone nome="camera" tamanho={32} />
            {processando ? "Enviando…" : "Adicionar"}
          </button>
        )}
      </div>
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => aoEscolher(e.target.files)}
      />
      {erro && <p className="text-[13px] font-semibold text-danger mt-2">{erro}</p>}
    </div>
  );
}
