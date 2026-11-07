"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { LinhaResumo, Tracejado } from "@/components/pedidos/Resumo";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card, TituloPagina } from "@/components/ui/Base";
import { CampoArea, CampoSelecao, CampoTexto, Confirmacao, Opcoes, TileOpcao } from "@/components/ui/Campos";
import { EnvioFotos } from "@/components/ui/Fotos";
import { Icone } from "@/components/ui/Icone";
import { Passos } from "@/components/ui/Passos";
import {
  calcularOrcamento,
  criarPedido,
  cupomDisponivel,
  mensagemDeErro,
  type EnderecoSolicitacao,
  type ItemSolicitacao,
} from "@/lib/dados/acoes";
import { usuarioAtual } from "@/lib/dados/acesso";
import {
  ADICIONAL_PET,
  CUPOM_PRIMEIRO_SERVICO,
  ESTOFADOS,
  PERIODOS,
  SERVICOS,
  TECIDOS,
  precoItem,
} from "@/lib/dados/catalogo";
import { useEstado } from "@/lib/dados/store";
import type { Periodo, Servico, Tecido, TipoEstofado } from "@/lib/dados/tipos";
import { dataISO, dataLonga, deDataISO, mascaraCep, moeda, somarDias, soDigitos } from "@/lib/dados/util";
import { CIDADES, atendeCidade, bairrosDe } from "@/lib/geo";

const PASSOS = ["Estofados", "Fotos", "Endereço", "Data", "Revisão"];

type Editor = { estofadoId?: string; tipo: TipoEstofado; tecido: Tecido; servico: Servico; quantidade: number; apelido: string };
const EDITOR_INICIAL: Editor = { tipo: "sofa_3", tecido: "sintetico", servico: "higienizacao", quantidade: 1, apelido: "" };

