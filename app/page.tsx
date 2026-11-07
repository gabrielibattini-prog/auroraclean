"use client";

import Link from "next/link";
import { BotaoLink } from "@/components/ui/Botao";
import { Card } from "@/components/ui/Base";
import { Icone, type NomeIcone } from "@/components/ui/Icone";
import { Logo } from "@/components/layout/Logo";
import { Tutorial } from "@/components/tutorial/Tutorial";
import { useEffect, useState } from "react";
import { INICIO_POR_PAPEL } from "@/components/layout/AreaProtegida";
import { usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";
import { GARANTIA_DIAS } from "@/lib/dados/catalogo";


const DIFERENCIAIS: { icone: NomeIcone; titulo: string; texto: string }[] = [
  { icone: "checklist", titulo: "Protocolo Aurora", texto: "Checklist obrigatório em todo serviço, igual ao da fundadora." },
  { icone: "camera", titulo: "Antes e depois", texto: "Sem fotos, o serviço não é concluído." },
  { icone: "sino", titulo: "Lembrete de proteção", texto: "Avisamos por e-mail quando for hora de impermeabilizar de novo." },
  { icone: "coracao", titulo: `${GARANTIA_DIAS} dias de garantia`, texto: "Você só paga depois de aprovar o resultado." },
];

export default function Inicio() {
  const e = useEstado();
  const u = usuarioAtual(e);
  const [perfilTutorial] = useState<"cliente" | "prestador">(() =>
    new URLSearchParams(window.location.search).get("tutorial") === "prestador" ? "prestador" : "cliente",
  );
  // a página só aparece depois de montar no navegador, então o salto para #como-usar é feito aqui
  useEffect(() => {
    if (window.location.hash === "#como-usar") document.getElementById("como-usar")?.scrollIntoView();
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Logo tamanho={40} comTexto />
        <nav className="flex items-center gap-1">
        <a href="#como-usar" className="hidden sm:inline-flex h-11 items-center px-4 rounded-md text-label text-ink-muted hover:bg-surface-sunken">
          Como usar
        </a>
        {u ? (
          <BotaoLink href={INICIO_POR_PAPEL[u.papel]} tamanho="sm">
            Ir para minha área
          </BotaoLink>
        ) : (
          <Link href="/entrar" className="h-11 inline-flex items-center px-4 rounded-md text-label text-brand-olive-deep hover:bg-brand-olive-soft">
            Entrar
          </Link>
        )}
        </nav>
      </header>

      <main>
        <section className="bg-brand-cream">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:items-center md:py-20">
            <div>
              <p className="text-overline uppercase text-brand-olive-deep">São Paulo e região metropolitana</p>
              <h1 className="text-[40px] leading-[46px] sm:text-display-xl font-bold mt-2">Estofados limpos e protegidos, no padrão Aurora</h1>
              <p className="text-body-lg text-ink-muted mt-4 max-w-xl">
                Higienização e impermeabilização de sofás, colchões e poltronas a domicílio, feitas por uma rede de prestadores treinados pela fundadora.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <BotaoLink href={u?.papel === "cliente" ? "/cliente/pedidos/novo" : "/cadastro"} tamanho="lg" icone="brilho">
                  Solicitar serviço
                </BotaoLink>
                <BotaoLink href="/cadastro/prestador" tamanho="lg" variante="secundario">
                  Quero ser prestador
                </BotaoLink>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="flex size-72 items-center justify-center rounded-full bg-brand-olive shadow-[0_8px_0_var(--brand-olive-deep)]">
                  <Icone nome="sofa" tamanho={64} className="scale-[2.4] icone-claro" />
                </div>
                <span className="absolute -top-4 -right-2"><Icone nome="brilho" tamanho={64} /></span>
                <span className="absolute bottom-2 -left-6 rounded-full bg-surface-card p-3 shadow-card"><Icone nome="gota" tamanho={48} /></span>
              </div>
            </div>
          </div>
        </section>

        <section id="como-usar" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-14">
          <h2 className="text-h1 text-center">Como usar a Aurora Clean</h2>
          <p className="text-body text-ink-muted text-center mt-2 mb-8">Um passo a passo rápido para clientes e prestadores.</p>
          <Tutorial perfilInicial={perfilTutorial} />
        </section>

        <section className="bg-surface-sunken">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-h1 text-center">Por que Aurora Clean</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DIFERENCIAIS.map((d) => (
                <Card key={d.titulo}>
                  <Icone nome={d.icone} tamanho={48} />
                  <h3 className="text-h3 mt-3">{d.titulo}</h3>
                  <p className="text-body-sm text-ink-muted mt-1">{d.texto}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 px-4 pt-8 pb-28 sm:pb-8 sm:pr-24 text-body-sm text-ink-muted">
        <p>© {new Date().getFullYear()} Aurora Clean · São Paulo, SP</p>
        <nav className="flex gap-4">
          <Link href="/ajuda" className="hover:underline">Dúvidas frequentes</Link>
          <Link href="/privacidade" className="hover:underline">Privacidade</Link>
        </nav>
      </footer>
    </div>
  );
}
