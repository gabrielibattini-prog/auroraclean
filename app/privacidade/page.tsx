import { PaginaSimples } from "@/components/layout/PaginaSimples";
import { DIAS_ACESSO_CONTATO_POS_SERVICO } from "@/lib/dados/catalogo";

/** Resumo em linguagem simples. O texto jurídico completo está em docs/LGPD.md. */
export default function Privacidade() {
  const secoes = [
    {
      t: "Quais dados coletamos",
      c: "Nome, e-mail, celular, endereço do serviço, fotos dos estofados e o registro dos serviços. Do prestador, também CPF, documento com foto e certificado. Não guardamos dados de cartão.",
    },
    {
      t: "Para que usamos",
      c: "Para agendar e executar o serviço, emitir o laudo, mandar lembretes de reimpermeabilização, dar suporte e cumprir obrigações legais.",
    },
    {
      t: "Quem vê o quê",
      c: `Antes do aceite, o prestador vê só o seu primeiro nome, o bairro e uma área aproximada no mapa. Endereço e telefone aparecem depois do aceite e ficam disponíveis até ${DIAS_ACESSO_CONTATO_POS_SERVICO} dias após o serviço. O cliente vê o primeiro nome do prestador depois do aceite; o telefone do prestador fica só com a equipe — para falar sobre o serviço, o cliente usa o WhatsApp ou o suporte da Aurora Clean. A equipe Aurora Clean vê tudo para dar suporte.`,
    },
    {
      t: "Fotos",
      c: "Removemos automaticamente a localização (GPS) gravada nas fotos antes de salvar.",
    },
    {
      t: "Seus direitos",
      c: "Você pode ver, corrigir, baixar (portabilidade) e excluir seus dados a qualquer momento na tela Perfil. Também pode revogar o consentimento para lembretes por e-mail.",
    },
    {
      t: "Por quanto tempo guardamos",
      c: "Enquanto sua conta existir. Ao excluir a conta, apagamos dados pessoais e endereços; laudos e pagamentos ficam anonimizados pelo prazo exigido por lei.",
    },
  ];
  return (
    <PaginaSimples largura="max-w-2xl">
      <h1 className="text-h1 mt-4">Privacidade</h1>
      <p className="text-body text-ink-muted mt-1 mb-6">Em resumo, sem juridiquês. Seguimos a LGPD (Lei nº 13.709/2018).</p>
      <div className="flex flex-col gap-4">
        {secoes.map((s) => (
          <section key={s.t} className="rounded-lg bg-surface-card p-5 shadow-card">
            <h2 className="text-h3">{s.t}</h2>
            <p className="text-body text-ink-muted mt-1">{s.c}</p>
          </section>
        ))}
      </div>
    </PaginaSimples>
  );
}
