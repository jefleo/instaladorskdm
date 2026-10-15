/**
 * Acabamento de imagem: grão, vinheta, graduação de cor, luz que respira e poeira.
 * Tudo barato (texturas pré-desenhadas, transform/opacity) e função de `t`.
 *
 * Desempenho (medido no Chromium por software): prefira transform 2D (`translate`, não
 * `translate3d`: o 3D promove camadas de composição e encarece cada quadro), texturas em vez
 * de gradientes radiais grandes, e nada de `will-change` em camadas que mudam de ESCALA
 * (a escala de rasterização passa a depender da história e o quadro deixa de ser
 * determinista). O grão é a exceção segura: só translada.
 */
import type { CSSProperties } from "react";
import { useFilme } from "./contexto";
import { rgba, type Tom } from "./cores";
import { clamp01, hash, mulberry32, oscilar, quadro } from "./tempo";
import { LADO_GRAO, texturaGrao, texturaRadial, texturaVinheta } from "./texturas";

/* ------------------------------------------------------------------ */
/* Grão                                                                */
/* ------------------------------------------------------------------ */

export interface GraoProps {
  /** Multiplicador da intensidade (padrão 1 = pontos de no máximo ~±0,1 de alfa; ≤ 1). */
  forca?: number;
}

/**
 * Grão de filme: o mosaico (gerado uma vez, `texturaGrao`) é deslocado a cada quadro
 * por um hash de `floor(t * fps)` — determinista, sem feTurbulence. O deslocamento é um
 * `translate` de uma camada própria (rasterizada uma vez), não um redesenho.
 */
export function Grao({ forca = 1 }: GraoProps) {
  const { t, fps, rascunho } = useFilme();
  if (rascunho) return null;
  const q = quadro(t, fps);
  const dx = hash(q, 11) % LADO_GRAO;
  const dy = hash(q, 23) % LADO_GRAO;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920 + LADO_GRAO,
          height: 1080 + LADO_GRAO,
          backgroundImage: `url(${texturaGrao()})`,
          transform: `translate(${-dx}px, ${-dy}px)`,
          // camada própria, só translação inteira: rasteriza uma vez, determinista
          willChange: "transform",
          opacity: forca >= 1 ? undefined : forca,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halo (brilho radial barato)                                         */
/* ------------------------------------------------------------------ */

export interface HaloProps {
  tom?: Tom;
  /** Centro em px do contêiner. */
  x: number;
  y: number;
  /** Largura e altura da elipse (px). */
  w: number;
  h?: number;
  /** Opacidade no centro, 0..1. */
  intensidade?: number;
  /** Escala (pulso) aplicada por transform. */
  escala?: number;
  style?: CSSProperties;
}

/**
 * Brilho radial suave (textura pré-desenhada): use atrás de números, celulares, marcas.
 * `escala` pulsa por transform (camada própria: não redesenha nada por baixo).
 */
export function Halo({ tom = "verde", x, y, w, h = w, intensidade = 0.2, escala = 1, style }: HaloProps) {
  if (intensidade <= 0.002) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        backgroundImage: `url(${texturaRadial(tom)})`,
        backgroundSize: "100% 100%",
        opacity: clamp01(intensidade),
        transform: escala === 1 ? undefined : `scale(${escala.toFixed(4)})`,
        ...style,
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
}

/** Vinheta: escurece as bordas e concentra o olhar no centro (textura pré-desenhada). */
export function Vinheta({ forca = 0.55 }: VinhetaProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: `url(${texturaVinheta()})`, backgroundSize: "100% 100%", opacity: clamp01(forca) }}
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

/** Luz ambiente de cada tom: um brilho radial (textura) num canto + gradiente linear vertical. */
const GRADUACAO: Record<TomGraduacao, { tom: Tom; x: number; y: number; w: number; h: number; a: number; linear: string }> = {
  frio: { tom: "azul", x: 230, y: 0, w: 2300, h: 1300, a: 0.09, linear: "linear-gradient(180deg, rgb(143 184 255 / 0.03), transparent 45%, rgb(8 14 30 / 0.16))" },
  quente: { tom: "coral", x: 1770, y: 40, w: 2100, h: 1100, a: 0.06, linear: "linear-gradient(180deg, rgb(255 190 140 / 0.02), transparent 50%, rgb(30 16 8 / 0.14))" },
  neutro: { tom: "texto", x: 960, y: -60, w: 2700, h: 1100, a: 0.05, linear: "linear-gradient(180deg, transparent 55%, rgb(4 6 9 / 0.14))" },
};

/** Graduação de cor da cena: luz ambiente fria, quente ou neutra (sem blend-mode). */
export function Graduacao({ tom = "neutro", intensidade = 1 }: GraduacaoProps) {
  if (intensidade <= 0.001) return null;
  const g = GRADUACAO[tom];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: g.linear, opacity: clamp01(intensidade) }}>
      <Halo tom={g.tom} x={g.x} y={g.y} w={g.w} h={g.h} intensidade={g.a} />
    </div>
  );
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
  const a = intensidade * (0.78 + 0.22 * s) * opacidade;
  const esc = 1 + 0.035 * s;
  // a textura cai a zero na borda: o raio útil é ~70% do lado
  const lado = raio * 2 * 1.25;
  return <Halo tom={tom} x={x} y={y} w={lado} h={lado * achatar} intensidade={a} escala={esc} />;
}

/* ------------------------------------------------------------------ */
/* Poeira (partículas deterministas)                                   */
/* ------------------------------------------------------------------ */

export interface PoeiraProps {
  /** Quantidade de partículas finas (padrão 28; mantenha ≤ 80). */
  n?: number;
  /** Quantidade de círculos grandes desfocados (bokeh, padrão 4). */
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
export function Poeira({ n = 28, bokeh = 4, seed = 7, tom = "texto", area, velocidade = 10, opacidade = 1 }: PoeiraProps) {
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
              transform: `translate(${(x - p.r).toFixed(1)}px, ${(y - p.r).toFixed(1)}px)`,
              backgroundImage: `url(${texturaRadial(tom)})`,
              backgroundSize: "100% 100%",
              opacity: Math.min(1, a * 1.2),
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
              transform: `translate(${(x - p.r).toFixed(1)}px, ${(y - p.r).toFixed(1)}px)`,
              background: rgba(tom, a),
              boxShadow: p.r > 1.8 ? `0 0 ${(p.r * 3).toFixed(1)}px ${rgba(tom, a * 0.6)}` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
