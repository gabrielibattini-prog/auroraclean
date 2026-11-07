"use client";

import { Botao } from "@/components/ui/Botao";
import { Card, LinhaInfo, Selo } from "@/components/ui/Base";
import { Icone } from "@/components/ui/Icone";
import { ESTOFADOS, PERIODOS, SERVICOS, TECIDOS } from "@/lib/dados/catalogo";
import type { OportunidadePublica } from "@/lib/dados/consultas";
import { dataCurta, moeda } from "@/lib/dados/util";

/** JobCard do guia — mostra só dados não identificáveis do cliente. */
export function CardOportunidade({
  o,
  aoAceitar,
  aoOcultar,
  destacado,
  compacto,
}: {
  o: OportunidadePublica;
  aoAceitar: () => void;
  aoOcultar?: () => void;
  destacado?: boolean;
  compacto?: boolean;
}) {
  const principal = o.itens[0];
  const nova = Date.now() - new Date(o.criadoEm).getTime() < 864e5;
  return (
    <Card className={`flex flex-col ${destacado ? "ring-[3px] ring-accent-clay" : ""}`}>
      <div className="flex items-start gap-3">
        <Icone nome={ESTOFADOS[principal.tipo].icone} tamanho={48} />
        <div className="min-w-0 flex-1">
          <h3 className="text-h3">
            {o.itens.length > 1 ? `${o.itens.length} estofados` : ESTOFADOS[principal.tipo].nome}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {nova && <Selo tom="clay">Nova solicitação</Selo>}
            {o.pet && (
              <Selo tom="neutral" icone="pet">
                Pet
              </Selo>
            )}
          </div>
        </div>
        <span className="text-[20px] font-bold whitespace-nowrap">{moeda(o.valor)}</span>
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-body-sm">
        {o.itens.map((i, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Icone nome={SERVICOS[i.servico].icone} tamanho={20} />
            <span>
              {i.apelido} · {SERVICOS[i.servico].curto} · {TECIDOS[i.tecido].nome.toLowerCase()}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-col gap-1">
        <LinhaInfo icone="calendario">
          {dataCurta(o.data)} · {PERIODOS[o.periodo].nome} ({PERIODOS[o.periodo].faixa})
        </LinhaInfo>
        <LinhaInfo icone="local">
          {o.bairro}, {o.cidade} (~{o.distanciaKm} km)
        </LinhaInfo>
        <LinhaInfo icone="usuario">Cliente: {o.clientePrimeiroNome}</LinhaInfo>
        {o.qtdFotos > 0 && <LinhaInfo icone="camera">{o.qtdFotos} foto(s) do cliente</LinhaInfo>}
      </div>
      {!compacto && o.observacoes && <p className="mt-3 rounded-md bg-surface-sunken p-3 text-body-sm">“{o.observacoes}”</p>}

      {/* espaço extra embaixo para a base 3D dos botões não encostar na borda do card */}
      <div className="mt-auto flex gap-3 pt-5 pb-1">
        {aoOcultar && (
          <Botao variante="secundario" className="shrink-0" onClick={aoOcultar}>
            Ocultar
          </Botao>
        )}
        <Botao variante="terracota" className="min-w-0 flex-1" onClick={aoAceitar}>
          Aceitar
        </Botao>
      </div>
    </Card>
  );
}
