"use client";

import Link from "next/link";
import { useState } from "react";
import { tituloPedido } from "@/components/pedidos/CardPedido";
import { SeloStatus } from "@/components/pedidos/Resumo";
import { Card, EstadoVazio, TituloPagina } from "@/components/ui/Base";
import { CampoTexto, Opcoes } from "@/components/ui/Campos";
import { PERIODOS, STATUS_PEDIDO } from "@/lib/dados/catalogo";
import { nomeDoUsuario } from "@/lib/dados/consultas";
import { useEstado } from "@/lib/dados/store";
import type { StatusPedido } from "@/lib/dados/tipos";
import { dataCurta, moeda } from "@/lib/dados/util";

export default function PedidosAdmin() {
  const e = useEstado();
  const [status, setStatus] = useState<StatusPedido | "todos">("todos");
  const [busca, setBusca] = useState("");

  const lista = e.pedidos
    .filter((p) => status === "todos" || p.status === status)
    .filter((p) => {
      if (!busca.trim()) return true;
      const termo = busca.toLowerCase();
      const cliente = e.usuarios.find((u) => u.id === p.clienteId)?.nome.toLowerCase() ?? "";
      return String(p.numero).includes(termo) || cliente.includes(termo) || p.bairro.toLowerCase().includes(termo);
    })
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  return (
    <>
      <TituloPagina titulo="Ordens de serviço" subtitulo={`${e.pedidos.length} no total`} />
      <div className="flex flex-col gap-4">
        <CampoTexto rotulo="Buscar" placeholder="Número, cliente ou bairro" value={busca} onChange={(ev) => setBusca(ev.target.value)} />
        <Opcoes
          rotulo="Status"
          valor={status}
          aoMudar={(v) => setStatus(v as typeof status)}
          opcoes={[{ valor: "todos" as const, rotulo: "Todos" }, ...(Object.keys(STATUS_PEDIDO) as StatusPedido[]).map((s) => ({ valor: s, rotulo: STATUS_PEDIDO[s].nome }))]}
        />
      </div>

      {lista.length === 0 ? (
        <EstadoVazio icone="calendario" titulo="Nenhuma ordem de serviço encontrada" />
      ) : (
        <>
          {/* Celular: cards */}
          <div className="mt-6 flex flex-col gap-3 md:hidden">
            {lista.map((p) => (
              <Card key={p.id} href={`/admin/pedidos/${p.id}`}>
                <div className="flex justify-between gap-2">
                  <span className="text-label">Nº {p.numero}</span>
                  <SeloStatus status={p.status} />
                </div>
                <p className="text-body-sm mt-1">{tituloPedido(e, p)}</p>
                <p className="text-body-sm text-ink-muted">
                  {nomeDoUsuario(e, p.clienteId, true)} · {p.bairro} · {dataCurta(p.data)}
                </p>
              </Card>
            ))}
          </div>
          {/* Telas maiores: tabela */}
          <div className="mt-6 hidden md:block overflow-x-auto rounded-xl bg-surface-card shadow-card">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b-2 border-line text-label text-ink-muted">
                <tr>
                  <th className="p-4">Nº</th>
                  <th className="p-4">Estofados</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Prestador</th>
                  <th className="p-4">Quando</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-line">
                {lista.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-sunken">
                    <td className="p-4 font-semibold">
                      <Link href={`/admin/pedidos/${p.id}`} className="underline text-brand-olive-deep">
                        {p.numero}
                      </Link>
                    </td>
                    <td className="p-4">{tituloPedido(e, p)}</td>
                    <td className="p-4">{nomeDoUsuario(e, p.clienteId, true)}</td>
                    <td className="p-4">{p.prestadorId ? nomeDoUsuario(e, p.prestadorId, true) : "—"}</td>
                    <td className="p-4 whitespace-nowrap">
                      {dataCurta(p.data)} · {PERIODOS[p.periodo].nome}
                    </td>
                    <td className="p-4">{moeda(p.total)}</td>
                    <td className="p-4">
                      <SeloStatus status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
