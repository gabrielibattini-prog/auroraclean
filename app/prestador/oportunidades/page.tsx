"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { CardOportunidade } from "@/components/oportunidades/CardOportunidade";
import { DicaTutorial } from "@/components/tutorial/Tutorial";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { Alerta, EstadoVazio, TituloPagina } from "@/components/ui/Base";
import { Opcoes } from "@/components/ui/Campos";
import { Dialogo } from "@/components/ui/Dialogo";
import { Icone } from "@/components/ui/Icone";
import { aceitarPedido, mensagemDeErro, ocultarOportunidade } from "@/lib/dados/acoes";
import { prestadorDe, usuarioAtual } from "@/lib/dados/acesso";
import { oportunidades, type OportunidadePublica } from "@/lib/dados/consultas";
import { useEstado } from "@/lib/dados/store";
import type { Servico } from "@/lib/dados/tipos";
import { dataCurta, moeda } from "@/lib/dados/util";

const Mapa = dynamic(() => import("@/components/mapa/MapaOportunidades"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-surface-sunken" />,
});

type Visao = "cards" | "mapa";

function Oportunidades() {
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const prestador = prestadorDe(e, u.id)!;
  const router = useRouter();
  const caminho = usePathname();
  const params = useSearchParams();
  const visao: Visao = params.get("visao") === "mapa" ? "mapa" : "cards";

  const [filtro, setFiltro] = useState<Servico | "todos">("todos");
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<OportunidadePublica | null>(null);
  const [erro, setErro] = useState("");

  const lista = useMemo(() => oportunidades(e), [e]);
  const filtradas = lista.filter((o) => filtro === "todos" || o.itens.some((i) => i.servico === filtro));
  const sel = filtradas.find((o) => o.id === selecionada) ?? null;

  function trocarVisao(v: Visao) {
    const q = new URLSearchParams(params.toString());
    q.set("visao", v);
    router.replace(`${caminho}?${q.toString()}`, { scroll: false });
  }

  function aceitar(o: OportunidadePublica) {
    setErro("");
    try {
      aceitarPedido(o.id);
      router.push(`/prestador/servicos/${o.id}?aceito=1`);
    } catch (err) {
      setConfirmar(null);
      setErro(mensagemDeErro(err));
    }
  }

  return (
    <>
      <TituloPagina
        titulo="Oportunidades"
        subtitulo={`${lista.length} perto de você · até ${prestador.raioKm} km de ${prestador.bairro}`}
        acao={
          <div role="tablist" aria-label="Forma de visualização" className="flex rounded-pill bg-surface-sunken p-1">
            {(["cards", "mapa"] as Visao[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={visao === v}
                onClick={() => trocarVisao(v)}
                className={`flex h-10 items-center gap-2 rounded-pill px-4 text-label ${visao === v ? "bg-surface-card shadow-[0_2px_0_var(--line)]" : "text-ink-muted"}`}
              >
                <Icone nome={v === "cards" ? "cards" : "mapa"} tamanho={24} inativo={visao !== v} />
                {v === "cards" ? "Cards" : "Mapa"}
              </button>
            ))}
          </div>
        }
      />

      <DicaTutorial usuarioId={u.id} perfil="prestador" />
      <Opcoes
        rotulo="Filtrar por serviço"
        valor={filtro}
        aoMudar={(v) => setFiltro(v as typeof filtro)}
        opcoes={[
          { valor: "todos", rotulo: "Todos" },
          { valor: "higienizacao", rotulo: "Higienização" },
          { valor: "impermeabilizacao", rotulo: "Impermeabilização" },
          { valor: "combo", rotulo: "Combo" },
        ]}
      />

      {erro && (
        <div className="mt-4">
          <Alerta tom="danger" titulo={erro} />
        </div>
      )}

      <div className="mt-4 flex gap-2 rounded-md bg-info-soft p-3 text-body-sm">
        <Icone nome="local" tamanho={24} />
        <p>Você vê só a região aproximada. O endereço e o telefone do cliente aparecem depois que você aceita.</p>
      </div>

      {filtradas.length === 0 ? (
        <EstadoVazio
          icone="mapa"
          titulo="Nenhuma oportunidade agora"
          texto="Novas ordens de serviço aparecem aqui. Aumentar seu raio de atendimento pode ajudar."
          acao={<BotaoLink href="/prestador/perfil" variante="secundario">Ajustar raio</BotaoLink>}
        />
      ) : visao === "cards" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((o) => (
            <CardOportunidade key={o.id} o={o} aoAceitar={() => setConfirmar(o)} aoOcultar={() => ocultarOportunidade(o.id)} />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="relative z-0 h-[60vh] min-h-[360px] lg:h-[calc(100dvh-280px)]">
            <Mapa base={prestador.base} raioKm={prestador.raioKm} oportunidades={filtradas} selecionada={selecionada} aoSelecionar={setSelecionada} />
          </div>
          <div className="flex flex-col gap-3 lg:max-h-[calc(100dvh-280px)] lg:overflow-y-auto lg:pr-1">
            {sel ? (
              <>
                <CardOportunidade o={sel} destacado aoAceitar={() => setConfirmar(sel)} aoOcultar={() => ocultarOportunidade(sel.id)} />
                <Botao variante="fantasma" onClick={() => setSelecionada(null)}>
                  Ver todas
                </Botao>
              </>
            ) : (
              <>
                <p className="text-body-sm text-ink-muted">Toque em um círculo no mapa ou escolha abaixo.</p>
                {filtradas.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelecionada(o.id)}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface-card p-4 text-left shadow-card"
                  >
                    <span>
                      <span className="block text-label">
                        {o.clientePrimeiroNome} · {o.bairro} · ~{o.distanciaKm} km
                      </span>
                      <span className="block text-body-sm text-ink-muted">
                        {o.itens.length} estofado(s) · {dataCurta(o.data)}
                      </span>
                    </span>
                    <span className="text-h3">{moeda(o.valor)}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <Dialogo
        aberto={!!confirmar}
        aoFechar={() => setConfirmar(null)}
        titulo="Aceitar esta oportunidade?"
        acoes={
          <>
            <Botao variante="secundario" onClick={() => setConfirmar(null)}>
              Voltar
            </Botao>
            <Botao variante="terracota" onClick={() => confirmar && aceitar(confirmar)}>
              Aceitar oportunidade
            </Botao>
          </>
        }
      >
        {confirmar && (
          <>
            {dataCurta(confirmar.data)}, {confirmar.bairro}. Ao aceitar, você se compromete com a data e com o protocolo Aurora. O endereço e o
            telefone do cliente serão liberados.
          </>
        )}
      </Dialogo>
    </>
  );
}

export default function PaginaOportunidades() {
  return (
    <Suspense>
      <Oportunidades />
    </Suspense>
  );
}
