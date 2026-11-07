"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CardPedido } from "@/components/pedidos/CardPedido";
import { ListaLaudos } from "@/components/prontuario/ListaLaudos";
import { STATUS_CHAMADO } from "@/components/suporte/Chamados";
import { Avatar, Card, EstadoVazio, LinhaInfo, Secao, Selo, TituloPagina } from "@/components/ui/Base";
import { Icone } from "@/components/ui/Icone";
import { ESTOFADOS, TECIDOS } from "@/lib/dados/catalogo";
import { useEstado } from "@/lib/dados/store";
import { dataLonga, moeda } from "@/lib/dados/util";

export default function ClienteAdmin() {
  const { id } = useParams<{ id: string }>();
  const e = useEstado();
  const u = e.usuarios.find((x) => x.id === id && x.papel === "cliente");
  if (!u || u.excluido) return <EstadoVazio icone="usuario" titulo="Cliente não encontrado" />;

  const pedidos = e.pedidos.filter((p) => p.clienteId === u.id).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const enderecos = e.enderecos.filter((x) => x.clienteId === u.id);
  const estofados = e.estofados.filter((x) => x.clienteId === u.id);
  const laudos = e.laudos.filter((l) => l.clienteId === u.id);
  const chamados = e.chamados.filter((c) => c.abertoPor === u.id);
  const total = pedidos.filter((p) => p.pagamento && !p.pagamento.reembolsadoEm).reduce((s, p) => s + p.total, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <TituloPagina voltar={{ href: "/admin/clientes", rotulo: "Clientes" }} titulo={u.nome} subtitulo={`Cliente desde ${dataLonga(u.criadoEm)}`} />

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
        <Card className="md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <Avatar nome={u.nome} tamanho={48} />
            <p className="text-h3">{u.nome}</p>
          </div>
          <div className="flex flex-col gap-2">
            <LinhaInfo icone="usuario">{u.email}</LinhaInfo>
            <LinhaInfo icone="chat">{u.telefone}</LinhaInfo>
            <LinhaInfo icone="verificado">Termos aceitos em {dataLonga(u.aceiteTermosEm)}</LinhaInfo>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Icone nome="calendario" tamanho={48} />
          <div>
            <p className="text-[13px] font-medium text-ink-muted">Ordens de serviço</p>
            <p className="text-[24px] font-bold">{pedidos.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Icone nome="carteira" tamanho={48} />
          <div>
            <p className="text-[13px] font-medium text-ink-muted">Total pago</p>
            <p className="text-[24px] font-bold">{moeda(total)}</p>
          </div>
        </Card>
      </div>

      <Secao titulo="Endereços">
        <div className="grid gap-3 md:grid-cols-2">
          {enderecos.map((x) => (
            <Card key={x.id} className="flex items-center gap-3">
              <Icone nome="casa" tamanho={40} />
              <span className="text-body-sm">
                {x.logradouro}, {x.numero} {x.complemento && `· ${x.complemento}`}
                <br />
                <span className="text-ink-muted">
                  {x.bairro}, {x.cidade}/{x.uf} · CEP {x.cep}
                </span>
              </span>
            </Card>
          ))}
          {enderecos.length === 0 && <p className="text-body-sm text-ink-muted">Nenhum endereço salvo.</p>}
        </div>
      </Secao>

      <Secao titulo="Estofados">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {estofados.map((x) => {
            const lembrete = e.lembretes.find((l) => l.estofadoId === x.id && l.status !== "cancelado");
            return (
              <Card key={x.id} className="flex items-center gap-3">
                <Icone nome={ESTOFADOS[x.tipo].icone} tamanho={40} />
                <span className="min-w-0">
                  <span className="block text-label truncate">{x.apelido}</span>
                  <span className="block text-caption text-ink-muted">
                    {ESTOFADOS[x.tipo].nome} · {TECIDOS[x.tecido].nome.toLowerCase()}
                    {lembrete && ` · proteger até ${dataLonga(lembrete.dataPrevista)}`}
                  </span>
                </span>
              </Card>
            );
          })}
        </div>
      </Secao>

      <Secao titulo="Ordens de serviço">
        <div className="grid gap-4 md:grid-cols-2">
          {pedidos.map((p) => (
            <CardPedido key={p.id} e={e} p={p} href={`/admin/pedidos/${p.id}`} />
          ))}
        </div>
      </Secao>

      {laudos.length > 0 && (
        <Secao titulo="Laudos">
          <ListaLaudos laudos={laudos} base="/admin/laudos" />
        </Secao>
      )}

      {chamados.length > 0 && (
        <Secao titulo="Atendimentos">
          <ul className="flex flex-col gap-2">
            {chamados.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/suporte/${c.id}`} className="flex items-center justify-between gap-2 rounded-md bg-surface-card px-4 py-3 shadow-card">
                  <span className="text-label">{c.assunto}</span>
                  <Selo tom={STATUS_CHAMADO[c.status].tom}>{STATUS_CHAMADO[c.status].rotulo}</Selo>
                </Link>
              </li>
            ))}
          </ul>
        </Secao>
      )}
    </div>
  );
}
