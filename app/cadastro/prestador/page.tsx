"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PaginaSimples } from "@/components/layout/PaginaSimples";
import { CamposArea } from "@/components/prestador/CamposArea";
import { Botao } from "@/components/ui/Botao";
import { Alerta } from "@/components/ui/Base";
import { CampoArea, CampoTexto, Confirmacao } from "@/components/ui/Campos";
import { EnvioArquivo } from "@/components/ui/EnvioArquivo";
import { Icone } from "@/components/ui/Icone";
import { Passos } from "@/components/ui/Passos";
import { cadastrarPrestador, mensagemDeErro } from "@/lib/dados/acoes";
import type { ArquivoRef } from "@/lib/dados/tipos";
import { emailValido, mascaraCpf, mascaraTelefone, soDigitos } from "@/lib/dados/util";

const PASSOS = ["Seus dados", "Onde atende", "Documentos"];

export default function CadastroPrestador() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [erro, setErro] = useState("");
  const [d, setD] = useState({ nome: "", email: "", telefone: "", cpf: "", senha: "", bio: "" });
  const [area, setArea] = useState({ cidade: "São Paulo", bairro: "Pinheiros", raioKm: 10 });
  const [documento, setDocumento] = useState<ArquivoRef>();
  const [certificado, setCertificado] = useState<ArquivoRef>();
  const [aceite, setAceite] = useState(false);

  const mudar = (campo: keyof typeof d) => (v: string) => setD((x) => ({ ...x, [campo]: v }));

  function avancar() {
    setErro("");
    if (passo === 0) {
      if (d.nome.trim().split(/\s+/).length < 2) return setErro("Informe nome e sobrenome.");
      if (!emailValido(d.email)) return setErro("Informe um e-mail válido.");
      if (soDigitos(d.telefone).length < 10) return setErro("Informe o celular com DDD.");
      if (soDigitos(d.cpf).length !== 11) return setErro("Informe um CPF válido.");
      if (d.senha.length < 6) return setErro("A senha precisa de pelo menos 6 caracteres.");
    }
    setPasso((p) => p + 1);
  }

  function concluir() {
    setErro("");
    try {
      cadastrarPrestador({ ...d, ...area, documento, certificado, aceiteTermos: aceite });
      router.push("/prestador/aguardando-aprovacao");
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  return (
    <PaginaSimples>
      <div data-modo="prestador">
        <h1 className="text-h1 mt-4">Seja um prestador Aurora</h1>
        <p className="text-body text-ink-muted mt-1 mb-6">
          A fundadora revisa cada cadastro. Depois de aprovado, você recebe oportunidades perto de você.
        </p>
        <Passos passos={PASSOS} atual={passo} />

        {passo === 0 && (
          <div className="flex flex-col gap-4">
            <CampoTexto rotulo="Nome completo" autoComplete="name" value={d.nome} onChange={(e) => mudar("nome")(e.target.value)} />
            <CampoTexto rotulo="E-mail" type="email" autoComplete="email" value={d.email} onChange={(e) => mudar("email")(e.target.value)} />
            <CampoTexto rotulo="Celular" type="tel" inputMode="numeric" placeholder="(11) 90000-0000" value={d.telefone} onChange={(e) => mudar("telefone")(mascaraTelefone(e.target.value))} />
            <CampoTexto rotulo="CPF" inputMode="numeric" placeholder="000.000.000-00" value={d.cpf} onChange={(e) => mudar("cpf")(mascaraCpf(e.target.value))} dica="Usado só para verificar sua identidade." />
            <CampoTexto rotulo="Senha" type="password" autoComplete="new-password" value={d.senha} onChange={(e) => mudar("senha")(e.target.value)} />
            <CampoArea rotulo="Conte sobre sua experiência" opcional value={d.bio} onChange={(e) => mudar("bio")(e.target.value)} placeholder="Há quanto tempo trabalha com estofados, cursos que fez…" />
          </div>
        )}

        {passo === 1 && <CamposArea {...area} aoMudar={setArea} />}

        {passo === 2 && (
          <div className="flex flex-col gap-4">
            <EnvioArquivo rotulo="Documento com foto" dica="RG ou CNH, foto ou PDF" icone="documento" arquivo={documento} aoMudar={setDocumento} />
            <EnvioArquivo rotulo="Certificado Aurora" dica="Certificado do treinamento no protocolo" icone="certificado" arquivo={certificado} aoMudar={setCertificado} />
            <div className="flex gap-3 rounded-lg bg-surface-sunken p-4 text-body-sm text-ink-muted">
              <Icone nome="verificado" tamanho={32} />
              <p>Seus documentos ficam guardados com segurança e só a equipe Aurora Clean vê.</p>
            </div>
            <Confirmacao marcado={aceite} aoMudar={setAceite}>
              Aceito os termos, a{" "}
              <Link href="/privacidade" target="_blank" className="underline text-brand-olive-deep">
                política de privacidade
              </Link>{" "}
              e sigo o protocolo Aurora em todo serviço.
            </Confirmacao>
          </div>
        )}

        {erro && (
          <div className="mt-4">
            <Alerta tom="danger" titulo={erro} />
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {passo > 0 && (
            <Botao variante="secundario" tamanho="lg" onClick={() => setPasso((p) => p - 1)}>
              Voltar
            </Botao>
          )}
          {passo < PASSOS.length - 1 ? (
            <Botao tamanho="lg" larguraTotal onClick={avancar}>
              Continuar
            </Botao>
          ) : (
            <Botao tamanho="lg" variante="terracota" larguraTotal onClick={concluir}>
              Enviar para aprovação
            </Botao>
          )}
        </div>

        <p className="text-body-sm text-center text-ink-muted mt-6">
          Quer contratar um serviço?{" "}
          <Link href="/cadastro" className="font-semibold text-brand-olive-deep underline">
            Criar conta de cliente
          </Link>
        </p>
      </div>
    </PaginaSimples>
  );
}
