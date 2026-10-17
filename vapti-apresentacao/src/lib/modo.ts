/** Modos de exibição lidos da URL: ?print=1 (impressão, modo claro, sem animação), ?notas=1 (janela de notas). */

const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();

export const isPrint = params.has("print");
export const isNotas = params.has("notas");
export const isResumo = params.has("resumo");

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Sem animação: impressão ou usuário que pediu menos movimento. */
export const semAnimacao = (): boolean => isPrint || prefersReducedMotion();
