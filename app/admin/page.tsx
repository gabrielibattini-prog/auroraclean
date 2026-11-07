"use client";

import Link from "next/link";
import { Card, EstadoVazio, Secao, Selo, TituloPagina } from "@/components/ui/Base";
import { Icone, type NomeIcone } from "@/components/ui/Icone";
import { STATUS_CHAMADO, TIPO_CHAMADO } from "@/components/suporte/Chamados";
import { useEstado } from "@/lib/dados/store";
import { dataCurta, deDataISO, moeda, nomeCurto } from "@/lib/dados/util";

function Indicador({ icone, rotulo, valor, href }: { icone: NomeIcone; rotulo: string; valor: string | number; href: string }) {
  return (
    <Card href={href} className="flex items-center gap-4">
      <Icone nome={icone} tamanho={48} />
      <div>
        <p className="text-[13px] font-medium text-ink-muted">{rotulo}</p>
        <p className="text-[24px] font-bold leading-8">{valor}</p>
      </div>
    </Card>
  );
}

export default function PainelAdmin() {
  const e = useEstado();
  const pendentes = e.prestadores.filter((p) => p.status === "pendente");
  const chamados = e.chamados.filter((c) => c.status !== "resolvido").sort((a, b) => (a.tipo === "disputa" ? -1 : 0) - (b.tipo === "disputa" ? -1 : 0));
  const abertos = e.pedidos.filter((p) => p.status === "aberto");
  const semPrestador = abertos.filter((p) => (Date.now() - new Date(p.criadoEm).getTime()) / 36e5 > 24);
  const andamento = e.pedidos.filter((p) => ["aceito", "em_execucao", "aguardando_pagamento"].includes(p.status));

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const faturado = e.pedidos
    .filter((p) => p.pagamento && !p.pagamento.reembolsadoEm && new Date(p.pagamento.pagoEm) >= inicioMes)
    .reduce((s, p) => s + p.total, 0);

  const em30 = new Date();
  em30.setDate(em30.getDate() + 30);
  const lembretes = e.lembretes.filter((l) => l.status === "agendado" && deDataISO(l.dataPrevista) <= em30);

  return (
    <>
      <TituloPagina titulo="Painel" subtitulo="O que precisa da sua atenção hoje." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Indicador icone="usuario" rotulo="Clientes cadastrados" valor={e.usuarios.filter((u) => u.papel === "cliente" && !u.excluido).length} href="/admin/clientes" />
        <Indicador icone="verificado" rotulo="Cadastros para aprovar" valor={pendentes.length} href="/admin/prestadores" />
        <Indicador icone="suporte" rotulo="Atendimentos abertos" valor={chamados.length} href="/admin/suporte" />
        <Indicador icone="calendario" rotulo="Serviços em andamento" valor={andamento.length} href="/admin/pedidos" />
        <Indicador icone="carteira" rotulo="Recebido no mês" valor={moeda(faturado)} href="/admin/pedidos" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Secao titulo="Atendimentos">
          {chamados.length ? (
            <div className="flex flex-col gap-3">
              {chamados.map((c) => {
                const p = e.pedidos.find((x) => x.id === c.pedidoId)!;
                return (
                  <Card key={c.id} href={`/admin/suporte/${c.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-label">{c.assunto}</p>
                        <p className="text-body-sm text-ink-muted">
                          {TIPO_CHAMADO[c.tipo]} · ordem de serviço nº {p.numero} · {dataCurta(c.criadoEm)}
                        </p>
                      </div>
                      <Selo tom={c.tipo === "disputa" ? "warning" : STATUS_CHAMADO[c.status].tom}>{c.tipo === "disputa" ? "Disputa" : STATUS_CHAMADO[c.status].rotulo}</Selo>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EstadoVazio icone="suporte" titulo="Tudo tranquilo" texto="Nenhum atendimento aberto." />
          )}
        </Secao>

        <Secao titulo="Cadastros novos">
          {pendentes.length ? (
            <div className="flex flex-col gap-3">
              {pendentes.map((p) => {
                const u = e.usuarios.find((x) => x.id === p.usuarioId)!;
                return (
                  <Card key={u.id} href={`/admin/prestadores/${u.id}`} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-label">{u.nome}</span>
                      <span className="block text-body-sm text-ink-muted">
                        {p.bairro}, {p.cidade}
                      </span>
                    </span>
                    <Selo tom="warning">Em análise</Selo>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EstadoVazio icone="verificado" titulo="Nenhum cadastro pendente" />
          )}
        </Secao>
      </div>

      {semPrestador.length > 0 && (
        <Secao titulo="Ordens de serviço sem prestador há mais de 24h">
          <div className="grid gap-3 md:grid-cols-2">
            {semPrestador.map((p) => (
              <Card key={p.id} href={`/admin/pedidos/${p.id}`} className="flex items-center justify-between">
                <span>
                  <span className="block text-label">
                    Nº {p.numero} · {p.bairro}, {p.cidade}
                  </span>
                  <span className="block text-body-sm text-ink-muted">Para {dataCurta(p.data)}</span>
                </span>
                <Selo tom="clay">Sem prestador</Selo>
              </Card>
            ))}
          </div>
        </Secao>
      )}

      {lembretes.length > 0 && (
        <Secao titulo="Lembretes dos próximos 30 dias" acao={<Link href="/admin/lembretes" className="text-label text-brand-olive-deep underline">Ver todos</Link>}>
          <div className="grid gap-3 md:grid-cols-2">
            {lembretes.map((l) => {
              const u = e.usuarios.find((x) => x.id === l.clienteId)!;
              const est = e.estofados.find((x) => x.id === l.estofadoId);
              return (
                <Card key={l.id} className="flex items-center gap-3">
                  <Icone nome="gota" tamanho={40} />
                  <span>
                    <span className="block text-label">
                      {est?.apelido} · {nomeCurto(u.nome)}
                    </span>
                    <span className="block text-body-sm text-ink-muted">{dataCurta(l.dataPrevista)}</span>
                  </span>
                </Card>
              );
            })}
          </div>
        </Secao>
      )}
    </>
  );
}
