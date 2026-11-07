"use client";

import Link from "next/link";
import { BotaoLink } from "@/components/ui/Botao";
import { Card, EstadoVazio, Selo, TituloPagina } from "@/components/ui/Base";
import { Icone } from "@/components/ui/Icone";
import { usuarioAtual } from "@/lib/dados/acesso";
import { ESTOFADOS, SERVICOS, TECIDOS } from "@/lib/dados/catalogo";
import { useEstado } from "@/lib/dados/store";
import { dataLonga } from "@/lib/dados/util";

export default function Estofados() {
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const lista = e.estofados.filter((x) => x.clienteId === u.id);

  return (
    <>
      <TituloPagina titulo="Seus estofados" subtitulo="O histórico de cuidados de cada peça. Recontrate em poucos toques, sem cadastrar de novo." />
      {lista.length === 0 ? (
        <EstadoVazio icone="sofa" titulo="Nenhum estofado ainda" texto="Eles aparecem aqui depois da primeira ordem de serviço." acao={<BotaoLink href="/cliente/pedidos/novo">Solicitar serviço</BotaoLink>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((x) => {
            const laudos = e.laudos.filter((l) => l.estofadoId === x.id);
            const lembrete = e.lembretes.find((l) => l.estofadoId === x.id && l.status !== "cancelado");
            const ultimo = e.pedidos
              .filter((p) => p.clienteId === u.id && p.status !== "cancelado" && p.itens.some((i) => i.estofadoId === x.id))
              .sort((a, b) => b.data.localeCompare(a.data))[0];
            const servicoUltimo = ultimo?.itens.find((i) => i.estofadoId === x.id)?.servico;
            return (
              <Card key={x.id} className="flex flex-col">
                <Link href={`/cliente/estofados/${x.id}`} className="flex items-center gap-3 rounded-md hover:opacity-90">
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-brand-cream">
                    <Icone nome={ESTOFADOS[x.tipo].icone} tamanho={48} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-h3 truncate">{x.apelido}</span>
                    <span className="block text-body-sm text-ink-muted">
                      {ESTOFADOS[x.tipo].nome} · {TECIDOS[x.tecido].nome.toLowerCase()}
                    </span>
                  </span>
                </Link>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Selo tom="neutral" icone="laudo">
                    {laudos.length} laudo(s)
                  </Selo>
                  {lembrete && (
                    <Selo tom="info" icone="gota">
                      Proteger até {dataLonga(lembrete.dataPrevista)}
                    </Selo>
                  )}
                </div>
                {ultimo && servicoUltimo && (
                  <p className="text-caption text-ink-muted mt-3">
                    Último: {SERVICOS[servicoUltimo].nome} em {dataLonga(ultimo.data)}
                  </p>
                )}
                <div className="mt-auto flex gap-2 pt-4 pb-1">
                  <BotaoLink href={`/cliente/pedidos/novo?estofado=${x.id}`} icone="repetir" tamanho="sm" className="flex-1">
                    Recontratar serviço
                  </BotaoLink>
                  <BotaoLink href={`/cliente/estofados/${x.id}`} variante="secundario" tamanho="sm">
                    Histórico
                  </BotaoLink>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
