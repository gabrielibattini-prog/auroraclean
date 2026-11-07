import Link from "next/link";
import { Icone } from "@/components/ui/Icone";
import { SERVICOS } from "@/lib/dados/catalogo";
import type { Laudo } from "@/lib/dados/tipos";
import { dataLonga } from "@/lib/dados/util";

export function ListaLaudos({ laudos, base }: { laudos: Laudo[]; base: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {laudos.map((l) => (
        <li key={l.id}>
          <Link href={`${base}/${l.id}`} className="flex items-center gap-3 rounded-lg border-2 border-line bg-surface-card p-3 hover:bg-surface-sunken">
            <Icone nome="laudo" tamanho={40} />
            <span className="min-w-0 flex-1">
              <span className="block text-label">
                Laudo nº {l.numero} · {l.conteudo.estofado}
              </span>
              <span className="block text-body-sm text-ink-muted">
                {SERVICOS[l.conteudo.servico].curto} · {dataLonga(l.emitidoEm)}
              </span>
            </span>
            <span className="text-label text-brand-olive-deep">Ver</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
