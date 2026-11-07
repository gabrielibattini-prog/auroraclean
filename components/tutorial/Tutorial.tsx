"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Botao, BotaoLink } from "@/components/ui/Botao";
import { Icone, type NomeIcone } from "@/components/ui/Icone";
import { GARANTIA_DIAS, MESES_REIMPERMEABILIZACAO, PARCELAS_MAX } from "@/lib/dados/catalogo";

type Perfil = "cliente" | "prestador";
interface Passo {
  icone: NomeIcone;
  titulo: string;
  texto: string;
  dica?: string;
}

const PASSOS: Record<Perfil, Passo[]> = {
  cliente: [
    { icone: "usuario", titulo: "Crie sua conta", texto: "Só nome, e-mail e celular. Leva menos de um minuto.", dica: "Primeira vez? O cupom AURORA10 dá 10% de desconto." },
    { icone: "sofa", titulo: "Escolha estofados e serviço", texto: "Sofá, poltrona, colchão, cadeiras… Escolha higienização, impermeabilização ou as duas. O preço aparece na hora.", dica: "Dá para colocar vários estofados na mesma ordem de serviço." },
    { icone: "camera", titulo: "Mande fotos e o endereço", texto: "As fotos ajudam o prestador a se preparar. Removemos a localização gravada nelas.", dica: "Antes de aceitar, o prestador vê só seu primeiro nome e o bairro." },
    { icone: "calendario", titulo: "Escolha o dia e o período", texto: "De segunda a sábado: manhã, tarde ou noite. Reagende ou cancele sem custo até 24h antes." },
    { icone: "verificado", titulo: "Um prestador Aurora aceita", texto: "Só profissionais aprovados e treinados no protocolo da fundadora. Acompanhe cada etapa na tela da ordem de serviço." },
    { icone: "laudo", titulo: "Confira o laudo e pague", texto: `Você recebe fotos de antes e depois e o laudo do serviço. Gostou? Pague por Pix ou cartão em até ${PARCELAS_MAX}x.`, dica: `${GARANTIA_DIAS} dias de garantia.` },
    { icone: "repetir", titulo: "Avalie e recontrate", texto: `Avalie o prestador e, na aba Estofados, recontrate em poucos toques. Avisamos por e-mail quando for hora de impermeabilizar de novo (a cada ${MESES_REIMPERMEABILIZACAO} meses).` },
  ],
  prestador: [
    { icone: "certificado", titulo: "Faça seu cadastro", texto: "Envie um documento com foto e o certificado do treinamento Aurora." },
    { icone: "relogio", titulo: "Aguarde a aprovação", texto: "A fundadora revisa cada cadastro com carinho. Você recebe a resposta por e-mail." },
    { icone: "local", titulo: "Defina onde atende", texto: "Escolha o bairro de onde sai e até quantos km quer ir. Dá para mudar quando quiser no Perfil." },
    { icone: "mapa", titulo: "Veja oportunidades", texto: "No mapa ou em cards, com o serviço, a data, o valor, o bairro e o primeiro nome do cliente.", dica: "O endereço e o telefone aparecem só depois que você aceita." },
    { icone: "calendario", titulo: "Aceite e vá até o cliente", texto: "Aceitou? O serviço entra na sua agenda. No dia, toque em “Iniciar serviço”." },
    { icone: "checklist", titulo: "Siga o protocolo Aurora", texto: "Preencha o checklist de cada estofado e tire fotos de antes e depois. Sem elas, o serviço não é concluído." },
    { icone: "estrela", titulo: "Finalize e cresça", texto: "O laudo vai direto para o cliente. Boas avaliações ajudam você a ganhar a confiança dos próximos clientes." },
  ],
};

