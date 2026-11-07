import { nomeDoUsuario } from "@/lib/dados/consultas";
import type { Estado } from "@/lib/dados/tipos";
import { dataHora } from "@/lib/dados/util";

/** Registro de eventos do pedido (usado na mediação). */
export function Historico({ e, pedidoId }: { e: Estado; pedidoId: string }) {
  const eventos = e.eventos.filter((x) => x.pedidoId === pedidoId).sort((a, b) => a.em.localeCompare(b.em));
  if (!eventos.length) return <p className="text-body-sm text-ink-muted">Sem registros ainda.</p>;
  return (
    <ol className="flex flex-col gap-3">
      {eventos.map((ev) => (
        <li key={ev.id} className="flex gap-3 text-body-sm">
          <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-brand-olive" aria-hidden />
          <div>
            <p>{ev.texto}</p>
            <p className="text-caption text-ink-muted">
              {dataHora(ev.em)} · {nomeDoUsuario(e, ev.autorId)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
