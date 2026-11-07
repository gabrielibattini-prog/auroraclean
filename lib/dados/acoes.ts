"use client";

import {
  ADICIONAL_PET,
  CUPOM_PRIMEIRO_SERVICO,
  ESTOFADOS,
  GARANTIA_DIAS,
  HORAS_MINIMAS_REAGENDAR,
  MESES_REIMPERMEABILIZACAO,
  PARCELAS_MAX,
  incluiImpermeabilizacao,
  precoItem,
} from "./catalogo";
import { atendeCidade, coordDe, distanciaAproximada, gerarLocalAproximado, simularPontoExato } from "../geo";
import { ErroAcesso, ErroRegra, exigir, exigirPrestadorAprovado, prestadorDe, usuarioAtual } from "./acesso";
import { PROTOCOLO, VERSAO_PROTOCOLO, formatarResposta, pendencias, perguntasPara } from "./protocolo";
import { lerEstado, mudar } from "./store";
import type {
  ArquivoRef,
  Estado,
  MetodoPagamento,
  Pedido,
  Periodo,
  Servico,
  Tecido,
  TipoChamado,
  TipoEstofado,
  ValorResposta,
} from "./tipos";
import { agoraISO, dataISO, deDataISO, emailValido, nomeCurto, novoId, somarDias, somarMeses, soDigitos } from "./util";

/*
 * Ações do MVP. Cada uma confere o perfil de quem está logado antes de mudar
 * qualquer dado. No back-end, viram chamadas ao Supabase (RPC + RLS).
 */

function registrar(e: Estado, pedidoId: string, autorId: string, texto: string) {
  e.eventos.push({ id: novoId("ev"), pedidoId, autorId, texto, em: agoraISO() });
}

function pedidoOuErro(e: Estado, id: string) {
  const p = e.pedidos.find((x) => x.id === id);
  if (!p) throw new ErroRegra("Ordem de serviço não encontrada.");
  return p;
}

function horasAte(data: string, periodo: Periodo) {
  const d = deDataISO(data);
  d.setHours(periodo === "manha" ? 8 : periodo === "tarde" ? 14 : 17);
  return (d.getTime() - Date.now()) / 36e5;
}

function validarData(data: string) {
  const d = deDataISO(data);
  const amanha = somarDias(new Date(), 1);
  amanha.setHours(0, 0, 0, 0);
  if (d < amanha) throw new ErroRegra("Escolha uma data a partir de amanhã.");
  if (d.getDay() === 0) throw new ErroRegra("Atendemos de segunda a sábado.");
}

/* ------------------------------------------------------------------ */
/* Autenticação (simulada no MVP)                                      */
/* ------------------------------------------------------------------ */

/** Distingue "saiu pelo botão Sair" de "sessão ausente" (para onde redirecionar). */
let saidaVoluntaria = false;
export const saiuPorVontade = () => saidaVoluntaria;

export function entrar(email: string, senha: string) {
  if (senha.length < 6) throw new ErroRegra("A senha tem pelo menos 6 caracteres.");
  const e = lerEstado();
  const u = e.usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && !x.excluido);
  if (!u) throw new ErroRegra("Não achamos uma conta com esse e-mail.");
  saidaVoluntaria = false;
  mudar((r) => {
    r.sessaoId = u.id;
  });
  return u;
}

export function sair() {
  saidaVoluntaria = true;
  mudar((r) => {
    r.sessaoId = null;
  });
}

interface DadosBase {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  aceiteTermos: boolean;
}

function validarBase(e: Estado, d: DadosBase) {
  if (d.nome.trim().split(/\s+/).length < 2) throw new ErroRegra("Informe nome e sobrenome.");
  if (!emailValido(d.email)) throw new ErroRegra("Informe um e-mail válido.");
  if (soDigitos(d.telefone).length < 10) throw new ErroRegra("Informe o celular com DDD.");
  if (d.senha.length < 6) throw new ErroRegra("A senha precisa de pelo menos 6 caracteres.");
  if (!d.aceiteTermos) throw new ErroRegra("Para continuar, aceite os termos e a política de privacidade.");
  if (e.usuarios.some((u) => u.email.toLowerCase() === d.email.trim().toLowerCase() && !u.excluido)) {
    throw new ErroRegra("Já existe uma conta com esse e-mail.");
  }
}

