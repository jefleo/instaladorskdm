/**
 * Geometria do palco e zonas dos layouts sem apresentador (SPEC §5).
 * Tudo em px do palco fixo 1920×1080. Os cantos superiores são do <Capitulo> (esquerdo)
 * e da <MarcaCanto> (direito); a faixa inferior é da <Legenda> na versão legendada.
 */
import type { CSSProperties, ReactNode } from "react";

export const PALCO = { largura: 1920, altura: 1080, margem: 120, topo: 140, base: 96 } as const;

export interface Retangulo {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Zonas por layout:
 * - L1: composição central com ar (um objeto/tipografia em destaque).
 * - L2: terço esquerdo = palavra-chave grande; dois terços da direita = visual.
 * - L3: visual ocupa a tela; rótulo pequeno no canto inferior esquerdo.
 * - L4: tela cheia, só visual (≤ 4 s seguidos).
 * - L5: número gigante no fundo (com profundidade) e a cena menor à frente.
 */
export const ZONAS = {
  L1: { centro: { x: 360, y: 200, w: 1200, h: 680 } },
  L2: { esquerda: { x: 120, y: 200, w: 520, h: 680 }, direita: { x: 700, y: 150, w: 1100, h: 780 } },
  L3: { visual: { x: 120, y: 150, w: 1680, h: 740 }, rotulo: { x: 120, y: 930, w: 900, h: 70 } },
  L4: { tela: { x: 0, y: 0, w: 1920, h: 1080 } },
  L5: { fundo: { x: 0, y: 140, w: 1920, h: 800 }, frente: { x: 360, y: 260, w: 1200, h: 620 } },
} as const satisfies Record<string, Record<string, Retangulo>>;

export interface ZonaProps {
  r: Retangulo;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Mostra o contorno da zona (só para depurar). */
  depurar?: boolean;
}

/** Caixa absoluta numa zona do palco. */
export function Zona({ r, children, className, style, depurar }: ZonaProps) {
  return (
    <div className={className} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, outline: depurar ? "1px dashed rgb(143 184 255 / 0.5)" : undefined, ...style }}>
      {children}
    </div>
  );
}
