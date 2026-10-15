/**
 * Peças comuns dos atos 4, 5 e 6 (gamificação, estrutura, números).
 * Tudo é função pura de `t` (lido do contexto do filme). Nada de estado temporal.
 * Peças locais (não estão no kit): tempo de palavra, entrada genérica, ✓ e ✕ desenhados,
 * avatar abstrato, cadeado, carimbo, onda de impacto e holofote.
 */
import type { CSSProperties, ReactNode } from "react";
import { COR, ease, normalizar, prog, rgba, spring, useFilme, type Tom } from "../../kit";
import type { Timeline } from "../../timeline";

/* ------------------------------------------------------------------ */
/* Tempo                                                               */
/* ------------------------------------------------------------------ */

/**
 * Instante (absoluto) em que a palavra `palavra` começa a ser dita na frase `id`.
 * `ocorrencia` escolhe a n-ésima vez que ela aparece. Sem par, devolve o início da frase.
 */
export function tPal(tl: Timeline, id: string, palavra: string, ocorrencia = 0): number {
  const f = tl.frases.find((x) => x.id === id);
  if (!f) throw new Error(`tPal: frase ${id} não existe.`);
  const alvo = normalizar(palavra);
  let k = 0;
  for (const p of f.palavras) {
    if (normalizar(p.w) === alvo) {
      if (k === ocorrencia) return p.t0;
      k++;
    }
  }
  return f.inicio;
}

/** Fim (t1) da palavra. */
export function tPalFim(tl: Timeline, id: string, palavra: string, ocorrencia = 0): number {
  const f = tl.frases.find((x) => x.id === id);
  if (!f) throw new Error(`tPalFim: frase ${id} não existe.`);
  const alvo = normalizar(palavra);
  let k = 0;
  for (const p of f.palavras) {
    if (normalizar(p.w) === alvo) {
      if (k === ocorrencia) return p.t1;
      k++;
    }
  }
  return f.fim;
}

/** O trecho [a, b] (com margem) contém `t`? Para não montar o que não aparece. */
export const dentro = (t: number, a: number, b: number, margem = 0.6): boolean => t >= a - margem && t <= b + margem;

/** Presença 0..1 numa janela, com entrada e saída suaves (saída termina em `b`). */
export function vida(t: number, a: number, b: number, entrada = 0.45, saida = 0.45): number {
  const e = ease.saida(prog(t, a, a + entrada));
  const s = Number.isFinite(b) ? 1 - ease.inOutSine(prog(t, b - saida, b)) : 1;
  return Math.min(e, s);
}

/* ------------------------------------------------------------------ */
/* Cores dos níveis (só acento: topo do degrau e nome)                 */
/* ------------------------------------------------------------------ */

export const COR_NIVEL: Record<string, string> = {
  entrada: "#9fb0c4",
  bronze: "#d39a6c",
  prata: "#dfe5ec",
  ouro: "#f2c95a",
};
export const RGB_NIVEL: Record<string, string> = {
  entrada: "159 176 196",
  bronze: "211 154 108",
  prata: "223 229 236",
  ouro: "242 201 90",
};

/* ------------------------------------------------------------------ */
/* Entrada genérica                                                    */
/* ------------------------------------------------------------------ */

