"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card } from "@/components/ui/Base";
import { CampoSelecao, CampoTexto, Opcoes } from "@/components/ui/Campos";
import { Icone } from "@/components/ui/Icone";
import { mensagemDeErro, pagarPedido } from "@/lib/dados/acoes";
import { PARCELAS_MAX } from "@/lib/dados/catalogo";
import type { MetodoPagamento, Pedido } from "@/lib/dados/tipos";
import { moeda, soDigitos } from "@/lib/dados/util";

/**
 * Pagamento simulado (MVP). Os dados do cartão NÃO são guardados: na versão
 * real, vão direto para o provedor de pagamento (tokenização).
 */
export function Pagamento({ p }: { p: Pedido }) {
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [parcelas, setParcelas] = useState(1);
  const [cartao, setCartao] = useState({ numero: "", validade: "", cvv: "", nome: "" });
  const [erro, setErro] = useState("");
  const [pagando, setPagando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const codigoPix = `00020126AURORACLEAN${p.numero}5204000053039865406${p.total.toFixed(2)}`;

  function pagar() {
    setErro("");
    if (metodo !== "pix") {
      if (soDigitos(cartao.numero).length < 13 || cartao.validade.length < 5 || soDigitos(cartao.cvv).length < 3 || !cartao.nome.trim()) {
        return setErro("Confira os dados do cartão.");
      }
    }
    setPagando(true);
    setTimeout(() => {
      try {
        pagarPedido(p.id, metodo, metodo === "credito" ? parcelas : 1);
      } catch (err) {
        setErro(mensagemDeErro(err));
        setPagando(false);
      }
    }, 900);
  }

  return (
    <Card className="border-2 border-warning/40">
      <h2 className="text-h3">Aprovar e pagar</h2>
      <p className="text-body-sm text-ink-muted mt-1">Confira o laudo abaixo. Gostou do resultado? Conclua o pagamento.</p>

      <div className="mt-4">
        <Opcoes
          rotulo="Forma de pagamento"
          valor={metodo}
          aoMudar={(v) => {
            setMetodo(v as MetodoPagamento);
            setParcelas(1);
          }}
          opcoes={[
            { valor: "pix", rotulo: "Pix" },
            { valor: "credito", rotulo: `Crédito (até ${PARCELAS_MAX}x)` },
            { valor: "debito", rotulo: "Débito" },
          ]}
        />
      </div>

      {metodo === "pix" ? (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 rounded-lg bg-surface-sunken p-4">
          <div className="grid size-32 shrink-0 grid-cols-8 gap-0.5 rounded-md bg-surface-card p-2" aria-label="QR Code Pix (simulado)" role="img">
            {Array.from({ length: 64 }, (_, i) => (
              <span key={i} className={(i * 7 + p.numero) % 3 === 0 || i % 9 === 0 ? "bg-ink" : ""} />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-label">Pix copia e cola</p>
            <p className="text-caption text-ink-muted break-all mt-1">{codigoPix}</p>
            <Botao
              variante="secundario"
              tamanho="sm"
              className="mt-2"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(codigoPix);
                  setCopiado(true);
                } catch {
                  /* área de transferência indisponível */
                }
              }}
            >
              {copiado ? "Copiado!" : "Copiar código"}
            </Botao>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CampoTexto rotulo="Número do cartão" inputMode="numeric" autoComplete="cc-number" value={cartao.numero} onChange={(ev) => setCartao({ ...cartao, numero: soDigitos(ev.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })} />
          </div>
          <CampoTexto rotulo="Validade" placeholder="MM/AA" inputMode="numeric" autoComplete="cc-exp" value={cartao.validade} onChange={(ev) => setCartao({ ...cartao, validade: soDigitos(ev.target.value).slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2") })} />
          <CampoTexto rotulo="CVV" inputMode="numeric" autoComplete="cc-csc" value={cartao.cvv} onChange={(ev) => setCartao({ ...cartao, cvv: soDigitos(ev.target.value).slice(0, 4) })} />
          <div className="sm:col-span-2">
            <CampoTexto rotulo="Nome impresso no cartão" autoComplete="cc-name" value={cartao.nome} onChange={(ev) => setCartao({ ...cartao, nome: ev.target.value.toUpperCase() })} />
          </div>
          {metodo === "credito" && (
            <div className="sm:col-span-2">
              <CampoSelecao rotulo="Parcelas" value={parcelas} onChange={(ev) => setParcelas(Number(ev.target.value))}>
                {Array.from({ length: PARCELAS_MAX }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x de {moeda(p.total / n)} sem juros
                  </option>
                ))}
              </CampoSelecao>
            </div>
          )}
        </div>
      )}

      {erro && (
        <div className="mt-4">
          <Alerta tom="danger" titulo="Pagamento recusado">
            {erro}
          </Alerta>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 text-caption text-ink-muted">
        <Icone nome="verificado" tamanho={20} /> Ambiente de demonstração: nenhum valor é cobrado.
      </div>
      <Botao tamanho="lg" larguraTotal className="mt-3" carregando={pagando} onClick={pagar}>
        {metodo === "pix" ? `Já paguei ${moeda(p.total)}` : `Confirmar e pagar ${moeda(p.total)}`}
      </Botao>
    </Card>
  );
}
