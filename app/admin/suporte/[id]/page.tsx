"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Historico } from "@/components/pedidos/Historico";
import { ResumoPedido, SeloStatus } from "@/components/pedidos/Resumo";
import { ListaLaudos } from "@/components/prontuario/ListaLaudos";
import { Conversa, STATUS_CHAMADO, TIPO_CHAMADO } from "@/components/suporte/Chamados";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card, EstadoVazio, Selo, TituloPagina } from "@/components/ui/Base";
import { CampoArea, Opcoes } from "@/components/ui/Campos";
import { mensagemDeErro, resolverChamado, type DecisaoDisputa } from "@/lib/dados/acoes";
import { useEstado } from "@/lib/dados/store";

const DECISOES: { valor: DecisaoDisputa; rotulo: string; explicacao: string }[] = [
  { valor: "manter", rotulo: "Manter serviço", explicacao: "O serviço seguiu o protocolo. A ordem de serviço volta a ficar concluída." },
  { valor: "refazer", rotulo: "Refazer (garantia)", explicacao: "Cria um retorno sem custo com o mesmo prestador." },
  { valor: "reembolsar", rotulo: "Devolver valor", explicacao: "Cancela a ordem de serviço e devolve o pagamento ao cliente." },
];

export default function ChamadoAdmin() {
  const { id } = useParams<{ id: string }>();
  const e = useEstado();
  const [resolucao, setResolucao] = useState("");
  const [decisao, setDecisao] = useState<DecisaoDisputa | undefined>();
  const [erro, setErro] = useState("");
  const c = e.chamados.find((x) => x.id === id);
  if (!c) return <EstadoVazio icone="suporte" titulo="Atendimento não encontrado" />;
  const p = e.pedidos.find((x) => x.id === c.pedidoId)!;
  const laudos = e.laudos.filter((l) => l.pedidoId === p.id);
  const disputaAtiva = c.tipo === "disputa" && p.status === "em_disputa";

  return (
    <div className="mx-auto max-w-5xl">
      <TituloPagina
        voltar={{ href: "/admin/suporte", rotulo: "Suporte" }}
        sobre={TIPO_CHAMADO[c.tipo]}
        titulo={c.assunto}
        acao={<Selo tom={STATUS_CHAMADO[c.status].tom}>{STATUS_CHAMADO[c.status].rotulo}</Selo>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6 min-w-0">
          <Card>
            <Conversa e={e} chamado={c} />
          </Card>

          {c.status !== "resolvido" && (
            <Card>
              <h2 className="text-h3 mb-1">Encerrar atendimento</h2>
              <p className="text-body-sm text-ink-muted mb-4">A resolução é enviada ao cliente e ao prestador.</p>
              <div className="flex flex-col gap-4">
                {disputaAtiva && (
                  <>
                    <Opcoes rotulo="Decisão da disputa" valor={decisao} aoMudar={(v) => setDecisao(v as DecisaoDisputa)} opcoes={DECISOES.map((d) => ({ valor: d.valor, rotulo: d.rotulo }))} />
                    {decisao && <p className="-mt-2 text-body-sm text-ink-muted">{DECISOES.find((d) => d.valor === decisao)!.explicacao}</p>}
                  </>
                )}
                <CampoArea rotulo="Resolução" value={resolucao} onChange={(ev) => setResolucao(ev.target.value)} placeholder="Explique a decisão com carinho e clareza." />
                {erro && <Alerta tom="danger" titulo={erro} />}
                <div>
                  <Botao
                    onClick={() => {
                      setErro("");
                      try {
                        resolverChamado(c.id, resolucao, decisao);
                      } catch (err) {
                        setErro(mensagemDeErro(err));
                      }
                    }}
                  >
                    Resolver atendimento
                  </Botao>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center justify-between gap-2 mb-2">
              <Link href={`/admin/pedidos/${p.id}`} className="text-h3 underline text-brand-olive-deep">
                Ordem de serviço nº {p.numero}
              </Link>
              <SeloStatus status={p.status} />
            </div>
            <p className="text-body-sm text-ink-muted">Use o prontuário e as fotos para mediar com justiça.</p>
          </Card>
          {laudos.length > 0 && (
            <Card>
              <h2 className="text-h3 mb-3">Laudos e prontuários</h2>
              <ListaLaudos laudos={laudos} base="/admin/laudos" />
            </Card>
          )}
          <ResumoPedido e={e} p={p} />
          <Card>
            <h2 className="text-h3 mb-3">Histórico</h2>
            <Historico e={e} pedidoId={p.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}