export interface SurgeProps {
  em: number;
  saida?: number;
  dur?: number;
  /** Deslocamento vertical de entrada (px). */
  dy?: number;
  dx?: number;
  /** Escala inicial (1 = sem escala). */
  escala?: number;
  /** Mola em vez de curva. */
  mola?: boolean;
  origem?: string;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/** Qualquer coisa que entra (opacidade + deslocamento/escala) e sai. Posicione por `style`. */
export function Surge({ em, saida, dur = 0.5, dy = 26, dx = 0, escala = 1, mola = false, origem = "50% 50%", children, style, className }: SurgeProps) {
  const { t } = useFilme();
  const p = mola ? spring(t - em, { k: 200, d: 22 }) : ease.saida(prog(t, em, em + dur));
  const o = ease.outCubic(prog(t, em, em + Math.min(dur, 0.35)));
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.4)) : 0;
  if (o <= 0.001 || q >= 0.999) return null;
  const u = 1 - p;
  const s = escala === 1 ? 1 : escala + (1 - escala) * p;
  return (
    <div
      className={className}
      style={{
        opacity: o * (1 - q),
        transform: `translate(${(u * dx).toFixed(2)}px, ${(u * dy - q * 12).toFixed(2)}px)${s !== 1 ? ` scale(${s.toFixed(4)})` : ""}`,
        transformOrigin: origem,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ✓ e ✕ desenhados                                                     */
/* ------------------------------------------------------------------ */

/** Círculo com ✓ que se desenha em `em` (verde por padrão). */
export function Check({ em, tamanho = 64, tom = "verde", cheio = false, style }: { em: number; tamanho?: number; tom?: Tom; cheio?: boolean; style?: CSSProperties }) {
  const { t } = useFilme();
  const s = spring(t - em, { k: 260, d: 18 });
  const pc = ease.inOutCubic(prog(t, em + 0.08, em + 0.42));
  if (t < em) return <span style={{ display: "inline-block", width: tamanho, height: tamanho, flex: "none", ...style }} />;
  const cor = COR[tom];
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" style={{ flex: "none", overflow: "visible", transform: `scale(${(0.6 + 0.4 * s).toFixed(4)})`, ...style }}>
      <circle cx={32} cy={32} r={28} fill={cheio ? cor : rgba(tom === "texto" ? "texto" : tom, 0.12)} stroke={cor} strokeWidth={3} />
      <path d="M19 33 L28 42 L46 23" fill="none" stroke={cheio ? "var(--cor-tinta)" : cor} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pc} />
    </svg>
  );
}

/** ✕ em coral que "carimba" em `em` (o mesmo peso visual do ✓). */
export function Xis({ em, tamanho = 64, tom = "coral", circulo = true, style }: { em: number; tamanho?: number; tom?: Tom; circulo?: boolean; style?: CSSProperties }) {
  const { t } = useFilme();
  const s = spring(t - em, { k: 300, d: 20 });
  const p1 = ease.inOutCubic(prog(t, em, em + 0.22));
  const p2 = ease.inOutCubic(prog(t, em + 0.12, em + 0.34));
  if (t < em) return <span style={{ display: "inline-block", width: tamanho, height: tamanho, flex: "none", ...style }} />;
  const cor = COR[tom];
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" style={{ flex: "none", overflow: "visible", transform: `scale(${(1.35 - 0.35 * s).toFixed(4)})`, ...style }}>
      {circulo ? <circle cx={32} cy={32} r={28} fill={rgba(tom === "texto" ? "texto" : tom, 0.12)} stroke={cor} strokeWidth={3} opacity={Math.min(1, s)} /> : null}
      <path d="M21 21 L43 43" stroke={cor} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p1} />
      <path d="M43 21 L21 43" stroke={cor} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p2} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar abstrato (forma, nunca rosto)                                */
/* ------------------------------------------------------------------ */

/** Silhueta abstrata: círculo + ombros arredondados. Sem traços de rosto. */
export function Avatar({ tamanho = 120, tom = "verde", style }: { tamanho?: number; tom?: Tom; style?: CSSProperties }) {
  const c = tom === "texto" ? "texto" : tom;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 120 120" style={{ overflow: "visible", ...style }}>
      <circle cx={60} cy={60} r={58} fill={rgba(c, 0.08)} stroke={rgba(c, 0.55)} strokeWidth={2.5} />
      <circle cx={60} cy={46} r={19} fill={rgba(c, 0.9)} />
      <path d="M26 98 C 30 74, 90 74, 94 98 Z" fill={rgba(c, 0.9)} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Cadeado (abre → fecha)                                              */
/* ------------------------------------------------------------------ */

/** Cadeado em traço; `fechar` 0..1 desce a alça. Coral quando fechado. */
export function Cadeado({ fechar, tamanho = 56, style }: { fechar: number; tamanho?: number; style?: CSSProperties }) {
  const f = Math.max(0, Math.min(1, fechar));
  const cor = f > 0.98 ? "var(--cor-coral)" : "var(--cor-texto-2)";
  const sobe = (1 - f) * 12;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 56 56" style={{ flex: "none", overflow: "visible", ...style }}>
      <path d={`M17 ${26 - sobe} V${18 - sobe} a11 11 0 0 1 22 0 V${26 - sobe - (1 - f) * 6}`} fill="none" stroke={cor} strokeWidth={4.5} strokeLinecap="round" />
      <rect x={10} y={25} width={36} height={26} rx={6} fill={f > 0.98 ? rgba("coral", 0.16) : "rgb(255 255 255 / 0.04)"} stroke={cor} strokeWidth={4} />
      <circle cx={28} cy={37} r={3.6} fill={cor} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Onda de impacto e holofote                                          */
/* ------------------------------------------------------------------ */

/** Anel que se expande a partir de (x, y) em `em` (uma vez; nada pisca). */
export function Onda({ em, x, y, tom = "coral", raio = 420, dur = 1.1, espessura = 3, intensidade = 0.7 }: { em: number; x: number; y: number; tom?: Tom; raio?: number; dur?: number; espessura?: number; intensidade?: number }) {
  const { t } = useFilme();
  const p = prog(t, em, em + dur);
  if (p <= 0 || p >= 1) return null;
  const r = raio * ease.outCubic(p);
  const a = intensidade * (1 - p) ** 1.4;
  const c = tom === "texto" ? "texto" : tom;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `${espessura}px solid ${rgba(c, a)}`,
        pointerEvents: "none",
      }}
    />
  );
}

