"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PaginaSimples } from "@/components/layout/PaginaSimples";
import { Botao } from "@/components/ui/Botao";
import { Alerta } from "@/components/ui/Base";
import { CampoTexto, Confirmacao } from "@/components/ui/Campos";
import { Icone } from "@/components/ui/Icone";
import { cadastrarCliente, mensagemDeErro } from "@/lib/dados/acoes";
import { mascaraTelefone } from "@/lib/dados/util";

/** Cadastro com o seletor de perfil do guia (RoleSwitch). */
export default function PaginaCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState("");

  function enviar(ev: FormEvent) {
    ev.preventDefault();
    setErro("");
    try {
      cadastrarCliente({ nome, email, telefone, senha, aceiteTermos: aceite });
      router.push("/cliente/pedidos/novo");
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  return (
    <PaginaSimples>
      <h1 className="text-h1 mt-4">Criar conta</h1>

      <div role="tablist" aria-label="Tipo de conta" className="mt-5 flex rounded-pill bg-surface-sunken p-1">
        <span role="tab" aria-selected className="flex flex-1 items-center justify-center gap-2 h-10 rounded-pill bg-surface-card text-label shadow-[0_2px_0_var(--line)]">
          <Icone nome="casa" tamanho={24} /> Sou cliente
        </span>
        <Link role="tab" aria-selected={false} href="/cadastro/prestador" className="flex flex-1 items-center justify-center gap-2 h-10 rounded-pill text-label text-ink-muted">
          <Icone nome="vassoura" tamanho={24} inativo /> Sou prestador
        </Link>
      </div>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4" noValidate>
        <CampoTexto rotulo="Nome completo" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} />
        <CampoTexto rotulo="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} dica="Enviamos o laudo e os lembretes para este e-mail." />
        <CampoTexto
          rotulo="Celular"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(11) 90000-0000"
          value={telefone}
          onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
          dica="Só o prestador do seu serviço vê, depois de aceitar."
        />
        <CampoTexto rotulo="Senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} dica="Pelo menos 6 caracteres." />
        <Confirmacao marcado={aceite} aoMudar={setAceite}>
          Li e aceito os termos de uso e a{" "}
          <Link href="/privacidade" target="_blank" className="underline text-brand-olive-deep">
            política de privacidade
          </Link>
          .
        </Confirmacao>
        {erro && <Alerta tom="danger" titulo={erro} />}
        <Botao type="submit" tamanho="lg" larguraTotal>
          Criar conta
        </Botao>
      </form>
      <p className="text-body-sm text-center text-ink-muted mt-6">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-brand-olive-deep underline">
          Entrar
        </Link>
      </p>
    </PaginaSimples>
  );
}
