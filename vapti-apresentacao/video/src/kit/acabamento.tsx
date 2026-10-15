/**
 * Acabamento de imagem: grão, vinheta, graduação de cor, luz que respira e poeira.
 * Tudo barato (gradientes, um PNG em mosaico, transform/opacity) e função de `t`.
 */
import type { CSSProperties } from "react";
import { useFilme } from "./contexto";
import { rgba, RGB, type Tom } from "./cores";
import { clamp01, hash, mulberry32, oscilar, quadro } from "./tempo";

/* ------------------------------------------------------------------ */
/* Grão                                                                */
/* ------------------------------------------------------------------ */

const LADO_GRAO = 256;
let texturaGrao: string | null = null;

/**
 * Gera UMA vez (na carga) o mosaico de grão: PNG 256×256 com pontos claros e escuros
 * de alfa baixo (média ≈ neutra, não clareia o preto). Semente fixa: sempre o mesmo PNG.
 */
export function gerarTexturaGrao(): string {
  if (texturaGrao) return texturaGrao;
  const c = document.createElement("canvas");
  c.width = LADO_GRAO;
  c.height = LADO_GRAO;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(LADO_GRAO, LADO_GRAO);
  const r = mulberry32(20261016);
  for (let i = 0; i < LADO_GRAO * LADO_GRAO; i++) {
    // Soma de 3 uniformes ≈ gaussiana em −1..1
    const n = (r() + r() + r()) / 1.5 - 1;
    const claro = n > 0;
    const v = claro ? 255 : 0;
    const a = Math.min(255, Math.round(Math.abs(n) * (claro ? 210 : 255)));
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  texturaGrao = c.toDataURL("image/png");
  return texturaGrao;
}

/** Garante a textura decodificada antes do primeiro quadro (usado no `pronto`). */
export async function prepararGrao(): Promise<void> {
  const url = gerarTexturaGrao();
  if (!url) return;
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch {
    /* sem decode: o navegador decodifica no primeiro uso */
  }
}

export interface GraoProps {
  /** Opacidade da camada (padrão 0,1). */
  forca?: number;
  /** Escala do grão (padrão 1,5: grão de ~1,5 px, sobrevive à compressão H.264). */
  escala?: number;
}

/** Grão de filme: o mosaico é deslocado a cada quadro por `floor(t * fps)` (determinista). */
export function Grao({ forca = 0.1, escala = 1.5 }: GraoProps) {
  const { t, fps, rascunho } = useFilme();
  if (rascunho) return null;
  const q = quadro(t, fps);
  const lado = LADO_GRAO * escala;
  const dx = hash(q, 11) % lado;
  const dy = hash(q, 23) % lado;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url(${gerarTexturaGrao()})`,
        backgroundSize: `${lado}px ${lado}px`,
        backgroundPosition: `${dx}px ${dy}px`,
        opacity: forca,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Vinheta                                                             */
/* ------------------------------------------------------------------ */

export interface VinhetaProps {
  /** Escurecimento nas bordas, 0..1 (padrão 0,55). */
  forca?: number;
  /** Raio livre no centro, em % (padrão 52). */
  centro?: number;
}

/** Vinheta: escurece as bordas e concentra o olhar no centro. */
export function Vinheta({ forca = 0.55, centro = 52 }: VinhetaProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 75% 80% at 50% 48%, transparent ${centro}%, rgb(4 6 9 / ${(forca * 0.55).toFixed(3)}) ${centro + 26}%, rgb(4 6 9 / ${forca.toFixed(3)}) 100%)`,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Graduação de cor                                                    */
/* ------------------------------------------------------------------ */

export type TomGraduacao = "frio" | "quente" | "neutro";

export interface GraduacaoProps {
  tom?: TomGraduacao;
  /** 0..1 (padrão 1). O Film cruza duas graduações na troca de ato. */
  intensidade?: number;
}

const GRADUACAO: Record<TomGraduacao, string> = {
  frio: [
    "radial-gradient(ellipse 60% 55% at 12% 0%, rgb(143 184 255 / 0.085), transparent 70%)",
    "linear-gradient(180deg, rgb(143 184 255 / 0.03), transparent 45%, rgb(8 14 30 / 0.16))",
  ].join(", "),
  quente: [
    "radial-gradient(ellipse 55% 50% at 92% 4%, rgb(255 176 112 / 0.075), transparent 70%)",
    "linear-gradient(180deg, rgb(255 190 140 / 0.02), transparent 50%, rgb(30 16 8 / 0.14))",
  ].join(", "),
  neutro: [
    "radial-gradient(ellipse 70% 50% at 50% -5%, rgb(242 244 247 / 0.045), transparent 70%)",
    "linear-gradient(180deg, transparent 55%, rgb(4 6 9 / 0.14))",
  ].join(", "),
};

/** Graduação de cor da cena: luz ambiente fria, quente ou neutra (sem blend-mode). */
export function Graduacao({ tom = "neutro", intensidade = 1 }: GraduacaoProps) {
  if (intensidade <= 0.001) return null;
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: GRADUACAO[tom], opacity: clamp01(intensidade) }} />;
}

/* ------------------------------------------------------------------ */
/* Respiração (luz que pulsa devagar)                                  */
/* ------------------------------------------------------------------ */

