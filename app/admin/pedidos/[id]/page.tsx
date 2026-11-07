"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { tituloPedido } from "@/components/pedidos/CardPedido";
import { Historico } from "@/components/pedidos/Historico";
import { ResumoPedido, SeloStatus } from "@/components/pedidos/Resumo";
import { ListaLaudos } from "@/components/prontuario/ListaLaudos";
import { STATUS_CHAMADO } from "@/components/suporte/Chamados";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card, EstadoVazio, LinhaInfo, Selo, TituloPagina } from "@/components/ui/Base";
import { CampoArea } from "@/components/ui/Campos";
import { Foto } from "@/components/ui/Fotos";
import { Estrelas } from "@/components/avaliacoes/Avaliacoes";
import { cancelarPedidoAdmin, mensagemDeErro } from "@/lib/dados/acoes";
import { PERIODOS } from "@/lib/dados/catalogo";
import { contatoDoCliente, nomeDoUsuario } from "@/lib/dados/consultas";
import { useEstado } from "@/lib/dados/store";
import { dataCurta, dataHora } from "@/lib/dados/util";

export default function PedidoAdmin() {
  const { id } = useParams<{ id: string }>();
  const e = useEstado();
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const p = e.pedidos.find((x) => x.id === id);
  if (!p) return <EstadoVazio icone="calendario" titulo="Ordem de serviço não encontrada" />;

  const contato = contatoDoCliente(e, p.id)!;
  const laudos = e.laudos.filter((l) => l.pedidoId === p.id);
  const chamados = e.chamados.filter((c) => c.pedidoId === p.id);
  const prontuarios = e.prontuarios.filter((x) => x.pedidoId === p.id);

  return (
    <div className="mx-auto max-w-5xl">
      <TituloPagina voltar={{ href: "/admin/pedidos", rotulo: "Ordens de serviço" }} sobre={`Ordem de serviço nº ${p.numero}`} titulo={tituloPedido(e, p)} acao={<SeloStatus status={p.status} />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6 min-w-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h2 className="text-h3 mb-3">Cliente</h2>
              <div className="flex flex-col gap-2">
                <LinhaInfo icone="usuario">
                  <Link href={`/admin/clientes/${p.clienteId}`} className="underline text-brand-olive-deep">
                    {contato.nome}
                  </Link>
                </LinhaInfo>
                <LinhaInfo icone="chat">{contato.telefone}</LinhaInfo>
                <LinhaInfo icone="local">{contato.endereco}</LinhaInfo>
              </div>
            </Card>
            <Card>
              <h2 className="text-h3 mb-3">Prestador</h2>
              {p.prestadorId ? (
                <div className="flex flex-col gap-2">
                  <LinhaInfo icone="verificado">
                    <Link href={`/admin/prestadores/${p.prestadorId}`} className="underline text-brand-olive-deep">
                      {nomeDoUsuario(e, p.prestadorId, true)}
                    </Link>
                  </LinhaInfo>
                  <LinhaInfo icone="chat">{e.usuarios.find((x) => x.id === p.prestadorId)?.telefone}</LinhaInfo>
                  {p.aceitoEm && <LinhaInfo icone="relogio">Aceitou em {dataHora(p.aceitoEm)}</LinhaInfo>}
                </div>
              ) : (
                <p className="text-body-sm text-ink-muted">Ainda sem prestador.</p>
              )}
            </Card>
          </div>

          {chamados.length > 0 && (
            <Card>
              <h2 className="text-h3 mb-3">Atendimentos</h2>
              <ul className="flex flex-col gap-2">
                {chamados.map((c) => (
                  <li key={c.id}>
                    <Link href={`/admin/suporte/${c.id}`} className="flex items-center justify-between gap-2 rounded-md bg-surface-sunken px-4 py-3">
                      <span className="text-label">{c.assunto}</span>
                      <Selo tom={STATUS_CHAMADO[c.status].tom}>{STATUS_CHAMADO[c.status].rotulo}</Selo>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(() => {
            const av = e.avaliacoes.find((a) => a.pedidoId === p.id);
            if (!av) return null;
            return (
              <Card>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-h3">Avaliação do cliente</h2>
                  {av.oculta && <Selo tom="danger">Oculta</Selo>}
                </div>
                <div className="mt-2">
                  <Estrelas nota={av.nota} tamanho={24} />
                </div>
                {av.comentario && <p className="text-body mt-2">{av.comentario}</p>}
              </Card>
            );
          })()}

          {laudos.length > 0 && (
            <Card>
              <h2 className="text-h3 mb-3">Laudos</h2>
              <ListaLaudos laudos={laudos} base="/admin/laudos" />
            </Card>
          )}

          {prontuarios.some((x) => x.status === "rascunho") && (
            <Card>
              <h2 className="text-h3 mb-2">Prontuários em andamento</h2>
              {prontuarios
                .filter((x) => x.status === "rascunho")
                .map((x) => (
                  <p key={x.id} className="text-body-sm text-ink-muted">
                    {e.estofados.find((s) => s.id === x.estofadoId)?.apelido}: {Object.keys(x.respostas).length} respostas, {x.fotosAntes.length} antes / {x.fotosDepois.length} depois
                  </p>
                ))}
            </Card>
          )}

          {!["concluido", "cancelado"].includes(p.status) && (
            <Card>
              <h2 className="text-h3">Ações da equipe</h2>
              {cancelando ? (
                <div className="mt-3 flex flex-col gap-3">
                  <CampoArea rotulo="Motivo do cancelamento" value={motivo} onChange={(ev) => setMotivo(ev.target.value)} dica="Fica registrado no histórico do pedido." />
                  {erro && <Alerta tom="danger" titulo={erro} />}
                  <div className="flex gap-3">
                    <Botao
                      variante="perigo"
                      onClick={() => {
                        try {
                          cancelarPedidoAdmin(p.id, motivo);
                          setCancelando(false);
                        } catch (err) {
                          setErro(mensagemDeErro(err));
                        }
                      }}
                    >
                      Cancelar ordem de serviço
                    </Botao>
                    <Botao variante="fantasma" onClick={() => setCancelando(false)}>
                      Voltar
                    </Botao>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <Botao variante="secundario" onClick={() => setCancelando(true)}>
                    Cancelar ordem de serviço
                  </Botao>
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <ResumoPedido e={e} p={p} />
          <Card>
            <h2 className="text-h3 mb-2">Agenda</h2>
            <LinhaInfo icone="calendario">
              {dataCurta(p.data)} · {PERIODOS[p.periodo].faixa}
            </LinhaInfo>
            {p.observacoes && <p className="text-body-sm rounded-md bg-surface-sunken p-3 mt-3">{p.observacoes}</p>}
            {p.fotosCliente.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {p.fotosCliente.map((f, i) => (
                  <Foto key={f} id={f} alt={`Foto do cliente ${i + 1}`} />
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
