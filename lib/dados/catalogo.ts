import type { NomeIcone } from "@/components/ui/Icone";
import type { Periodo, Servico, StatusPedido, StatusPrestador, Tecido, TipoEstofado } from "./tipos";

/**
 * Tabela fixa de preços.
 * ATENÇÃO: valores PROVISÓRIOS — substituir pela tabela oficial da Aurora Clean.
 */
export const PRECO_HIGIENIZACAO: Record<TipoEstofado, number> = {
  sofa_2: 180,
  sofa_3: 230,
  sofa_retratil: 280,
  sofa_canto: 320,
  poltrona: 100,
  cadeira: 40,
  colchao_solteiro: 130,
  colchao_casal: 180,
  colchao_queen_king: 220,
  cabeceira: 90,
  puff: 50,
};

/** impermeabilização sozinha = 90% da higienização; combo = higienização + 70% */
export const FATOR_SERVICO: Record<Servico, number> = {
  higienizacao: 1,
  impermeabilizacao: 0.9,
  combo: 1.7,
};

/** tecidos naturais exigem produto específico (+15%, conforme o site oficial: +15–20%) */
export const ACRESCIMO_TECIDO_NATURAL = 0.15;
export const ADICIONAL_PET = 70;
export const CUPOM_PRIMEIRO_SERVICO = { codigo: "AURORA10", percentual: 0.1 };
export const GARANTIA_DIAS = 7;
export const MESES_REIMPERMEABILIZACAO = 12;
export const DIAS_ACESSO_CONTATO_POS_SERVICO = 7;
export const HORAS_MINIMAS_REAGENDAR = 24;
export const PARCELAS_MAX = 3;

/** WhatsApp oficial da Aurora Clean (atendimento ao cliente). */
export const WHATSAPP_AURORA = { numero: "5511925958991", exibicao: "(11) 92595-8991" };

export function precoItem(tipo: TipoEstofado, servico: Servico, tecido: Tecido) {
  const base = PRECO_HIGIENIZACAO[tipo] * FATOR_SERVICO[servico];
  const comTecido = tecido === "natural" ? base * (1 + ACRESCIMO_TECIDO_NATURAL) : base;
  return Math.round(comTecido);
}

export const ESTOFADOS: Record<TipoEstofado, { nome: string; icone: NomeIcone }> = {
  sofa_2: { nome: "Sofá 2 lugares", icone: "sofa" },
  sofa_3: { nome: "Sofá 3 lugares", icone: "sofa" },
  sofa_retratil: { nome: "Sofá retrátil", icone: "sofa" },
  sofa_canto: { nome: "Sofá de canto", icone: "sofa" },
  poltrona: { nome: "Poltrona", icone: "poltrona" },
  cadeira: { nome: "Cadeira estofada", icone: "cadeira" },
  colchao_solteiro: { nome: "Colchão solteiro", icone: "colchao" },
  colchao_casal: { nome: "Colchão casal", icone: "colchao" },
  colchao_queen_king: { nome: "Colchão queen/king", icone: "colchao" },
  cabeceira: { nome: "Cabeceira", icone: "colchao" },
  puff: { nome: "Puff", icone: "poltrona" },
};

export const SERVICOS: Record<Servico, { nome: string; curto: string; descricao: string; icone: NomeIcone }> = {
  higienizacao: {
    nome: "Higienização",
    curto: "Higienização",
    descricao: "Limpeza profunda com extração a vácuo. Remove ácaros, fungos e odores.",
    icone: "spray",
  },
  impermeabilizacao: {
    nome: "Impermeabilização",
    curto: "Impermeabilização",
    descricao: "Proteção contra líquidos e manchas. Indicada a cada 12 meses.",
    icone: "gota",
  },
  combo: {
    nome: "Higienização + impermeabilização",
    curto: "Combo",
    descricao: "Limpa e protege na mesma visita, com desconto.",
    icone: "brilho",
  },
};

export function incluiImpermeabilizacao(s: Servico) {
  return s === "impermeabilizacao" || s === "combo";
}

export const TECIDOS: Record<Tecido, { nome: string; exemplos: string }> = {
  sintetico: { nome: "Sintético", exemplos: "Suede, courino, microfibra, nylon, poliéster" },
  natural: { nome: "Natural", exemplos: "Linho, veludo, algodão, seda (+15%)" },
};

export const PERIODOS: Record<Periodo, { nome: string; faixa: string }> = {
  manha: { nome: "Manhã", faixa: "08h às 13h" },
  tarde: { nome: "Tarde", faixa: "14h às 16h" },
  noite: { nome: "Noite", faixa: "17h às 19h" },
};

export const STATUS_PEDIDO: Record<
  StatusPedido,
  { nome: string; tom: "brand" | "clay" | "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  aberto: { nome: "Procurando prestador", tom: "clay" },
  aceito: { nome: "Prestador confirmado", tom: "info" },
  em_execucao: { nome: "Em andamento", tom: "brand" },
  aguardando_pagamento: { nome: "Aguardando pagamento", tom: "warning" },
  concluido: { nome: "Concluído", tom: "success" },
  cancelado: { nome: "Cancelado", tom: "danger" },
  em_disputa: { nome: "Em mediação", tom: "warning" },
};

export const STATUS_PRESTADOR: Record<StatusPrestador, { rotulo: string; tom: "warning" | "success" | "danger" | "neutral" }> = {
  pendente: { rotulo: "Em análise", tom: "warning" },
  aprovado: { rotulo: "Aprovado", tom: "success" },
  reprovado: { rotulo: "Reprovado", tom: "danger" },
  suspenso: { rotulo: "Suspenso", tom: "neutral" },
};

