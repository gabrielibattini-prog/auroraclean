"use client";

import { MeusDados } from "@/components/perfil/MeusDados";
import { TituloPagina } from "@/components/ui/Base";

export default function PerfilCliente() {
  return (
    <div className="mx-auto max-w-2xl">
      <TituloPagina titulo="Seu perfil" />
      <MeusDados />
    </div>
  );
}