export interface RespiracaoProps {
  /** Tom da luz (padrão verde). */
  tom?: Tom;
  /** Centro em px do palco (padrão o centro). */
  x?: number;
  y?: number;
  /** Raio em px (padrão 520). */
  raio?: number;
  /** Alfa no centro (padrão 0,16). */
  intensidade?: number;
  /** Período da respiração em s (padrão 6). */
  periodo?: number;
  fase?: number;
  /** Multiplicador geral 0..1 (para entrar/sair com a cena). */
  opacidade?: number;
  /** Achatamento vertical (1 = círculo). */
  achatar?: number;
}

/** Luz ambiente que respira devagar — dá vida ao fundo sem chamar atenção. */
export function Respiracao({ tom = "verde", x = 960, y = 540, raio = 520, intensidade = 0.16, periodo = 6, fase = 0, opacidade = 1, achatar = 0.75 }: RespiracaoProps) {
  const { t } = useFilme();
  if (opacidade <= 0.001) return null;
  const s = oscilar(t, periodo, fase);
  const a = intensidade * (0.78 + 0.22 * s);
  const esc = 1 + 0.035 * s;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: x - raio,
        top: y - raio,
        width: raio * 2,
        height: raio * 2,
        transform: `scale(${esc.toFixed(4)}, ${(esc * achatar).toFixed(4)})`,
        background: `radial-gradient(circle, rgb(${RGB[tom]} / ${a.toFixed(3)}) 0%, rgb(${RGB[tom]} / ${(a * 0.45).toFixed(3)}) 32%, rgb(${RGB[tom]} / ${(a * 0.12).toFixed(3)}) 55%, transparent 72%)`,
        opacity: opacidade,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Poeira (partículas deterministas)                                   */
/* ------------------------------------------------------------------ */

export interface PoeiraProps {
  /** Quantidade de partículas finas (padrão 36; mantenha ≤ 80). */
  n?: number;
  /** Quantidade de círculos grandes desfocados (bokeh, padrão 5). */
  bokeh?: number;
  seed?: number;
  tom?: Tom;
  /** Área em px do palco (padrão o palco inteiro). */
  area?: { x: number; y: number; w: number; h: number };
  /** Velocidade de subida em px/s (padrão 10). */
  velocidade?: number;
  /** Multiplicador de opacidade 0..1. */
  opacidade?: number;
}

interface Particula {
  x: number;
  y: number;
  r: number;
  v: number;
  fase: number;
  deriva: number;
  a: number;
}

const cacheParticulas = new Map<string, Particula[]>();

function particulas(n: number, seed: number, grande: boolean): Particula[] {
  const chave = `${n}-${seed}-${grande}`;
  const c = cacheParticulas.get(chave);
  if (c) return c;
  const r = mulberry32(seed);
  const lista = Array.from({ length: n }, () => ({
    x: r(),
    y: r(),
    r: grande ? 30 + r() * 70 : 0.8 + r() * r() * 2.6,
    v: 0.4 + r() * 0.9,
    fase: r() * 2,
    deriva: (r() - 0.5) * 2,
    a: grande ? 0.035 + r() * 0.05 : 0.18 + r() * 0.5,
  }));
  cacheParticulas.set(chave, lista);
  return lista;
}

const modulo = (a: number, b: number) => ((a % b) + b) % b;

/** Poeira em suspensão: partículas finas que sobem devagar e cintilam, mais bokeh opcional. */
export function Poeira({ n = 36, bokeh = 5, seed = 7, tom = "texto", area, velocidade = 10, opacidade = 1 }: PoeiraProps) {
  const { t } = useFilme();
  if (opacidade <= 0.001) return null;
  const A = area ?? { x: 0, y: 0, w: 1920, h: 1080 };
  const finas = particulas(n, seed, false);
  const grandes = particulas(bokeh, seed + 101, true);
  const pos = (p: Particula, vel: number) => {
    const y = A.y + modulo(p.y * A.h - t * vel * p.v, A.h + 40) - 20;
    const x = A.x + modulo(p.x * A.w + Math.sin(t * 0.25 + p.fase * Math.PI) * 18 * p.deriva, A.w);
    return [x, y] as const;
  };
  const base: CSSProperties = { position: "absolute", left: 0, top: 0, borderRadius: "50%" };
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: opacidade }}>
      {grandes.map((p, i) => {
        const [x, y] = pos(p, velocidade * 0.35);
        const a = p.a * (0.7 + 0.3 * oscilar(t, 7 + i, p.fase));
        return (
          <span
            key={`b${i}`}
            style={{
              ...base,
              width: p.r * 2,
              height: p.r * 2,
              transform: `translate3d(${(x - p.r).toFixed(1)}px, ${(y - p.r).toFixed(1)}px, 0)`,
              background: `radial-gradient(circle, ${rgba(tom, a)} 0%, ${rgba(tom, a * 0.5)} 45%, transparent 70%)`,
            }}
          />
        );
      })}
      {finas.map((p, i) => {
        const [x, y] = pos(p, velocidade);
        const a = p.a * (0.55 + 0.45 * oscilar(t, 3.5 + (i % 5), p.fase));
        return (
          <span
            key={i}
            style={{
              ...base,
              width: p.r * 2,
              height: p.r * 2,
              transform: `translate3d(${(x - p.r).toFixed(1)}px, ${(y - p.r).toFixed(1)}px, 0)`,
              background: rgba(tom, a),
              boxShadow: p.r > 1.8 ? `0 0 ${(p.r * 3).toFixed(1)}px ${rgba(tom, a * 0.6)}` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
