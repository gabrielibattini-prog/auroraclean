import { Card, LinhaInfo } from "@/components/ui/Base";
import { Icone } from "@/components/ui/Icone";
import { ESTOFADOS, PERIODOS } from "@/lib/dados/catalogo";
import type { Estado, Pedido } from "@/lib/dados/tipos";
import { dataCurta, moeda } from "@/lib/dados/util";
import { SeloStatus } from "./Resumo";

export function tituloPedido(e: Estado, p: Pedido) {
  const nomes = p.itens.map((i) => e.estofados.find((x) => x.id === i.estofadoId)?.apelido ?? "Estofado");
  return nomes.length > 2 ? `${nomes[0]} e mais ${nomes.length - 1}` : nomes.join(" e ");
}

export function CardPedido({ e, p, href }: { e: Estado; p: Pedido; href: string }) {
  const primeiro = e.estofados.find((x) => x.id === p.itens[0]?.estofadoId);
  return (
    <Card href={href}>
      <div className="flex items-start gap-3">
        <Icone nome={primeiro ? ESTOFADOS[primeiro.tipo].icone : "sofa"} tamanho={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-h3 truncate">{tituloPedido(e, p)}</h3>
            <span className="text-h3">{moeda(p.total)}</span>
          </div>
          <div className="mt-1">
            <SeloStatus status={p.status} />
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <LinhaInfo icone="calendario">
              {dataCurta(p.data)} · {PERIODOS[p.periodo].nome}
            </LinhaInfo>
            <LinhaInfo icone="local">
              {p.bairro}, {p.cidade} · nº {p.numero}
            </LinhaInfo>
          </div>
        </div>
      </div>
    </Card>
  );
}
