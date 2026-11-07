"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Avatar, Card, Selo } from "@/components/ui/Base";
import { CampoArea } from "@/components/ui/Campos";
import { Icone } from "@/components/ui/Icone";
import { avaliarServico, mensagemDeErro, moderarAvaliacao } from "@/lib/dados/acoes";
import type { ResumoAvaliacoes } from "@/lib/dados/consultas";
import { dataLonga } from "@/lib/dados/util";

const formatarMedia = (m: number) => m.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** RatingStars do guia (só leitura). */
export function Estrelas({ nota, tamanho = 20 }: { nota: number; tamanho?: 20 | 24 }) {
  const cheias = Math.round(nota);
  return (
    <span className="inline-flex items-center" role="img" aria-label={`${formatarMedia(nota)} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icone key={i} nome="estrela" tamanho={tamanho} inativo={i > cheias} />
      ))}
    </span>
  );
}

/** Nota média + quantidade: "★★★★★ 4,9 (128)". */
export function NotaResumo({ resumo }: { resumo: ResumoAvaliacoes }) {
  if (resumo.media === null) return <span className="text-body-sm text-ink-muted">Ainda sem avaliações</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-body-sm">
      <Estrelas nota={resumo.media} />
      <span className="font-semibold">{formatarMedia(resumo.media)}</span>
      <span className="text-ink-muted">({resumo.total})</span>
    </span>
  );
}

/** Lista de avaliações (Review do guia). Com `moderacao`, mostra as ações da admin. */
export function ListaAvaliacoes({ resumo, limite, moderacao }: { resumo: ResumoAvaliacoes; limite?: number; moderacao?: boolean }) {
  const [todas, setTodas] = useState(false);
  const lista = limite && !todas ? resumo.lista.slice(0, limite) : resumo.lista;
  if (resumo.lista.length === 0) return <p className="text-body-sm text-ink-muted">Nenhuma avaliação ainda.</p>;
  return (
    <div className="flex flex-col gap-3">
      {lista.map((a) => (
        <ItemAvaliacao key={a.id} a={a} moderacao={moderacao} />
      ))}
      {limite && resumo.lista.length > limite && !todas && (
        <Botao variante="fantasma" tamanho="sm" onClick={() => setTodas(true)}>
          Ver todas as {resumo.lista.length} avaliações
        </Botao>
      )}
    </div>
  );
}

function ItemAvaliacao({ a, moderacao }: { a: ResumoAvaliacoes["lista"][number]; moderacao?: boolean }) {
  const [ocultando, setOcultando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  return (
    <div className={`rounded-lg border-2 border-line p-4 ${a.oculta ? "opacity-70" : ""}`}>
      <div className="flex items-center gap-3">
        <Avatar nome={a.autor} tamanho={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{a.autor}</p>
          <p className="text-caption text-ink-muted">{dataLonga(a.criadoEm)}</p>
        </div>
        {a.oculta && <Selo tom="danger">Oculta</Selo>}
      </div>
      <div className="mt-2">
        <Estrelas nota={a.nota} />
      </div>
      {a.comentario && <p className="text-[15px] mt-2 whitespace-pre-wrap">{a.comentario}</p>}
      {a.oculta && <p className="text-caption text-ink-muted mt-2">Motivo: {a.oculta.motivo}</p>}

      {moderacao && (
        <div className="mt-3">
          {a.oculta ? (
            <Botao variante="fantasma" tamanho="sm" onClick={() => moderarAvaliacao(a.id, false, "")}>
              Voltar a mostrar
            </Botao>
          ) : ocultando ? (
            <div className="flex flex-col gap-2">
              <CampoArea rotulo="Por que ocultar?" value={motivo} onChange={(ev) => setMotivo(ev.target.value)} dica="Ex.: ofensa, dados pessoais, conteúdo sem relação com o serviço." />
              {erro && <p className="text-[13px] font-semibold text-danger">{erro}</p>}
              <div className="flex gap-2">
                <Botao
                  variante="perigo"
                  tamanho="sm"
                  onClick={() => {
                    try {
                      moderarAvaliacao(a.id, true, motivo);
                      setOcultando(false);
                    } catch (err) {
                      setErro(mensagemDeErro(err));
                    }
                  }}
                >
                  Ocultar avaliação
                </Botao>
                <Botao variante="fantasma" tamanho="sm" onClick={() => setOcultando(false)}>
                  Voltar
                </Botao>
              </div>
            </div>
          ) : (
            <Botao variante="fantasma" tamanho="sm" onClick={() => setOcultando(true)}>
              Ocultar
            </Botao>
          )}
        </div>
      )}
    </div>
  );
}

const LEGENDAS = ["", "Ruim", "Poderia ser melhor", "Bom", "Muito bom", "Perfeito!"];

/** Formulário do cliente: estrelas grandes + comentário. */
export function FormAvaliacao({ pedidoId, prestadorNome }: { pedidoId: string; prestadorNome: string }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState("");

  return (
    <Card className="bg-brand-cream">
      <h2 className="text-h3">Como foi o serviço com {prestadorNome}?</h2>
      <p className="text-body-sm text-ink-muted mt-1">Sua avaliação ajuda os próximos clientes e a Aurora Clean a manter o padrão.</p>
      <div role="radiogroup" aria-label="Nota de 1 a 5 estrelas" className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={nota === i}
            aria-label={`${i} estrela${i > 1 ? "s" : ""}`}
            onClick={() => setNota(i)}
            className="flex size-12 items-center justify-center rounded-md hover:bg-surface-card/60"
          >
            <Icone nome="estrela" tamanho={40} inativo={i > nota} />
          </button>
        ))}
        <span className="ml-2 text-label" aria-live="polite">
          {LEGENDAS[nota]}
        </span>
      </div>
      <div className="mt-4">
        <CampoArea
          rotulo="Conte como foi"
          opcional
          maxLength={500}
          value={comentario}
          onChange={(ev) => setComentario(ev.target.value)}
          placeholder="Pontualidade, cuidado com o estofado, resultado…"
          dica={`${comentario.length}/500 · Seu nome aparece como primeiro nome e inicial.`}
        />
      </div>
      {erro && (
        <div className="mt-3">
          <Alerta tom="danger" titulo={erro} />
        </div>
      )}
      <Botao
        className="mt-4"
        disabled={nota === 0}
        onClick={() => {
          setErro("");
          try {
            avaliarServico(pedidoId, nota, comentario);
          } catch (err) {
            setErro(mensagemDeErro(err));
          }
        }}
      >
        Enviar avaliação
      </Botao>
    </Card>
  );
}
