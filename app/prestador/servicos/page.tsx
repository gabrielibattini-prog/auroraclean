"use client";

import { useState } from "react";
import { CardPedido } from "@/components/pedidos/CardPedido";
import { BotaoLink } from "@/components/ui/Botao";
import { Card, EstadoVazio, TituloPagina } from "@/components/ui/Base";
import { Opcoes } from "@/components/ui/Campos";
import { Icone } from "@/components/ui/Icone";
import { usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";
import { moeda } from "@/lib/dados/util";

export default function ServicosPrestador() {
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const [aba, setAba] = useState<"ativos" | "finalizados">("ativos");
  const meus = e.pedidos.filter((p) => p.prestadorId === u.id).sort((a, b) => a.data.localeCompare(b.data));
  const ativos = meus.filter((p) => p.status === "aceito" || p.status === "em_execucao");
  const finalizados = meus.filter((p) => !ativos.includes(p));

  const inicioMes = new Date();
  inicioMes.setDate(1);
  const doMes = meus.filter((p) => p.status === "concluido" && p.concluidoEm && new Date(p.concluidoEm) >= inicioMes);
  const ganhos = doMes.reduce((s, p) => s + p.total, 0);
  const lista = aba === "ativos" ? ativos : finalizados;

  return (
    <>
      <TituloPagina titulo="Seus serviços" />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="flex items-center gap-4">
          <Icone nome="carteira" tamanho={48} />
          <div>
            <p className="text-[13px] font-medium text-ink-muted">Recebido no mês</p>
            <p className="text-[24px] font-bold">{moeda(ganhos)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Icone nome="checklist" tamanho={48} />
          <div>
            <p className="text-[13px] font-medium text-ink-muted">Serviços no mês</p>
            <p className="text-[24px] font-bold">{doMes.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Icone nome="laudo" tamanho={48} />
          <div>
            <p className="text-[13px] font-medium text-ink-muted">Laudos emitidos</p>
            <p className="text-[24px] font-bold">{e.prontuarios.filter((x) => x.prestadorId === u.id && x.status === "finalizado").length}</p>
          </div>
        </Card>
      </div>

      <Opcoes
        rotulo="Mostrar"
        valor={aba}
        aoMudar={(v) => setAba(v as typeof aba)}
        opcoes={[
          { valor: "ativos", rotulo: `Agendados (${ativos.length})` },
          { valor: "finalizados", rotulo: "Finalizados" },
        ]}
      />
      {lista.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {lista.map((p) => (
            <CardPedido key={p.id} e={e} p={p} href={`/prestador/servicos/${p.id}`} />
          ))}
        </div>
      ) : (
        <EstadoVazio
          icone="calendario"
          titulo={aba === "ativos" ? "Nenhum serviço agendado" : "Nada por aqui ainda"}
          texto="Aceite oportunidades para encher sua agenda."
          acao={<BotaoLink href="/prestador/oportunidades" variante="terracota">Ver oportunidades</BotaoLink>}
        />
      )}
    </>
  );
}
