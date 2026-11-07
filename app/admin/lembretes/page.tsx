"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Card, EstadoVazio, Selo, TituloPagina } from "@/components/ui/Base";
import { Icone } from "@/components/ui/Icone";
import { enviarLembrete } from "@/lib/dados/acoes";
import { MESES_REIMPERMEABILIZACAO } from "@/lib/dados/catalogo";
import { useEstado } from "@/lib/dados/store";
import { dataLonga, deDataISO } from "@/lib/dados/util";

const STATUS = {
  agendado: { rotulo: "Agendado", tom: "info" },
  enviado: { rotulo: "Enviado", tom: "success" },
  cancelado: { rotulo: "Cancelado", tom: "neutral" },
} as const;

/**
 * Lembretes de reimpermeabilização. No back-end, um cron diário envia
 * os e-mails 30 dias antes da data prevista; aqui a admin pode simular o envio.
 */
export default function Lembretes() {
  const e = useEstado();
  const [previa, setPrevia] = useState<string | null>(null);
  const lista = [...e.lembretes].sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));
  const sel = lista.find((l) => l.id === previa);

  return (
    <>
      <TituloPagina
        titulo="Lembretes de proteção"
        subtitulo={`Enviados por e-mail ${MESES_REIMPERMEABILIZACAO} meses depois de cada impermeabilização.`}
      />
      {lista.length === 0 ? (
        <EstadoVazio icone="sino" titulo="Nenhum lembrete ainda" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-3">
            {lista.map((l) => {
              const u = e.usuarios.find((x) => x.id === l.clienteId)!;
              const est = e.estofados.find((x) => x.id === l.estofadoId);
              const dias = Math.round((deDataISO(l.dataPrevista).getTime() - Date.now()) / 864e5);
              return (
                <Card key={l.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 ${previa === l.id ? "ring-[3px] ring-brand-olive" : ""}`}>
                  <Icone nome="gota" tamanho={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-label">
                      {est?.apelido} · {u.excluido ? "Conta excluída" : u.nome}
                    </p>
                    <p className="text-body-sm text-ink-muted">
                      {dataLonga(l.dataPrevista)} {l.status === "agendado" && `(${dias >= 0 ? `em ${dias} dias` : `${-dias} dias atrás`})`}
                    </p>
                  </div>
                  <Selo tom={STATUS[l.status].tom}>{STATUS[l.status].rotulo}</Selo>
                  {l.status === "agendado" && (
                    <Botao variante="secundario" tamanho="sm" onClick={() => setPrevia(l.id)}>
                      Ver e-mail
                    </Botao>
                  )}
                </Card>
              );
            })}
          </div>

          {sel && (
            <Card className="h-fit lg:sticky lg:top-24">
              <p className="text-overline uppercase text-ink-muted">Prévia do e-mail</p>
              <div className="mt-3 rounded-lg border-2 border-line overflow-hidden">
                <div className="bg-brand-olive p-4 text-on-brand">
                  <p className="text-h3">Hora de proteger seu {e.estofados.find((x) => x.id === sel.estofadoId)?.apelido.toLowerCase()} 💧</p>
                </div>
                <div className="p-4 text-body-sm flex flex-col gap-3">
                  <p>Oi, {e.usuarios.find((x) => x.id === sel.clienteId)?.nome.split(" ")[0]}!</p>
                  <p>
                    Faz quase {MESES_REIMPERMEABILIZACAO} meses da última impermeabilização. A proteção contra líquidos e manchas vai perdendo força com o
                    uso — agora é a hora ideal para renovar.
                  </p>
                  <p className="rounded-md bg-brand-cream p-3 font-semibold">Agende em poucos toques pelo app Aurora Clean.</p>
                  <p className="text-caption text-ink-muted">Você recebe este aviso porque fez um serviço com a Aurora Clean. Para não receber mais, responda “parar”.</p>
                </div>
              </div>
              <Botao
                className="mt-4"
                larguraTotal
                icone="sino"
                onClick={() => {
                  enviarLembrete(sel.id);
                  setPrevia(null);
                }}
              >
                Enviar agora (simulação)
              </Botao>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
