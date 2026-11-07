import type { Coord } from "./dados/tipos";

/**
 * Região metropolitana de São Paulo — área de cobertura do MVP.
 * Coordenadas aproximadas (centro do bairro/cidade). No back-end a busca de
 * coordenadas passa a ser feita por geocodificação (Nominatim) no servidor.
 */
export const LOCAIS: { cidade: string; bairro: string; coord: Coord }[] = [
  { cidade: "São Paulo", bairro: "Pinheiros", coord: { lat: -23.5662, lng: -46.6919 } },
  { cidade: "São Paulo", bairro: "Vila Madalena", coord: { lat: -23.5536, lng: -46.6911 } },
  { cidade: "São Paulo", bairro: "Perdizes", coord: { lat: -23.537, lng: -46.675 } },
  { cidade: "São Paulo", bairro: "Lapa", coord: { lat: -23.527, lng: -46.704 } },
  { cidade: "São Paulo", bairro: "Butantã", coord: { lat: -23.571, lng: -46.708 } },
  { cidade: "São Paulo", bairro: "Morumbi", coord: { lat: -23.6, lng: -46.721 } },
  { cidade: "São Paulo", bairro: "Itaim Bibi", coord: { lat: -23.585, lng: -46.678 } },
  { cidade: "São Paulo", bairro: "Moema", coord: { lat: -23.601, lng: -46.665 } },
  { cidade: "São Paulo", bairro: "Vila Mariana", coord: { lat: -23.589, lng: -46.634 } },
  { cidade: "São Paulo", bairro: "Bela Vista", coord: { lat: -23.561, lng: -46.647 } },
  { cidade: "São Paulo", bairro: "Campo Belo", coord: { lat: -23.623, lng: -46.668 } },
  { cidade: "São Paulo", bairro: "Santo Amaro", coord: { lat: -23.654, lng: -46.711 } },
  { cidade: "São Paulo", bairro: "Jabaquara", coord: { lat: -23.645, lng: -46.641 } },
  { cidade: "São Paulo", bairro: "Ipiranga", coord: { lat: -23.593, lng: -46.61 } },
  { cidade: "São Paulo", bairro: "Mooca", coord: { lat: -23.56, lng: -46.599 } },
  { cidade: "São Paulo", bairro: "Tatuapé", coord: { lat: -23.5407, lng: -46.576 } },
  { cidade: "São Paulo", bairro: "Penha", coord: { lat: -23.528, lng: -46.544 } },
  { cidade: "São Paulo", bairro: "Santana", coord: { lat: -23.502, lng: -46.625 } },
  { cidade: "Barueri", bairro: "Alphaville", coord: { lat: -23.495, lng: -46.85 } },
  { cidade: "Barueri", bairro: "Centro", coord: { lat: -23.5113, lng: -46.8768 } },
  { cidade: "Santana de Parnaíba", bairro: "Centro", coord: { lat: -23.444, lng: -46.918 } },
  { cidade: "Cajamar", bairro: "Centro", coord: { lat: -23.355, lng: -46.877 } },
  { cidade: "Caieiras", bairro: "Centro", coord: { lat: -23.364, lng: -46.74 } },
  { cidade: "Osasco", bairro: "Centro", coord: { lat: -23.532, lng: -46.792 } },
  { cidade: "Carapicuíba", bairro: "Centro", coord: { lat: -23.523, lng: -46.836 } },
  { cidade: "Cotia", bairro: "Centro", coord: { lat: -23.604, lng: -46.919 } },
  { cidade: "Taboão da Serra", bairro: "Centro", coord: { lat: -23.626, lng: -46.791 } },
  { cidade: "Guarulhos", bairro: "Centro", coord: { lat: -23.454, lng: -46.533 } },
  { cidade: "Santo André", bairro: "Centro", coord: { lat: -23.664, lng: -46.538 } },
  { cidade: "São Bernardo do Campo", bairro: "Centro", coord: { lat: -23.694, lng: -46.565 } },
  { cidade: "São Caetano do Sul", bairro: "Centro", coord: { lat: -23.623, lng: -46.551 } },
  { cidade: "Diadema", bairro: "Centro", coord: { lat: -23.686, lng: -46.623 } },
  { cidade: "Mogi das Cruzes", bairro: "Centro", coord: { lat: -23.523, lng: -46.188 } },
];

export const CIDADES = Array.from(new Set(LOCAIS.map((l) => l.cidade)));
export const CENTRO_RMSP: Coord = { lat: -23.55, lng: -46.68 };

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export function atendeCidade(cidade: string) {
  return CIDADES.some((c) => normalizar(c) === normalizar(cidade));
}

export function bairrosDe(cidade: string) {
  return LOCAIS.filter((l) => normalizar(l.cidade) === normalizar(cidade)).map((l) => l.bairro);
}

/** Coordenada do bairro (ou do centro da cidade, se o bairro não estiver na lista). */
export function coordDe(cidade: string, bairro: string): Coord | null {
  const daCidade = LOCAIS.filter((l) => normalizar(l.cidade) === normalizar(cidade));
  if (daCidade.length === 0) return null;
  const doBairro = daCidade.find((l) => normalizar(l.bairro) === normalizar(bairro));
  return (doBairro ?? daCidade[0]).coord;
}

/** Gerador pseudoaleatório determinístico a partir de um texto. */
export function aleatorioDe(semente: string) {
  let h = 2166136261;
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function deslocar(c: Coord, metros: number, anguloRad: number): Coord {
  const dLat = (metros * Math.cos(anguloRad)) / 111320;
  const dLng = (metros * Math.sin(anguloRad)) / (111320 * Math.cos((c.lat * Math.PI) / 180));
  return { lat: c.lat + dLat, lng: c.lng + dLng };
}

/**
 * Localização aproximada para o mapa: ponto sorteado entre 300 e 800 m do real.
 * Gerado UMA vez por pedido e salvo (sortear de novo a cada consulta permitiria
 * descobrir o ponto real pela média).
 */
export function gerarLocalAproximado(real: Coord, semente: string): Coord {
  const r = aleatorioDe(semente);
  return deslocar(real, 300 + r() * 500, r() * Math.PI * 2);
}

/** Simula o endereço exato (no back-end: geocodificação real). */
export function simularPontoExato(cidade: string, bairro: string, semente: string): Coord | null {
  const c = coordDe(cidade, bairro);
  if (!c) return null;
  const r = aleatorioDe(semente);
  return deslocar(c, r() * 600, r() * Math.PI * 2);
}

export function distanciaKm(a: Coord, b: Coord) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Distância arredondada para não permitir triangulação ("~3 km"). */
export function distanciaAproximada(a: Coord, b: Coord) {
  const d = distanciaKm(a, b);
  return d < 1 ? 1 : Math.round(d);
}

export const RAIO_AREA_APROX_M = 1000;