export function cadastrarCliente(d: DadosBase) {
  const id = novoId("usr");
  mudar((r) => {
    validarBase(r, d);
    r.usuarios.push({
      id,
      papel: "cliente",
      nome: d.nome.trim(),
      email: d.email.trim().toLowerCase(),
      telefone: d.telefone,
      criadoEm: agoraISO(),
      aceiteTermosEm: agoraISO(),
    });
    r.sessaoId = id;
  });
  return id;
}

export function cadastrarPrestador(
  d: DadosBase & {
    cpf: string;
    cidade: string;
    bairro: string;
    raioKm: number;
    bio: string;
    documento?: ArquivoRef;
    certificado?: ArquivoRef;
  },
) {
  const id = novoId("usr");
  mudar((r) => {
    validarBase(r, d);
    if (soDigitos(d.cpf).length !== 11) throw new ErroRegra("Informe um CPF válido.");
    if (!d.documento) throw new ErroRegra("Envie a foto de um documento com foto.");
    if (!d.certificado) throw new ErroRegra("Envie o certificado do treinamento Aurora.");
    const base = coordDe(d.cidade, d.bairro);
    if (!base) throw new ErroRegra("Ainda não atuamos nessa cidade.");
    r.usuarios.push({
      id,
      papel: "prestador",
      nome: d.nome.trim(),
      email: d.email.trim().toLowerCase(),
      telefone: d.telefone,
      criadoEm: agoraISO(),
      aceiteTermosEm: agoraISO(),
    });
    r.prestadores.push({
      usuarioId: id,
      status: "pendente",
      cpf: d.cpf,
      cidade: d.cidade,
      bairro: d.bairro,
      base,
      raioKm: d.raioKm,
      bio: d.bio.trim(),
      documento: d.documento,
      certificado: d.certificado,
      ocultos: [],
    });
    r.sessaoId = id;
  });
  return id;
}

export function atualizarPerfil(dados: { nome: string; telefone: string }) {
  mudar((r) => {
    const u = exigir(r, "cliente", "prestador", "admin");
    if (dados.nome.trim().split(/\s+/).length < 2) throw new ErroRegra("Informe nome e sobrenome.");
    if (soDigitos(dados.telefone).length < 10) throw new ErroRegra("Informe o celular com DDD.");
    const alvo = r.usuarios.find((x) => x.id === u.id)!;
    alvo.nome = dados.nome.trim();
    alvo.telefone = dados.telefone;
  });
}

/** LGPD: portabilidade — devolve só os dados do próprio titular. */
export function exportarMeusDados() {
  const e = lerEstado();
  const u = exigir(e, "cliente", "prestador", "admin");
  const meusPedidos = e.pedidos.filter((p) => p.clienteId === u.id || p.prestadorId === u.id);
  return {
    geradoEm: agoraISO(),
    titular: u,
    prestador: prestadorDe(e, u.id) ?? null,
    enderecos: e.enderecos.filter((x) => x.clienteId === u.id),
    estofados: e.estofados.filter((x) => x.clienteId === u.id),
    pedidos: meusPedidos.map((p) => ({ ...p, localAprox: undefined })),
    laudos: e.laudos.filter((x) => x.clienteId === u.id),
    chamados: e.chamados.filter((c) => c.abertoPor === u.id),
    mensagens: e.mensagens.filter((m) => m.autorId === u.id),
  };
}

/** LGPD: eliminação — anonimiza a conta e mantém só o necessário por obrigação legal. */
export function excluirConta() {
  saidaVoluntaria = true;
  mudar((r) => {
    const u = exigir(r, "cliente", "prestador");
    const ativo = r.pedidos.some(
      (p) =>
        (p.clienteId === u.id || p.prestadorId === u.id) &&
        ["aberto", "aceito", "em_execucao", "aguardando_pagamento", "em_disputa"].includes(p.status),
    );
    if (ativo) throw new ErroRegra("Você tem serviços em andamento. Conclua ou cancele antes de excluir a conta.");
    const alvo = r.usuarios.find((x) => x.id === u.id)!;
    alvo.nome = "Conta excluída";
    alvo.email = `excluido+${alvo.id}@anonimo.invalid`;
    alvo.telefone = "";
    alvo.excluido = true;
    r.enderecos = r.enderecos.filter((x) => x.clienteId !== u.id);
    r.lembretes.forEach((l) => {
      if (l.clienteId === u.id) l.status = "cancelado";
    });
    r.sessaoId = null;
  });
}

