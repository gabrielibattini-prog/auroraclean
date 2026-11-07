"use client";

import type { ReactNode } from "react";
import { AppShell, type Aba } from "@/components/layout/AppShell";
import { AreaProtegida } from "@/components/layout/AreaProtegida";
import { prestadorDe, usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";

export default function LayoutPrestador({ children }: { children: ReactNode }) {
  const e = useEstado();
  const u = usuarioAtual(e);
  const aprovado = u && prestadorDe(e, u.id)?.status === "aprovado";
  const emAndamento = u
    ? e.pedidos.filter((p) => p.prestadorId === u.id && (p.status === "aceito" || p.status === "em_execucao")).length
    : 0;

  const abas: Aba[] = aprovado
    ? [
        { href: "/prestador/oportunidades", rotulo: "Oportunidades", icone: "mapa" },
        { href: "/prestador/servicos", rotulo: "Serviços", icone: "checklist", prefixo: true, contador: emAndamento },
        { href: "/prestador/perfil", rotulo: "Perfil", icone: "usuario" },
      ]
    : [
        { href: "/prestador/aguardando-aprovacao", rotulo: "Cadastro", icone: "verificado" },
        { href: "/prestador/perfil", rotulo: "Perfil", icone: "usuario" },
      ];

  return (
    <AreaProtegida papel="prestador">
      <AppShell abas={abas} modo="prestador">
        {children}
      </AppShell>
    </AreaProtegida>
  );
}
