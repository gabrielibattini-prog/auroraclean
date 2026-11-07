/** Stepper do guia: passos concluídos em oliva com check, atual com contorno. */
export function Passos({ passos, atual }: { passos: string[]; atual: number }) {
  return (
    <nav aria-label="Etapas" className="mb-6">
      <p className="text-overline uppercase text-ink-muted mb-3 sm:hidden">
        Passo {atual + 1} de {passos.length} · {passos[atual]}
      </p>
      <ol className="flex items-center">
        {passos.map((p, i) => {
          const feito = i < atual;
          const ativo = i === atual;
          return (
            <li key={p} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  aria-current={ativo ? "step" : undefined}
                  className={`flex size-9 sm:size-10 items-center justify-center rounded-full text-[15px] font-bold ${
                    feito
                      ? "bg-brand-olive text-on-brand shadow-[0_3px_0_var(--brand-olive-deep)]"
                      : ativo
                        ? "bg-surface-card text-brand-olive-deep border-[3px] border-brand-olive shadow-[0_3px_0_var(--brand-olive-deep)]"
                        : "bg-surface-sunken text-ink-muted shadow-[0_3px_0_var(--line)]"
                  }`}
                >
                  {feito ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12.5 l4.5 4.5 l9-10" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                  <span className="sr-only">{feito ? `${p} (concluído)` : p}</span>
                </span>
                <span className={`hidden sm:block text-caption font-semibold ${feito || ativo ? "text-ink" : "text-ink-muted"}`}>{p}</span>
              </div>
              {i < passos.length - 1 && (
                <span className={`h-1.5 flex-1 mx-1 sm:mx-2 rounded-sm sm:-mt-6 ${feito ? "bg-brand-olive" : "bg-surface-sunken"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