/* ------------------------------------------------------------------ */
/* Cliente                                                             */
/* ------------------------------------------------------------------ */

export interface ItemSolicitacao {
  estofadoId?: string;
  novo?: { tipo: TipoEstofado; apelido: string; tecido: Tecido };
  servico: Servico;
  quantidade: number;
}

export interface EnderecoSolicitacao {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export function cupomDisponivel(e: Estado, clienteId: string) {
  return !e.pedidos.some((p) => p.clienteId === clienteId && p.status !== "cancelado");
}

export function calcularOrcamento(
  e: Estado,
  clienteId: string,
  itens: ItemSolicitacao[],
  pet: boolean,
  cupom: string,
) {
  const linhas = itens.map((i) => {
    const est = i.estofadoId ? e.estofados.find((x) => x.id === i.estofadoId) : undefined;
    const tipo = est?.tipo ?? i.novo!.tipo;
    const tecido = est?.tecido ?? i.novo!.tecido;
    return { ...i, tipo, tecido, valor: precoItem(tipo, i.servico, tecido) * i.quantidade };
  });
  const subtotal = linhas.reduce((s, l) => s + l.valor, 0) + (pet ? ADICIONAL_PET : 0);
  const cupomOk =
    cupom.trim().toUpperCase() === CUPOM_PRIMEIRO_SERVICO.codigo && cupomDisponivel(e, clienteId);
  const desconto = cupomOk ? Math.round(subtotal * CUPOM_PRIMEIRO_SERVICO.percentual) : 0;
  return { linhas, subtotal, desconto, total: subtotal - desconto, cupomOk };
}

export function criarPedido(s: {
  itens: ItemSolicitacao[];
  pet: boolean;
  fotos: string[];
  enderecoId?: string;
  endereco?: EnderecoSolicitacao;
  data: string;
  periodo: Periodo;
  observacoes: string;
  cupom: string;
}) {
  const id = novoId("ped");
  mudar((r) => {
    const u = exigir(r, "cliente");
    if (s.itens.length === 0) throw new ErroRegra("Adicione pelo menos um estofado.");
    validarData(s.data);

    // Endereço: existente (do próprio cliente) ou novo
    let enderecoId = s.enderecoId;
    if (enderecoId) {
      const end = r.enderecos.find((x) => x.id === enderecoId);
      if (!end || end.clienteId !== u.id) throw new ErroAcesso("Endereço inválido.");
    } else {
      const d = s.endereco!;
      if (!d.logradouro || !d.numero || !d.bairro || !d.cidade) throw new ErroRegra("Complete o endereço.");
      if (!atendeCidade(d.cidade)) throw new ErroRegra("Ainda não atendemos essa cidade.");
      enderecoId = novoId("end");
      const coord = simularPontoExato(d.cidade, d.bairro, enderecoId)!;
      r.enderecos.push({ id: enderecoId, clienteId: u.id, ...d, coord });
    }
    const end = r.enderecos.find((x) => x.id === enderecoId)!;

    // Estofados: reaproveita os já cadastrados ou cria novos (histórico por estofado)
    const orc = calcularOrcamento(r, u.id, s.itens, s.pet, s.cupom);
    const itens = orc.linhas.map((l) => {
      let estofadoId = l.estofadoId;
      if (estofadoId) {
        const est = r.estofados.find((x) => x.id === estofadoId);
        if (!est || est.clienteId !== u.id) throw new ErroAcesso("Estofado inválido.");
      } else {
        estofadoId = novoId("est");
        const apelido =
          l.novo!.apelido.trim() ||
          `${ESTOFADOS[l.tipo].nome}${l.quantidade > 1 ? ` (${l.quantidade})` : ""}`;
        r.estofados.push({ id: estofadoId, clienteId: u.id, tipo: l.tipo, tecido: l.tecido, apelido, criadoEm: agoraISO() });
      }
      return { id: novoId("it"), estofadoId, servico: l.servico, valor: l.valor };
    });

    r.contadores.pedido += 1;
    r.pedidos.push({
      id,
      numero: r.contadores.pedido,
      clienteId: u.id,
      enderecoId: end.id,
      itens,
      pet: s.pet,
      fotosCliente: s.fotos,
      data: s.data,
      periodo: s.periodo,
      observacoes: s.observacoes.trim(),
      status: "aberto",
      subtotal: orc.subtotal,
      desconto: orc.desconto,
      cupom: orc.cupomOk ? CUPOM_PRIMEIRO_SERVICO.codigo : undefined,
      total: orc.total,
      bairro: end.bairro,
      cidade: end.cidade,
      localAprox: gerarLocalAproximado(end.coord, id),
      criadoEm: agoraISO(),
    });
    registrar(r, id, u.id, "Ordem de serviço criada.");
  });
  return id;
}

export function podeAlterarSozinho(p: Pedido) {
  if (p.status === "aberto") return true;
  if (p.status === "aceito") return horasAte(p.data, p.periodo) >= HORAS_MINIMAS_REAGENDAR;
  return false;
}

export function reagendarPedido(pedidoId: string, data: string, periodo: Periodo) {
  mudar((r) => {
    const u = exigir(r, "cliente");
    const p = pedidoOuErro(r, pedidoId);
    if (p.clienteId !== u.id) throw new ErroAcesso("Ordem de serviço de outra pessoa.");
    if (!podeAlterarSozinho(p)) {
      throw new ErroRegra(`Reagendamento sozinho só até ${HORAS_MINIMAS_REAGENDAR}h antes. Fale com o suporte.`);
    }
    validarData(data);
    p.data = data;
    p.periodo = periodo;
    registrar(r, p.id, u.id, "Cliente reagendou o serviço.");
  });
}

export function cancelarPedido(pedidoId: string, motivo: string) {
  mudar((r) => {
    const u = exigir(r, "cliente");
    const p = pedidoOuErro(r, pedidoId);
    if (p.clienteId !== u.id) throw new ErroAcesso("Ordem de serviço de outra pessoa.");
    if (!podeAlterarSozinho(p)) {
      throw new ErroRegra(`Cancelamento grátis só até ${HORAS_MINIMAS_REAGENDAR}h antes. Fale com o suporte.`);
    }
    p.status = "cancelado";
    p.canceladoEm = agoraISO();
    registrar(r, p.id, u.id, `Cliente cancelou${motivo ? `: ${motivo}` : "."}`);
  });
}

/** Pagamento acontece depois do serviço, quando o cliente aprova o resultado. */
export function pagarPedido(pedidoId: string, metodo: MetodoPagamento, parcelas: number) {
  mudar((r) => {
    const u = exigir(r, "cliente");
    const p = pedidoOuErro(r, pedidoId);
    if (p.clienteId !== u.id) throw new ErroAcesso("Ordem de serviço de outra pessoa.");
    if (p.status !== "aguardando_pagamento") throw new ErroRegra("Esta ordem de serviço não está aguardando pagamento.");
    if (metodo !== "credito" && parcelas !== 1) throw new ErroRegra("Parcelamento só no cartão de crédito.");
    if (parcelas < 1 || parcelas > PARCELAS_MAX) throw new ErroRegra(`Parcele em até ${PARCELAS_MAX}x.`);
    const agora = agoraISO();
    p.pagamento = { metodo, parcelas, valor: p.total, pagoEm: agora };
    p.status = "concluido";
    p.concluidoEm = agora;
    registrar(r, p.id, u.id, "Cliente aprovou o resultado e pagou.");
  });
}

/* ------------------------------------------------------------------ */
/* Avaliações                                                          */
/* ------------------------------------------------------------------ */

/** Cliente avalia o prestador depois do serviço concluído (uma vez por pedido). */
export function avaliarServico(pedidoId: string, nota: number, comentario: string) {
  mudar((r) => {
    const u = exigir(r, "cliente");
    const p = pedidoOuErro(r, pedidoId);
    if (p.clienteId !== u.id) throw new ErroAcesso("Ordem de serviço de outra pessoa.");
    if (p.status !== "concluido" || !p.prestadorId) throw new ErroRegra("Você pode avaliar depois que o serviço for concluído.");
    if (r.avaliacoes.some((a) => a.pedidoId === p.id)) throw new ErroRegra("Você já avaliou este serviço.");
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) throw new ErroRegra("Escolha de 1 a 5 estrelas.");
    if (comentario.trim().length > 500) throw new ErroRegra("O comentário pode ter até 500 caracteres.");
    r.avaliacoes.push({
      id: novoId("av"),
      pedidoId: p.id,
      clienteId: u.id,
      prestadorId: p.prestadorId,
      nota,
      comentario: comentario.trim(),
      criadoEm: agoraISO(),
    });
    registrar(r, p.id, u.id, `Cliente avaliou o serviço com ${nota} estrela${nota > 1 ? "s" : ""}.`);
  });
}

