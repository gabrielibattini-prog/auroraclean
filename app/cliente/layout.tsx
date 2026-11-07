"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AreaProtegida } from "@/components/layout/AreaProtegida";
import { usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";

export default function LayoutCliente({ children }: { children: ReactNode }) {
  const e = useEstado();
  const u = usuarioAtual(e);
  const aPagar = u ? e.pedidos.filter((p) => p.clienteId === u.id && p.status === "aguardando_pagamento").length : 0;

  return (
    <AreaProtegida papel="cliente">
      <AppShell
        modo="cliente"
        abas={[
          { href: "/cliente", rotulo: "Início", icone: "casa", contador: aPagar },
          { href: "/cliente/pedidos/novo", rotulo: "Solicitar", icone: "brilho" },
          { href: "/cliente/estofados", rotulo: "Estofados", icone: "sofa", prefixo: true },
          { href: "/cliente/perfil", rotulo: "Perfil", icone: "usuario" },
        ]}
      >
        {children}
      </AppShell>
    </AreaProtegida>
  );
}
