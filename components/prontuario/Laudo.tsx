"use client";

import { Botao } from "@/components/ui/Botao";
import { Card, EstadoVazio, Selo } from "@/components/ui/Base";
import { Foto } from "@/components/ui/Fotos";
import { Icone } from "@/components/ui/Icone";
import { Logo } from "@/components/layout/Logo";
import { usuarioAtual } from "@/lib/dados/acesso";
import { ESTOFADOS, GARANTIA_DIAS, SERVICOS, TECIDOS } from "@/lib/dados/catalogo";
import { useEstado } from "@/lib/dados/store";
import { dataLonga } from "@/lib/dados/util";

/**
 * Laudo do serviço (página para ver e imprimir/salvar em PDF).
 * Visível só para o cliente dono, o prestador que fez e a admin.
 */
export function LaudoView({ id }: { id: string }) {
  const e = useEstado();
  const u = usuarioAtual(e);
  const l = e.laudos.find((x) => x.id === id);
  const pedido = l && e.pedidos.find((p) => p.id === l.pedidoId);
  const pode = !!l && !!u && (u.papel === "admin" || l.clienteId === u.id || pedido?.prestadorId === u.id);
  if (!l || !pode) return <EstadoVazio icone="laudo" titulo="Laudo não encontrado" />;

  const c = l.conteudo;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="nao-imprimir mb-4 flex justify-end">
        <Botao variante="secundario" icone="laudo" onClick={() => window.print()}>
          Imprimir ou salvar PDF
        </Botao>
      </div>
      <Card className="p-6 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-line pb-5">
          <div className="flex items-center gap-3">
            <Logo tamanho={48} />
            <div>
              <p className="text-overline uppercase text-ink-muted">Laudo de serviço</p>
              <h1 className="text-h1">Nº {l.numero}</h1>
            </div>
          </div>
          <div className="text-right text-body-sm text-ink-muted">
            <p>Emitido em {dataLonga(l.emitidoEm)}</p>
            <p>Ordem de serviço nº {pedido?.numero}</p>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Icone nome={ESTOFADOS[c.tipo].icone} tamanho={48} />
            <div>
              <p className="text-h3">{c.estofado}</p>
              <p className="text-body-sm text-ink-muted">
                {ESTOFADOS[c.tipo].nome} · tecido {TECIDOS[c.tecido].nome.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icone nome="verificado" tamanho={48} />
            <div>
              <p className="text-h3">{SERVICOS[c.servico].nome}</p>
              <p className="text-body-sm text-ink-muted">Por {c.prestadorNome}, prestador verificado Aurora</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-h2 mb-3">Antes e depois</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Selo tom="neutral">Antes</Selo>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {c.fotosAntes.length ? c.fotosAntes.map((f, i) => <Foto key={f} id={f} alt={`Antes ${i + 1}`} />) : <Foto id="demo" alt="Foto de antes (exemplo)" />}
              </div>
            </div>
            <div>
              <Selo tom="success">Depois</Selo>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {c.fotosDepois.length ? c.fotosDepois.map((f, i) => <Foto key={f} id={f} alt={`Depois ${i + 1}`} />) : <Foto id="demo" alt="Foto de depois (exemplo)" />}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-h2 mb-3">Protocolo Aurora</h2>
          <dl className="divide-y-2 divide-line rounded-lg border-2 border-line">
            {c.respostas.map((r) => (
              <div key={r.pergunta} className="grid gap-1 p-3 sm:grid-cols-[1fr_1.2fr]">
                <dt className="text-label text-ink-muted">{r.pergunta}</dt>
                <dd className="text-body-sm">{r.resposta}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 flex items-center gap-2 text-caption text-ink-muted">
            <Icone nome="checklist" tamanho={20} /> Todas as etapas obrigatórias do protocolo foram cumpridas.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-brand-cream p-4">
            <p className="text-label">Cuidados</p>
            <p className="text-body-sm mt-1">Evite usar o estofado até secar. Mantenha o ambiente ventilado. Limpe respingos na hora com pano seco.</p>
          </div>
          <div className="rounded-lg bg-info-soft p-4">
            <p className="text-label">{c.proximaImpermeabilizacao ? "Próxima impermeabilização" : "Garantia"}</p>
            <p className="text-body-sm mt-1">
              {c.proximaImpermeabilizacao
                ? `Recomendada até ${dataLonga(c.proximaImpermeabilizacao)}. Vamos te lembrar por e-mail.`
                : `${GARANTIA_DIAS} dias a partir do serviço.`}
            </p>
          </div>
        </section>
      </Card>
    </div>
  );
}
