"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icone, type NomeIcone } from "@/components/ui/Icone";
import { Avatar } from "@/components/ui/Base";
import { sair } from "@/lib/dados/acoes";
import { usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";
import { Logo } from "./Logo";

export interface Aba {
  href: string;
  rotulo: string;
  icone: NomeIcone;
  /** marca a aba como ativa também em sub-rotas */
  prefixo?: boolean;
  contador?: number;
}

const ROTULO_MODO = { cliente: "Cliente", prestador: "Prestador", admin: "Admin" } as const;

/** Estrutura das áreas logadas: cabeçalho, conteúdo e barra de abas no celular. */
export function AppShell({ abas, modo, children }: { abas: Aba[]; modo: "cliente" | "prestador" | "admin"; children: ReactNode }) {
  const caminho = usePathname();
  const e = useEstado();
  const u = usuarioAtual(e);

  const ativa = (a: Aba) => (a.prefixo ? caminho === a.href || caminho.startsWith(a.href + "/") : caminho === a.href);

  return (
    <div data-modo={modo} className="min-h-dvh pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-0">
      <header className="nao-imprimir sticky top-0 z-[1100] border-b-2 border-line bg-surface-page/95 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Logo tamanho={36} comTexto href={abas[0].href} />
            <span className="hidden xl:inline-flex h-6 items-center rounded-pill bg-modo-soft px-2.5 text-caption text-modo">{ROTULO_MODO[modo]}</span>
          </div>
          <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-1">
            {abas.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                aria-current={ativa(a) ? "page" : undefined}
                className={`relative flex items-center gap-2 h-11 px-3 rounded-md text-label ${
                  ativa(a) ? "bg-modo-soft text-ink" : "text-ink-muted hover:bg-surface-sunken"
                }`}
              >
                <Icone nome={a.icone} tamanho={24} inativo={!ativa(a)} />
                {a.rotulo}
                {!!a.contador && <Contador n={a.contador} />}
              </Link>
            ))}
          </nav>
          {u && (
            <div className="flex items-center gap-2">
              <span className="hidden xl:block text-body-sm text-ink-muted">{u.nome.split(" ")[0]}</span>
              <Avatar nome={u.nome} tamanho={36} />
              <button
                type="button"
                onClick={() => sair()}
                className="h-10 px-3 rounded-md text-label text-ink-muted hover:bg-surface-sunken"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:pt-8">{children}</main>

      <nav
        aria-label="Navegação principal"
        className="nao-imprimir md:hidden fixed inset-x-0 bottom-0 z-[1100] border-t-2 border-line bg-surface-card pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="flex justify-around px-2 py-2">
          {abas.map((a) => (
            <li key={a.href} className="flex-1">
              <Link
                href={a.href}
                aria-current={ativa(a) ? "page" : undefined}
                className={`relative mx-auto flex h-16 max-w-24 flex-col items-center justify-center gap-1 rounded-md text-caption font-semibold ${
                  ativa(a) ? "bg-modo-soft text-ink" : "text-ink-muted"
                }`}
              >
                <Icone nome={a.icone} tamanho={28} inativo={!ativa(a)} />
                {a.rotulo}
                {!!a.contador && (
                  <span className="absolute top-1 right-3">
                    <Contador n={a.contador} />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Contador({ n }: { n: number }) {
  return (
    <span className="inline-flex min-w-5 h-[18px] items-center justify-center rounded-pill bg-danger-solid px-1.5 text-[11px] font-bold text-on-brand">
      {n}
      <span className="sr-only"> pendentes</span>
    </span>
  );
}
