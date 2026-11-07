"use client";

import Link from "next/link";
import { CardPedido } from "@/components/pedidos/CardPedido";
import { DicaTutorial } from "@/components/tutorial/Tutorial";
import { BotaoLink } from "@/components/ui/Botao";
import { Alerta, EstadoVazio, Secao, TituloPagina } from "@/components/ui/Base";
import { usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";
import { dataLonga, deDataISO } from "@/lib/dados/util";

export default function InicioCliente() {
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const meus = e.pedidos.filter((p) => p.clienteId === u.id).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const ativos = meus.filter((p) => !["concluido", "cancelado"].includes(p.status));
  const anteriores = meus.filter((p) => ["concluido", "cancelado"].includes(p.status));
  const aPagar = meus.filter((p) => p.status === "aguardando_pagamento");
  const aAvaliar = meus.filter((p) => p.status === "concluido" && p.prestadorId && !e.avaliacoes.some((a) => a.pedidoId === p.id));

  const em60dias = new Date();
  em60dias.setDate(em60dias.getDate() + 60);
  const lembretes = e.lembretes.filter((l) => l.clienteId === u.id && l.status !== "cancelado" && deDataISO(l.dataPrevista) <= em60dias);

  return (
    <>
      <TituloPagina
        titulo={`Olá, ${u.nome.split(" ")[0]}!`}
        subtitulo="Acompanhe seus serviços por aqui."
        acao={
          <BotaoLink href="/cliente/pedidos/novo" icone="brilho" className="hidden sm:inline-flex">
            Solicitar serviço
          </BotaoLink>
        }
      />

      <DicaTutorial usuarioId={u.id} perfil="cliente" />
      <div className="flex flex-col gap-3">
        {aPagar.map((p) => (
          <Link key={p.id} href={`/cliente/pedidos/${p.id}`} className="block">
            <Alerta tom="warning" titulo="Serviço finalizado! Confira e aprove">
              Veja o laudo com fotos de antes e depois e conclua o pagamento do ordem de serviço nº {p.numero}.
            </Alerta>
          </Link>
        ))}
        {aAvaliar.map((p) => (
          <Link key={p.id} href={`/cliente/pedidos/${p.id}`} className="block">
            <Alerta tom="info" icone="estrela" titulo="Como foi seu serviço?">
              Avalie o atendimento da ordem de serviço nº {p.numero}. Leva só um minuto.
            </Alerta>
          </Link>
        ))}
        {lembretes.map((l) => {
          const est = e.estofados.find((x) => x.id === l.estofadoId);
          return (
            <Link key={l.id} href={`/cliente/estofados/${l.estofadoId}`} className="block">
              <Alerta tom="info" icone="gota" titulo={`Hora de proteger o ${est?.apelido ?? "estofado"} de novo`}>
                A impermeabilização vence em {dataLonga(l.dataPrevista)}. Agende para manter a proteção.
              </Alerta>
            </Link>
          );
        })}
      </div>

      <Secao titulo="Em andamento">
        {ativos.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {ativos.map((p) => (
              <CardPedido key={p.id} e={e} p={p} href={`/cliente/pedidos/${p.id}`} />
            ))}
          </div>
        ) : (
          <EstadoVazio
            icone="sofa"
            titulo="Nenhum serviço agendado"
            texto="Que tal deixar o sofá limpinho e protegido esta semana?"
            acao={<BotaoLink href="/cliente/pedidos/novo">Solicitar serviço</BotaoLink>}
          />
        )}
      </Secao>

      {anteriores.length > 0 && (
        <Secao titulo="Anteriores">
          <div className="grid gap-4 md:grid-cols-2">
            {anteriores.map((p) => (
              <CardPedido key={p.id} e={e} p={p} href={`/cliente/pedidos/${p.id}`} />
            ))}
          </div>
        </Secao>
      )}
    </>
  );
}
