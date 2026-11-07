"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { saiuPorVontade } from "@/lib/dados/acoes";
import { prestadorDe, usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";
import type { Papel } from "@/lib/dados/tipos";

export const INICIO_POR_PAPEL: Record<Papel, string> = {
  cliente: "/cliente",
  prestador: "/prestador/oportunidades",
  admin: "/admin",
};

/** Rotas que o prestador ainda não aprovado pode abrir. */
const LIVRES_PARA_PENDENTE = ["/prestador/aguardando-aprovacao", "/prestador/perfil"];

/**
 * Proteção de rota no front-end. É uma conveniência de navegação:
 * a proteção real fica nas ações (lib/dados/acoes.ts) e, no back-end, no RLS.
 */
export function AreaProtegida({ papel, children }: { papel: Papel; children: ReactNode }) {
  const e = useEstado();
  const router = useRouter();
  const caminho = usePathname();
  const u = usuarioAtual(e);

  const prestador = u?.papel === "prestador" ? prestadorDe(e, u.id) : undefined;
  const pendente = papel === "prestador" && prestador?.status !== "aprovado";
  const bloqueadoPorAprovacao = pendente && !LIVRES_PARA_PENDENTE.includes(caminho);

  let destino: string | null = null;
  if (!u) destino = saiuPorVontade() ? "/" : `/entrar?volta=${encodeURIComponent(caminho)}`;
  else if (u.papel !== papel) destino = INICIO_POR_PAPEL[u.papel];
  else if (bloqueadoPorAprovacao) destino = "/prestador/aguardando-aprovacao";

  useEffect(() => {
    if (destino) router.replace(destino);
  }, [destino, router]);

  if (destino) return null;
  return <>{children}</>;
}
