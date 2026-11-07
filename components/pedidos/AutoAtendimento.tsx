"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card } from "@/components/ui/Base";
import { CampoTexto, Opcoes } from "@/components/ui/Campos";
import { Dialogo } from "@/components/ui/Dialogo";
import { cancelarPedido, mensagemDeErro, podeAlterarSozinho, reagendarPedido } from "@/lib/dados/acoes";
import { HORAS_MINIMAS_REAGENDAR, PERIODOS } from "@/lib/dados/catalogo";
import type { Pedido, Periodo } from "@/lib/dados/tipos";
import { dataISO, somarDias } from "@/lib/dados/util";

/** Reagendar e cancelar sem precisar falar com a equipe (regra das 24h). */
export function AutoAtendimento({ p }: { p: Pedido }) {
  const [reagendando, setReagendando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [data, setData] = useState(p.data);
  const [periodo, setPeriodo] = useState<Periodo>(p.periodo);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  if (p.status !== "aberto" && p.status !== "aceito") return null;
  const pode = podeAlterarSozinho(p);

  return (
    <Card>
      <h2 className="text-h3">Precisa mudar algo?</h2>
      {!pode ? (
        <p className="text-body-sm text-ink-muted mt-1">
          Faltam menos de {HORAS_MINIMAS_REAGENDAR}h para o serviço. Para reagendar ou cancelar, fale com a equipe abaixo.
        </p>
      ) : (
        <>
          <p className="text-body-sm text-ink-muted mt-1">Reagende ou cancele sem custo até {HORAS_MINIMAS_REAGENDAR}h antes.</p>
          {reagendando ? (
            <div className="mt-4 flex flex-col gap-4">
              <CampoTexto rotulo="Novo dia" type="date" min={dataISO(somarDias(new Date(), 1))} value={data} onChange={(ev) => setData(ev.target.value)} />
              <Opcoes
                rotulo="Período"
                valor={periodo}
                aoMudar={(v) => setPeriodo(v as Periodo)}
                opcoes={(Object.keys(PERIODOS) as Periodo[]).map((x) => ({ valor: x, rotulo: `${PERIODOS[x].nome} · ${PERIODOS[x].faixa}` }))}
              />
              <div className="flex gap-3">
                <Botao
                  onClick={() => {
                    setErro("");
                    try {
                      reagendarPedido(p.id, data, periodo);
                      setReagendando(false);
                      setOk("Pronto! Nova data salva e o prestador foi avisado.");
                    } catch (err) {
                      setErro(mensagemDeErro(err));
                    }
                  }}
                >
                  Salvar nova data
                </Botao>
                <Botao variante="fantasma" onClick={() => setReagendando(false)}>
                  Voltar
                </Botao>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Botao variante="secundario" icone="calendario" onClick={() => setReagendando(true)}>
                Reagendar
              </Botao>
              <Botao variante="fantasma" className="text-danger" onClick={() => setCancelando(true)}>
                Cancelar ordem de serviço
              </Botao>
            </div>
          )}
        </>
      )}
      {(erro || ok) && (
        <div className="mt-4">
          <Alerta tom={erro ? "danger" : "success"} titulo={erro || ok} />
        </div>
      )}
      <Dialogo
        aberto={cancelando}
        aoFechar={() => setCancelando(false)}
        titulo="Cancelar esta ordem de serviço?"
        acoes={
          <>
            <Botao variante="secundario" onClick={() => setCancelando(false)}>
              Manter ordem de serviço
            </Botao>
            <Botao
              variante="perigo"
              onClick={() => {
                try {
                  cancelarPedido(p.id, "");
                  setCancelando(false);
                } catch (err) {
                  setCancelando(false);
                  setErro(mensagemDeErro(err));
                }
              }}
            >
              Cancelar ordem de serviço
            </Botao>
          </>
        }
      >
        O cancelamento é gratuito. Se mudar de ideia, é só abrir uma nova ordem de serviço.
      </Dialogo>
    </Card>
  );
}
