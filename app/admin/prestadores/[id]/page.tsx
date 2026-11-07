"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Avatar, Card, EstadoVazio, LinhaInfo, Selo, TituloPagina } from "@/components/ui/Base";
import { CampoArea } from "@/components/ui/Campos";
import { Icone } from "@/components/ui/Icone";
import { useArquivoUrl } from "@/lib/arquivos";
import { avaliarPrestador, mensagemDeErro, suspenderPrestador } from "@/lib/dados/acoes";
import { prestadorDe } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";
import type { ArquivoRef } from "@/lib/dados/tipos";
import { dataLonga } from "@/lib/dados/util";
import { STATUS_PRESTADOR } from "@/lib/dados/catalogo";
import { avaliacoesDoPrestador } from "@/lib/dados/consultas";
import { ListaAvaliacoes, NotaResumo } from "@/components/avaliacoes/Avaliacoes";

function Arquivo({ rotulo, arquivo }: { rotulo: string; arquivo?: ArquivoRef }) {
  const url = useArquivoUrl(arquivo?.id);
  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-line p-3">
      <Icone nome={rotulo.startsWith("Cert") ? "certificado" : "documento"} tamanho={40} />
      <div className="min-w-0 flex-1">
        <p className="text-label">{rotulo}</p>
        <p className="text-body-sm text-ink-muted truncate">{arquivo?.nome ?? "Não enviado"}</p>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-label text-brand-olive-deep underline">
          Abrir
        </a>
      ) : (
        arquivo && <span className="text-caption text-ink-muted">exemplo</span>
      )}
    </div>
  );
}

export default function AdminPrestador() {
  const { id } = useParams<{ id: string }>();
  const e = useEstado();
  const p = prestadorDe(e, id);
  const u = e.usuarios.find((x) => x.id === id);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const [modo, setModo] = useState<"nenhum" | "reprovar" | "suspender">("nenhum");

  if (!p || !u) return <EstadoVazio icone="usuario" titulo="Prestador não encontrado" />;

  const servicos = e.pedidos.filter((x) => x.prestadorId === id);
  const disputas = servicos.filter((x) => e.chamados.some((c) => c.pedidoId === x.id && c.tipo === "disputa")).length;

  function agir(fn: () => void) {
    setErro("");
    try {
      fn();
      setModo("nenhum");
      setMotivo("");
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina voltar={{ href: "/admin/prestadores", rotulo: "Prestadores" }} titulo={u.nome} acao={<Selo tom={STATUS_PRESTADOR[p.status].tom}>{STATUS_PRESTADOR[p.status].rotulo}</Selo>} />

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Avatar nome={u.nome} tamanho={56} verificado={p.status === "aprovado"} />
            <div>
              <p className="text-h3">{u.nome}</p>
              <p className="text-body-sm text-ink-muted">CPF {p.cpf}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <LinhaInfo icone="usuario">{u.email}</LinhaInfo>
            <LinhaInfo icone="chat">{u.telefone}</LinhaInfo>
            <LinhaInfo icone="local">
              Sai de {p.bairro}, {p.cidade} · até {p.raioKm} km
            </LinhaInfo>
            <LinhaInfo icone="calendario">Cadastro em {dataLonga(u.criadoEm)}</LinhaInfo>
          </div>
          {p.bio && <p className="mt-4 rounded-md bg-surface-sunken p-3 text-body-sm">“{p.bio}”</p>}
        </Card>

        <Card>
          <h2 className="text-h3 mb-3">Documentos</h2>
          <div className="flex flex-col gap-3">
            <Arquivo rotulo="Documento com foto" arquivo={p.documento} />
            <Arquivo rotulo="Certificado Aurora" arquivo={p.certificado} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-md bg-surface-sunken p-3">
              <p className="text-h2">{servicos.filter((s) => s.status === "concluido").length}</p>
              <p className="text-caption text-ink-muted">serviços concluídos</p>
            </div>
            <div className="rounded-md bg-surface-sunken p-3">
              <p className="text-h2">{disputas}</p>
              <p className="text-caption text-ink-muted">disputas</p>
            </div>
          </div>
        </Card>
      </div>

      {p.motivo && p.status !== "aprovado" && (
        <div className="mt-4">
          <Alerta tom="warning" titulo="Motivo registrado">
            {p.motivo}
          </Alerta>
        </div>
      )}

      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-h3">Avaliações dos clientes</h2>
          <NotaResumo resumo={avaliacoesDoPrestador(e, id)} />
        </div>
        <ListaAvaliacoes resumo={avaliacoesDoPrestador(e, id)} moderacao />
      </Card>

      <Card className="mt-4">
        <h2 className="text-h3 mb-3">Decisão</h2>
        {modo !== "nenhum" && (
          <div className="mb-4">
            <CampoArea
              rotulo={modo === "reprovar" ? "O que o prestador precisa ajustar?" : "Motivo da suspensão"}
              value={motivo}
              onChange={(ev) => setMotivo(ev.target.value)}
              dica="O prestador vai ler esta mensagem. Seja gentil e objetiva."
            />
          </div>
        )}
        {erro && (
          <div className="mb-4">
            <Alerta tom="danger" titulo={erro} />
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          {modo === "nenhum" && p.status !== "aprovado" && (
            <Botao icone="verificado" onClick={() => agir(() => avaliarPrestador(id, true, ""))}>
              Aprovar prestador
            </Botao>
          )}
          {modo === "nenhum" && p.status === "pendente" && (
            <Botao variante="secundario" onClick={() => setModo("reprovar")}>
              Pedir ajustes
            </Botao>
          )}
          {modo === "nenhum" && p.status === "aprovado" && (
            <Botao variante="secundario" onClick={() => setModo("suspender")}>
              Suspender
            </Botao>
          )}
          {modo === "reprovar" && (
            <Botao variante="perigo" onClick={() => agir(() => avaliarPrestador(id, false, motivo))}>
              Enviar pedido de ajustes
            </Botao>
          )}
          {modo === "suspender" && (
            <Botao variante="perigo" onClick={() => agir(() => suspenderPrestador(id, motivo))}>
              Confirmar suspensão
            </Botao>
          )}
          {modo !== "nenhum" && (
            <Botao variante="fantasma" onClick={() => setModo("nenhum")}>
              Voltar
            </Botao>
          )}
        </div>
      </Card>
    </div>
  );
}
