import type { ReactNode } from "react";
import { Logo } from "./Logo";

/** Moldura das telas públicas (entrar, cadastro, ajuda, privacidade). */
export function PaginaSimples({ children, largura = "max-w-md" }: { children: ReactNode; largura?: string }) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-20 max-w-6xl items-center px-4">
        <Logo tamanho={40} comTexto href="/" />
      </header>
      <main className={`mx-auto ${largura} px-4 pb-28`}>{children}</main>
    </div>
  );
}
