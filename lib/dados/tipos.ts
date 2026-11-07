/**
 * Modelo de dados do MVP. Espelha as tabelas planejadas para o Supabase
 * (ver docs/ARQUITETURA.md). No MVP de front-end tudo vive no navegador.
 */

export type Papel = "cliente" | "prestador" | "admin";

export interface Coord {
  lat: number;
  lng: number;
}

export interface Usuario {
  id: string;
  papel: Papel;
  nome: string;
  email: string;
  telefone: string;
  criadoEm: string;
  aceiteTermosEm: string;
  excluido?: boolean;
}

export type StatusPrestador = "pendente" | "aprovado" | "reprovado" | "suspenso";

export interface ArquivoRef {
  /** chave no armazenamento local de arquivos (IndexedDB) */
  id: string;
  nome: string;
  tipo: string;
}

export interface Prestador {
  usuarioId: string;
  status: StatusPrestador;
  cpf: string;
  cidade: string;
  bairro: string;
  /** localização base (privada) usada só para calcular distância */
  base: Coord;
  raioKm: number;
  bio: string;
  documento?: ArquivoRef;
  certificado?: ArquivoRef;
  motivo?: string;
  avaliadoEm?: string;
  avaliadoPor?: string;
  /** oportunidades que o prestador escolheu não ver */
  ocultos: string[];
}

export interface Endereco {
  id: string;
  clienteId: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  /** ponto exato (privado) */
  coord: Coord;
}

export type TipoEstofado =
  | "sofa_2"
  | "sofa_3"
  | "sofa_retratil"
  | "sofa_canto"
  | "poltrona"
  | "cadeira"
  | "colchao_solteiro"
  | "colchao_casal"
  | "colchao_queen_king"
  | "cabeceira"
  | "puff";

export type Servico = "higienizacao" | "impermeabilizacao" | "combo";
export type Tecido = "sintetico" | "natural";
export type Periodo = "manha" | "tarde" | "noite";

export interface Estofado {
  id: string;
  clienteId: string;
  tipo: TipoEstofado;
  apelido: string;
  tecido: Tecido;
  criadoEm: string;
}

export interface PedidoItem {
  id: string;
  estofadoId: string;
  servico: Servico;
  valor: number;
}

export type StatusPedido =
  | "aberto"
  | "aceito"
  | "em_execucao"
  | "aguardando_pagamento"
  | "concluido"
  | "cancelado"
  | "em_disputa";

export type MetodoPagamento = "pix" | "credito" | "debito";

export interface Pagamento {
  metodo: MetodoPagamento;
  parcelas: number;
  valor: number;
  pagoEm: string;
  reembolsadoEm?: string;
}

export interface Pedido {
  id: string;
  numero: number;
  clienteId: string;
  enderecoId: string;
  prestadorId?: string;
  itens: PedidoItem[];
  pet: boolean;
  fotosCliente: string[];
  data: string;
  periodo: Periodo;
  observacoes: string;
  status: StatusPedido;
  subtotal: number;
  desconto: number;
  cupom?: string;
  total: number;
  /** dados públicos para o mapa: nunca o endereço exato */
  bairro: string;
  cidade: string;
  localAprox: Coord;
  criadoEm: string;
  aceitoEm?: string;
  iniciadoEm?: string;
  finalizadoEm?: string;
  concluidoEm?: string;
  canceladoEm?: string;
  pagamento?: Pagamento;
}

export interface Evento {
  id: string;
  pedidoId: string;
  em: string;
  autorId: string;
  texto: string;
}

export type ValorResposta = string | string[] | boolean;

export interface Prontuario {
  id: string;
  pedidoId: string;
  itemId: string;
  estofadoId: string;
  prestadorId: string;
  respostas: Record<string, ValorResposta>;
  fotosAntes: string[];
  fotosDepois: string[];
  status: "rascunho" | "finalizado";
  versaoProtocolo: number;
  finalizadoEm?: string;
}

export interface Laudo {
  id: string;
  numero: number;
  prontuarioId: string;
  pedidoId: string;
  estofadoId: string;
  clienteId: string;
  emitidoEm: string;
  /** cópia congelada: o laudo não muda depois de emitido */
  conteudo: {
    estofado: string;
    tipo: TipoEstofado;
    tecido: Tecido;
    servico: Servico;
    prestadorNome: string;
    respostas: { pergunta: string; resposta: string }[];
    fotosAntes: string[];
    fotosDepois: string[];
    proximaImpermeabilizacao?: string;
  };
}

export interface Lembrete {
  id: string;
  estofadoId: string;
  clienteId: string;
  laudoId: string;
  dataPrevista: string;
  status: "agendado" | "enviado" | "cancelado";
  enviadoEm?: string;
}

export type TipoChamado = "duvida" | "problema" | "disputa";
export type StatusChamado = "aberto" | "em_mediacao" | "resolvido";

export interface Chamado {
  id: string;
  pedidoId: string;
  abertoPor: string;
  tipo: TipoChamado;
  assunto: string;
  status: StatusChamado;
  resolucao?: string;
  criadoEm: string;
  resolvidoEm?: string;
}

export interface Mensagem {
  id: string;
  chamadoId: string;
  autorId: string;
  texto: string;
  em: string;
}

export interface Avaliacao {
  id: string;
  pedidoId: string;
  clienteId: string;
  prestadorId: string;
  /** 1 a 5 estrelas */
  nota: number;
  comentario: string;
  criadoEm: string;
  /** moderação da admin (conteúdo impróprio); some para clientes e prestador */
  oculta?: { motivo: string; em: string };
}

export interface Estado {
  versao: number;
  sessaoId: string | null;
  usuarios: Usuario[];
  prestadores: Prestador[];
  enderecos: Endereco[];
  estofados: Estofado[];
  pedidos: Pedido[];
  eventos: Evento[];
  prontuarios: Prontuario[];
  laudos: Laudo[];
  lembretes: Lembrete[];
  chamados: Chamado[];
  mensagens: Mensagem[];
  avaliacoes: Avaliacao[];
  contadores: { pedido: number; laudo: number };
}