/** Moderação: a admin oculta (ou volta a mostrar) uma avaliação imprópria. */
export function moderarAvaliacao(avaliacaoId: string, ocultar: boolean, motivo: string) {
  mudar((r) => {
    exigir(r, "admin");
    const a = r.avaliacoes.find((x) => x.id === avaliacaoId);
    if (!a) throw new ErroRegra("Avaliação não encontrada.");
    if (ocultar && !motivo.trim()) throw new ErroRegra("Informe o motivo para ocultar.");
    a.oculta = ocultar ? { motivo: motivo.trim(), em: agoraISO() } : undefined;
  });
}

/* ------------------------------------------------------------------ */
/* Suporte (cliente, prestador e admin)                                */
/* ------------------------------------------------------------------ */

export function dentroDaGarantia(p: Pedido) {
  if (!p.concluidoEm) return p.status === "aguardando_pagamento";
  return (Date.now() - new Date(p.concluidoEm).getTime()) / 864e5 <= GARANTIA_DIAS;
}

export function abrirChamado(pedidoId: string, tipo: TipoChamado, assunto: string, texto: string) {
  const id = novoId("ch");
  mudar((r) => {
    const u = exigir(r, "cliente", "prestador");
    const p = pedidoOuErro(r, pedidoId);
    const participa = p.clienteId === u.id || p.prestadorId === u.id;
    if (!participa) throw new ErroAcesso("Você não participa desta ordem de serviço.");
    if (!assunto.trim() || !texto.trim()) throw new ErroRegra("Conte o que aconteceu.");
    if (tipo === "disputa") {
      if (u.papel !== "cliente") throw new ErroAcesso("Só o cliente abre disputa.");
      if (!dentroDaGarantia(p)) throw new ErroRegra(`A garantia é de ${GARANTIA_DIAS} dias após o serviço.`);
      p.status = "em_disputa";
      registrar(r, p.id, u.id, "Cliente abriu uma disputa (garantia).");
    }
    r.chamados.push({ id, pedidoId, abertoPor: u.id, tipo, assunto: assunto.trim(), status: "aberto", criadoEm: agoraISO() });
    r.mensagens.push({ id: novoId("msg"), chamadoId: id, autorId: u.id, texto: texto.trim(), em: agoraISO() });
  });
  return id;
}

