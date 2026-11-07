"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Alerta, BarraProgresso, Card, EstadoVazio, TituloPagina } from "@/components/ui/Base";
import { CampoArea, Confirmacao, Opcoes } from "@/components/ui/Campos";
import { EnvioFotos } from "@/components/ui/Fotos";
import { Icone } from "@/components/ui/Icone";
import { adicionarFotos, finalizarProntuario, mensagemDeErro, removerFoto, salvarResposta } from "@/lib/dados/acoes";
import { usuarioAtual } from "@/lib/dados/acesso";
import { ESTOFADOS, SERVICOS, TECIDOS } from "@/lib/dados/catalogo";
import { pendencias, perguntasPara, respondida } from "@/lib/dados/protocolo";
import { useEstado } from "@/lib/dados/store";

/** Prontuário do estofado: checklist do Protocolo Aurora + fotos obrigatórias. */
export default function Prontuario() {
  const { id, prontuarioId } = useParams<{ id: string; prontuarioId: string }>();
  const router = useRouter();
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const [erro, setErro] = useState("");

  const pr = e.prontuarios.find((x) => x.id === prontuarioId);
  const p = e.pedidos.find((x) => x.id === id);
  if (!pr || !p || pr.prestadorId !== u.id) return <EstadoVazio icone="checklist" titulo="Prontuário não encontrado" />;

  const item = p.itens.find((i) => i.id === pr.itemId)!;
  const est = e.estofados.find((x) => x.id === pr.estofadoId)!;
  const perguntas = perguntasPara(item.servico);
  const obrigatorias = perguntas.filter((q) => q.obrigatoria);
  const feitas = obrigatorias.filter((q) => respondida(q, pr.respostas[q.id])).length;
  const faltam = pendencias(item.servico, pr.respostas);
  const travado = pr.status === "finalizado";
  const pronto = faltam.length === 0 && pr.fotosAntes.length > 0 && pr.fotosDepois.length > 0;

  function responder(perguntaId: string, valor: string | string[] | boolean) {
    try {
      salvarResposta(pr!.id, perguntaId, valor);
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  const secoes = Array.from(new Set(perguntas.map((q) => q.secao)));

  return (
    <div className="mx-auto max-w-2xl">
      <TituloPagina
        voltar={{ href: `/prestador/servicos/${p.id}`, rotulo: `Ordem de serviço nº ${p.numero}` }}
        sobre="Prontuário do estofado"
        titulo={est.apelido}
        subtitulo={`${ESTOFADOS[est.tipo].nome} · ${SERVICOS[item.servico].nome} · tecido ${TECIDOS[est.tecido].nome.toLowerCase()}`}
      />

      {travado ? (
        <div className="mb-6">
          <Alerta tom="success" titulo="Prontuário finalizado">
            O laudo foi enviado ao cliente. Os dados ficam salvos no histórico do estofado.
          </Alerta>
        </div>
      ) : (
        <Card className="mb-6">
          <BarraProgresso rotulo="Checklist Aurora" valor={feitas} total={obrigatorias.length} detalhe={`${feitas} de ${obrigatorias.length}`} />
        </Card>
      )}

      <div className="flex flex-col gap-6">
        <Card>
          <EnvioFotos
            rotulo="Fotos de ANTES"
            dica="Obrigatório. Tire antes de começar: visão geral e close das manchas."
            fotos={pr.fotosAntes}
            aoAdicionar={(ids) => adicionarFotos(pr.id, "antes", ids)}
            aoRemover={(f) => removerFoto(pr.id, "antes", f)}
            desabilitado={travado}
          />
        </Card>

        {secoes.map((secao) => (
          <Card key={secao}>
            <h2 className="text-overline uppercase text-ink-muted mb-4">{secao}</h2>
            <div className="flex flex-col gap-5">
              {perguntas
                .filter((q) => q.secao === secao)
                .map((q) => {
                  const v = pr.respostas[q.id];
                  const rotulo = `${q.pergunta}${q.obrigatoria ? "" : " (opcional)"}`;
                  if (q.tipo === "confirmacao") {
                    return (
                      <Confirmacao key={q.id} marcado={v === true} aoMudar={(x) => responder(q.id, x)} desabilitado={travado}>
                        {q.pergunta}
                      </Confirmacao>
                    );
                  }
                  if (q.tipo === "texto") {
                    return (
                      <CampoArea
                        key={q.id}
                        rotulo={q.pergunta}
                        opcional={!q.obrigatoria}
                        dica={q.ajuda}
                        disabled={travado}
                        defaultValue={(v as string) ?? ""}
                        onBlur={(ev) => responder(q.id, ev.target.value)}
                      />
                    );
                  }
                  return (
                    <div key={q.id}>
                      <Opcoes
                        rotulo={rotulo}
                        multipla={q.tipo === "multipla"}
                        valor={v as string | string[] | undefined}
                        desabilitado={travado}
                        aoMudar={(x) => {
                          if (q.id === "manchas" && Array.isArray(x)) {
                            // "Nenhuma" é exclusiva
                            const antes = (v as string[]) ?? [];
                            const marcouNenhuma = x.includes("Nenhuma") && !antes.includes("Nenhuma");
                            x = marcouNenhuma ? ["Nenhuma"] : x.filter((y) => y !== "Nenhuma");
                          }
                          responder(q.id, x);
                        }}
                        opcoes={q.opcoes!.map((o) => ({ valor: o, rotulo: o }))}
                      />
                      {q.ajuda && <p className="text-[13px] text-ink-muted mt-2">{q.ajuda}</p>}
                    </div>
                  );
                })}
            </div>
          </Card>
        ))}

        <Card>
          <EnvioFotos
            rotulo="Fotos de DEPOIS"
            dica="Obrigatório. Mesmos ângulos das fotos de antes."
            fotos={pr.fotosDepois}
            aoAdicionar={(ids) => adicionarFotos(pr.id, "depois", ids)}
            aoRemover={(f) => removerFoto(pr.id, "depois", f)}
            desabilitado={travado}
          />
        </Card>

        {!travado && (
          <Card className="bg-surface-sunken shadow-none">
            <h2 className="text-h3 mb-3">Para finalizar</h2>
            <ul className="flex flex-col gap-2 text-body-sm">
              <Requisito ok={faltam.length === 0}>
                {faltam.length === 0 ? "Checklist completo" : `Falta responder: ${faltam.map((f) => f.pergunta.toLowerCase()).join(", ")}`}
              </Requisito>
              <Requisito ok={pr.fotosAntes.length > 0}>Pelo menos 1 foto de antes</Requisito>
              <Requisito ok={pr.fotosDepois.length > 0}>Pelo menos 1 foto de depois</Requisito>
            </ul>
            {erro && (
              <div className="mt-4">
                <Alerta tom="danger" titulo={erro} />
              </div>
            )}
            <Botao
              tamanho="lg"
              larguraTotal
              className="mt-4"
              disabled={!pronto}
              onClick={() => {
                setErro("");
                try {
                  finalizarProntuario(pr.id);
                  router.push(`/prestador/servicos/${p.id}`);
                } catch (err) {
                  setErro(mensagemDeErro(err));
                }
              }}
            >
              Finalizar e enviar laudo
            </Botao>
          </Card>
        )}
      </div>
    </div>
  );
}

function Requisito({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Icone nome={ok ? "verificado" : "relogio"} tamanho={20} inativo={!ok} />
      <span className={ok ? "text-success font-semibold" : "text-ink-muted"}>{children}</span>
    </li>
  );
}
