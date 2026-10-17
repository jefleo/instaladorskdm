/**
 * Câmera virtual e parallax por camadas.
 *
 * <Camera> calcula, a partir de `t`, a posição (x, y), o zoom e a rotação da câmera e
 * repassa para as <Camada z>. Cada camada se move na proporção da sua distância:
 * z = 0 é o plano de foco (acompanha a câmera 100%), z > 0 fica mais longe (move menos),
 * −1 < z < 0 fica mais perto (move mais). Fator = 1 / (1 + z).
 *
 * Tudo em px do palco 1920×1080. Só transform/opacity: barato de desenhar.
 */
import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { useFilme } from "./contexto";
import { ease, lerp, prog, ruido, type Easing } from "./tempo";

/** Estado da câmera. x/y positivos = a câmera anda para a direita/baixo (a cena vai ao contrário). */
export interface PoseCamera {
  x?: number;
  y?: number;
  /** 1 = sem zoom; 1.08 = push-in de 8%. */
  zoom?: number;
  /** Rotação em graus (use pouco: ±1°). */
  rot?: number;
}

/** Chave de câmera em tempo ABSOLUTO; `curva` vale para o trecho que CHEGA nesta chave. */
export interface ChaveCamera extends PoseCamera {
  t: number;
  curva?: Easing;
}

interface PoseCompleta {
  x: number;
  y: number;
  zoom: number;
  rot: number;
  /** Centro da transformação (px do palco). */
  ox: number;
  oy: number;
}

const POSE0: PoseCompleta = { x: 0, y: 0, zoom: 1, rot: 0, ox: 960, oy: 540 };
const CameraContext = createContext<PoseCompleta>(POSE0);

const completar = (p: PoseCamera | undefined, base: PoseCompleta): PoseCompleta => ({
  ...base,
  x: p?.x ?? base.x,
  y: p?.y ?? base.y,
  zoom: p?.zoom ?? base.zoom,
  rot: p?.rot ?? base.rot,
});

const interp = (a: PoseCompleta, b: PoseCompleta, p: number): PoseCompleta => ({
  ...a,
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  zoom: lerp(a.zoom, b.zoom, p),
  rot: lerp(a.rot, b.rot, p),
});

/** Pose da câmera em `t` a partir de chaves ordenadas por tempo. */
export function poseEm(t: number, chaves: ChaveCamera[], base: PoseCompleta = POSE0): PoseCompleta {
  if (!chaves.length) return base;
  const ks = [...chaves].sort((a, b) => a.t - b.t);
  let atual = completar(ks[0], base);
  if (t <= ks[0].t) return atual;
  for (let i = 1; i < ks.length; i++) {
    const prox = completar(ks[i], atual);
    if (t < ks[i].t) {
      const c = ks[i].curva ?? ease.inOutCubic;
      return interp(atual, prox, c(prog(t, ks[i - 1].t, ks[i].t)));
    }
    atual = prox;
  }
  return atual;
}

export interface CameraProps {
  /** Pose inicial (em t0). */
  de?: PoseCamera;
  /** Pose final (em t1). */
  para?: PoseCamera;
  /** Janela do movimento de `de` até `para` (absoluta). */
  t0?: number;
  t1?: number;
  /** Curva do movimento (padrão inOutSine: lento nas pontas, como um dolly). */
  curva?: Easing;
  /** Alternativa a de/para: chaves absolutas (têm prioridade). */
  chaves?: ChaveCamera[];
  /**
   * Deriva orgânica muito lenta, em px (padrão 0). Valores de 4 a 10 dão vida a planos
   * parados sem virar tremor. Determinista (ruído suave por `seed`).
   */
  deriva?: number;
  seed?: number;
  /** Centro do zoom/rotação em px do palco (padrão o centro: 960, 540). */
  foco?: [number, number];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Câmera da cena. Ex.: push-in lento durante a frase:
 * ```tsx
 * <Camera de={{ zoom: 1 }} para={{ zoom: 1.06, y: -12 }} t0={f.t0} t1={f.t1 + 1}>
 *   <Camada z={2}><NumeroGigante/></Camada>
 *   <Camada z={0}><Painel/></Camada>
 * </Camera>
 * ```
 */
export function Camera({ de, para, t0 = 0, t1 = 0, curva = ease.inOutSine, chaves, deriva = 0, seed = 1, foco, children, className, style }: CameraProps) {
  const { t } = useFilme();
  const base: PoseCompleta = { ...POSE0, ox: foco?.[0] ?? 960, oy: foco?.[1] ?? 540 };
  let pose: PoseCompleta;
  if (chaves && chaves.length) pose = poseEm(t, chaves, base);
  else {
    const a = completar(de, base);
    const b = completar(para ?? de, base);
    pose = interp(a, b, curva(prog(t, t0, t1)));
  }
  if (deriva) {
    pose = {
      ...pose,
      x: pose.x + ruido(t / 7, seed) * deriva,
      y: pose.y + ruido(t / 9, seed + 17) * deriva * 0.6,
      rot: pose.rot + ruido(t / 11, seed + 31) * deriva * 0.012,
    };
  }
  return (
    <CameraContext.Provider value={pose}>
      <div className={`absolute inset-0 ${className ?? ""}`} style={style}>
        {children}
      </div>
    </CameraContext.Provider>
  );
}

export interface CamadaProps {
  /** Profundidade: 0 = plano de foco; 1 = metade do movimento; 3 = um quarto; −0,3 = primeiro plano. */
  z?: number;
  /**
   * Desfoque em px (filter: blur). CARO em área grande: use ≤ 8 px e só em camadas
   * com pouco conteúdo (ex.: número gigante de fundo no L5).
   */
  desfoque?: number;
  opacidade?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Transform CSS de uma camada a profundidade `z` para a pose atual. */
export function transformCamada(pose: PoseCompleta, z: number): string {
  const f = 1 / (1 + Math.max(-0.9, z));
  const s = 1 + (pose.zoom - 1) * f;
  const tx = -pose.x * f;
  const ty = -pose.y * f;
  const r = pose.rot * f;
  return `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(5)}) rotate(${r.toFixed(4)}deg)`;
}

/** Plano de parallax dentro de uma <Camera>. Os filhos usam coordenadas do palco. */
export function Camada({ z = 0, desfoque = 0, opacidade = 1, children, className, style }: CamadaProps) {
  const pose = useContext(CameraContext);
  return (
    <div
      className={`absolute inset-0 ${className ?? ""}`}
      style={{
        transform: transformCamada(pose, z),
        transformOrigin: `${pose.ox}px ${pose.oy}px`,
        filter: desfoque > 0.05 ? `blur(${desfoque.toFixed(2)}px)` : undefined,
        opacity: opacidade,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Pose atual da câmera (para quem precisa compensar algo à mão). */
export function useCamera(): PoseCompleta {
  return useContext(CameraContext);
}
