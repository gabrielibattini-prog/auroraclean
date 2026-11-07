"use client";

import { useState } from "react";
import { MeusDados } from "@/components/perfil/MeusDados";
import { ListaAvaliacoes, NotaResumo } from "@/components/avaliacoes/Avaliacoes";
import { avaliacoesDoPrestador } from "@/lib/dados/consultas";
import { CamposArea } from "@/components/prestador/CamposArea";
import { Botao } from "@/components/ui/Botao";
import { Alerta, Card, Selo, TituloPagina } from "@/components/ui/Base";
import { CampoArea } from "@/components/ui/Campos";
import { atualizarAtendimento, mensagemDeErro } from "@/lib/dados/acoes";
import { prestadorDe, usuarioAtual } from "@/lib/dados/acesso";
import { useEstado } from "@/lib/dados/store";

const STATUS = {
  aprovado: { rotulo: "Aprovado", tom: "success" },
  pendente: { rotulo: "Em análise", tom: "warning" },
  reprovado: { rotulo: "Precisa de ajustes", tom: "danger" },
  suspenso: { rotulo: "Suspenso", tom: "danger" },
} as const;

export default function PerfilPrestador() {
  const e = useEstado();
  const u = usuarioAtual(e)!;
  const p = prestadorDe(e, u.id)!;
  const [area, setArea] = useState({ cidade: p.cidade, bairro: p.bairro, raioKm: p.raioKm });
  const [bio, setBio] = useState(p.bio);
  const [aviso, setAviso] = useState<{ tom: "success" | "danger"; texto: string } | null>(null);
  const concluidos = e.pedidos.filter((x) => x.prestadorId === u.id && x.status === "concluido").length;

  return (
    <div className="mx-auto max-w-2xl">
      <TituloPagina
        titulo="Seu perfil"
        subtitulo={`${concluidos} serviços concluídos na Aurora Clean`}
        acao={<Selo tom={STATUS[p.status].tom} icone={p.status === "aprovado" ? "verificado" : undefined}>{STATUS[p.status].rotulo}</Selo>}
      />
      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-h3 mb-4">Área de atendimento</h2>
          <CamposArea {...area} aoMudar={setArea} />
          <div className="mt-4">
            <CampoArea rotulo="Sobre você" value={bio} onChange={(ev) => setBio(ev.target.value)} />
          </div>
          {aviso && (
            <div className="mt-4">
              <Alerta tom={aviso.tom} titulo={aviso.texto} />
            </div>
          )}
          <div className="mt-4">
            <Botao
              variante="terracota"
              onClick={() => {
                try {
                  atualizarAtendimento({ ...area, bio });
                  setAviso({ tom: "success", texto: "Área de atendimento atualizada." });
                } catch (err) {
                  setAviso({ tom: "danger", texto: mensagemDeErro(err) });
                }
              }}
            >
              Salvar área
            </Botao>
          </div>
        </Card>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-h3">O que os clientes dizem</h2>
            <NotaResumo resumo={avaliacoesDoPrestador(e, u.id)} />
          </div>
          <ListaAvaliacoes resumo={avaliacoesDoPrestador(e, u.id)} limite={5} />
        </Card>
        <MeusDados />
      </div>
    </div>
  );
}
