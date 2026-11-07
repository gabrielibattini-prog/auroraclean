"use client";

import { CampoSelecao } from "@/components/ui/Campos";
import { CIDADES, bairrosDe } from "@/lib/geo";

/** Cidade, bairro-base e raio de atendimento do prestador. */
export function CamposArea({
  cidade,
  bairro,
  raioKm,
  aoMudar,
}: {
  cidade: string;
  bairro: string;
  raioKm: number;
  aoMudar: (v: { cidade: string; bairro: string; raioKm: number }) => void;
}) {
  const bairros = bairrosDe(cidade);
  return (
    <div className="flex flex-col gap-4">
      <CampoSelecao
        rotulo="Cidade"
        value={cidade}
        onChange={(e) => aoMudar({ cidade: e.target.value, bairro: bairrosDe(e.target.value)[0], raioKm })}
      >
        {CIDADES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </CampoSelecao>
      <CampoSelecao
        rotulo="Bairro de onde você sai"
        value={bairro}
        onChange={(e) => aoMudar({ cidade, bairro: e.target.value, raioKm })}
        dica="Usamos só para calcular a distância. Ninguém vê essa informação."
      >
        {bairros.map((b) => (
          <option key={b}>{b}</option>
        ))}
      </CampoSelecao>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="raio" className="text-label">
            Até onde você atende
          </label>
          <span className="text-h3 text-modo">{raioKm} km</span>
        </div>
        <input
          id="raio"
          type="range"
          min={2}
          max={50}
          step={1}
          value={raioKm}
          onChange={(e) => aoMudar({ cidade, bairro, raioKm: Number(e.target.value) })}
          className="mt-3 w-full h-3 accent-[var(--modo-acento)]"
        />
        <div className="flex justify-between text-caption text-ink-muted mt-1">
          <span>2 km</span>
          <span>50 km</span>
        </div>
      </div>
    </div>
  );
}
