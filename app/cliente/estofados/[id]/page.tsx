"use client";

import { useParams } from "next/navigation";
import { ListaLaudos } from "@/components/prontuario/ListaLaudos";
import { BotaoLink } from "@/components/ui/Botao";
import { Alerta, Card, EstadoVazio, TituloPagina } from "@/components/ui/Base";
import { Icone } from "@/components/ui/Icone";
import { usuarioAtual } from "@/lib/dados/acesso";
import { ESTOFADOS, SERVICOS, STATUS_PEDIDO, TECIDOS } from "@/lib/dados/catalogo";
import { useEstado } from "@/lib/dados/store";
import { dataLonga, deDataISO } from "@/lib/dados/util";

export default function Estofado() {
  const { id } = useParams<{ id: string }>();
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const est = e.estofados.find((x) => x.id === id);
  if (!est || est.clienteId !== u.id) return <EstadoVazio icone="sofa" titulo="Estofado não encontrado" />;

  const laudos = e.laudos.filter((l) => l.estofadoId === est.id).sort((a, b) => b.emitidoEm.localeCompare(a.emitidoEm));
  const lembrete = e.lembretes.find((l) => l.estofadoId === est.id && l.status !== "cancelado");
  const servicos = e.pedidos
    .filter((p) => p.itens.some((i) => i.estofadoId === est.id))
    .sort((a, b) => b.data.localeCompare(a.data));
  const vencendo = lembrete && (deDataISO(lembrete.dataPrevista).getTime() - Date.now()) / 864e5 < 60;

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina
        voltar={{ href: "/cliente/estofados", rotulo: "Seus estofados" }}
        titulo={est.apelido}
        subtitulo={`${ESTOFADOS[est.tipo].nome} · tecido ${TECIDOS[est.tecido].nome.toLowerCase()}`}
        acao={
          <BotaoLink href={`/cliente/pedidos/novo?estofado=${est.id}`} icone="repetir">
            Recontratar serviço
          </BotaoLink>
        }
      />

      {lembrete ? (
        <Card className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${vencendo ? "bg-info-soft" : ""}`}>
          <Icone nome="gota" tamanho={48} />
          <div className="flex-1">
            <p className="text-h3">{vencendo ? "Hora de proteger de novo" : "Protegido"}</p>
            <p className="text-body-sm text-ink-muted">
              Impermeabilização recomendada até {dataLonga(lembrete.dataPrevista)}.{" "}
              {lembrete.status === "enviado" ? "Já te avisamos por e-mail." : "Vamos te lembrar por e-mail."}
            </p>
          </div>
          <BotaoLink href={`/cliente/pedidos/novo?estofado=${est.id}&servico=impermeabilizacao`} variante="secundario" icone="gota">
            Proteger de novo
          </BotaoLink>
        </Card>
      ) : (
        <Alerta tom="info" icone="gota" titulo="Sem proteção registrada">
          A impermeabilização protege contra líquidos e manchas por cerca de 12 meses.
        </Alerta>
      )}

      <h2 className="text-h2 mt-8 mb-3">Laudos</h2>
      {laudos.length ? <ListaLaudos laudos={laudos} base="/cliente/laudos" /> : <p className="text-body-sm text-ink-muted">Os laudos aparecem aqui depois de cada serviço.</p>}

      <h2 className="text-h2 mt-8 mb-3">Linha do tempo</h2>
      <ol className="flex flex-col gap-3">
        {servicos.map((p) => {
          const item = p.itens.find((i) => i.estofadoId === est.id)!;
          return (
            <li key={p.id}>
              <Card href={`/cliente/pedidos/${p.id}`} className="flex items-center gap-3">
                <Icone nome={SERVICOS[item.servico].icone} tamanho={40} />
                <span className="flex-1">
                  <span className="block text-label">{SERVICOS[item.servico].nome}</span>
                  <span className="block text-body-sm text-ink-muted">
                    {dataLonga(p.data)} · {STATUS_PEDIDO[p.status].nome}
                  </span>
                </span>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
