import type { ReactNode } from "react";
import { Card, Selo } from "@/components/ui/Base";
import { Icone, type NomeIcone } from "@/components/ui/Icone";
import { ESTOFADOS, PERIODOS, SERVICOS, STATUS_PEDIDO } from "@/lib/dados/catalogo";
import type { Estado, Pedido, StatusPedido } from "@/lib/dados/tipos";
import { dataCurta, moeda } from "@/lib/dados/util";

export function SeloStatus({ status }: { status: StatusPedido }) {
  const s = STATUS_PEDIDO[status];
  return <Selo tom={s.tom}>{s.nome}</Selo>;
}

/** Linha do resumo (BookingSummary do guia). */
export function LinhaResumo({ icone, rotulo, valor, destaque }: { icone?: NomeIcone; rotulo: ReactNode; valor?: ReactNode; destaque?: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-1.5 ${destaque ? "text-[18px] font-bold" : "text-[15px]"}`}>
      {icone && <Icone nome={icone} tamanho={28} />}
      <span className={`flex-1 min-w-0 ${destaque ? "" : "text-ink-muted"}`}>{rotulo}</span>
      {valor !== undefined && <span className="text-ink whitespace-nowrap">{valor}</span>}
    </div>
  );
}

export function Tracejado() {
  return <hr className="my-3 border-0 border-t-2 border-dashed border-line" />;
}

/** Itens + agenda + valores de um pedido já criado. */
export function ResumoPedido({ e, p, titulo = "Resumo do serviço", mostrarValores = true }: { e: Estado; p: Pedido; titulo?: string; mostrarValores?: boolean }) {
  return (
    <Card>
      <h2 className="text-h3 mb-2">{titulo}</h2>
      {p.itens.map((i) => {
        const est = e.estofados.find((x) => x.id === i.estofadoId);
        if (!est) return null;
        return (
          <LinhaResumo
            key={i.id}
            icone={ESTOFADOS[est.tipo].icone}
            rotulo={
              <>
                <span className="text-ink">{est.apelido}</span> · {SERVICOS[i.servico].curto}
              </>
            }
            valor={mostrarValores ? moeda(i.valor) : undefined}
          />
        );
      })}
      {p.pet && <LinhaResumo icone="pet" rotulo="Limpeza pet (adicional)" valor={mostrarValores ? moeda(70) : undefined} />}
      <LinhaResumo icone="calendario" rotulo={`${dataCurta(p.data)} · ${PERIODOS[p.periodo].nome} (${PERIODOS[p.periodo].faixa})`} />
      {mostrarValores && p.desconto > 0 && <LinhaResumo icone="cupom" rotulo={`Cupom ${p.cupom}`} valor={`−${moeda(p.desconto)}`} />}
      {mostrarValores && (
        <>
          <Tracejado />
          <LinhaResumo rotulo="Total" valor={moeda(p.total)} destaque />
        </>
      )}
    </Card>
  );
}

const ETAPAS: { status: StatusPedido[]; rotulo: string }[] = [
  { status: ["aberto"], rotulo: "Solicitado" },
  { status: ["aceito"], rotulo: "Prestador confirmado" },
  { status: ["em_execucao"], rotulo: "Em andamento" },
  { status: ["aguardando_pagamento", "em_disputa"], rotulo: "Sua aprovação" },
  { status: ["concluido"], rotulo: "Concluído" },
];

/** Linha do tempo de status para o cliente. */
export function ProgressoPedido({ status }: { status: StatusPedido }) {
  if (status === "cancelado") return null;
  const atual = ETAPAS.findIndex((et) => et.status.includes(status));
  return (
    <ol className="flex flex-col gap-0" aria-label="Andamento do pedido">
      {ETAPAS.map((et, i) => {
        const feito = i < atual || status === "concluido";
        const ativo = i === atual && status !== "concluido";
        return (
          <li key={et.rotulo} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-[13px] font-bold ${
                  feito ? "bg-brand-olive text-on-brand" : ativo ? "border-[3px] border-brand-olive bg-surface-card" : "bg-surface-sunken text-ink-muted"
                }`}
              >
                {feito ? "✓" : i + 1}
              </span>
              {i < ETAPAS.length - 1 && <span className={`w-1 flex-1 min-h-5 ${feito ? "bg-brand-olive" : "bg-surface-sunken"}`} />}
            </div>
            <p className={`pb-4 pt-0.5 text-[15px] ${ativo ? "font-bold" : feito ? "text-ink" : "text-ink-muted"}`}>
              {et.rotulo}
              {ativo && <span className="sr-only"> (etapa atual)</span>}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