/** Feixe de holofote vindo de cima até (x, y): cone suave + poça de luz. */
export function Holofote({ x, y, largura = 560, intensidade = 1 }: { x: number; y: number; largura?: number; intensidade?: number }) {
  if (intensidade <= 0.002) return null;
  const topo = 0;
  const h = y - topo + 80;
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: intensidade }}>
      <div
        style={{
          position: "absolute",
          left: x - largura / 2,
          top: topo,
          width: largura,
          height: h,
          clipPath: `polygon(${(largura / 2 - 60).toFixed(0)}px 0, ${(largura / 2 + 60).toFixed(0)}px 0, ${largura}px 100%, 0 100%)`,
          background: "linear-gradient(180deg, rgb(242 244 247 / 0.10), rgb(242 244 247 / 0.035) 70%, rgb(242 244 247 / 0))",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Texto miúdo padronizado (≥ 28 px)                                   */
/* ------------------------------------------------------------------ */

export const ESTILO_ROTULO: CSSProperties = {
  fontFamily: "var(--fonte-texto)",
  fontWeight: 600,
  fontSize: 30,
  lineHeight: 1.15,
  color: "var(--cor-texto-2)",
  whiteSpace: "nowrap",
};

export const ESTILO_EYEBROW: CSSProperties = {
  fontFamily: "var(--fonte-texto)",
  fontWeight: 700,
  fontSize: 28,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--cor-texto-2)",
  whiteSpace: "nowrap",
};

export const ESTILO_TITULO: CSSProperties = {
  fontFamily: "var(--fonte-titulo)",
  fontWeight: 800,
  letterSpacing: "-0.035em",
  lineHeight: 1.02,
  color: "var(--cor-texto)",
};

export const ESTILO_MONO: CSSProperties = {
  fontFamily: "var(--fonte-mono)",
  fontWeight: 700,
  letterSpacing: "-0.04em",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

/* ------------------------------------------------------------------ */
/* Poses por chaves (objeto de números interpolado no tempo)           */
/* ------------------------------------------------------------------ */

export type Pose = Record<string, number>;

/**
 * Interpola um objeto de números entre chaves de tempo absoluto (ordenadas).
 * Cada chave pode trazer só alguns campos: os ausentes herdam da chave anterior.
 */
export function poseEmChaves(t: number, chaves: ({ t: number } & Pose)[], curva: (p: number) => number = ease.inOutCubic): Pose {
  const cheias: ({ t: number } & Pose)[] = [];
  let acc: Pose = {};
  for (const c of chaves) {
    acc = { ...acc, ...c };
    cheias.push({ ...acc, t: c.t });
  }
  if (!cheias.length) return {};
  if (t <= cheias[0].t) return cheias[0];
  for (let i = 1; i < cheias.length; i++) {
    const b = cheias[i];
    if (t < b.t) {
      const a = cheias[i - 1];
      const p = curva(prog(t, a.t, b.t));
      const out: Pose = {};
      for (const k of Object.keys(b)) out[k] = (a[k] ?? b[k]) + (b[k] - (a[k] ?? b[k])) * p;
      return out;
    }
  }
  return cheias[cheias.length - 1];
}