function NovoPedido() {
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const router = useRouter();
  const estofadoInicial = useSearchParams().get("estofado");
  const meusEstofados = e.estofados.filter((x) => x.clienteId === u.id);
  const meusEnderecos = e.enderecos.filter((x) => x.clienteId === u.id);

  const [passo, setPasso] = useState(0);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Passo 1 — estofados
  // Recontratar: ?estofado=id já traz o estofado cadastrado com o último serviço feito nele
  const servicoSugerido = (estofadoId: string): Servico => {
    const params = new URLSearchParams(window.location.search);
    const pedido = params.get("servico") as Servico | null;
    if (pedido && pedido in SERVICOS) return pedido;
    const ultimo = e.pedidos
      .filter((p) => p.clienteId === u.id && p.status !== "cancelado")
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .flatMap((p) => p.itens)
      .find((i) => i.estofadoId === estofadoId);
    return ultimo?.servico ?? "higienizacao";
  };
  const [itens, setItens] = useState<ItemSolicitacao[]>(() => {
    const est = meusEstofados.find((x) => x.id === estofadoInicial);
    return est ? [{ estofadoId: est.id, servico: servicoSugerido(est.id), quantidade: 1 }] : [];
  });
  const recontratando = itens.length > 0 && !!estofadoInicial;
  const [editor, setEditor] = useState<Editor | null>(itens.length ? null : EDITOR_INICIAL);
  const [pet, setPet] = useState(false);

  // Passo 2 — fotos
  const [fotos, setFotos] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState("");

  // Passo 3 — endereço
  const [enderecoId, setEnderecoId] = useState<string | "novo">(meusEnderecos[0]?.id ?? "novo");
  const [end, setEnd] = useState<EnderecoSolicitacao>({ cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "São Paulo", uf: "SP" });
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Passo 4 — data
  const amanha = dataISO(somarDias(new Date(), 1));
  const [data, setData] = useState(amanha);
  const [periodo, setPeriodo] = useState<Periodo>("manha");

  // Passo 5 — revisão
  const [cupom, setCupom] = useState(cupomDisponivel(e, u.id) ? CUPOM_PRIMEIRO_SERVICO.codigo : "");

  const orc = useMemo(() => calcularOrcamento(e, u.id, itens, pet, cupom), [e, u.id, itens, pet, cupom]);

  function adicionarItem() {
    if (!editor) return;
    setItens((xs) => [
      ...xs,
      editor.estofadoId
        ? { estofadoId: editor.estofadoId, servico: editor.servico, quantidade: 1 }
        : { novo: { tipo: editor.tipo, tecido: editor.tecido, apelido: editor.apelido }, servico: editor.servico, quantidade: editor.quantidade },
    ]);
    setEditor(null);
  }

  async function buscarCep(cep: string) {
    const d = soDigitos(cep);
    if (d.length !== 8) return;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (j.erro) throw new Error();
      setEnd((x) => ({ ...x, logradouro: j.logradouro || x.logradouro, bairro: j.bairro || x.bairro, cidade: j.localidade || x.cidade, uf: j.uf || x.uf }));
    } catch {
      /* sem internet ou CEP não encontrado: o cliente preenche à mão */
    } finally {
      setBuscandoCep(false);
    }
  }

  function validarPasso(): string | null {
    if (passo === 0 && itens.length === 0) return "Adicione pelo menos um estofado.";
    if (passo === 2 && enderecoId === "novo") {
      if (!end.logradouro || !end.numero || !end.bairro || !end.cidade) return "Complete o endereço.";
      if (!atendeCidade(end.cidade)) return "Ainda não atendemos essa cidade. Estamos em expansão!";
    }
    if (passo === 3) {
      if (data < amanha) return "Escolha uma data a partir de amanhã.";
      if (deDataISO(data).getDay() === 0) return "Atendemos de segunda a sábado.";
    }
    return null;
  }

  function avancar() {
    const problema = validarPasso();
    setErro(problema ?? "");
    if (!problema) setPasso((p) => p + 1);
  }

  function enviar() {
    setErro("");
    setEnviando(true);
    try {
      const id = criarPedido({
        itens,
        pet,
        fotos,
        enderecoId: enderecoId === "novo" ? undefined : enderecoId,
        endereco: enderecoId === "novo" ? end : undefined,
        data,
        periodo,
        observacoes,
        cupom,
      });
      router.push(`/cliente/pedidos/${id}?novo=1`);
    } catch (err) {
      setErro(mensagemDeErro(err));
      setEnviando(false);
    }
  }

  const tiposDisponiveis = Object.keys(ESTOFADOS) as TipoEstofado[];

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina titulo="Solicitar serviço" voltar={{ href: "/cliente", rotulo: "Início" }} />
      <Passos passos={PASSOS} atual={passo} />

      {/* ---------- Passo 1: estofados ---------- */}
      {passo === 0 && (
        <div className="flex flex-col gap-4">
          {recontratando && (
            <Alerta tom="success" icone="repetir" titulo="Seu estofado já está aqui">
              Usamos os dados que você já cadastrou. Confira o serviço, adicione outros estofados se quiser e siga para a data.
            </Alerta>
          )}
          {orc.linhas.map((l, i) => {
            const est = l.estofadoId ? meusEstofados.find((x) => x.id === l.estofadoId) : undefined;
            return (
              <Card key={i}>
                <div className="flex items-center gap-3">
                  <Icone nome={ESTOFADOS[l.tipo].icone} tamanho={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-h3 truncate">
                      {est?.apelido || l.novo?.apelido || ESTOFADOS[l.tipo].nome}
                      {l.quantidade > 1 && ` × ${l.quantidade}`}
                    </p>
                    <p className="text-caption text-ink-muted">tecido {TECIDOS[l.tecido].nome.toLowerCase()}</p>
                  </div>
                  <span className="text-h3 shrink-0">{moeda(l.valor)}</span>
                  <button type="button" onClick={() => setItens((xs) => xs.filter((_, j) => j !== i))} className="size-10 shrink-0 rounded-full text-danger font-bold hover:bg-danger-soft" aria-label="Remover">
                    ×
                  </button>
                </div>
                <label className="sr-only" htmlFor={`servico-${i}`}>
                  Serviço para {est?.apelido || ESTOFADOS[l.tipo].nome}
                </label>
                <select
                  id={`servico-${i}`}
                  value={l.servico}
                  onChange={(ev) => setItens((xs) => xs.map((x, j) => (j === i ? { ...x, servico: ev.target.value as Servico } : x)))}
                  className="mt-3 h-11 w-full rounded-md border-2 border-line bg-surface-card px-3 text-ink"
                >
                  {(Object.keys(SERVICOS) as Servico[]).map((s) => (
                    <option key={s} value={s}>
                      {SERVICOS[s].nome}
                    </option>
                  ))}
                </select>
              </Card>
            );
          })}

          {editor ? (
            <Card className="flex flex-col gap-5">
              {meusEstofados.length > 0 && (
                <div>
                  <p className="text-label mb-2">Seus estofados</p>
                  <div className="flex flex-wrap gap-2">
                    {meusEstofados.map((x) => (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => setEditor((ed) => ({ ...ed!, estofadoId: ed?.estofadoId === x.id ? undefined : x.id, tipo: x.tipo, tecido: x.tecido }))}
                        aria-pressed={editor.estofadoId === x.id}
                        className={`flex items-center gap-2 min-h-11 px-3 rounded-pill border-2 text-label ${
                          editor.estofadoId === x.id ? "bg-brand-olive-soft border-brand-olive" : "bg-surface-card border-line"
                        }`}
                      >
                        <Icone nome={ESTOFADOS[x.tipo].icone} tamanho={24} /> {x.apelido}
                      </button>
                    ))}
                  </div>
                  {!editor.estofadoId && <p className="text-caption text-ink-muted mt-2">Ou cadastre um novo abaixo.</p>}
                </div>
              )}

              {!editor.estofadoId && (
                <>
                  <div>
                    <p className="text-label mb-2">Qual estofado?</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {tiposDisponiveis.map((t) => (
                        <TileOpcao
                          key={t}
                          icone={ESTOFADOS[t].icone}
                          titulo={ESTOFADOS[t].nome}
                          detalhe={`a partir de ${moeda(precoItem(t, "higienizacao", "sintetico"))}`}
                          selecionado={editor.tipo === t}
                          onClick={() => setEditor({ ...editor, tipo: t })}
                        />
                      ))}
                    </div>
                  </div>
                  <Opcoes
                    rotulo="Tipo de tecido"
                    valor={editor.tecido}
                    aoMudar={(v) => setEditor({ ...editor, tecido: v as Tecido })}
                    opcoes={(Object.keys(TECIDOS) as Tecido[]).map((t) => ({ valor: t, rotulo: TECIDOS[t].nome }))}
                  />
                  <p className="-mt-3 text-caption text-ink-muted">{TECIDOS[editor.tecido].exemplos}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CampoTexto rotulo="Como você chama este estofado?" opcional placeholder="Ex.: Sofá da sala" value={editor.apelido} onChange={(ev) => setEditor({ ...editor, apelido: ev.target.value })} dica="Ajuda a achar o histórico depois." />
                    <div>
                      <p className="text-label mb-1.5">Quantidade</p>
                      <div className="flex items-center gap-3">
                        <Botao variante="secundario" tamanho="sm" aria-label="Menos" onClick={() => setEditor({ ...editor, quantidade: Math.max(1, editor.quantidade - 1) })}>
                          −
                        </Botao>
                        <span className="text-h2 w-8 text-center" aria-live="polite">{editor.quantidade}</span>
                        <Botao variante="secundario" tamanho="sm" aria-label="Mais" onClick={() => setEditor({ ...editor, quantidade: Math.min(12, editor.quantidade + 1) })}>
                          +
                        </Botao>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <p className="text-label mb-2">Qual serviço?</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(SERVICOS) as Servico[]).map((s) => {
                    const est = meusEstofados.find((x) => x.id === editor.estofadoId);
                    const valor = precoItem(est?.tipo ?? editor.tipo, s, est?.tecido ?? editor.tecido) * (est ? 1 : editor.quantidade);
                    return (
                      <TileOpcao key={s} icone={SERVICOS[s].icone} titulo={SERVICOS[s].nome} detalhe={moeda(valor)} selecionado={editor.servico === s} onClick={() => setEditor({ ...editor, servico: s })} />
                    );
                  })}
                </div>
                <p className="text-body-sm text-ink-muted mt-2">{SERVICOS[editor.servico].descricao}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Botao onClick={adicionarItem}>Adicionar à ordem de serviço</Botao>
                {itens.length > 0 && (
                  <Botao variante="fantasma" onClick={() => setEditor(null)}>
                    Cancelar
                  </Botao>
                )}
              </div>
            </Card>
          ) : (
            <Botao variante="secundario" icone="sofa" onClick={() => setEditor(EDITOR_INICIAL)}>
              Adicionar outro estofado
            </Botao>
          )}

          <Confirmacao marcado={pet} aoMudar={setPet}>
            Tenho pets em casa — incluir limpeza pet (+{moeda(ADICIONAL_PET)}). Tratamento enzimático contra pelos, odores e alérgenos.
          </Confirmacao>
        </div>
      )}

      {/* ---------- Passo 2: fotos ---------- */}
      {passo === 1 && (
        <Card className="flex flex-col gap-5">
          <EnvioFotos
            rotulo="Fotos dos estofados"
            dica="Opcional, mas ajuda o prestador a se preparar. Mostre manchas e o estado geral."
            fotos={fotos}
            aoAdicionar={(ids) => setFotos((f) => [...f, ...ids])}
            aoRemover={(id) => setFotos((f) => f.filter((x) => x !== id))}
          />
          <div className="flex gap-2 rounded-md bg-info-soft p-3 text-body-sm">
            <Icone nome="verificado" tamanho={24} />
            <p>Removemos automaticamente a localização gravada nas fotos.</p>
          </div>
          <CampoArea rotulo="Algo que o prestador precisa saber?" opcional value={observacoes} onChange={(ev) => setObservacoes(ev.target.value)} placeholder="Ex.: mancha de café no braço, prédio sem elevador…" />
        </Card>
      )}

      {/* ---------- Passo 3: endereço ---------- */}
      {passo === 2 && (
        <div className="flex flex-col gap-4">
          {meusEnderecos.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={enderecoId === x.id}
              onClick={() => setEnderecoId(x.id)}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left ${enderecoId === x.id ? "bg-brand-olive-soft border-brand-olive" : "bg-surface-card border-line"}`}
            >
              <Icone nome="casa" tamanho={40} />
              <span>
                <span className="block text-label">
                  {x.logradouro}, {x.numero} {x.complemento && `· ${x.complemento}`}
                </span>
                <span className="block text-body-sm text-ink-muted">
                  {x.bairro}, {x.cidade}
                </span>
              </span>
            </button>
          ))}
          {meusEnderecos.length > 0 && (
            <button
              type="button"
              aria-pressed={enderecoId === "novo"}
              onClick={() => setEnderecoId("novo")}
              className={`rounded-lg border-2 p-4 text-left text-label ${enderecoId === "novo" ? "bg-brand-olive-soft border-brand-olive" : "bg-surface-card border-line border-dashed"}`}
            >
              + Usar outro endereço
            </button>
          )}
          {enderecoId === "novo" && (
            <Card className="grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <CampoTexto
                  rotulo="CEP"
                  icone="local"
                  inputMode="numeric"
                  placeholder="00000-000"
                  value={end.cep}
                  onChange={(ev) => {
                    const cep = mascaraCep(ev.target.value);
                    setEnd({ ...end, cep });
                    buscarCep(cep);
                  }}
                  dica={buscandoCep ? "Buscando endereço…" : "Preenchemos o resto para você."}
                />
              </div>
              <div className="sm:col-span-4">
                <CampoTexto rotulo="Rua" value={end.logradouro} onChange={(ev) => setEnd({ ...end, logradouro: ev.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <CampoTexto rotulo="Número" value={end.numero} onChange={(ev) => setEnd({ ...end, numero: ev.target.value })} />
              </div>
              <div className="sm:col-span-4">
                <CampoTexto rotulo="Complemento" opcional value={end.complemento} onChange={(ev) => setEnd({ ...end, complemento: ev.target.value })} />
              </div>
              <div className="sm:col-span-3">
                <CampoSelecao rotulo="Cidade" value={atendeCidade(end.cidade) ? end.cidade : ""} onChange={(ev) => setEnd({ ...end, cidade: ev.target.value, bairro: "" })}>
                  <option value="" disabled>
                    {end.cidade && !atendeCidade(end.cidade) ? `${end.cidade} (não atendida)` : "Escolha"}
                  </option>
                  {CIDADES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </CampoSelecao>
              </div>
              <div className="sm:col-span-3">
                <CampoTexto rotulo="Bairro" list="bairros" value={end.bairro} onChange={(ev) => setEnd({ ...end, bairro: ev.target.value })} />
                <datalist id="bairros">
                  {bairrosDe(end.cidade).map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>
            </Card>
          )}
          <div className="flex gap-2 rounded-md bg-info-soft p-3 text-body-sm">
            <Icone nome="local" tamanho={24} />
            <p>Antes de aceitar, o prestador vê só seu primeiro nome e o bairro. O endereço completo e seu telefone aparecem depois do aceite.</p>
          </div>
        </div>
      )}

      {/* ---------- Passo 4: data ---------- */}
      {passo === 3 && (
        <Card className="flex flex-col gap-5">
          <CampoTexto rotulo="Dia" type="date" min={amanha} value={data} onChange={(ev) => setData(ev.target.value)} dica="De segunda a sábado." />
          <div>
            <p className="text-label mb-2">Período</p>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(PERIODOS) as Periodo[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={periodo === p}
                  onClick={() => setPeriodo(p)}
                  className={`flex h-16 flex-col items-center justify-center rounded-md border-2 base-3d ${
                    periodo === p ? "bg-brand-olive text-on-brand border-transparent [--base-3d:var(--brand-olive-deep)]" : "bg-surface-card border-line [--base-3d:var(--line)]"
                  }`}
                >
                  <span className="text-button">{PERIODOS[p].nome}</span>
                  <span className={`text-caption ${periodo === p ? "" : "text-ink-muted"}`}>{PERIODOS[p].faixa}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ---------- Passo 5: revisão ---------- */}
      {passo === 4 && (
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="text-h3 mb-2">Resumo da ordem de serviço</h2>
            {orc.linhas.map((l, i) => {
              const est = l.estofadoId ? meusEstofados.find((x) => x.id === l.estofadoId) : undefined;
              return (
                <LinhaResumo
                  key={i}
                  icone={ESTOFADOS[l.tipo].icone}
                  rotulo={`${est?.apelido || l.novo?.apelido || ESTOFADOS[l.tipo].nome}${l.quantidade > 1 ? ` × ${l.quantidade}` : ""} · ${SERVICOS[l.servico].curto}`}
                  valor={moeda(l.valor)}
                />
              );
            })}
            {pet && <LinhaResumo icone="pet" rotulo="Limpeza pet" valor={moeda(ADICIONAL_PET)} />}
            <LinhaResumo icone="calendario" rotulo={`${dataLonga(data)} · ${PERIODOS[periodo].nome}`} />
            <LinhaResumo
              icone="local"
              rotulo={
                enderecoId === "novo"
                  ? `${end.logradouro}, ${end.numero} — ${end.bairro}`
                  : (() => {
                      const x = meusEnderecos.find((y) => y.id === enderecoId)!;
                      return `${x.logradouro}, ${x.numero} — ${x.bairro}`;
                    })()
              }
            />
            {fotos.length > 0 && <LinhaResumo icone="camera" rotulo={`${fotos.length} foto(s)`} />}
            {orc.desconto > 0 && <LinhaResumo icone="cupom" rotulo={`Cupom ${CUPOM_PRIMEIRO_SERVICO.codigo}`} valor={`−${moeda(orc.desconto)}`} />}
            <Tracejado />
            <LinhaResumo rotulo="Total" valor={moeda(orc.total)} destaque />
          </Card>

          <CampoTexto
            rotulo="Cupom"
            icone="cupom"
            opcional
            value={cupom}
            onChange={(ev) => setCupom(ev.target.value.toUpperCase())}
            erro={cupom && !orc.cupomOk ? "Cupom inválido ou já usado." : undefined}
            dica={orc.cupomOk ? "10% de desconto no primeiro serviço aplicado!" : undefined}
          />

          <Alerta tom="success" titulo="Você só paga depois do serviço">
            Primeiro você confere o resultado e o laudo. Pix ou cartão em até 3x. 7 dias de garantia.
          </Alerta>
        </div>
      )}

      {erro && (
        <div className="mt-4">
          <Alerta tom="danger" titulo={erro} />
        </div>
      )}

      <div className="sticky bottom-[calc(84px+env(safe-area-inset-bottom))] md:bottom-0 mt-8 flex gap-3 bg-surface-page/95 py-3">
        {passo > 0 && (
          <Botao variante="secundario" tamanho="lg" onClick={() => setPasso((p) => p - 1)}>
            Voltar
          </Botao>
        )}
        {passo < PASSOS.length - 1 ? (
          <Botao tamanho="lg" larguraTotal onClick={avancar} disabled={passo === 0 && itens.length === 0}>
            {passo === 0 && itens.length > 0 ? `Continuar · ${moeda(orc.total)}` : "Continuar"}
          </Botao>
        ) : (
          <Botao tamanho="lg" larguraTotal icone="brilho" carregando={enviando} onClick={enviar}>
            Solicitar serviço
          </Botao>
        )}
      </div>
    </div>
  );
}

export default function PaginaNovoPedido() {
  return (
    <Suspense>
      <NovoPedido />
    </Suspense>
  );
}
