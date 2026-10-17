/** Tons semânticos compartilhados pelos componentes base. */
export type Tom = "verde" | "coral" | "azul" | "cinza" | "texto";

/** Classes de cor de texto por tom (utilitários do @theme em tokens.css). */
export const corTexto: Record<Tom, string> = {
  verde: "text-verde",
  coral: "text-coral",
  azul: "text-azul",
  cinza: "text-cinza",
  texto: "text-texto",
};

/** Movimento padrão das entradas (200–400 ms, saída suave). Use com motion. */
export const movimento = {
  rapida: 0.2,
  base: 0.3,
  lenta: 0.4,
  contagem: 1.1,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  deslocamento: 16,
} as const;
