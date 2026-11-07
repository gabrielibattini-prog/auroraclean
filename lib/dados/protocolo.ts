import type { Servico, ValorResposta } from "./tipos";
import { incluiImpermeabilizacao } from "./catalogo";

/**
 * Checklist do Protocolo Aurora (versão 1).
 * No back-end isto vira a tabela checklist_modelo, editável pela admin.
 */
export const VERSAO_PROTOCOLO = 1;

export type TipoPergunta = "opcao" | "multipla" | "confirmacao" | "texto";

export interface PerguntaProtocolo {
  id: string;
  secao: "Avaliação" | "Execução" | "Finalização";
  pergunta: string;
  ajuda?: string;
  tipo: TipoPergunta;
  opcoes?: string[];
  obrigatoria: boolean;
  /** só aparece quando o serviço inclui impermeabilização */
  soImpermeabilizacao?: boolean;
}

export const PROTOCOLO: PerguntaProtocolo[] = [
  {
    id: "tecido",
    secao: "Avaliação",
    pergunta: "Qual é o tecido?",
    tipo: "opcao",
    opcoes: ["Suede", "Linho", "Veludo", "Chenille", "Courino", "Microfibra", "Algodão", "Outro"],
    obrigatoria: true,
  },
  {
    id: "estado",
    secao: "Avaliação",
    pergunta: "Estado geral do estofado",
    tipo: "opcao",
    opcoes: ["Bom", "Regular", "Desgastado"],
    obrigatoria: true,
  },
  {
    id: "manchas",
    secao: "Avaliação",
    pergunta: "Manchas encontradas",
    ajuda: "Marque todas que encontrar.",
    tipo: "multipla",
    opcoes: ["Nenhuma", "Alimento", "Bebida", "Gordura", "Urina/pet", "Tinta/caneta", "Mofo", "Sangue"],
    obrigatoria: true,
  },
  {
    id: "teste_cor",
    secao: "Avaliação",
    pergunta: "Teste de solidez de cor feito em área escondida",
    tipo: "confirmacao",
    obrigatoria: true,
  },
  {
    id: "aspiracao",
    secao: "Execução",
    pergunta: "Aspiração a seco antes da limpeza",
    tipo: "confirmacao",
    obrigatoria: true,
  },
  {
    id: "pre_tratamento",
    secao: "Execução",
    pergunta: "Pré-tratamento das manchas",
    tipo: "confirmacao",
    obrigatoria: true,
  },
  {
    id: "produtos",
    secao: "Execução",
    pergunta: "Produtos usados e diluição",
    ajuda: "Ex.: detergente neutro 1:20, enzimático pet 1:10.",
    tipo: "texto",
    obrigatoria: true,
  },
  {
    id: "extracao",
    secao: "Execução",
    pergunta: "Extração a vácuo e enxágue",
    tipo: "confirmacao",
    obrigatoria: true,
  },
  {
    id: "impermeabilizante",
    secao: "Execução",
    pergunta: "Impermeabilizante aplicado em camada uniforme",
    tipo: "confirmacao",
    obrigatoria: true,
    soImpermeabilizacao: true,
  },
  {
    id: "secagem",
    secao: "Finalização",
    pergunta: "Tempo de secagem orientado ao cliente",
    tipo: "opcao",
    opcoes: ["2 a 4 horas", "4 a 6 horas", "6 a 12 horas"],
    obrigatoria: true,
  },
  {
    id: "observacoes",
    secao: "Finalização",
    pergunta: "Observações para o cliente",
    ajuda: "Manchas que não saíram, cuidados especiais, recomendações.",
    tipo: "texto",
    obrigatoria: false,
  },
];

export function perguntasPara(servico: Servico) {
  return PROTOCOLO.filter((p) => !p.soImpermeabilizacao || incluiImpermeabilizacao(servico));
}

export function respondida(p: PerguntaProtocolo, v: ValorResposta | undefined) {
  if (p.tipo === "confirmacao") return v === true;
  if (p.tipo === "multipla") return Array.isArray(v) && v.length > 0;
  return typeof v === "string" && v.trim().length > 0;
}

export function pendencias(servico: Servico, respostas: Record<string, ValorResposta>) {
  return perguntasPara(servico).filter((p) => p.obrigatoria && !respondida(p, respostas[p.id]));
}

export function formatarResposta(p: PerguntaProtocolo, v: ValorResposta | undefined) {
  if (p.tipo === "confirmacao") return v === true ? "Feito" : "Não feito";
  if (Array.isArray(v)) return v.join(", ");
  return (v as string) || "—";
}
