"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "./Logo";

/**
 * No MVP os dados vivem no navegador. Esperamos montar no cliente antes de
 * renderizar as telas, para não haver diferença entre servidor e navegador.
 */
export function Pronto({ children }: { children: ReactNode }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy>
        <div className="animate-pulse">
          <Logo tamanho={56} />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
