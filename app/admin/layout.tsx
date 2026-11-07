"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AreaProtegida } from "@/components/layout/AreaProtegida";
import { useEstado } from "@/lib/dados/store";

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  const e = useEstado();
  const pendentes = e.prestadores.filter((p) => p.status === "pendente").length;
  const chamadosAbertos = e.chamados.filter((c) => c.status !== "resolvido").length;

  return (
    <AreaProtegida papel="admin">
      <AppShell
        modo="admin"
        abas={[
          { href: "/admin", rotulo: "Painel", icone: "casa" },
          { href: "/admin/clientes", rotulo: "Clientes", icone: "usuario", prefixo: true },
          { href: "/admin/prestadores", rotulo: "Prestadores", icone: "verificado", prefixo: true, contador: pendentes },
          { href: "/admin/pedidos", rotulo: "Ordens", icone: "calendario", prefixo: true },
          { href: "/admin/suporte", rotulo: "Suporte", icone: "suporte", prefixo: true, contador: chamadosAbertos },
          { href: "/admin/lembretes", rotulo: "Lembretes", icone: "sino" },
        ]}
      >
        {children}
      </AppShell>
    </AreaProtegida>
  );
}
