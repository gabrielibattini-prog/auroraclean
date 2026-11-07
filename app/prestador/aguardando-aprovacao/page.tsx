"use client";

import { BotaoLink } from "@/components/ui/Botao";
import { Alerta, Card, EstadoVazio } from "@/components/ui/Base";
import { Icone } from "@/components/ui/Icone";
import { DicaTutorial } from "@/components/tutorial/Tutorial";
import { prestadorDe, usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";

export default function AguardandoAprovacao() {
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const p = prestadorDe(e, u.id);

  if (p?.status === "aprovado") {
    return (
      <EstadoVazio
        icone="verificado"
        titulo="Cadastro aprovado!"
        texto="Você já pode ver oportunidades perto de você."
        acao={<BotaoLink href="/prestador/oportunidades" variante="terracota">Ver oportunidades</BotaoLink>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <DicaTutorial usuarioId={u.id} perfil="prestador" />
      {p?.status === "pendente" && (
        <EstadoVazio
          icone="relogio"
          titulo="Recebemos seu cadastro"
          texto="A fundadora está revisando seus documentos. Avisamos por e-mail assim que terminar."
        />
      )}
      {p?.status === "reprovado" && (
        <div className="py-6">
          <Alerta tom="warning" titulo="Seu cadastro precisa de ajustes">
            {p.motivo}
          </Alerta>
        </div>
      )}
      {p?.status === "suspenso" && (
        <div className="py-6">
          <Alerta tom="danger" titulo="Seu cadastro está suspenso">
            {p.motivo} Fale com o suporte para entender os próximos passos.
          </Alerta>
        </div>
      )}

      <Card>
        <h2 className="text-h3 mb-3">O que acontece agora</h2>
        <ol className="flex flex-col gap-3">
          {[
            { icone: "documento" as const, texto: "Conferimos seu documento e o certificado Aurora.", feito: true },
            { icone: "verificado" as const, texto: "A fundadora aprova seu cadastro.", feito: p?.status !== "pendente" },
            { icone: "mapa" as const, texto: "Você passa a ver oportunidades no mapa e nos cards.", feito: false },
          ].map((passo) => (
            <li key={passo.texto} className="flex items-center gap-3">
              <Icone nome={passo.icone} tamanho={32} inativo={!passo.feito} />
              <span className={passo.feito ? "text-ink" : "text-ink-muted"}>{passo.texto}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