export function participaDoChamado(e: Estado, chamadoId: string) {
  const u = usuarioAtual(e);
  const c = e.chamados.find((x) => x.id === chamadoId);
  if (!u || !c) return false;
  if (u.papel === "admin") return true;
  const p = e.pedidos.find((x) => x.id === c.pedidoId);
  return !!p && (p.clienteId === u.id || p.prestadorId === u.id);
}

export function enviarMensagem(chamadoId: string, texto: string) {
  mudar((r) => {
    const u = exigir(r, "cliente", "prestador", "admin");
    if (!participaDoChamado(r, chamadoId)) throw new ErroAcesso("Você não participa deste atendimento.");
    const c = r.chamados.find((x) => x.id === chamadoId)!;
    if (c.status === "resolvido") throw new ErroRegra("Este atendimento já foi encerrado.");
    if (!texto.trim()) return;
    r.mensagens.push({ id: novoId("msg"), chamadoId, autorId: u.id, texto: texto.trim(), em: agoraISO() });
    if (u.papel === "admin" && c.status === "aberto") c.status = "em_mediacao";
  });
}

/* ------------------------------------------------------------------ */
/* Prestador                                                           */
/* ------------------------------------------------------------------ */

export function ocultarOportunidade(pedidoId: string) {
  mudar((r) => {
    const { prestador } = exigirPrestadorAprovado(r);
    const alvo = r.prestadores.find((x) => x.usuarioId === prestador.usuarioId)!;
    if (!alvo.ocultos.includes(pedidoId)) alvo.ocultos.push(pedidoId);
  });
}

