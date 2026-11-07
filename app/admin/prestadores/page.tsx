"use client";

import { useState } from "react";
import { Avatar, Card, EstadoVazio, LinhaInfo, Selo, TituloPagina } from "@/components/ui/Base";
import { Opcoes } from "@/components/ui/Campos";
import { useEstado } from "@/lib/dados/store";
import type { StatusPrestador } from "@/lib/dados/tipos";
import { STATUS_PRESTADOR } from "@/lib/dados/catalogo";
import { dataCurta } from "@/lib/dados/util";
import { avaliacoesDoPrestador } from "@/lib/dados/consultas";
import { NotaResumo } from "@/components/avaliacoes/Avaliacoes";


export default function AdminPrestadores() {
  const e = useEstado();
  const [filtro, setFiltro] = useState<StatusPrestador | "todos">("pendente");

  const lista = e.prestadores
    .filter((p) => filtro === "todos" || p.status === filtro)
    .map((p) => ({ p, u: e.usuarios.find((u) => u.id === p.usuarioId)! }))
    .filter(({ u }) => !u.excluido);

  return (
    <>
      <TituloPagina titulo="Prestadores" subtitulo="Só prestadores aprovados recebem oportunidades." />
      <Opcoes
        rotulo="Mostrar"
        valor={filtro}
        aoMudar={(v) => setFiltro(v as typeof filtro)}
        opcoes={[
          { valor: "pendente", rotulo: `Em análise (${e.prestadores.filter((p) => p.status === "pendente").length})` },
          { valor: "aprovado", rotulo: "Aprovados" },
          { valor: "reprovado", rotulo: "Reprovados" },
          { valor: "suspenso", rotulo: "Suspensos" },
          { valor: "todos", rotulo: "Todos" },
        ]}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {lista.map(({ p, u }) => (
          <Card key={u.id} href={`/admin/prestadores/${u.id}`}>
            <div className="flex items-start gap-3">
              <Avatar nome={u.nome} tamanho={48} verificado={p.status === "aprovado"} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-h3">{u.nome}</h2>
                  <Selo tom={STATUS_PRESTADOR[p.status].tom}>{STATUS_PRESTADOR[p.status].rotulo}</Selo>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <LinhaInfo icone="local">
                    {p.bairro}, {p.cidade} · atende até {p.raioKm} km
                  </LinhaInfo>
                  <LinhaInfo icone="calendario">Cadastro em {dataCurta(u.criadoEm)}</LinhaInfo>
                  {p.status !== "pendente" && <NotaResumo resumo={avaliacoesDoPrestador(e, u.id)} />}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {lista.length === 0 && <EstadoVazio icone="verificado" titulo="Nada por aqui" texto="Nenhum prestador com esse status." />}
    </>
  );
}
