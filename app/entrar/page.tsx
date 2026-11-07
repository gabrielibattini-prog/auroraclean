"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { PaginaSimples } from "@/components/layout/PaginaSimples";
import { INICIO_POR_PAPEL } from "@/components/layout/AreaProtegida";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card } from "@/components/ui/Base";
import { CampoTexto } from "@/components/ui/Campos";
import { entrar, mensagemDeErro } from "@/lib/dados/acoes";
import { reiniciarDemo } from "@/lib/dados/store";

const CONTAS_DEMO = [
  { email: "carla@exemplo.com", rotulo: "Cliente (Carla)" },
  { email: "marlene@exemplo.com", rotulo: "Prestador aprovado (Marlene)" },
  { email: "joao@exemplo.com", rotulo: "Prestador em análise (João)" },
  { email: "admin@auroraclean.com.br", rotulo: "Admin (fundadora)" },
];

function FormEntrar() {
  const router = useRouter();
  const volta = useSearchParams().get("volta");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function concluir(emailUsado: string, senhaUsada: string) {
    try {
      const u = entrar(emailUsado, senhaUsada);
      const destino = volta && volta.startsWith(`/${u.papel}`) ? volta : INICIO_POR_PAPEL[u.papel];
      router.push(destino);
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  function enviar(ev: FormEvent) {
    ev.preventDefault();
    setErro("");
    concluir(email, senha);
  }

  return (
    <PaginaSimples>
      <h1 className="text-h1 mt-4">Que bom te ver!</h1>
      <p className="text-body text-ink-muted mt-1">Entre para acompanhar seus serviços.</p>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4" noValidate>
        <CampoTexto rotulo="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <CampoTexto rotulo="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        {erro && <Alerta tom="danger" titulo={erro} />}
        <Botao type="submit" tamanho="lg" larguraTotal>
          Entrar
        </Botao>
      </form>

      <p className="text-body-sm text-center text-ink-muted mt-6">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-olive-deep underline">
          Criar conta
        </Link>
      </p>

      <Card className="mt-10 bg-surface-sunken shadow-none">
        <p className="text-overline uppercase text-ink-muted">Demonstração</p>
        <p className="text-body-sm text-ink-muted mt-1">Este MVP usa contas de teste. Toque para entrar direto:</p>
        <div className="mt-3 grid gap-2">
          {CONTAS_DEMO.map((c) => (
            <Botao key={c.email} variante="secundario" tamanho="sm" larguraTotal onClick={() => concluir(c.email, "demo123")}>
              {c.rotulo}
            </Botao>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            reiniciarDemo();
            setErro("");
          }}
          className="mt-4 text-caption text-ink-muted underline"
        >
          Restaurar dados de demonstração
        </button>
      </Card>
    </PaginaSimples>
  );
}

export default function PaginaEntrar() {
  return (
    <Suspense>
      <FormEntrar />
    </Suspense>
  );
}
