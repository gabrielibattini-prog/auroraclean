"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icone, type NomeIcone } from "./Icone";

const campoBase =
  "w-full rounded-md border-2 bg-surface-card text-ink placeholder:text-ink-muted/80 outline-none transition-shadow focus:border-brand-olive focus:shadow-[0_0_0_3px_var(--brand-olive-soft)]";

function Moldura({
  id,
  rotulo,
  dica,
  erro,
  opcional,
  children,
}: {
  id: string;
  rotulo: string;
  dica?: ReactNode;
  erro?: string;
  opcional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label">
        {rotulo} {opcional && <span className="font-normal text-ink-muted">(opcional)</span>}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="text-[13px] font-semibold text-danger">
          {erro}
        </p>
      ) : dica ? (
        <p id={`${id}-dica`} className="text-[13px] text-ink-muted">
          {dica}
        </p>
      ) : null}
    </div>
  );
}

type PropsCampo = {
  rotulo: string;
  dica?: ReactNode;
  erro?: string;
  opcional?: boolean;
  icone?: NomeIcone;
};

export function CampoTexto({ rotulo, dica, erro, opcional, icone, className = "", ...resto }: PropsCampo & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Moldura id={id} rotulo={rotulo} dica={dica} erro={erro} opcional={opcional}>
      <div className="relative">
        {icone && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icone nome={icone} tamanho={24} />
          </span>
        )}
        <input
          id={id}
          aria-invalid={!!erro || undefined}
          aria-describedby={erro ? `${id}-erro` : dica ? `${id}-dica` : undefined}
          className={`${campoBase} h-12 ${icone ? "pl-12" : "pl-4"} pr-4 ${erro ? "border-danger" : "border-line-strong"} ${className}`}
          {...resto}
        />
      </div>
    </Moldura>
  );
}

export function CampoSelecao({
  rotulo,
  dica,
  erro,
  opcional,
  children,
  className = "",
  ...resto
}: PropsCampo & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Moldura id={id} rotulo={rotulo} dica={dica} erro={erro} opcional={opcional}>
      <select
        id={id}
        aria-invalid={!!erro || undefined}
        className={`${campoBase} h-12 px-4 ${erro ? "border-danger" : "border-line-strong"} ${className}`}
        {...resto}
      >
        {children}
      </select>
    </Moldura>
  );
}

export function CampoArea({ rotulo, dica, erro, opcional, className = "", ...resto }: PropsCampo & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Moldura id={id} rotulo={rotulo} dica={dica} erro={erro} opcional={opcional}>
      <textarea
        id={id}
        aria-invalid={!!erro || undefined}
        className={`${campoBase} min-h-24 p-4 ${erro ? "border-danger" : "border-line-strong"} ${className}`}
        {...resto}
      />
    </Moldura>
  );
}

/** Caixa de seleção grande (área de toque de 48px). */
export function Confirmacao({
  marcado,
  aoMudar,
  children,
  desabilitado,
}: {
  marcado: boolean;
  aoMudar: (v: boolean) => void;
  children: ReactNode;
  desabilitado?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-3 min-h-12 rounded-lg px-4 py-3 cursor-pointer border-2 transition-colors ${
        marcado ? "bg-success-soft border-transparent" : "bg-surface-card border-line"
      } ${desabilitado ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={marcado}
        disabled={desabilitado}
        onChange={(e) => aoMudar(e.target.checked)}
      />
      <span
        aria-hidden
        className={`flex size-7 shrink-0 items-center justify-center rounded-sm border-2 peer-focus-visible:outline-3 peer-focus-visible:outline-focus ${
          marcado ? "bg-success border-success" : "bg-surface-card border-line-strong"
        }`}
      >
        {marcado && (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--surface-card)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5 l4.5 4.5 l9-10" />
          </svg>
        )}
      </span>
      <span className="text-[15px] font-medium">{children}</span>
    </label>
  );
}

/** Grupo de opções em "pílulas" (radio ou múltipla escolha). */
export function Opcoes<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  multipla,
  desabilitado,
}: {
  rotulo: string;
  opcoes: { valor: T; rotulo: ReactNode }[];
  valor: T | T[] | undefined;
  aoMudar: (v: T | T[]) => void;
  multipla?: boolean;
  desabilitado?: boolean;
}) {
  const ativos = Array.isArray(valor) ? valor : valor ? [valor] : [];
  return (
    <fieldset disabled={desabilitado}>
      <legend className="text-label mb-2">{rotulo}</legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => {
          const ativo = ativos.includes(o.valor);
          return (
            <button
              key={o.valor}
              type="button"
              role={multipla ? "checkbox" : "radio"}
              aria-checked={ativo}
              onClick={() => {
                if (!multipla) return aoMudar(o.valor);
                aoMudar(ativo ? ativos.filter((v) => v !== o.valor) : [...ativos, o.valor]);
              }}
              className={`min-h-10 px-4 rounded-pill border-2 text-label transition-colors disabled:opacity-60 ${
                ativo ? "bg-brand-olive-soft border-brand-olive text-brand-olive-deep" : "bg-surface-card border-line text-ink"
              }`}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Tile grande de escolha com ícone (IconTile do guia). */
export function TileOpcao({
  icone,
  titulo,
  detalhe,
  selecionado,
  onClick,
}: {
  icone: NomeIcone;
  titulo: string;
  detalhe?: string;
  selecionado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 min-h-[140px] text-center base-3d ${
        selecionado
          ? "bg-brand-olive-soft border-brand-olive [--base-3d:var(--brand-olive)]"
          : "bg-surface-card border-line [--base-3d:var(--line)]"
      }`}
    >
      <Icone nome={icone} tamanho={48} />
      <span className="text-label">{titulo}</span>
      {detalhe && <span className="text-caption text-ink-muted">{detalhe}</span>}
    </button>
  );
}