/** Aceite atômico: só funciona se o pedido ainda estiver aberto e sem prestador. */
export function aceitarPedido(pedidoId: string) {
  mudar((r) => {
    const { usuario, prestador } = exigirPrestadorAprovado(r);
    const p = pedidoOuErro(r, pedidoId);
    if (p.status !== "aberto" || p.prestadorId) throw new ErroRegra("Ops! Outro prestador aceitou antes.");
    if (distanciaAproximada(prestador.base, p.localAprox) > prestador.raioKm) {
      throw new ErroRegra("Esta ordem de serviço está fora da sua área de atendimento.");
    }
    p.prestadorId = usuario.id;
    p.status = "aceito";
    p.aceitoEm = agoraISO();
    registrar(r, p.id, usuario.id, `${nomeCurto(usuario.nome)} aceitou o serviço.`);
  });
}

function exigirPrestadorDoPedido(r: Estado, pedidoId: string) {
  const { usuario } = exigirPrestadorAprovado(r);
  const p = pedidoOuErro(r, pedidoId);
  if (p.prestadorId !== usuario.id) throw new ErroAcesso("Este serviço é de outro prestador.");
  return { usuario, p };
}

export function iniciarServico(pedidoId: string) {
  mudar((r) => {
    const { usuario, p } = exigirPrestadorDoPedido(r, pedidoId);
    if (p.status !== "aceito") throw new ErroRegra("Este serviço não pode ser iniciado agora.");
    p.status = "em_execucao";
    p.iniciadoEm = agoraISO();
    for (const item of p.itens) {
      r.prontuarios.push({
        id: novoId("pr"),
        pedidoId: p.id,
        itemId: item.id,
        estofadoId: item.estofadoId,
        prestadorId: usuario.id,
        respostas: {},
        fotosAntes: [],
        fotosDepois: [],
        status: "rascunho",
        versaoProtocolo: VERSAO_PROTOCOLO,
      });
    }
    registrar(r, p.id, usuario.id, "Serviço iniciado.");
  });
}

function prontuarioEditavel(r: Estado, prontuarioId: string) {
  const { usuario } = exigirPrestadorAprovado(r);
  const pr = r.prontuarios.find((x) => x.id === prontuarioId);
  if (!pr || pr.prestadorId !== usuario.id) throw new ErroAcesso("Prontuário de outro prestador.");
  if (pr.status === "finalizado") throw new ErroRegra("Prontuário já finalizado.");
  return { usuario, pr };
}

export function salvarResposta(prontuarioId: string, perguntaId: string, valor: ValorResposta) {
  mudar((r) => {
    const { pr } = prontuarioEditavel(r, prontuarioId);
    if (!PROTOCOLO.some((p) => p.id === perguntaId)) throw new ErroRegra("Pergunta inválida.");
    pr.respostas[perguntaId] = valor;
  });
}

export function adicionarFotos(prontuarioId: string, momento: "antes" | "depois", ids: string[]) {
  mudar((r) => {
    const { pr } = prontuarioEditavel(r, prontuarioId);
    const lista = momento === "antes" ? pr.fotosAntes : pr.fotosDepois;
    lista.push(...ids);
  });
}

export function removerFoto(prontuarioId: string, momento: "antes" | "depois", id: string) {
  mudar((r) => {
    const { pr } = prontuarioEditavel(r, prontuarioId);
    if (momento === "antes") pr.fotosAntes = pr.fotosAntes.filter((x) => x !== id);
    else pr.fotosDepois = pr.fotosDepois.filter((x) => x !== id);
  });
}

/**
 * Finaliza o prontuário: exige checklist obrigatório + fotos de antes e depois.
 * Gera o laudo (cópia congelada) e o lembrete de reimpermeabilização.
 */
