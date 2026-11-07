import { PaginaSimples } from "@/components/layout/PaginaSimples";
import { BotaoLink } from "@/components/ui/Botao";
import { GARANTIA_DIAS, HORAS_MINIMAS_REAGENDAR, MESES_REIMPERMEABILIZACAO, PARCELAS_MAX } from "@/lib/dados/catalogo";

const PERGUNTAS = [
  {
    p: "Quanto tempo dura o serviço?",
    r: "Depende do tipo e da quantidade de peças. Em média, sofás levam de 1h a 2h e colchões de 40 min a 1h.",
  },
  {
    p: "O estofado fica molhado depois da limpeza?",
    r: "Usamos extração a vácuo, que tira a umidade durante o processo. O estofado fica levemente úmido e seca em 2 a 4 horas.",
  },
  {
    p: "Como acompanho minha ordem de serviço?",
    r: "Na tela da ordem de serviço você vê cada etapa: solicitado, prestador confirmado, em andamento, sua aprovação e concluído.",
  },
  {
    p: "Posso reagendar ou cancelar?",
    r: `Sim, sozinho e sem custo, até ${HORAS_MINIMAS_REAGENDAR}h antes do serviço. Depois disso, fale com a equipe pela tela da ordem de serviço.`,
  },
  {
    p: "Quando eu pago?",
    r: `Só depois do serviço, quando você confere o laudo com fotos e aprova o resultado. Pix, débito ou crédito em até ${PARCELAS_MAX}x sem juros.`,
  },
  {
    p: "Vocês têm garantia?",
    r: `Sim, ${GARANTIA_DIAS} dias. Se não gostar do resultado, abra uma disputa na tela da ordem de serviço: a fundadora analisa o prontuário e, se for o caso, refazemos ou devolvemos o valor.`,
  },
  {
    p: "O que é o prontuário do estofado?",
    r: "É o registro de cada serviço: tecido, manchas, produtos usados e fotos de antes e depois. Ele fica salvo no histórico do seu estofado.",
  },
  {
    p: "De quanto em quanto tempo devo impermeabilizar?",
    r: `A cada ${MESES_REIMPERMEABILIZACAO} meses, em média. A gente te lembra por e-mail quando estiver chegando a hora.`,
  },
  {
    p: "Quais regiões vocês atendem?",
    r: "São Paulo e região metropolitana, incluindo Barueri, Santana de Parnaíba, Cajamar, Caieiras, Osasco, ABC e Guarulhos.",
  },
  {
    p: "O prestador vê meu endereço?",
    r: "Só depois de aceitar o serviço. Antes disso ele vê apenas seu primeiro nome, o bairro e uma área aproximada no mapa.",
  },
];

export default function Ajuda() {
  return (
    <PaginaSimples largura="max-w-2xl">
      <h1 className="text-h1 mt-4">Dúvidas frequentes</h1>
      <p className="text-body text-ink-muted mt-1 mb-6">Tudo o que você precisa saber antes e depois do seu serviço.</p>
      <div className="flex flex-col gap-3">
        {PERGUNTAS.map((q) => (
          <details key={q.p} className="group rounded-lg bg-surface-card shadow-card">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-[16px] font-semibold">
              {q.p}
              <span aria-hidden className="text-h2 text-brand-olive transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-body text-ink-muted">{q.r}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 rounded-xl bg-brand-cream p-6 text-center">
        <p className="text-h3">Ainda com dúvida?</p>
        <p className="text-body-sm text-ink-muted mt-1">Entre na sua conta e fale com a equipe pela tela da ordem de serviço.</p>
        <BotaoLink href="/entrar" className="mt-4">
          Entrar
        </BotaoLink>
      </div>
    </PaginaSimples>
  );
}
