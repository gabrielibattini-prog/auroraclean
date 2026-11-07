import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icone, type NomeIcone } from "./Icone";

type Variante = "primario" | "secundario" | "creme" | "terracota" | "perigo" | "fantasma";
type Tamanho = "sm" | "md" | "lg";

const variantes: Record<Variante, string> = {
  primario: "bg-brand-olive text-on-brand [--base-3d:var(--brand-olive-deep)] base-3d",
  secundario: "bg-surface-card text-brand-olive-deep border-2 border-line [--base-3d:var(--line)] base-3d",
  creme: "bg-brand-cream text-ink [--base-3d:var(--brand-cream-deep)] base-3d",
  terracota: "bg-accent-clay text-on-brand [--base-3d:var(--brand-olive-deep)] base-3d",
  perigo: "bg-danger-solid text-on-brand [--base-3d:var(--danger)] base-3d",
  fantasma: "text-brand-olive-deep hover:bg-brand-olive-soft",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-10 px-4 rounded-md text-body-sm font-bold gap-2",
  md: "h-12 px-6 rounded-lg text-button gap-2",
  lg: "h-14 px-8 rounded-lg text-[17px] font-bold gap-3",
};

const desabilitado =
  "disabled:bg-surface-sunken disabled:text-ink-muted disabled:border-transparent disabled:[--base-3d:var(--line)] disabled:cursor-not-allowed";

interface Comum {
  variante?: Variante;
  tamanho?: Tamanho;
  icone?: NomeIcone;
  larguraTotal?: boolean;
  carregando?: boolean;
  children: ReactNode;
  className?: string;
}

function classes({ variante = "primario", tamanho = "md", larguraTotal, className = "" }: Comum) {
  return [
    "inline-flex max-w-full items-center justify-center select-none whitespace-nowrap transition-colors",
    variantes[variante],
    tamanhos[tamanho],
    desabilitado,
    larguraTotal ? "w-full" : "",
    className,
  ].join(" ");
}

export function Botao({
  variante,
  tamanho,
  icone,
  larguraTotal,
  carregando,
  children,
  className,
  type = "button",
  disabled,
  ...resto
}: Comum & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={classes({ variante, tamanho, larguraTotal, className, children })}
      {...resto}
    >
      {icone && <Icone nome={icone} tamanho={tamanho === "lg" ? 28 : 24} />}
      <span className="min-w-0 truncate">{carregando ? "Aguarde…" : children}</span>
    </button>
  );
}

export function BotaoLink({
  href,
  variante,
  tamanho,
  icone,
  larguraTotal,
  children,
  className,
}: Comum & { href: string }) {
  return (
    <Link href={href} className={classes({ variante, tamanho, larguraTotal, className, children })}>
      {icone && <Icone nome={icone} tamanho={tamanho === "lg" ? 28 : 24} />}
      <span className="min-w-0 truncate">{children}</span>
    </Link>
  );
}
