"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { tituloPedido } from "@/components/pedidos/CardPedido";
import { Historico } from "@/components/pedidos/Historico";
import { ResumoPedido, SeloStatus } from "@/components/pedidos/Resumo";
import { SuportePedido } from "@/components/suporte/Chamados";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card, EstadoVazio, LinhaInfo, Selo, TituloPagina } from "@/components/ui/Base";
import { Foto } from "@/components/ui/Fotos";
import { Icone } from "@/components/ui/Icone";
import { iniciarServico, mensagemDeErro } from "@/lib/dados/acoes";
import { podeVerPedido } from "@/lib/dados/acesso";
import { ESTOFADOS, PERIODOS, SERVICOS } from "@/lib/dados/catalogo";
import { contatoDoCliente } from "@/lib/dados/consultas";
import { useEstado } from "@/lib/dados/store";
import { dataCurta } from "@/lib/dados/util";

function Servico() {
  const { id } = useParams<{ id: string }>();
  const aceito = useSearchParams().get("aceito");
  const e = useEstado();
  const [erro, setErro] = useState("");
  const p = e.pedidos.find((x) => x.id === id);

  if (!p || !podeVerPedido(e, p)) return <EstadoVazio icone="calendario" titulo="Serviço não encontrado" />;

  const contato = contatoDoCliente(e, p.id);
  const prontuarios = e.prontuarios.filter((x) => x.pedidoId === p.id);

  return (
    <div className="mx-auto max-w-5xl">
      <TituloPagina voltar={{ href: "/prestador/servicos", rotulo: "Seus serviços" }} sobre={`Ordem de serviço nº ${p.numero}`} titulo={tituloPedido(e, p)} acao={<SeloStatus status={p.status} />} />

      {aceito && p.status === "aceito" && (
        <div className="mb-6">
          <Alerta tom="success" titulo="Oportunidade aceita!">
            Combine os detalhes com o cliente e chegue no horário. No dia, toque em “Iniciar serviço”.
          </Alerta>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6 min-w-0">
          {contato ? (
            <Card>
              <h2 className="text-h3 mb-3">Cliente</h2>
              <div className="flex flex-col gap-2">
                <LinhaInfo icone="usuario">{contato.nome}</LinhaInfo>
                <LinhaInfo icone="chat">
                  <a className="underline text-brand-olive-deep font-semibold" href={`tel:${contato.telefone.replace(/\D/g, "")}`}>
                    {contato.telefone}
                  </a>
                </LinhaInfo>
                <LinhaInfo icone="local">
                  {contato.endereco}
                  {contato.complemento && ` · ${contato.complemento}`}
                </LinhaInfo>
                <LinhaInfo icone="calendario">
                  {dataCurta(p.data)} · {PERIODOS[p.periodo].nome} ({PERIODOS[p.periodo].faixa})
                </LinhaInfo>
              </div>
            </Card>
          ) : (
            <Alerta tom="info" titulo="Contato encerrado">
              Por privacidade, os dados do cliente ficam disponíveis só durante o serviço e alguns dias depois.
            </Alerta>
          )}

          {p.status === "aceito" && (
            <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Icone nome="checklist" tamanho={48} />
              <div className="flex-1">
                <h2 className="text-h3">Chegou no cliente?</h2>
                <p className="text-body-sm text-ink-muted">Ao iniciar, abrimos o prontuário de cada estofado com o checklist Aurora.</p>
              </div>
              <Botao
                variante="terracota"
                onClick={() => {
                  setErro("");
                  try {
                    iniciarServico(p.id);
                  } catch (err) {
                    setErro(mensagemDeErro(err));
                  }
                }}
              >
                Iniciar serviço
              </Botao>
            </Card>
          )}

          {prontuarios.length > 0 && (
            <Card>
              <h2 className="text-h3 mb-1">Prontuários</h2>
              <p className="text-body-sm text-ink-muted mb-4">Checklist e fotos de antes e depois são obrigatórios para concluir.</p>
              <ul className="flex flex-col gap-3">
                {p.itens.map((i) => {
                  const pr = prontuarios.find((x) => x.itemId === i.id);
                  const est = e.estofados.find((x) => x.id === i.estofadoId)!;
                  if (!pr) return null;
                  const feito = pr.status === "finalizado";
                  return (
                    <li key={i.id}>
                      <Link
                        href={`/prestador/servicos/${p.id}/prontuario/${pr.id}`}
                        className={`flex items-center gap-3 rounded-lg p-4 border-2 ${feito ? "bg-success-soft border-transparent" : "bg-surface-card border-line"}`}
                      >
                        <span className={`flex size-7 items-center justify-center rounded-sm ${feito ? "bg-success text-on-brand" : "border-2 border-line-strong"}`} aria-hidden>
                          {feito && "✓"}
                        </span>
                        <Icone nome={ESTOFADOS[est.tipo].icone} tamanho={32} />
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[15px] font-medium ${feito ? "text-ink-muted" : ""}`}>{est.apelido}</span>
                          <span className="block text-caption text-ink-muted">{SERVICOS[i.servico].curto}</span>
                        </span>
                        <span className="flex items-center gap-1 text-caption font-semibold text-ink-muted">
                          <Icone nome="camera" tamanho={20} /> {pr.fotosAntes.length + pr.fotosDepois.length}
                        </span>
                        <Selo tom={feito ? "success" : "clay"}>{feito ? "Feito" : "Abrir"}</Selo>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {p.status === "aguardando_pagamento" && (
            <Alerta tom="success" titulo="Tudo certo do seu lado!">
              Os laudos foram enviados. Agora o cliente confere e aprova o resultado.
            </Alerta>
          )}

          {erro && <Alerta tom="danger" titulo={erro} />}
          <SuportePedido e={e} p={p} />
        </div>

        <div className="flex flex-col gap-6">
          <ResumoPedido e={e} p={p} titulo="O que fazer" />
          {(p.observacoes || p.fotosCliente.length > 0) && (
            <Card>
              <h2 className="text-h3 mb-2">Recado do cliente</h2>
              {p.observacoes && <p className="text-body-sm">{p.observacoes}</p>}
              {p.fotosCliente.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {p.fotosCliente.map((f, i) => (
                    <Foto key={f} id={f} alt={`Foto do cliente ${i + 1}`} />
                  ))}
                </div>
              )}
            </Card>
          )}
          <Card>
            <h2 className="text-h3 mb-3">Histórico</h2>
            <Historico e={e} pedidoId={p.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaginaServico() {
  return (
    <Suspense>
      <Servico />
    </Suspense>
  );
}
