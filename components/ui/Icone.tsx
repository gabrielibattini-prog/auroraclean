import type { CSSProperties, ReactNode } from "react";

/**
 * Iconografia Aurora Clean (estilo Duolingo, grid 48×48).
 * Forma principal oliva + sombra inferior + detalhe creme/branco + um acento.
 * As cores vêm dos tokens (--icon-*), então funcionam no tema escuro
 * e no estado inativo (classe .icone-inativo).
 */
type Tom = "main" | "shade" | "fill" | "shine" | "accent" | "gold";

const f = (t: Tom): CSSProperties => ({ fill: `var(--icon-${t})` });
const tr = (t: Tom, largura = 3.5): CSSProperties => ({
  fill: "none",
  stroke: `var(--icon-${t})`,
  strokeWidth: largura,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});
const fs = (t: Tom): CSSProperties => ({
  ...tr(t),
  fill: `var(--icon-${t})`,
});

const icones = {
  casa: (
    <>
      <path style={f("shade")} d="M8 24 L24 10 L40 24 V40 a4 4 0 0 1-4 4 H12 a4 4 0 0 1-4-4Z" />
      <path style={f("main")} d="M8 24 L24 10 L40 24 V37 a4 4 0 0 1-4 4 H12 a4 4 0 0 1-4-4Z" />
      <path style={fs("accent")} d="M4 24 L24 6 L44 24 L41 27 L24 12 L7 27Z" />
      <rect style={f("fill")} x="19" y="27" width="10" height="14" rx="3" />
      <circle style={f("shine")} cx="24" cy="20" r="2.5" />
    </>
  ),
  apartamento: (
    <>
      <rect style={f("shade")} x="11" y="6" width="26" height="38" rx="5" />
      <rect style={f("main")} x="11" y="6" width="26" height="35" rx="5" />
      <rect style={f("fill")} x="16" y="11" width="6" height="6" rx="2" />
      <rect style={f("fill")} x="26" y="11" width="6" height="6" rx="2" />
      <rect style={f("fill")} x="16" y="20" width="6" height="6" rx="2" />
      <rect style={f("fill")} x="26" y="20" width="6" height="6" rx="2" />
      <rect style={f("accent")} x="20" y="31" width="8" height="10" rx="2" />
    </>
  ),
  escritorio: (
    <>
      <path style={tr("shade")} d="M18 15 V12 a3 3 0 0 1 3-3 h6 a3 3 0 0 1 3 3 V15" />
      <rect style={f("shade")} x="6" y="15" width="36" height="27" rx="6" />
      <rect style={f("main")} x="6" y="15" width="36" height="24" rx="6" />
      <rect style={f("fill")} x="20" y="24" width="8" height="7" rx="2" />
    </>
  ),
  brilho: (
    <>
      <path style={f("accent")} d="M21 8 Q21 26 39 26 Q21 26 21 44 Q21 26 3 26 Q21 26 21 8Z" />
      <path style={f("main")} d="M38 2 Q38 10 46 10 Q38 10 38 18 Q38 10 30 10 Q38 10 38 2Z" />
      <path style={f("gold")} d="M39 31 Q39 36 44 36 Q39 36 39 41 Q39 36 34 36 Q39 36 39 31Z" />
    </>
  ),
  calendario: (
    <>
      <rect style={f("shade")} x="6" y="9" width="36" height="34" rx="6" />
      <rect style={f("fill")} x="6" y="9" width="36" height="31" rx="6" />
      <path style={f("main")} d="M6 15 a6 6 0 0 1 6-6 H36 a6 6 0 0 1 6 6 V19 H6Z" />
      <rect style={f("shade")} x="14" y="5" width="4" height="9" rx="2" />
      <rect style={f("shade")} x="30" y="5" width="4" height="9" rx="2" />
      <path style={tr("main")} d="M17 29 L22 34 L31 25" />
    </>
  ),
  camera: (
    <>
      <rect style={f("main")} x="16" y="8" width="16" height="8" rx="3" />
      <rect style={f("shade")} x="5" y="13" width="38" height="29" rx="7" />
      <rect style={f("main")} x="5" y="13" width="38" height="27" rx="7" />
      <circle style={f("fill")} cx="24" cy="27" r="9" />
      <circle style={f("shade")} cx="24" cy="27" r="5" />
      <circle style={f("gold")} cx="36" cy="19" r="2" />
    </>
  ),
  carteira: (
    <>
      <rect style={f("accent")} x="10" y="6" width="24" height="10" rx="3" />
      <rect style={f("shade")} x="5" y="12" width="38" height="30" rx="6" />
      <rect style={f("main")} x="5" y="12" width="38" height="28" rx="6" />
      <rect style={f("fill")} x="28" y="21" width="15" height="11" rx="4" />
      <circle style={f("shade")} cx="34" cy="26.5" r="2.5" />
    </>
  ),
  chat: (
    <>
      <path style={f("shade")} d="M6 13 a7 7 0 0 1 7-7 H35 a7 7 0 0 1 7 7 V29 a7 7 0 0 1-7 7 H21 L12 44 V36 a7 7 0 0 1-6-7Z" />
      <path style={f("main")} d="M6 11 a7 7 0 0 1 7-7 H35 a7 7 0 0 1 7 7 V27 a7 7 0 0 1-7 7 H21 L12 41 V34 a7 7 0 0 1-6-7Z" />
      <circle style={f("fill")} cx="16" cy="19" r="2.8" />
      <circle style={f("fill")} cx="24" cy="19" r="2.8" />
      <circle style={f("fill")} cx="32" cy="19" r="2.8" />
    </>
  ),
  checklist: (
    <>
      <rect style={f("shade")} x="9" y="8" width="30" height="36" rx="5" />
      <rect style={f("fill")} x="9" y="8" width="30" height="34" rx="5" />
      <rect style={f("main")} x="17" y="4" width="14" height="8" rx="3" />
      <path style={tr("main")} d="M14 22 l3 3 l5-5" />
      <rect style={f("main")} x="25" y="20" width="10" height="4" rx="2" />
      <path style={tr("main")} d="M14 33 l3 3 l5-5" />
      <rect style={f("main")} x="25" y="31" width="10" height="4" rx="2" />
    </>
  ),
  coracao: (
    <>
      <path style={f("accent")} d="M24 42 C10 32 5 25 5 17 a10 10 0 0 1 19-4 a10 10 0 0 1 19 4 C43 25 38 32 24 42Z" />
      <ellipse style={f("shine")} cx="14" cy="17" rx="2.5" ry="4" />
    </>
  ),
  cozinha: (
    <>
      <rect style={f("shade")} x="12" y="5" width="24" height="39" rx="5" />
      <rect style={f("main")} x="12" y="5" width="24" height="37" rx="5" />
      <rect style={f("shade")} x="12" y="18" width="24" height="3" />
      <rect style={f("fill")} x="16" y="9" width="3.5" height="6" rx="1.75" />
      <rect style={f("fill")} x="16" y="25" width="3.5" height="10" rx="1.75" />
    </>
  ),
  cupom: (
    <>
      <path style={f("accent")} d="M6 14 a3 3 0 0 1 3-3 H39 a3 3 0 0 1 3 3 V19 a5 5 0 0 0 0 10 V34 a3 3 0 0 1-3 3 H9 a3 3 0 0 1-3-3 V29 a5 5 0 0 0 0-10Z" />
      <path style={tr("fill")} d="M31 15 V17 M31 23 V25 M31 31 V33" />
      <circle style={f("shine")} cx="14" cy="19" r="2.5" />
      <circle style={f("shine")} cx="22" cy="29" r="2.5" />
      <path style={tr("shine")} d="M23 18 L13 30" />
    </>
  ),
  estrela: (
    <>
      <path style={fs("gold")} d="M24 5 L29.6 17 L42.5 18.6 L33 27.6 L35.5 40.5 L24 34 L12.5 40.5 L15 27.6 L5.5 18.6 L18.4 17Z" />
      <ellipse style={f("shine")} cx="18" cy="22" rx="2" ry="3.5" />
    </>
  ),
  janelas: (
    <>
      <rect style={f("shade")} x="7" y="9" width="32" height="34" rx="5" />
      <rect style={f("main")} x="7" y="9" width="32" height="32" rx="5" />
      <rect style={f("fill")} x="11" y="13" width="11" height="11" rx="2" />
      <rect style={f("fill")} x="24" y="13" width="11" height="11" rx="2" />
      <rect style={f("fill")} x="11" y="26" width="11" height="11" rx="2" />
      <rect style={f("fill")} x="24" y="26" width="11" height="11" rx="2" />
      <path style={f("gold")} d="M39 1 Q39 9 47 9 Q39 9 39 17 Q39 9 31 9 Q39 9 39 1Z" />
    </>
  ),
  local: (
    <>
      <path style={f("shade")} d="M24 46 C24 46 9 31 9 20 a15 15 0 0 1 30 0 C39 31 24 46 24 46Z" />
      <path style={f("main")} d="M24 43 C24 43 9 29 9 18 a15 15 0 0 1 30 0 C39 29 24 43 24 43Z" />
      <circle style={f("fill")} cx="24" cy="18" r="6" />
    </>
  ),
  passadoria: (
    <>
      <path style={tr("shade")} d="M22 16 V11 H38 V16" />
      <path style={f("main")} d="M6 37 C6 24 14 16 26 16 H38 a4 4 0 0 1 4 4 V37Z" />
      <rect style={f("shade")} x="4" y="35" width="40" height="7" rx="3.5" />
      <circle style={f("fill")} cx="32" cy="26" r="4.5" />
      <circle style={f("shine")} cx="16" cy="28" r="2" />
    </>
  ),
  "pos-obra": (
    <>
      <rect style={f("shade")} x="5" y="33" width="38" height="8" rx="4" />
      <path style={f("accent")} d="M10 33 a14 14 0 0 1 28 0Z" />
      <rect style={f("fill")} x="21" y="17" width="6" height="12" rx="3" />
      <rect style={f("main")} x="5" y="31" width="38" height="7" rx="3.5" />
    </>
  ),
  relogio: (
    <>
      <circle style={f("shade")} cx="24" cy="26" r="19" />
      <circle style={f("main")} cx="24" cy="24" r="19" />
      <circle style={f("fill")} cx="24" cy="24" r="14" />
      <path style={tr("shade")} d="M24 15 V24 L30 28" />
    </>
  ),
  repetir: (
    <>
      <path style={tr("main")} d="M37 18 A15 15 0 0 0 12 14" />
      <path style={f("main")} d="M5 10 L17 12 L9 21Z" />
      <path style={tr("accent")} d="M11 30 A15 15 0 0 0 36 34" />
      <path style={f("accent")} d="M43 38 L31 36 L39 27Z" />
    </>
  ),
  sino: (
    <>
      <circle style={f("gold")} cx="24" cy="8" r="3" />
      <circle style={f("shade")} cx="24" cy="39" r="4.5" />
      <path style={fs("gold")} d="M12 34 V22 a12 12 0 0 1 24 0 V34 L39 37 H9Z" />
      <rect style={f("shine")} x="16" y="18" width="3" height="10" rx="1.5" />
    </>
  ),
  spray: (
    <>
      <rect style={f("shade")} x="7" y="7" width="8" height="5" rx="2" />
      <path style={f("shade")} d="M14 5 H30 a3 3 0 0 1 3 3 V14 H14Z" />
      <rect style={f("fill")} x="18" y="14" width="10" height="6" />
      <path style={f("main")} d="M15 20 H31 a5 5 0 0 1 5 5 V40 a4 4 0 0 1-4 4 H14 a4 4 0 0 1-4-4 V25 a5 5 0 0 1 5-5Z" />
      <rect style={f("fill")} x="16" y="27" width="14" height="9" rx="3" />
      <circle style={f("accent")} cx="4" cy="6" r="2" />
      <circle style={f("accent")} cx="5" cy="13" r="1.5" />
    </>
  ),
  suporte: (
    <>
      <path style={tr("shade")} d="M10 26 V22 a14 14 0 0 1 28 0 V26" />
      <rect style={f("main")} x="6" y="22" width="9" height="15" rx="4" />
      <rect style={f("main")} x="33" y="22" width="9" height="15" rx="4" />
      <path style={tr("shade")} d="M37.5 37 C37.5 41 33 43 28 43" />
      <circle style={f("accent")} cx="25" cy="43" r="3" />
    </>
  ),
  usuario: (
    <>
      <path style={f("main")} d="M8 41 a16 13 0 0 1 32 0 v1 a3 3 0 0 1-3 3 H11 a3 3 0 0 1-3-3Z" />
      <circle style={f("shade")} cx="24" cy="17" r="10" />
      <circle style={f("accent")} cx="24" cy="16" r="9" />
      <circle style={f("shine")} cx="20.5" cy="13" r="2" />
    </>
  ),
  vassoura: (
    <>
      <rect style={f("accent")} x="21.5" y="3" width="5" height="24" rx="2.5" />
      <rect style={f("shade")} x="15" y="24" width="18" height="7" rx="3.5" />
      <path style={f("main")} d="M15 30 H33 L39 41 a2 2 0 0 1-1.8 3 H10.8 a2 2 0 0 1-1.8-3Z" />
      <path style={tr("fill")} d="M19 35 L17.5 41 M24 35 V41 M29 35 L30.5 41" />
    </>
  ),
  verificado: (
    <>
      <path style={f("shade")} d="M24 5 L40 11 V23 C40 33 33 40 24 44 C15 40 8 33 8 23 V11Z" />
      <path style={f("main")} d="M24 5 L40 11 V22 C40 31 33 37 24 41 C15 37 8 31 8 22 V11Z" />
      <path style={tr("shine")} d="M17 23 L22 28 L31 18" />
    </>
  ),

  /* ---- Ícones novos (estofados e plataforma), no mesmo estilo ---- */
  whatsapp: (
    <>
      <path transform="translate(0 3)" style={f("shade")} d="M24 5 a19 19 0 1 1 -9.5 35.4 L6 43 l2.6 -8.2 A19 19 0 0 1 24 5Z" />
      <path style={f("main")} d="M24 5 a19 19 0 1 1 -9.5 35.4 L6 43 l2.6 -8.2 A19 19 0 0 1 24 5Z" />
      <path
        style={f("fill")}
        d="M17 15.5 c1-1 2.5-1 3.2 0 l2 2.8 c.6.9.4 2-.4 2.7 l-1.2 1 c1 2.3 2.8 4.1 5.1 5.1 l1-1.2 c.7-.8 1.8-1 2.7-.4 l2.8 2 c1 .7 1 2.2 0 3.2 l-1.4 1.4 c-1.6 1.6-4.1 1.9-6.1.8 c-4-2.2-7.3-5.5-9.5-9.5 c-1.1-2-.8-4.5.8-6.1Z"
      />
      <circle style={f("gold")} cx="38" cy="9" r="3" />
    </>
  ),
  sofa: (
    <>
      <rect style={f("shade")} x="3" y="24" width="42" height="18" rx="6" />
      <rect style={f("main")} x="8" y="9" width="32" height="20" rx="7" />
      <rect style={f("main")} x="3" y="22" width="42" height="17" rx="6" />
      <rect style={f("fill")} x="11" y="26" width="12" height="6" rx="3" />
      <rect style={f("fill")} x="25" y="26" width="12" height="6" rx="3" />
      <rect style={f("accent")} x="8" y="40" width="4" height="5" rx="2" />
      <rect style={f("accent")} x="36" y="40" width="4" height="5" rx="2" />
      <circle style={f("shine")} cx="14" cy="15" r="2" />
    </>
  ),
  poltrona: (
    <>
      <rect style={f("shade")} x="7" y="24" width="34" height="18" rx="6" />
      <rect style={f("main")} x="12" y="6" width="24" height="23" rx="7" />
      <rect style={f("main")} x="7" y="22" width="34" height="17" rx="6" />
      <rect style={f("fill")} x="15" y="26" width="18" height="6" rx="3" />
      <rect style={f("accent")} x="11" y="40" width="4" height="5" rx="2" />
      <rect style={f("accent")} x="33" y="40" width="4" height="5" rx="2" />
      <circle style={f("shine")} cx="18" cy="12" r="2" />
    </>
  ),
  colchao: (
    <>
      <rect style={f("shade")} x="4" y="18" width="40" height="22" rx="6" />
      <rect style={f("main")} x="4" y="15" width="40" height="22" rx="6" />
      <rect style={f("fill")} x="8" y="19" width="13" height="7" rx="3.5" />
      <path style={tr("fill", 3)} d="M26 22.5 H38 M10 31 H38" />
      <rect style={f("accent")} x="8" y="38" width="4" height="5" rx="2" />
      <rect style={f("accent")} x="36" y="38" width="4" height="5" rx="2" />
    </>
  ),
  cadeira: (
    <>
      <rect style={f("main")} x="13" y="4" width="22" height="22" rx="6" />
      <rect style={f("fill")} x="17" y="8" width="14" height="12" rx="3" />
      <path style={tr("shade")} d="M15 33 V44 M33 33 V44" />
      <rect style={f("shade")} x="9" y="26" width="30" height="9" rx="4" />
      <rect style={f("main")} x="9" y="23" width="30" height="9" rx="4" />
      <circle style={f("accent")} cx="24" cy="27.5" r="2" />
    </>
  ),
  gota: (
    <>
      <path style={f("shade")} d="M24 7 C24 7 10 23 10 33 a14 14 0 0 0 28 0 C38 23 24 7 24 7Z" />
      <path style={f("main")} d="M24 4 C24 4 10 20 10 30 a14 14 0 0 0 28 0 C38 20 24 4 24 4Z" />
      <path style={tr("fill")} d="M17 31 a7 7 0 0 0 7 7" />
      <ellipse style={f("shine")} cx="19" cy="23" rx="2" ry="3.5" />
      <path style={f("gold")} d="M40 3 Q40 9 46 9 Q40 9 40 15 Q40 9 34 9 Q40 9 40 3Z" />
    </>
  ),
  laudo: (
    <>
      <rect style={f("shade")} x="9" y="6" width="30" height="38" rx="5" />
      <rect style={f("fill")} x="9" y="4" width="30" height="37" rx="5" />
      <rect style={f("main")} x="14" y="10" width="20" height="4" rx="2" />
      <rect style={f("main")} x="14" y="18" width="14" height="4" rx="2" />
      <rect style={f("main")} x="14" y="26" width="10" height="4" rx="2" />
      <circle style={f("accent")} cx="33" cy="34" r="8" />
      <path style={tr("shine", 3)} d="M29.5 34 l2.5 2.5 l4.5-5" />
    </>
  ),
  mapa: (
    <>
      <rect style={f("shade")} x="4" y="11" width="40" height="31" rx="5" />
      <rect style={f("main")} x="4" y="8" width="40" height="31" rx="5" />
      <path style={f("fill")} d="M17 8 H31 V39 H17Z" />
      <circle style={f("accent")} cx="24" cy="21" r="6" />
      <circle style={f("shine")} cx="24" cy="21" r="2.2" />
      <path style={f("accent")} d="M19.5 25 L24 32 L28.5 25Z" />
    </>
  ),
  cards: (
    <>
      <rect style={f("shade")} x="6" y="8" width="36" height="15" rx="5" />
      <rect style={f("main")} x="6" y="5" width="36" height="15" rx="5" />
      <rect style={f("fill")} x="11" y="10.5" width="15" height="4" rx="2" />
      <circle style={f("accent")} cx="35" cy="12.5" r="3" />
      <rect style={f("shade")} x="6" y="29" width="36" height="15" rx="5" />
      <rect style={f("main")} x="6" y="26" width="36" height="15" rx="5" />
      <rect style={f("fill")} x="11" y="31.5" width="21" height="4" rx="2" />
    </>
  ),
  documento: (
    <>
      <rect style={f("shade")} x="4" y="12" width="40" height="30" rx="6" />
      <rect style={f("main")} x="4" y="10" width="40" height="29" rx="6" />
      <circle style={f("fill")} cx="15" cy="21" r="5" />
      <rect style={f("fill")} x="9" y="28" width="12" height="5" rx="2.5" />
      <rect style={f("fill")} x="25" y="18" width="14" height="3.5" rx="1.75" />
      <rect style={f("fill")} x="25" y="25" width="10" height="3.5" rx="1.75" />
      <circle style={f("accent")} cx="37" cy="32" r="2.5" />
    </>
  ),
  certificado: (
    <>
      <path style={f("accent")} d="M15 28 L10 44 L17 41 L20 47 L24 32Z" />
      <path style={f("accent")} d="M33 28 L38 44 L31 41 L28 47 L24 32Z" />
      <circle style={f("shade")} cx="24" cy="21" r="15" />
      <circle style={f("main")} cx="24" cy="19" r="15" />
      <circle style={f("fill")} cx="24" cy="19" r="10" />
      <path style={fs("gold")} d="M24 13 L26 17.2 L30.5 17.7 L27.2 20.7 L28 25 L24 22.8 L20 25 L20.8 20.7 L17.5 17.7 L22 17.2Z" />
    </>
  ),
  pet: (
    <>
      <ellipse style={f("shade")} cx="24" cy="34" rx="11" ry="9" />
      <ellipse style={f("main")} cx="24" cy="32" rx="11" ry="9" />
      <circle style={f("main")} cx="11" cy="20" r="4.5" />
      <circle style={f("main")} cx="19" cy="12" r="4.5" />
      <circle style={f("main")} cx="29" cy="12" r="4.5" />
      <circle style={f("main")} cx="37" cy="20" r="4.5" />
      <ellipse style={f("fill")} cx="24" cy="32" rx="5" ry="3.5" />
      <circle style={f("accent")} cx="37" cy="20" r="2" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type NomeIcone = keyof typeof icones;

export function Icone({
  nome,
  tamanho = 24,
  inativo = false,
  className = "",
  rotulo,
}: {
  nome: NomeIcone;
  tamanho?: 20 | 24 | 28 | 32 | 40 | 48 | 64;
  inativo?: boolean;
  className?: string;
  /** Texto para leitor de tela. Sem rótulo, o ícone é decorativo. */
  rotulo?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={tamanho}
      height={tamanho}
      className={`shrink-0 ${inativo ? "icone-inativo" : ""} ${className}`}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
      focusable="false"
    >
      {icones[nome]}
    </svg>
  );
}
