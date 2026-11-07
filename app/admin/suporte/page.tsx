"use client";

import { useState } from "react";
import { STATUS_CHAMADO, TIPO_CHAMADO } from "@/components/suporte/Chamados";
import { Card, EstadoVazio, Selo, TituloPagina } from "@/components/ui/Base";
import { Opcoes } from "@/components/ui/Campos";
import { Icone } from "@/components/ui/Icone";
import { nomeDoUsuario } from "@/lib/dados/consultas";
import { useEstado } from "@/lib/dados/store";
import { dataHora } from "@/lib/dados/util";

export default function SuporteAdmin() {
  const e = useEstado();
  const [filtro, setFiltro] = useState<"abertos" | "resolvidos">("abertos");
  const lista = e.chamados
    .filter((c) => (filtro === "abertos" ? c.status !== "resolvido" : c.status === "resolvido"))
    .sort((a, b) => (a.tipo === "disputa" ? 0 : 1) - (b.tipo === "disputa" ? 0 : 1) || b.criadoEm.localeCompare(a.criadoEm));

  return (
    <>
      <TituloPagina titulo="Suporte e mediação" subtitulo="Disputas aparecem primeiro. O rotineiro (status, reagendamento, cancelamento) o cliente resolve sozinho." />
      <Opcoes
        rotulo="Mostrar"
        valor={filtro}
        aoMudar={(v) => setFiltro(v as typeof filtro)}
        opcoes={[
          { valor: "abertos", rotulo: `Abertos (${e.chamados.filter((c) => c.status !== "resolvido").length})` },
          { valor: "resolvidos", rotulo: "Resolvidos" },
        ]}
      />
      {lista.length === 0 ? (
        <EstadoVazio icone="suporte" titulo="Nenhum atendimento aqui" />
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {lista.map((c) => {
            const p = e.pedidos.find((x) => x.id === c.pedidoId)!;
            const ultima = e.mensagens.filter((m) => m.chamadoId === c.id).at(-1);
            return (
              <Card key={c.id} href={`/admin/suporte/${c.id}`} className="flex items-start gap-3">
                <Icone nome={c.tipo === "disputa" ? "sino" : "chat"} tamanho={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-h3">{c.assunto}</p>
                    <Selo tom={STATUS_CHAMADO[c.status].tom}>{STATUS_CHAMADO[c.status].rotulo}</Selo>
                  </div>
                  <p className="text-body-sm text-ink-muted">
                    {TIPO_CHAMADO[c.tipo]} · ordem de serviço nº {p.numero} · aberto por {nomeDoUsuario(e, c.abertoPor, true)}
                  </p>
                  {ultima && (
                    <p className="text-body-sm mt-2 truncate">
                      <span className="text-ink-muted">{nomeDoUsuario(e, ultima.autorId)}:</span> {ultima.texto}
                    </p>
                  )}
                  <p className="text-caption text-ink-muted mt-1">{dataHora(c.criadoEm)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
