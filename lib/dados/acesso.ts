import { DIAS_ACESSO_CONTATO_POS_SERVICO } from "./catalogo";
import type { Estado, Papel, Pedido, Prestador, Usuario } from "./tipos";

/**
 * Regras de acesso por perfil. No back-end, estas mesmas regras viram
 * políticas RLS e funções do Postgres (ver docs/ARQUITETURA.md).
 */
export class ErroAcesso extends Error {}
export class ErroRegra extends Error {}

export function usuarioAtual(e: Estado): Usuario | null {
  if (!e.sessaoId) return null;
  return e.usuarios.find((u) => u.id === e.sessaoId && !u.excluido) ?? null;
}

export function exigir(e: Estado, ...papeis: Papel[]): Usuario {
  const u = usuarioAtual(e);
  if (!u) throw new ErroAcesso("Entre na sua conta para continuar.");
  if (!papeis.includes(u.papel)) throw new ErroAcesso("Você não tem permissão para esta ação.");
  return u;
}

export function prestadorDe(e: Estado, usuarioId: string): Prestador | undefined {
  return e.prestadores.find((p) => p.usuarioId === usuarioId);
}

export function exigirPrestadorAprovado(e: Estado): { usuario: Usuario; prestador: Prestador } {
  const usuario = exigir(e, "prestador");
  const prestador = prestadorDe(e, usuario.id);
  if (!prestador || prestador.status !== "aprovado") {
    throw new ErroAcesso("Seu cadastro ainda não foi aprovado pela Aurora Clean.");
  }
  return { usuario, prestador };
}

/**
 * O prestador só vê endereço exato e telefone do cliente depois de aceitar,
 * e perde o acesso alguns dias após a conclusão (LGPD: minimização).
 */
export function prestadorVeContato(p: Pedido, prestadorId: string, agora = new Date()) {
  if (p.prestadorId !== prestadorId) return false;
  if (p.status === "aceito" || p.status === "em_execucao" || p.status === "aguardando_pagamento") return true;
  if (p.status === "concluido" || p.status === "em_disputa") {
    const fim = new Date(p.concluidoEm ?? p.finalizadoEm ?? p.criadoEm);
    fim.setDate(fim.getDate() + DIAS_ACESSO_CONTATO_POS_SERVICO);
    return agora <= fim;
  }
  return false;
}

/** Quem pode ver um pedido (página de detalhe). */
export function podeVerPedido(e: Estado, p: Pedido) {
  const u = usuarioAtual(e);
  if (!u) return false;
  if (u.papel === "admin") return true;
  if (u.papel === "cliente") return p.clienteId === u.id;
  return p.prestadorId === u.id;
}
