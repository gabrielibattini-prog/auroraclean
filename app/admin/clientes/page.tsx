"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, Card, EstadoVazio, LinhaInfo, TituloPagina } from "@/components/ui/Base";
import { CampoTexto } from "@/components/ui/Campos";
import { useEstado } from "@/lib/dados/store";
import { dataCurta, moeda } from "@/lib/dados/util";

export default function ClientesAdmin() {
  const e = useEstado();
  const [busca, setBusca] = useState("");

  const lista = e.usuarios
    .filter((u) => u.papel === "cliente" && !u.excluido)
    .map((u) => {
      const pedidos = e.pedidos.filter((p) => p.clienteId === u.id);
      const pagos = pedidos.filter((p) => p.pagamento && !p.pagamento.reembolsadoEm);
      const ultimo = [...pedidos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0];
      const end = e.enderecos.find((x) => x.clienteId === u.id);
      return {
        u,
        qtd: pedidos.length,
        total: pagos.reduce((s, p) => s + p.total, 0),
        ultimo,
        local: end ? `${end.bairro}, ${end.cidade}` : "Sem endereço",
      };
    })
    .filter(({ u, local }) => {
      const t = busca.trim().toLowerCase();
      return !t || u.nome.toLowerCase().includes(t) || u.email.includes(t) || u.telefone.includes(t) || local.toLowerCase().includes(t);
    })
    .sort((a, b) => b.u.criadoEm.localeCompare(a.u.criadoEm));

  return (
    <>
      <TituloPagina titulo="Clientes" subtitulo={`${e.usuarios.filter((u) => u.papel === "cliente" && !u.excluido).length} cadastrados`} />
      <CampoTexto rotulo="Buscar" placeholder="Nome, e-mail, celular ou bairro" value={busca} onChange={(ev) => setBusca(ev.target.value)} />

      {lista.length === 0 ? (
        <EstadoVazio icone="usuario" titulo="Nenhum cliente encontrado" />
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3 md:hidden">
            {lista.map(({ u, qtd, total, local }) => (
              <Card key={u.id} href={`/admin/clientes/${u.id}`} className="flex items-start gap-3">
                <Avatar nome={u.nome} tamanho={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-h3 truncate">{u.nome}</p>
                  <LinhaInfo icone="local">{local}</LinhaInfo>
                  <p className="text-body-sm text-ink-muted mt-1">
                    {qtd} OS · {moeda(total)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6 hidden md:block overflow-x-auto rounded-xl bg-surface-card shadow-card">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b-2 border-line text-label text-ink-muted">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4">Região</th>
                  <th className="p-4">Ordens de serviço</th>
                  <th className="p-4">Total pago</th>
                  <th className="p-4">Última OS</th>
                  <th className="p-4">Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-line">
                {lista.map(({ u, qtd, total, ultimo, local }) => (
                  <tr key={u.id} className="hover:bg-surface-sunken">
                    <td className="p-4">
                      <Link href={`/admin/clientes/${u.id}`} className="flex items-center gap-3 font-semibold text-brand-olive-deep underline">
                        <Avatar nome={u.nome} tamanho={32} />
                        {u.nome}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="block">{u.email}</span>
                      <span className="block text-ink-muted">{u.telefone}</span>
                    </td>
                    <td className="p-4">{local}</td>
                    <td className="p-4">{qtd}</td>
                    <td className="p-4">{moeda(total)}</td>
                    <td className="p-4">{ultimo ? `nº ${ultimo.numero} · ${dataCurta(ultimo.data)}` : "—"}</td>
                    <td className="p-4 whitespace-nowrap">{dataCurta(u.criadoEm)}</td>
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
