import { ESTOFADOS } from "./catalogo";
import { distanciaAproximada } from "../geo";
import { exigir, exigirPrestadorAprovado, prestadorVeContato, usuarioAtual } from "./acesso";
import type { Coord, Estado, Periodo, Servico, Tecido, TipoEstofado } from "./tipos";
import { nomeCurto } from "./util";

/**
 * O que o prestador vê de uma oportunidade antes de aceitar:
 * só o PRIMEIRO NOME do cliente — nunca sobrenome, endereço exato ou telefone.
 */
export interface OportunidadePublica {
  id: string;
  clientePrimeiroNome: string;
  numero: number;
  itens: { tipo: TipoEstofado; tecido: Tecido; servico: Servico; apelido: string }[];
  pet: boolean;
  bairro: string;
  cidade: string;
  localAprox: Coord;
  distanciaKm: number;
  data: string;
  periodo: Periodo;
  valor: number;
  qtdFotos: number;
  fotos: string[];
  observacoes: string;
  criadoEm: string;
}

export function oportunidades(e: Estado): OportunidadePublica[] {
  const { prestador } = exigirPrestadorAprovado(e);
  return e.pedidos
    .filter((p) => p.status === "aberto" && !p.prestadorId && !prestador.ocultos.includes(p.id))
    .map((p) => ({ p, d: distanciaAproximada(prestador.base, p.localAprox) }))
    .filter(({ d }) => d <= prestador.raioKm)
    .sort((a, b) => a.p.data.localeCompare(b.p.data))
    .map(({ p, d }) => ({
      id: p.id,
      clientePrimeiroNome: e.usuarios.find((u) => u.id === p.clienteId)?.nome.trim().split(/\s+/)[0] ?? "Cliente",
      numero: p.numero,
      itens: p.itens.map((i) => {
        const est = e.estofados.find((x) => x.id === i.estofadoId)!;
        return { tipo: est.tipo, tecido: est.tecido, servico: i.servico, apelido: ESTOFADOS[est.tipo].nome };
      }),
      pet: p.pet,
      bairro: p.bairro,
      cidade: p.cidade,
      localAprox: p.localAprox,
      distanciaKm: d,
      data: p.data,
      periodo: p.periodo,
      valor: p.subtotal,
      qtdFotos: p.fotosCliente.length,
      fotos: p.fotosCliente,
      observacoes: p.observacoes,
      criadoEm: p.criadoEm,
    }));
}

export interface ContatoCliente {
  nome: string;
  telefone: string;
  endereco: string;
  complemento: string;
}

/** Endereço e telefone: só para o prestador do pedido (após aceite) ou admin. */
export function contatoDoCliente(e: Estado, pedidoId: string): ContatoCliente | null {
  const u = exigir(e, "prestador", "admin");
  const p = e.pedidos.find((x) => x.id === pedidoId);
  if (!p) return null;
  if (u.papel === "prestador" && !prestadorVeContato(p, u.id)) return null;
  const c = e.usuarios.find((x) => x.id === p.clienteId)!;
  const end = e.enderecos.find((x) => x.id === p.enderecoId)!;
  return {
    nome: u.papel === "admin" ? c.nome : nomeCurto(c.nome),
    telefone: c.telefone,
    endereco: `${end.logradouro}, ${end.numero} — ${end.bairro}, ${end.cidade}/${end.uf} · CEP ${end.cep}`,
    complemento: end.complemento,
  };
}

/**
 * Quem é o prestador do pedido. O cliente vê só o nome curto (depois do aceite);
 * o TELEFONE do prestador é exclusivo da admin — o cliente fala com a Aurora Clean.
 */
export function contatoDoPrestador(e: Estado, pedidoId: string): { nome: string; iniciais: string; telefone?: string } | null {
  const u = usuarioAtual(e);
  const p = e.pedidos.find((x) => x.id === pedidoId);
  if (!u || !p || !p.prestadorId) return null;
  if (u.papel === "cliente" && p.clienteId !== u.id) return null;
  if (u.papel === "prestador") return null;
  if (u.papel === "cliente" && (p.status === "cancelado" || p.status === "aberto")) return null;
  const pr = e.usuarios.find((x) => x.id === p.prestadorId)!;
  return {
    nome: nomeCurto(pr.nome),
    iniciais: pr.nome,
    telefone: u.papel === "admin" ? pr.telefone : undefined,
  };
}

export function nomeDoUsuario(e: Estado, id: string, completo = false) {
  const u = e.usuarios.find((x) => x.id === id);
  if (!u) return "—";
  if (u.papel === "admin") return "Equipe Aurora Clean";
  return completo ? u.nome : nomeCurto(u.nome);
}

export interface ResumoAvaliacoes {
  media: number | null;
  total: number;
  lista: { id: string; nota: number; comentario: string; criadoEm: string; autor: string; oculta?: { motivo: string; em: string } }[];
}

/**
 * Avaliações de um prestador. Clientes e o próprio prestador veem só as
 * visíveis (autor como "Carla M."); a admin vê todas, inclusive as ocultas.
 */
export function avaliacoesDoPrestador(e: Estado, prestadorId: string): ResumoAvaliacoes {
  const u = usuarioAtual(e);
  const admin = u?.papel === "admin";
  const todas = e.avaliacoes
    .filter((a) => a.prestadorId === prestadorId && (admin || !a.oculta))
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const visiveis = todas.filter((a) => !a.oculta);
  const media = visiveis.length ? visiveis.reduce((s, a) => s + a.nota, 0) / visiveis.length : null;
  return {
    media,
    total: visiveis.length,
    lista: todas.map((a) => {
      const autor = e.usuarios.find((x) => x.id === a.clienteId);
      return {
        id: a.id,
        nota: a.nota,
        comentario: a.comentario,
        criadoEm: a.criadoEm,
        autor: !autor || autor.excluido ? "Cliente" : admin ? autor.nome : nomeCurto(autor.nome),
        oculta: a.oculta,
      };
    }),
  };
}