export function finalizarProntuario(prontuarioId: string) {
  mudar((r) => {
    const { usuario, pr } = prontuarioEditavel(r, prontuarioId);
    const p = pedidoOuErro(r, pr.pedidoId);
    if (p.status !== "em_execucao") throw new ErroRegra("O serviço não está em andamento.");
    const item = p.itens.find((i) => i.id === pr.itemId)!;
    const faltando = pendencias(item.servico, pr.respostas);
    if (faltando.length) throw new ErroRegra(`Falta responder: ${faltando.map((f) => f.pergunta).join("; ")}.`);
    if (pr.fotosAntes.length === 0) throw new ErroRegra("Envie pelo menos 1 foto de antes.");
    if (pr.fotosDepois.length === 0) throw new ErroRegra("Envie pelo menos 1 foto de depois.");

    const agora = new Date();
    pr.status = "finalizado";
    pr.finalizadoEm = agora.toISOString();

    const est = r.estofados.find((x) => x.id === pr.estofadoId)!;
    const imper = incluiImpermeabilizacao(item.servico);
    const proxima = imper ? dataISO(somarMeses(agora, MESES_REIMPERMEABILIZACAO)) : undefined;
    r.contadores.laudo += 1;
    const laudoId = novoId("ld");
    r.laudos.push({
      id: laudoId,
      numero: r.contadores.laudo,
      prontuarioId: pr.id,
      pedidoId: p.id,
      estofadoId: est.id,
      clienteId: p.clienteId,
      emitidoEm: agora.toISOString(),
      conteudo: {
        estofado: est.apelido,
        tipo: est.tipo,
        tecido: est.tecido,
        servico: item.servico,
        prestadorNome: nomeCurto(usuario.nome),
        respostas: perguntasPara(item.servico)
          .filter((q) => q.tipo !== "confirmacao")
          .map((q) => ({ pergunta: q.pergunta, resposta: formatarResposta(q, pr.respostas[q.id]) })),
        fotosAntes: [...pr.fotosAntes],
        fotosDepois: [...pr.fotosDepois],
        proximaImpermeabilizacao: proxima,
      },
    });
    if (proxima) {
      // um lembrete ativo por estofado: o novo substitui o anterior
      r.lembretes.forEach((l) => {
        if (l.estofadoId === est.id && l.status === "agendado") l.status = "cancelado";
      });
      r.lembretes.push({ id: novoId("lb"), estofadoId: est.id, clienteId: p.clienteId, laudoId, dataPrevista: proxima, status: "agendado" });
    }
    registrar(r, p.id, usuario.id, `Prontuário do ${est.apelido} finalizado. Laudo nº ${r.contadores.laudo} enviado.`);

    const todos = r.prontuarios.filter((x) => x.pedidoId === p.id);
    if (todos.length === p.itens.length && todos.every((x) => x.status === "finalizado")) {
      p.status = p.total === 0 ? "concluido" : "aguardando_pagamento";
      p.finalizadoEm = agora.toISOString();
      if (p.total === 0) p.concluidoEm = agora.toISOString();
      registrar(r, p.id, usuario.id, "Serviço finalizado. Aguardando aprovação do cliente.");
    }
  });
}

