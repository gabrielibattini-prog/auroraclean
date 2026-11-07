"use client";

import { usePathname } from "next/navigation";
import { Icone } from "@/components/ui/Icone";
import { usuarioAtual } from "@/lib/dados/acesso";
import { WHATSAPP_AURORA } from "@/lib/dados/catalogo";
import { useEstado } from "@/lib/dados/store";

/** Áreas onde o botão não aparece (equipe e telas com ação fixa no rodapé). */
const OCULTO_EM = ["/prestador", "/admin", "/cliente/pedidos/novo"];

/**
 * Botão flutuante para falar com a Aurora Clean pelo WhatsApp.
 * Na tela de um pedido, a mensagem já vai com o número do pedido.
 */
export function BotaoWhatsApp() {
  const caminho = usePathname();
  const e = useEstado();
  if (OCULTO_EM.some((r) => caminho.startsWith(r)) || caminho.includes("/laudos/")) return null;

  const u = usuarioAtual(e);
  const pedidoId = caminho.match(/^\/cliente\/pedidos\/([^/]+)/)?.[1];
  const pedido = pedidoId ? e.pedidos.find((p) => p.id === pedidoId && p.clienteId === u?.id) : undefined;
  const texto = pedido
    ? `Olá! Sou ${u!.nome.split(" ")[0]}, cliente da Aurora Clean. Tenho uma dúvida sobre a ordem de serviço nº ${pedido.numero}.`
    : "Olá! Vim pela plataforma Aurora Clean e tenho uma dúvida.";
  const href = `https://wa.me/${WHATSAPP_AURORA.numero}?text=${encodeURIComponent(texto)}`;
  const naAreaLogada = caminho.startsWith("/cliente");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar com a Aurora Clean no WhatsApp, ${WHATSAPP_AURORA.exibicao}`}
      title="Falar no WhatsApp"
      className={`nao-imprimir group fixed right-4 z-[1200] flex items-center gap-2 ${
        naAreaLogada ? "bottom-[calc(96px+env(safe-area-inset-bottom))] md:bottom-6" : "bottom-[calc(20px+env(safe-area-inset-bottom))]"
      }`}
    >
      <span className="hidden md:block rounded-pill bg-surface-card px-4 py-2 text-label shadow-card opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Fale com a gente
      </span>
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-olive base-3d [--base-3d:var(--brand-olive-deep)]">
        <Icone nome="whatsapp" tamanho={40} className="icone-claro" />
      </span>
    </a>
  );
}
