/**
 * Tempo e easing — funções puras de `t` (segundos absolutos do filme).
 *
 * Regra de ouro do filme: tudo o que aparece no quadro é f(t). Nada de Date.now,
 * Math.random, performance.now, setTimeout, requestAnimationFrame, CSS transition/animation
 * ou estado temporal. Aleatoriedade só por `mulberry32(seed)`.
 */

/** Função de easing: recebe 0..1 e devolve (em geral) 0..1. */
export type Curva = (p: number) => number;

/** Limita `x` ao intervalo [a, b]. */
export const clamp = (x: number, a: number, b: number): number => (x < a ? a : x > b ? b : x);

/** Limita `x` a [0, 1]. */
export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Interpolação linear de `a` até `b` por `p` (sem limitar `p`). */
export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;

/**
 * Progresso 0..1 de `t` dentro da janela [t0, t1] (limitado).
 * Janela vazia (t1 ≤ t0) vira degrau: 0 antes de t0, 1 a partir dele.
 */
export function prog(t: number, t0: number, t1: number): number {
  if (t1 <= t0) return t >= t0 ? 1 : 0;
  return clamp01((t - t0) / (t1 - t0));
}

/**
 * Mapeia `t` de [t0, t1] para [v0, v1] com easing opcional.
 * Ex.: `mapear(t, 2, 2.4, 40, 0, ease.outCubic)` → deslocamento que assenta em 0.
 */
export function mapear(t: number, t0: number, t1: number, v0: number, v1: number, curva: Curva = linear): number {
  return lerp(v0, v1, curva(prog(t, t0, t1)));
}

/* ------------------------------------------------------------------ */
/* Curvas                                                              */
/* ------------------------------------------------------------------ */

const linear: Curva = (p) => p;

/**
 * Bézier cúbica no estilo CSS (x1, y1, x2, y2), resolvida por Newton + bisseção.
 * Determinista e barata; use para casar com o `--ease-saida` do site.
 */
export function bezier(x1: number, y1: number, x2: number, y2: number): Curva {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  return (p: number) => {
    const x = clamp01(p);
    if (x === 0 || x === 1) return x;
    let u = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(u) - x;
      if (Math.abs(e) < 1e-6) return sy(u);
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= e / d;
    }
    let lo = 0;
    let hi = 1;
    u = x;
    for (let i = 0; i < 30; i++) {
      const v = sx(u);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return sy(u);
  };
}

/** Parâmetros da mola: k = rigidez, d = amortecimento, m = massa, v0 = velocidade inicial. */
export interface Mola {
  k?: number;
  d?: number;
  m?: number;
  v0?: number;
}

/**
 * Mola amortecida analítica (determinista). `t` = SEGUNDOS desde o disparo (não 0..1).
 * Vai de 0 a 1, podendo passar de 1 (overshoot) se pouco amortecida.
 * Padrão {k: 170, d: 26}: assenta em ~0,5 s com leve sobra.
 * Ex.: `const s = spring(t - tE, { k: 220, d: 18 })` → escala `0.9 + 0.1 * s`.
 */
export function spring(t: number, { k = 170, d = 26, m = 1, v0 = 0 }: Mola = {}): number {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k / m);
  const zeta = d / (2 * Math.sqrt(k * m));
  let x: number; // deslocamento até o alvo (começa em −1)
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const B = (v0 - zeta * w0) / wd;
    x = Math.exp(-zeta * w0 * t) * (-Math.cos(wd * t) + B * Math.sin(wd * t));
  } else if (zeta === 1) {
    x = (-1 + (v0 - w0) * t) * Math.exp(-w0 * t);
  } else {
    const r = Math.sqrt(zeta * zeta - 1);
    const r1 = -w0 * (zeta - r);
    const r2 = -w0 * (zeta + r);
    const c2 = (v0 + r1) / (r2 - r1);
    const c1 = -1 - c2;
    x = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
  }
  return 1 + x;
}

/** Curvas de easing (0..1 → 0..1). `saida` é o mesmo `--ease-saida` do site. */
export const ease = {
  linear,
  inCubic: (p: number) => clamp01(p) ** 3,
  outCubic: (p: number) => 1 - (1 - clamp01(p)) ** 3,
  inOutCubic: (p: number) => {
    const x = clamp01(p);
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  },
  outQuint: (p: number) => 1 - (1 - clamp01(p)) ** 5,
  outExpo: (p: number) => {
    const x = clamp01(p);
    return x === 1 ? 1 : 1 - 2 ** (-10 * x);
  },
  inOutExpo: (p: number) => {
    const x = clamp01(p);
    if (x === 0 || x === 1) return x;
    return x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2;
  },
  outBack: (p: number) => {
    const x = clamp01(p);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
  },
  inOutSine: (p: number) => -(Math.cos(Math.PI * clamp01(p)) - 1) / 2,
  /** Igual ao `--ease-saida` do site: chega rápido, assenta suave. */
  saida: bezier(0.22, 1, 0.36, 1),
  /** Mola como curva; `t` em segundos desde o disparo. */
  spring,
} as const;

/** Atraso escalonado do item `i`: `inicio + i * passo`. */
export const stagger = (i: number, passo: number, inicio = 0): number => inicio + i * passo;

/**
 * Envelope de presença 0..1: entra em [t0, t0 + entrada], fica, sai em [t1 − saida, t1].
 * Use para opacidade de elementos que vivem numa janela. `t1 = Infinity` = nunca sai.
 */
export function envelope(t: number, t0: number, t1: number, entrada = 0.35, saida = 0.35, curva: Curva = ease.outCubic): number {
  const a = curva(prog(t, t0, t0 + entrada));
  const b = Number.isFinite(t1) ? 1 - ease.inOutSine(prog(t, t1 - saida, t1)) : 1;
  return Math.min(a, b);
}

/** Quadro (inteiro) do instante `t`. */
export const quadro = (t: number, fps = 30): number => Math.floor(t * fps + 1e-6);

/** Oscilação suave −1..1 com período em segundos (respiração, brilho). */
export const oscilar = (t: number, periodo: number, fase = 0): number => Math.sin(((t / periodo) * 2 + fase) * Math.PI);

/* ------------------------------------------------------------------ */
/* Aleatoriedade determinista                                          */
/* ------------------------------------------------------------------ */

/** Gerador pseudoaleatório Mulberry32: mesma `seed` → mesma sequência, sempre. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash inteiro de um número (para sementes por índice/quadro). */
export function hash(n: number, seed = 0): number {
  let h = (Math.imul(n | 0, 0x9e3779b1) ^ Math.imul(seed | 0, 0x85ebca77)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Ruído 1D suave (value noise com interpolação cúbica), −1..1, determinista.
 * Bom para derivas orgânicas lentas: `ruido(t / 6, 3) * 8` px.
 */
export function ruido(x: number, seed = 0): number {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i, seed) / 4294967296;
  const b = hash(i + 1, seed) / 4294967296;
  const u = f * f * (3 - 2 * f);
  return (a + (b - a) * u) * 2 - 1;
}
