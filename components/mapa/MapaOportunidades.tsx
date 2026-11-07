"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { OportunidadePublica } from "@/lib/dados/consultas";
import type { Coord } from "@/lib/dados/tipos";
import { RAIO_AREA_APROX_M } from "@/lib/geo";
import { moeda } from "@/lib/dados/util";

/** Zoom máximo limitado para não "achar a casa" dentro da área aproximada. */
const ZOOM_MAX = 14;

function lerCor(nome: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim() || "#9a5638";
}

const iconeBase = L.divIcon({
  className: "",
  html: `<span style="display:block;width:22px;height:22px;border-radius:999px;background:var(--brand-olive);border:4px solid var(--surface-card);box-shadow:0 3px 0 var(--brand-olive-deep)"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function Enquadrar({ base, raioKm }: { base: Coord; raioKm: number }) {
  const mapa = useMap();
  useEffect(() => {
    const limites = L.latLng(base.lat, base.lng).toBounds(raioKm * 2000);
    mapa.fitBounds(limites, { padding: [16, 16] });
  }, [mapa, base.lat, base.lng, raioKm]);
  return null;
}

/**
 * Mapa de oportunidades (Leaflet + OpenStreetMap).
 * Cada pedido aparece como um CÍRCULO de ~1 km em volta de um ponto já
 * deslocado do endereço real — nunca um alfinete no endereço.
 */
export default function MapaOportunidades({
  base,
  raioKm,
  oportunidades,
  selecionada,
  aoSelecionar,
}: {
  base: Coord;
  raioKm: number;
  oportunidades: OportunidadePublica[];
  selecionada: string | null;
  aoSelecionar: (id: string) => void;
}) {
  const clay = lerCor("--accent-clay");
  const oliva = lerCor("--brand-olive");

  return (
    <MapContainer
      center={[base.lat, base.lng]}
      zoom={12}
      maxZoom={ZOOM_MAX}
      minZoom={9}
      scrollWheelZoom
      className="h-full w-full rounded-xl"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={ZOOM_MAX}
      />
      <Enquadrar base={base} raioKm={raioKm} />
      <Circle
        center={[base.lat, base.lng]}
        radius={raioKm * 1000}
        pathOptions={{ color: oliva, weight: 2, dashArray: "6 8", fillOpacity: 0.04 }}
        interactive={false}
      />
      <Marker position={[base.lat, base.lng]} icon={iconeBase} interactive={false} />
      {oportunidades.map((o) => {
        const ativa = o.id === selecionada;
        return (
          <Circle
            key={o.id}
            center={[o.localAprox.lat, o.localAprox.lng]}
            radius={RAIO_AREA_APROX_M}
            pathOptions={{ color: clay, weight: ativa ? 4 : 2, fillColor: clay, fillOpacity: ativa ? 0.45 : 0.25 }}
            eventHandlers={{ click: () => aoSelecionar(o.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {o.bairro} · {moeda(o.valor)}
            </Tooltip>
          </Circle>
        );
      })}
    </MapContainer>
  );
}
