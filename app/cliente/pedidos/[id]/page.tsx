"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AutoAtendimento } from "@/components/pedidos/AutoAtendimento";
import { tituloPedido } from "@/components/pedidos/CardPedido";
import { Historico } from "@/components/pedidos/Historico";
import { Pagamento } from "@/components/pedidos/Pagamento";
import { ProgressoPedido, ResumoPedido, SeloStatus } from "@/components/pedidos/Resumo";
import { ListaLaudos } from "@/components/prontuario/ListaLaudos";
import { SuportePedido } from "@/components/suporte/Chamados";
import { Estrelas, FormAvaliacao, ListaAvaliacoes, NotaResumo } from "@/components/avaliacoes/Avaliacoes";
import { Alerta, Avatar, Card, EstadoVazio, LinhaInfo, TituloPagina } from "@/components/ui/Base";
import { Foto } from "@/components/ui/Fotos";
import { podeVerPedido } from "@/lib/dados/acesso";
import { GARANTIA_DIAS, PERIODOS } from "@/lib/dados/catalogo";
import { avaliacoesDoPrestador, contatoDoPrestador } from "@/lib/dados/consultas";
import { useEstado } from "@/lib/dados/store";
import { dataCurta, dataLonga, moeda } from "@/lib/dados/util";

function DetalhePedido() {
  const { id } = useParams<{ id: string }>();
  const novo = useSearchParams().get("novo");
  const e = useEstado();
  const p = e.pedidos.find((x) => x.id === id);

  if (!p || !podeVerPedido(e, p)) {
    return <EstadoVazio icone="calendario" titulo="Ordem de serviço não encontrada" />;
  }

  const prestador = contatoDoPrestador(e, p.id);
  const end = e.enderecos.find((x) => x.id === p.enderecoId);
  const laudos = e.laudos.filter((l) => l.pedidoId === p.id);
  const minhaAvaliacao = e.avaliacoes.find((a) => a.pedidoId === p.id);
  const avaliacoes = p.prestadorId ? avaliacoesDoPrestador(e, p.prestadorId) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <TituloPagina
        voltar={{ href: "/cliente", rotulo: "Minhas ordens de serviço" }}
        sobre={`Ordem de serviço nº ${p.numero}`}
        titulo={tituloPedido(e, p)}
        acao={<SeloStatus status={p.status} />}
      />

      {novo && p.status === "aberto" && (
        <div className="mb-6 rounded-xl bg-brand-cream p-6 text-center">
          <p className="text-display-l">Tudo pronto!</p>
          <p className="text-body mt-2 text-ink-muted">
            Sua ordem de serviço já está disponível para prestadores Aurora perto de você. Avisamos quando alguém aceitar.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6 min-w-0">
          {p.status === "aguardando_pagamento" && <Pagamento p={p} />}
          {p.status === "em_disputa" && (
            <Alerta tom="warning" titulo="Em mediação">
              A equipe Aurora Clean está analisando o caso. Acompanhe pela conversa abaixo.
            </Alerta>
          )}
          {p.status === "concluido" && p.pagamento && (
            <Alerta tom="success" titulo="Serviço concluído">
              Pago em {dataLonga(p.pagamento.pagoEm)} ({p.pagamento.metodo === "pix" ? "Pix" : p.pagamento.metodo === "credito" ? `crédito ${p.pagamento.parcelas}x` : "débito"}).
              Garantia de {GARANTIA_DIAS} dias.
            </Alerta>
          )}
          {p.status === "cancelado" && (
            <Alerta tom="danger" titulo="Ordem de serviço cancelada">
              {p.pagamento?.reembolsadoEm ? `Valor de ${moeda(p.total)} devolvido em ${dataLonga(p.pagamento.reembolsadoEm)}.` : "Nenhum valor foi cobrado."}
            </Alerta>
          )}

          {p.status === "concluido" && prestador && !minhaAvaliacao && <FormAvaliacao pedidoId={p.id} prestadorNome={prestador.nome.split(" ")[0]} />}
          {minhaAvaliacao && (
            <Card>
              <h2 className="text-h3">Sua avaliação</h2>
              <div className="mt-2">
                <Estrelas nota={minhaAvaliacao.nota} tamanho={24} />
              </div>
              {minhaAvaliacao.comentario && <p className="text-body mt-2">{minhaAvaliacao.comentario}</p>}
              <p className="text-caption text-ink-muted mt-2">Obrigada por ajudar outros clientes!</p>
            </Card>
          )}

          {laudos.length > 0 && (
            <Card>
              <h2 className="text-h3 mb-3">Laudos do serviço</h2>
              <ListaLaudos laudos={laudos} base="/cliente/laudos" />
            </Card>
          )}

          {prestador && (
            <Card>
              <h2 className="text-h3 mb-3">Seu prestador</h2>
              <div className="flex items-center gap-3">
                <Avatar nome={prestador.iniciais} tamanho={56} verificado />
                <div>
                  <p className="text-h3">{prestador.nome}</p>
                  <p className="text-body-sm text-ink-muted">Verificado e treinado no protocolo Aurora</p>
                  {avaliacoes && <NotaResumo resumo={avaliacoes} />}
                </div>
              </div>
              {avaliacoes && avaliacoes.total > 0 && (
                <details className="mt-4 group">
                  <summary className="cursor-pointer list-none text-label text-brand-olive-deep underline">
                    Ver o que outros clientes disseram
                  </summary>
                  <div className="mt-3">
                    <ListaAvaliacoes resumo={avaliacoes} limite={3} />
                  </div>
                </details>
              )}
            </Card>
          )}

          <AutoAtendimento p={p} />
          <SuportePedido e={e} p={p} />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="text-h3 mb-3">Andamento</h2>
            <ProgressoPedido status={p.status} />
          </Card>
          <ResumoPedido e={e} p={p} />
          <Card className="flex flex-col gap-2">
            <h2 className="text-h3 mb-1">Onde e quando</h2>
            {end && (
              <LinhaInfo icone="local">
                {end.logradouro}, {end.numero} {end.complemento && `· ${end.complemento}`} — {end.bairro}
              </LinhaInfo>
            )}
            <LinhaInfo icone="calendario">
              {dataCurta(p.data)} · {PERIODOS[p.periodo].faixa}
            </LinhaInfo>
            {p.observacoes && <p className="text-body-sm rounded-md bg-surface-sunken p-3 mt-1">{p.observacoes}</p>}
            {p.fotosCliente.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {p.fotosCliente.map((f, i) => (
                  <Foto key={f} id={f} alt={`Foto enviada ${i + 1}`} />
                ))}
              </div>
            )}
          </Card>
          <Card>
            <h2 className="text-h3 mb-3">Histórico</h2>
            <Historico e={e} pedidoId={p.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaginaPedidoCliente() {
  return (
    <Suspense>
      <DetalhePedido />
    </Suspense>
  );
}
