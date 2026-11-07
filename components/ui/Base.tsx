import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { Icone, type NomeIcone } from "./Icone";
import { iniciais } from "@/lib/dados/util";

/* ---------------- Card ---------------- */

export function Card({
  children,
  className = "",
  href,
  ...resto
}: { children: ReactNode; className?: string; href?: string } & HTMLAttributes<HTMLDivElement>) {
  const base = `block bg-surface-card rounded-xl shadow-card p-4 sm:p-5 ${className}`;
  if (href) {
    return (
      <Link href={href} className={`${base} transition-transform hover:-translate-y-0.5`}>
        {children}
      </Link>
    );
  }
  return (
    <div className={base} {...resto}>
      {children}
    </div>
  );
}

/* ---------------- Selo (badge) ---------------- */

export type TomSelo = "brand" | "clay" | "success" | "warning" | "danger" | "info" | "neutral";

const tons: Record<TomSelo, string> = {
  brand: "bg-brand-olive-soft text-brand-olive-deep",
  clay: "bg-accent-clay-soft text-accent-clay",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-surface-sunken text-ink-muted",
};

export function Selo({ tom = "neutral", icone, children }: { tom?: TomSelo; icone?: NomeIcone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-pill text-[13px] font-semibold leading-none ${tons[tom]}`}>
      {icone && <Icone nome={icone} tamanho={20} />}
      {children}
    </span>
  );
}

/* ---------------- Alerta ---------------- */

const tonsAlerta = {
  success: { caixa: "bg-success-soft", titulo: "text-success", icone: "verificado" as NomeIcone },
  warning: { caixa: "bg-warning-soft", titulo: "text-warning", icone: "sino" as NomeIcone },
  danger: { caixa: "bg-danger-soft", titulo: "text-danger", icone: "sino" as NomeIcone },
  info: { caixa: "bg-info-soft", titulo: "text-info", icone: "brilho" as NomeIcone },
};

export function Alerta({
  tom = "info",
  titulo,
  children,
  icone,
}: {
  tom?: keyof typeof tonsAlerta;
  titulo: string;
  children?: ReactNode;
  icone?: NomeIcone;
}) {
  const t = tonsAlerta[tom];
  return (
    <div role={tom === "danger" ? "alert" : "status"} className={`flex gap-3 rounded-lg p-4 ${t.caixa}`}>
      <Icone nome={icone ?? t.icone} tamanho={32} />
      <div className="min-w-0">
        <p className={`text-[15px] font-bold ${t.titulo}`}>{titulo}</p>
        {children && <div className="text-body-sm text-ink mt-0.5">{children}</div>}
      </div>
    </div>
  );
}

/* ---------------- Avatar ---------------- */

export function Avatar({ nome, tamanho = 40, verificado }: { nome: string; tamanho?: number; verificado?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: tamanho, height: tamanho }}>
      <span
        className="inline-flex size-full items-center justify-center rounded-full bg-brand-cream text-brand-olive-deep font-bold"
        style={{ fontSize: tamanho * 0.36 }}
        aria-hidden
      >
        {iniciais(nome)}
      </span>
      {verificado && (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-surface-card p-0.5">
          <Icone nome="verificado" tamanho={20} rotulo="Verificado pela Aurora Clean" />
        </span>
      )}
    </span>
  );
}

/* ---------------- Estado vazio ---------------- */

export function EstadoVazio({
  icone,
  titulo,
  texto,
  acao,
}: {
  icone: NomeIcone;
  titulo: string;
  texto?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <span className="flex size-[100px] items-center justify-center rounded-full bg-brand-cream mb-4">
        <Icone nome={icone} tamanho={64} />
      </span>
      <p className="text-[20px] leading-7 font-bold">{titulo}</p>
      {texto && <p className="text-body-sm text-ink-muted mt-1 max-w-sm">{texto}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

/* ---------------- Título de página ---------------- */

export function TituloPagina({
  titulo,
  subtitulo,
  sobre,
  voltar,
  acao,
}: {
  titulo: string;
  subtitulo?: ReactNode;
  sobre?: string;
  voltar?: { href: string; rotulo: string };
  acao?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {voltar && (
        <Link href={voltar.href} className="inline-flex items-center gap-1 text-label text-brand-olive-deep mb-3 hover:underline">
          <span aria-hidden>←</span> {voltar.rotulo}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {sobre && <p className="text-overline uppercase text-ink-muted mb-1">{sobre}</p>}
          <h1 className="text-h1">{titulo}</h1>
          {subtitulo && <div className="text-body text-ink-muted mt-1">{subtitulo}</div>}
        </div>
        {acao}
      </div>
    </header>
  );
}

/* ---------------- Seção ---------------- */

export function Secao({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-h2">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

/* ---------------- Linha de informação ---------------- */

export function LinhaInfo({ icone, children }: { icone: NomeIcone; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-body-sm text-ink-muted">
      <Icone nome={icone} tamanho={24} />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

/* ---------------- Barra de progresso ---------------- */

export function BarraProgresso({ rotulo, valor, total, detalhe }: { rotulo: string; valor: number; total: number; detalhe?: string }) {
  const pct = total ? Math.round((valor / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-body-sm mb-1.5">
        <span className="font-semibold">{rotulo}</span>
        <span className="text-ink-muted">{detalhe ?? `${pct}%`}</span>
      </div>
      <div className="h-4 rounded-sm bg-surface-sunken overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={rotulo}>
        <div className="h-full rounded-sm bg-modo relative transition-[width]" style={{ width: `${pct}%` }}>
          <span className="absolute left-2 right-2 top-[3px] h-1 rounded-sm bg-white/35" />
        </div>
      </div>
    </div>
  );
}