export function atualizarAtendimento(d: { cidade: string; bairro: string; raioKm: number; bio: string }) {
  mudar((r) => {
    const u = exigir(r, "prestador");
    const pr = r.prestadores.find((x) => x.usuarioId === u.id)!;
    const base = coordDe(d.cidade, d.bairro);
    if (!base) throw new ErroRegra("Ainda não atuamos nessa cidade.");
    if (d.raioKm < 2 || d.raioKm > 50) throw new ErroRegra("Escolha um raio entre 2 e 50 km.");
    Object.assign(pr, { cidade: d.cidade, bairro: d.bairro, base, raioKm: d.raioKm, bio: d.bio.trim() });
  });
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export function avaliarPrestador(usuarioId: string, aprovar: boolean, motivo: string) {
  mudar((r) => {
    const admin = exigir(r, "admin");
    const pr = prestadorDe(r, usuarioId);
    if (!pr) throw new ErroRegra("Prestador não encontrado.");
    if (!aprovar && !motivo.trim()) throw new ErroRegra("Explique o motivo para o prestador.");
    pr.status = aprovar ? "aprovado" : "reprovado";
    pr.motivo = aprovar ? undefined : motivo.trim();
    pr.avaliadoEm = agoraISO();
    pr.avaliadoPor = admin.id;
  });
}

export function suspenderPrestador(usuarioId: string, motivo: string) {
  mudar((r) => {
    const admin = exigir(r, "admin");
    const pr = prestadorDe(r, usuarioId);
    if (!pr) throw new ErroRegra("Prestador não encontrado.");
    if (!motivo.trim()) throw new ErroRegra("Explique o motivo da suspensão.");
    pr.status = "suspenso";
    pr.motivo = motivo.trim();
    pr.avaliadoEm = agoraISO();
    pr.avaliadoPor = admin.id;
  });
}

export type DecisaoDisputa = "manter" | "reembolsar" | "refazer";

export function resolverChamado(chamadoId: string, resolucao: string, decisao?: DecisaoDisputa) {
  mudar((r) => {
    const admin = exigir(r, "admin");
    const c = r.chamados.find((x) => x.id === chamadoId);
    if (!c) throw new ErroRegra("Atendimento não encontrado.");
    if (!resolucao.trim()) throw new ErroRegra("Escreva a resolução para as partes.");
    const p = pedidoOuErro(r, c.pedidoId);
    if (c.tipo === "disputa" && p.status === "em_disputa") {
      if (!decisao) throw new ErroRegra("Escolha uma decisão para a disputa.");
      if (decisao === "reembolsar") {
        p.status = "cancelado";
        p.canceladoEm = agoraISO();
        if (p.pagamento) p.pagamento.reembolsadoEm = agoraISO();
        registrar(r, p.id, admin.id, "Disputa resolvida: valor devolvido ao cliente.");
      } else {
        p.status = p.pagamento ? "concluido" : "aguardando_pagamento";
        registrar(r, p.id, admin.id, "Disputa resolvida: serviço mantido.");
      }
      if (decisao === "refazer") {
        // garantia: novo atendimento sem custo, com o mesmo prestador
        r.contadores.pedido += 1;
        const novo: Pedido = {
          ...structuredClone(p),
          id: novoId("ped"),
          numero: r.contadores.pedido,
          status: "aceito",
          data: dataISO(somarDias(new Date(), 2)),
          subtotal: 0,
          desconto: 0,
          total: 0,
          cupom: undefined,
          pagamento: undefined,
          criadoEm: agoraISO(),
          aceitoEm: agoraISO(),
          iniciadoEm: undefined,
          finalizadoEm: undefined,
          concluidoEm: undefined,
          observacoes: `Retorno de garantia do ordem de serviço nº ${p.numero}.`,
          itens: p.itens.map((i) => ({ ...i, id: novoId("it"), valor: 0 })),
        };
        r.pedidos.push(novo);
        registrar(r, novo.id, admin.id, `Retorno de garantia criado (ordem de serviço nº ${p.numero}). Combine a nova data.`);
        registrar(r, p.id, admin.id, `Retorno de garantia agendado: ordem de serviço nº ${novo.numero}.`);
      }
    }
    c.status = "resolvido";
    c.resolucao = resolucao.trim();
    c.resolvidoEm = agoraISO();
    r.mensagens.push({ id: novoId("msg"), chamadoId, autorId: admin.id, texto: `Resolução: ${resolucao.trim()}`, em: agoraISO() });
  });
}

export function cancelarPedidoAdmin(pedidoId: string, motivo: string) {
  mudar((r) => {
    const admin = exigir(r, "admin");
    const p = pedidoOuErro(r, pedidoId);
    if (!motivo.trim()) throw new ErroRegra("Informe o motivo.");
    if (p.status === "concluido" || p.status === "cancelado") throw new ErroRegra("Ordem de serviço já encerrada.");
    p.status = "cancelado";
    p.canceladoEm = agoraISO();
    registrar(r, p.id, admin.id, `Cancelado pela equipe: ${motivo.trim()}`);
  });
}

/** Simula o envio do e-mail de lembrete (no back-end: cron diário + serviço de e-mail). */
export function enviarLembrete(lembreteId: string) {
  mudar((r) => {
    exigir(r, "admin");
    const l = r.lembretes.find((x) => x.id === lembreteId);
    if (!l || l.status !== "agendado") throw new ErroRegra("Lembrete indisponível.");
    l.status = "enviado";
    l.enviadoEm = agoraISO();
  });
}

export function mensagemDeErro(err: unknown) {
  if (err instanceof ErroRegra || err instanceof ErroAcesso) return err.message;
  console.error(err);
  return "Algo deu errado. Tente de novo.";
}
