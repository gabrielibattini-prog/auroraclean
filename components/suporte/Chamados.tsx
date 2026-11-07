"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card, Selo } from "@/components/ui/Base";
import { CampoArea, CampoTexto, Opcoes } from "@/components/ui/Campos";
import { abrirChamado, dentroDaGarantia, enviarMensagem, mensagemDeErro } from "@/lib/dados/acoes";
import { usuarioAtual } from "@/lib/dados/acesso";
import { GARANTIA_DIAS } from "@/lib/dados/catalogo";
import { nomeDoUsuario } from "@/lib/dados/consultas";
import type { Chamado, Estado, Pedido, StatusChamado, TipoChamado } from "@/lib/dados/tipos";
import { dataHora } from "@/lib/dados/util";

export const STATUS_CHAMADO: Record<StatusChamado, { rotulo: string; tom: "clay" | "info" | "success" }> = {
  aberto: { rotulo: "Aguardando equipe", tom: "clay" },
  em_mediacao: { rotulo: "Em atendimento", tom: "info" },
  resolvido: { rotulo: "Resolvido", tom: "success" },
};

export const TIPO_CHAMADO: Record<TipoChamado, string> = {
  duvida: "Dúvida",
  problema: "Problema no serviço",
  disputa: "Disputa (garantia)",
};

/** Conversa de um atendimento (ChatBubble do guia). */
export function Conversa({ e, chamado }: { e: Estado; chamado: Chamado }) {
  const u = usuarioAtual(e)!;
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const msgs = e.mensagens.filter((m) => m.chamadoId === chamado.id).sort((a, b) => a.em.localeCompare(b.em));

  return (
    <div>
      <div className="flex justify-center mb-4">
        <span className="rounded-pill bg-surface-sunken px-4 py-1.5 text-[13px] font-medium text-ink-muted">
          {TIPO_CHAMADO[chamado.tipo]} · aberto em {dataHora(chamado.criadoEm)}
        </span>
      </div>
      <ol className="flex flex-col gap-3" aria-live="polite">
        {msgs.map((m) => {
          const minha = m.autorId === u.id;
          const equipe = e.usuarios.find((x) => x.id === m.autorId)?.papel === "admin";
          return (
            <li key={m.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 text-[15px] ${
                  minha
                    ? "bg-brand-olive text-on-brand rounded-[16px_16px_4px_16px]"
                    : `border-2 rounded-[16px_16px_16px_4px] ${equipe ? "bg-brand-cream border-transparent" : "bg-surface-card border-line"}`
                }`}
              >
                {!minha && <p className="text-caption font-semibold mb-0.5">{nomeDoUsuario(e, m.autorId)}</p>}
                <p className="whitespace-pre-wrap">{m.texto}</p>
                <p className={`text-[11px] font-medium mt-1 ${minha ? "opacity-80" : "text-ink-muted"}`}>{dataHora(m.em)}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {chamado.status !== "resolvido" ? (
        <form
          className="mt-4 flex items-end gap-2"
          onSubmit={(ev) => {
            ev.preventDefault();
            setErro("");
            try {
              enviarMensagem(chamado.id, texto);
              setTexto("");
            } catch (err) {
              setErro(mensagemDeErro(err));
            }
          }}
        >
          <div className="flex-1">
            <CampoTexto rotulo="Mensagem" value={texto} onChange={(ev) => setTexto(ev.target.value)} placeholder="Escreva aqui…" />
          </div>
          <Botao type="submit" disabled={!texto.trim()}>
            Enviar
          </Botao>
        </form>
      ) : (
        <div className="mt-4">
          <Alerta tom="success" titulo="Atendimento encerrado">
            {chamado.resolucao}
          </Alerta>
        </div>
      )}
      {erro && <p className="text-[13px] font-semibold text-danger mt-2">{erro}</p>}
    </div>
  );
}

/** Lista de atendimentos de um pedido + abrir novo. Usado por cliente e prestador. */
export function SuportePedido({ e, p }: { e: Estado; p: Pedido }) {
  const u = usuarioAtual(e)!;
  const chamados = e.chamados.filter((c) => c.pedidoId === p.id).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const [aberto, setAberto] = useState<string | null>(chamados.find((c) => c.status !== "resolvido")?.id ?? null);
  const [novo, setNovo] = useState(false);
  const [tipo, setTipo] = useState<TipoChamado>("duvida");
  const [assunto, setAssunto] = useState("");
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  const podeDisputar =
    u.papel === "cliente" && (p.status === "aguardando_pagamento" || p.status === "concluido") && dentroDaGarantia(p);
  const tipos: TipoChamado[] = podeDisputar ? ["duvida", "problema", "disputa"] : ["duvida", "problema"];
  const selecionado = chamados.find((c) => c.id === aberto);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h3">Precisa de ajuda?</h2>
        {!novo && p.status !== "cancelado" && (
          <Botao variante="secundario" tamanho="sm" icone="suporte" onClick={() => setNovo(true)}>
            Falar com a equipe
          </Botao>
        )}
      </div>

      {novo && (
        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={(ev) => {
            ev.preventDefault();
            setErro("");
            try {
              const id = abrirChamado(p.id, tipo, assunto, texto);
              setNovo(false);
              setAssunto("");
              setTexto("");
              setAberto(id);
            } catch (err) {
              setErro(mensagemDeErro(err));
            }
          }}
        >
          <Opcoes rotulo="Sobre o quê?" valor={tipo} aoMudar={(v) => setTipo(v as TipoChamado)} opcoes={tipos.map((t) => ({ valor: t, rotulo: TIPO_CHAMADO[t] }))} />
          {tipo === "disputa" && (
            <Alerta tom="warning" titulo={`Garantia de ${GARANTIA_DIAS} dias`}>
              A fundadora analisa o prontuário e as fotos do serviço. O pagamento fica em espera até a decisão.
            </Alerta>
          )}
          <CampoTexto rotulo="Assunto" value={assunto} onChange={(ev) => setAssunto(ev.target.value)} />
          <CampoArea rotulo="Conte o que aconteceu" value={texto} onChange={(ev) => setTexto(ev.target.value)} />
          {erro && <Alerta tom="danger" titulo={erro} />}
          <div className="flex gap-3">
            <Botao type="submit">Enviar</Botao>
            <Botao variante="fantasma" onClick={() => setNovo(false)}>
              Cancelar
            </Botao>
          </div>
        </form>
      )}

      {!novo && chamados.length === 0 && (
        <p className="text-body-sm text-ink-muted mt-2">Status, reagendamento e cancelamento você resolve aqui mesmo. Para o resto, fale com a gente.</p>
      )}

      {chamados.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {chamados.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setAberto(aberto === c.id ? null : c.id)}
                aria-expanded={aberto === c.id}
                className="flex w-full items-center justify-between gap-2 rounded-md bg-surface-sunken px-4 py-3 text-left"
              >
                <span className="text-label">{c.assunto}</span>
                <Selo tom={STATUS_CHAMADO[c.status].tom}>{STATUS_CHAMADO[c.status].rotulo}</Selo>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selecionado && (
        <div className="mt-4 border-t-2 border-line pt-4">
          <Conversa e={e} chamado={selecionado} />
        </div>
      )}
    </Card>
  );
}
