"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Janela de confirmação acessível (usa <dialog> nativo). */
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  children,
  acoes,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  acoes: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
      className="m-auto w-[min(92vw,480px)] rounded-xl bg-surface-card text-ink p-0 shadow-card backdrop:bg-ink/40"
    >
      <div className="p-6">
        <h2 className="text-h2 mb-2">{titulo}</h2>
        <div className="text-body text-ink-muted">{children}</div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">{acoes}</div>
      </div>
    </dialog>
  );
}
