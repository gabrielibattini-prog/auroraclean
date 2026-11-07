"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card } from "@/components/ui/Base";
import { CampoTexto } from "@/components/ui/Campos";
import { Dialogo } from "@/components/ui/Dialogo";
import { atualizarPerfil, excluirConta, exportarMeusDados, mensagemDeErro } from "@/lib/dados/acoes";
import { usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";
import { mascaraTelefone } from "@/lib/dados/util";

/** Dados pessoais + direitos do titular (LGPD): acesso/portabilidade e eliminação. */
export function MeusDados() {
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const router = useRouter();
  const [nome, setNome] = useState(u.nome);
  const [telefone, setTelefone] = useState(u.telefone);
  const [aviso, setAviso] = useState<{ tom: "success" | "danger"; texto: string } | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  function salvar() {
    try {
      atualizarPerfil({ nome, telefone });
      setAviso({ tom: "success", texto: "Dados atualizados." });
    } catch (err) {
      setAviso({ tom: "danger", texto: mensagemDeErro(err) });
    }
  }

  function baixar() {
    const blob = new Blob([JSON.stringify(exportarMeusDados(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-dados-aurora-clean.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function excluir() {
    try {
      excluirConta();
      router.push("/");
    } catch (err) {
      setConfirmarExclusao(false);
      setAviso({ tom: "danger", texto: mensagemDeErro(err) });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-h3 mb-4">Seus dados</h2>
        <div className="flex flex-col gap-4">
          <CampoTexto rotulo="Nome completo" value={nome} onChange={(ev) => setNome(ev.target.value)} />
          <CampoTexto rotulo="E-mail" value={u.email} disabled dica="Para trocar o e-mail, fale com o suporte." />
          <CampoTexto rotulo="Celular" type="tel" value={telefone} onChange={(ev) => setTelefone(mascaraTelefone(ev.target.value))} />
          {aviso && <Alerta tom={aviso.tom} titulo={aviso.texto} />}
          <div>
            <Botao onClick={salvar}>Salvar alterações</Botao>
          </div>
        </div>
      </Card>

      {u.papel !== "admin" && (
        <Card>
          <h2 className="text-h3">Privacidade</h2>
          <p className="text-body-sm text-ink-muted mt-1">
            Você controla seus dados. Saiba mais na{" "}
            <Link href="/privacidade" className="underline text-brand-olive-deep">
              política de privacidade
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Botao variante="secundario" icone="documento" onClick={baixar}>
              Baixar meus dados
            </Botao>
            <Botao variante="fantasma" className="text-danger" onClick={() => setConfirmarExclusao(true)}>
              Excluir minha conta
            </Botao>
          </div>
        </Card>
      )}

      <Dialogo
        aberto={confirmarExclusao}
        aoFechar={() => setConfirmarExclusao(false)}
        titulo="Excluir sua conta?"
        acoes={
          <>
            <Botao variante="secundario" onClick={() => setConfirmarExclusao(false)}>
              Manter conta
            </Botao>
            <Botao variante="perigo" onClick={excluir}>
              Excluir conta
            </Botao>
          </>
        }
      >
        Apagamos seus dados pessoais e endereços. Laudos e pagamentos ficam guardados de forma anônima pelo prazo exigido por lei.
      </Dialogo>
    </div>
  );
}
