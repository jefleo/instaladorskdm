/**
 * Cores do filme — os mesmos valores de src/styles/tokens.css (modo escuro).
 * Cada cor tem UM significado: verde = Vapti / dinheiro entrando; coral = risco / perda;
 * azul-gelo = dado neutro; cinza = Zippi e terceiros (sempre só texto).
 * Verde e coral têm o mesmo peso visual (mesma opacidade de fundo, borda e brilho).
 */

export type Tom = "verde" | "coral" | "azul" | "cinza" | "texto";

/** Canais RGB de cada tom (para montar transparências). */
export const RGB: Record<Tom | "tinta" | "superficie" | "superficie2" | "texto2" | "texto3", string> = {
  verde: "182 242 58",
  coral: "255 122 69",
  azul: "143 184 255",
  cinza: "139 149 161",
  texto: "242 244 247",
  texto2: "180 188 199",
  texto3: "139 149 161",
  tinta: "14 17 22",
  superficie: "22 27 34",
  superficie2: "29 36 46",
};

/** Cor sólida por tom (variável CSS do tokens.css). */
export const COR: Record<Tom, string> = {
  verde: "var(--cor-verde)",
  coral: "var(--cor-coral)",
  azul: "var(--cor-azul)",
  cinza: "var(--cor-cinza)",
  texto: "var(--cor-texto)",
};

/** `rgb(r g b / a)` de um tom. Ex.: `rgba("verde", 0.3)`. */
export const rgba = (tom: keyof typeof RGB, a: number): string => `rgb(${RGB[tom]} / ${Math.max(0, Math.min(1, a)).toFixed(3)})`;

/** Brilho (text-shadow) suave na cor do tom; `forca` 0..1. Barato: sem filter. */
export const brilhoTexto = (tom: Tom, forca = 1): string =>
  forca <= 0.01 ? "none" : `0 0 ${Math.round(18 + 22 * forca)}px ${rgba(tom, 0.32 * forca)}, 0 0 ${Math.round(60 + 40 * forca)}px ${rgba(tom, 0.14 * forca)}`;

/** Brilho (box-shadow) em volta de caixas na cor do tom. */
export const brilhoCaixa = (tom: Tom, forca = 1): string =>
  forca <= 0.01 ? "" : `0 0 ${Math.round(24 + 30 * forca)}px ${rgba(tom, 0.22 * forca)}, 0 0 ${Math.round(90 + 50 * forca)}px ${rgba(tom, 0.1 * forca)}`;

/** Sombra de profundidade (cartões, celular): suave e longa. */
export const SOMBRA_PROFUNDA = "0 1px 0 rgb(255 255 255 / 0.06) inset, 0 40px 90px -30px rgb(0 0 0 / 0.85), 0 18px 40px -20px rgb(0 0 0 / 0.6)";