/** Passo a passo interativo de como usar a plataforma. */
export function Tutorial({ perfilInicial = "cliente" }: { perfilInicial?: Perfil }) {
  const [perfil, setPerfil] = useState<Perfil>(perfilInicial);
  const [i, setI] = useState(0);
  const passos = PASSOS[perfil];
  const p = passos[i];
  const ultimo = i === passos.length - 1;

  return (
    <div data-modo={perfil === "prestador" ? "prestador" : undefined}>
      <div role="tablist" aria-label="Tutorial para" className="mx-auto flex max-w-sm rounded-pill bg-surface-sunken p-1">
        {(["cliente", "prestador"] as Perfil[]).map((x) => (
          <button
            key={x}
            role="tab"
            aria-selected={perfil === x}
            onClick={() => {
              setPerfil(x);
              setI(0);
            }}
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-pill text-label ${perfil === x ? "bg-surface-card shadow-[0_2px_0_var(--line)]" : "text-ink-muted"}`}
          >
            <Icone nome={x === "cliente" ? "casa" : "vassoura"} tamanho={24} inativo={perfil !== x} />
            {x === "cliente" ? "Sou cliente" : "Sou prestador"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr] md:items-start">
        {/* Lista de passos (navegação rápida) */}
        <ol className="hidden md:flex flex-col gap-1" aria-label="Passos">
          {passos.map((x, n) => (
            <li key={x.titulo}>
              <button
                type="button"
                onClick={() => setI(n)}
                aria-current={n === i ? "step" : undefined}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-body-sm ${n === i ? "bg-modo-soft font-semibold text-ink" : "text-ink-muted hover:bg-surface-sunken"}`}
              >
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-bold ${n < i ? "bg-modo text-on-brand" : n === i ? "border-2 border-modo" : "bg-surface-sunken"}`}>
                  {n < i ? "✓" : n + 1}
                </span>
                {x.titulo}
              </button>
            </li>
          ))}
        </ol>

        {/* Passo atual */}
        <div className="rounded-xl bg-surface-card p-6 shadow-card sm:p-8" aria-live="polite">
          <p className="text-overline uppercase text-ink-muted">
            Passo {i + 1} de {passos.length}
          </p>
          <div className="mt-4 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
            <span className="flex size-28 shrink-0 items-center justify-center rounded-full bg-brand-cream">
              <Icone nome={p.icone} tamanho={64} />
            </span>
            <div className="mt-4 sm:mt-2">
              <h3 className="text-h2">{p.titulo}</h3>
              <p className="text-body-lg text-ink-muted mt-2">{p.texto}</p>
              {p.dica && (
                <p className="mt-4 inline-flex items-start gap-2 rounded-md bg-surface-sunken px-3 py-2 text-left text-body-sm">
                  <Icone nome="brilho" tamanho={20} /> {p.dica}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2 md:hidden" aria-hidden>
            {passos.map((x, n) => (
              <span key={x.titulo} className={`h-2 rounded-pill transition-all ${n === i ? "w-6 bg-modo" : "w-2 bg-line"}`} />
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Botao variante="secundario" onClick={() => setI((n) => n - 1)} disabled={i === 0}>
              Anterior
            </Botao>
            {ultimo ? (
              <BotaoLink
                href={perfil === "cliente" ? "/cadastro" : "/cadastro/prestador"}
                variante={perfil === "cliente" ? "primario" : "terracota"}
                className="flex-1"
              >
                {perfil === "cliente" ? "Começar agora" : "Quero ser prestador"}
              </BotaoLink>
            ) : (
              <Botao variante={perfil === "cliente" ? "primario" : "terracota"} className="flex-1" onClick={() => setI((n) => n + 1)}>
                Próximo
              </Botao>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Aviso de primeiro acesso nas áreas logadas; some quando a pessoa fecha. */
export function DicaTutorial({ usuarioId, perfil }: { usuarioId: string; perfil: Perfil }) {
  const chave = `aurora-tutorial-visto-${usuarioId}`;
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    try {
      setVisivel(localStorage.getItem(chave) !== "1");
    } catch {
      setVisivel(true);
    }
  }, [chave]);
  if (!visivel) return null;
  const fechar = () => {
    try {
      localStorage.setItem(chave, "1");
    } catch {
      /* sem armazenamento: some só nesta visita */
    }
    setVisivel(false);
  };
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg bg-brand-cream p-4">
      <Icone nome="brilho" tamanho={40} />
      <div className="min-w-0 flex-1">
        <p className="text-label">Primeira vez aqui?</p>
        <p className="text-body-sm text-ink-muted">
          Veja o{" "}
          <Link href={`/?tutorial=${perfil}#como-usar`} className="font-semibold text-brand-olive-deep underline" onClick={fechar}>
            passo a passo de como usar
          </Link>
          .
        </p>
      </div>
      <button type="button" onClick={fechar} className="size-10 shrink-0 rounded-full text-h3 text-ink-muted hover:bg-surface-card/60" aria-label="Fechar dica">
        ×
      </button>
    </div>
  );
}
