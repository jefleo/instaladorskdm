/**
 * Formas que se desenham no tempo: <Tracado>, <Curva>, <Barra>, <Grade>, <Cartao>, <Seta>.
 * Convenções do guia visual: Vapti em verde sólido e mais grosso; terceiros em cinza
 * tracejado; risco em coral; contexto em azul-gelo. Verde e coral com o mesmo peso.
 */
import { useId, type CSSProperties, type ReactNode } from "react";
import { useFilme } from "./contexto";
import { brilhoCaixa, COR, rgba, SOMBRA_PROFUNDA, type Tom } from "./cores";
import { clamp01, ease, prog, spring, type Curva as CurvaEase } from "./tempo";

/* ------------------------------------------------------------------ */
/* <Tracado> — path SVG que se desenha                                 */
/* ------------------------------------------------------------------ */

export interface TracadoProps {
  /** Atributo `d` do path (coordenadas do <svg> que o contém). */
  d: string;
  /** Início do desenho (absoluto). */
  em: number;
  /** Duração do desenho (padrão 0,9 s). */
  dur?: number;
  curva?: CurvaEase;
  /** Força o progresso 0..1 (ignora em/dur). */
  progresso?: number;
  tom?: Tom;
  espessura?: number;
  /** Tracejado (true = "10 10") ou padrão próprio ("4 8"). */
  tracejado?: boolean | string;
  /** Halo em volta do traço, 0..1 (padrão 0,6 no verde e no coral, 0 nos outros). */
  brilho?: number;
  /** Preenchimento que surge quando o traço termina (ex.: "var(--cor-verde)"). */
  preencher?: string;
  saida?: number;
  opacidade?: number;
}

/**
 * Traço que se desenha (pathLength = 1). Vai DENTRO de um <svg>.
 * ```tsx
 * <svg width={1920} height={1080} className="absolute inset-0">
 *   <Tracado d="M100 500 C 400 300, 700 700, 1000 500" em={tE} />
 * </svg>
 * ```
 */
export function Tracado({ d, em, dur = 0.9, curva = ease.inOutCubic, progresso, tom = "verde", espessura = 4, tracejado, brilho, preencher, saida, opacidade = 1 }: TracadoProps) {
  const { t } = useFilme();
  const id = useId().replace(/:/g, "");
  const p = progresso ?? curva(prog(t, em, em + dur));
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.35)) : 0;
  if (p <= 0.0005 && !preencher) return null;
  const cor = COR[tom];
  const halo = brilho ?? (tom === "verde" || tom === "coral" ? 0.6 : 0);
  const dash = tracejado === true ? "10 10" : tracejado || undefined;
  const pFill = preencher ? ease.outCubic(prog(t, em + dur * 0.85, em + dur + 0.35)) : 0;
  const solido = { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p } as const;
  return (
    <g opacity={opacidade * (1 - q)}>
      {preencher && pFill > 0 ? <path d={d} fill={preencher} opacity={pFill} stroke="none" /> : null}
      {halo > 0 && !dash ? (
        <>
          <path d={d} fill="none" stroke={cor} strokeWidth={espessura * 5} strokeLinecap="round" strokeLinejoin="round" opacity={0.06 * halo} {...solido} />
          <path d={d} fill="none" stroke={cor} strokeWidth={espessura * 2.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.14 * halo} {...solido} />
        </>
      ) : null}
      {dash ? (
        <>
          <mask id={`m${id}`} maskUnits="userSpaceOnUse">
            <path d={d} fill="none" stroke="#fff" strokeWidth={espessura + 4} strokeLinecap="round" {...solido} />
          </mask>
          <path d={d} fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeDasharray={dash} mask={`url(#m${id})`} />
        </>
      ) : (
        <path d={d} fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round" {...solido} />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* <Curva> — linha de dados suave que se desenha da esquerda p/ direita */
/* ------------------------------------------------------------------ */

/** Interpolação monotônica (Fritsch–Carlson): não inventa picos entre os pontos. */
export function interpolarMonotona(pontos: [number, number][]): { caminho: string; y: (x: number) => number } {
  const n = pontos.length;
  if (n < 2) return { caminho: n ? `M${pontos[0][0]} ${pontos[0][1]}` : "", y: () => (n ? pontos[0][1] : 0) };
  const xs = pontos.map((p) => p[0]);
  const ys = pontos.map((p) => p[1]);
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(xs[i + 1] - xs[i]);
    m.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i] || 1e-9));
  }
  const tg: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) tg.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  tg.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      tg[i] = 0;
      tg[i + 1] = 0;
      continue;
    }
    const a = tg[i] / m[i];
    const b = tg[i + 1] / m[i];
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      tg[i] = tau * a * m[i];
      tg[i + 1] = tau * b * m[i];
    }
  }
  let caminho = `M${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    caminho += ` C${(xs[i] + h).toFixed(2)} ${(ys[i] + tg[i] * h).toFixed(2)}, ${(xs[i + 1] - h).toFixed(2)} ${(ys[i + 1] - tg[i + 1] * h).toFixed(2)}, ${xs[i + 1].toFixed(2)} ${ys[i + 1].toFixed(2)}`;
  }
  const y = (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = dx[i];
    const s = (x - xs[i]) / h;
    const s2 = s * s;
    const s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * ys[i] + (s3 - 2 * s2 + s) * h * tg[i] + (-2 * s3 + 3 * s2) * ys[i + 1] + (s3 - s2) * h * tg[i + 1];
  };
  return { caminho, y };
}

export interface CurvaProps {
  /** Pontos em px do próprio SVG, com x crescente. */
  pontos: [number, number][];
  largura: number;
  altura: number;
  em: number;
  /** Duração do desenho (padrão 1,4 s). */
  dur?: number;
  curva?: CurvaEase;
  /** Força o progresso 0..1. */
  progresso?: number;
  tom?: Tom;
  espessura?: number;
  tracejado?: boolean;
  /** Gradiente embaixo da linha (padrão true). */
  area?: boolean;
  /** y da base da área (padrão: `altura`). */
  base?: number;
  /** Ponto brilhante na ponta enquanto desenha e depois (padrão true). */
  ponta?: boolean;
  brilho?: number;
  saida?: number;
  className?: string;
  style?: CSSProperties;
  /** Extras desenhados no mesmo SVG (eixos, marcas), atrás da linha. */
  children?: ReactNode;
}

/**
 * Curva de dados que se desenha da esquerda para a direita, com área e ponta brilhante.
 * Posicione com `style={{ position: "absolute", left, top }}`.
 */
export function Curva({ pontos, largura, altura, em, dur = 1.4, curva = ease.inOutCubic, progresso, tom = "verde", espessura = 5, tracejado = false, area = true, base, ponta = true, brilho, saida, className, style, children }: CurvaProps) {
  const { t } = useFilme();
  const id = useId().replace(/:/g, "");
  const p = progresso ?? curva(prog(t, em, em + dur));
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.35)) : 0;
  const { caminho, y } = interpolarMonotona(pontos);
  const x0 = pontos[0]?.[0] ?? 0;
  const x1 = pontos[pontos.length - 1]?.[0] ?? 0;
  const xp = x0 + (x1 - x0) * p;
  const yp = y(xp);
  const cor = COR[tom];
  const halo = brilho ?? (tom === "verde" || tom === "coral" ? 0.7 : 0.2);
  const yb = base ?? altura;
  const caminhoArea = `${caminho} L${x1} ${yb} L${x0} ${yb} Z`;
  return (
    <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} className={className} style={{ overflow: "visible", opacity: 1 - q, ...style }}>
      <defs>
        <clipPath id={`c${id}`}>
          <rect x={-50} y={-200} width={Math.max(0, xp - x0 + 50)} height={altura + 400} transform={`translate(${x0} 0)`} />
        </clipPath>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity={0.24} />
          <stop offset="100%" stopColor={cor} stopOpacity={0} />
        </linearGradient>
      </defs>
      {children}
      <g clipPath={`url(#c${id})`}>
        {area ? <path d={caminhoArea} fill={`url(#g${id})`} stroke="none" /> : null}
        {halo > 0 && !tracejado ? <path d={caminho} fill="none" stroke={cor} strokeWidth={espessura * 3.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.1 * halo} /> : null}
        <path d={caminho} fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={tracejado ? "12 10" : undefined} />
      </g>
      {ponta && p > 0.001 ? (
        <g transform={`translate(${xp.toFixed(2)} ${yp.toFixed(2)})`}>
          <circle r={espessura * 5} fill={rgba(tom === "texto" ? "texto" : tom, 0.12 * halo)} />
          <circle r={espessura * 2.6} fill={rgba(tom === "texto" ? "texto" : tom, 0.25 * halo)} />
          <circle r={espessura * 1.35} fill={cor} stroke="var(--cor-tinta)" strokeWidth={2} />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* <Barra>                                                             */
/* ------------------------------------------------------------------ */

export interface BarraProps {
  valor: number;
  max: number;
  /** Comprimento em px que corresponde a `max`. */
  comprimento: number;
  /** Espessura em px (padrão 56). */
  espessura?: number;
  /** "v" cresce para cima; "h" cresce para a direita (padrão "v"). */
  orientacao?: "v" | "h";
  em: number;
  /** Duração (só sem mola, padrão 0,8 s). */
  dur?: number;
  /** Crescimento em mola com leve sobra (padrão true). */
  mola?: boolean;
  tom?: Tom;
  /** "tracejado" para terceiros (padrão automático: cinza = tracejado). */
  estilo?: "solido" | "tracejado";
  brilho?: number;
  raio?: number;
  saida?: number;
  /** Conteúdo preso à ponta da barra (rótulo/valor). */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Barra que cresce no tempo, ancorada na base (v) ou à esquerda (h). */
export function Barra({ valor, max, comprimento, espessura = 56, orientacao = "v", em, dur = 0.8, mola = true, tom = "verde", estilo, brilho, raio = 6, saida, children, className, style }: BarraProps) {
  const { t } = useFilme();
  const g = mola ? spring(t - em, { k: 120, d: 17 }) : ease.saida(prog(t, em, em + dur));
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.35)) : 0;
  const alvo = (comprimento * clamp01(valor / (max || 1)));
  const L = Math.max(0, alvo * g);
  const vertical = orientacao === "v";
  const tracejado = (estilo ?? (tom === "cinza" ? "tracejado" : "solido")) === "tracejado";
  const halo = brilho ?? (tom === "verde" || tom === "coral" ? 0.55 : 0);
  const c = tom === "texto" ? "texto" : tom;
  const preenchimento: CSSProperties = tracejado
    ? {
        border: `2px dashed ${rgba(c, 0.85)}`,
        background: `repeating-linear-gradient(135deg, ${rgba(c, 0.16)} 0 2px, transparent 2px 11px)`,
      }
    : {
        background: vertical
          ? `linear-gradient(180deg, ${rgba(c, 1)} 0%, ${rgba(c, 0.86)} 100%)`
          : `linear-gradient(90deg, ${rgba(c, 0.86)} 0%, ${rgba(c, 1)} 100%)`,
        boxShadow: [`0 1px 0 rgb(255 255 255 / 0.35) inset`, brilhoCaixa(tom, halo * Math.min(1, g))].filter(Boolean).join(", "),
      };
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: vertical ? espessura : comprimento,
        height: vertical ? comprimento : espessura,
        opacity: (1 - q) * Math.min(1, Math.max(0, (t - em) * 6)),
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: vertical ? espessura : L,
          height: vertical ? L : espessura,
          borderRadius: raio,
          ...preenchimento,
        }}
      />
      {children ? (
        <div
          style={{
            position: "absolute",
            ...(vertical ? { left: "50%", bottom: L + 14, transform: "translateX(-50%)" } : { left: L + 16, top: "50%", transform: "translateY(-50%)" }),
            whiteSpace: "nowrap",
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* <Grade>                                                             */
/* ------------------------------------------------------------------ */

export interface GradeProps {
  /** "pauta" (linhas de extrato), "quadriculado" ou "chao" (piso em perspectiva). */
  tipo?: "pauta" | "quadriculado" | "chao";
  /** Espaçamento em px (padrão 64). */
  passo?: number;
  /** Entrada (absoluta): as linhas se desenham a partir daqui. Sem `em`, já prontas. */
  em?: number;
  dur?: number;
  /** Opacidade das linhas (padrão 1 = o tom do token `--cor-grade`, reforçado). */
  opacidade?: number;
  /** Deslocamento contínuo em px/s (padrão 0). */
  deriva?: number;
  area?: { x: number; y: number; w: number; h: number };
  /** Só "chao": y do horizonte (padrão 600). */
  horizonte?: number;
  tom?: Tom;
}

/** Grade de fundo: dá chão e escala às cenas sem competir com o conteúdo. */
export function Grade({ tipo = "pauta", passo = 64, em, dur = 1.2, opacidade = 1, deriva = 0, area, horizonte = 600, tom = "texto" }: GradeProps) {
  const { t } = useFilme();
  const A = area ?? { x: 0, y: 0, w: 1920, h: 1080 };
  const p = em !== undefined ? prog(t, em, em + dur) : 1;
  if (p <= 0) return null;
  const c = tom === "texto" ? "texto" : tom;
  const linha = rgba(c, 0.07 * opacidade);
  if (tipo === "pauta") {
    const n = Math.floor(A.h / passo);
    const off = ((t * deriva) % passo + passo) % passo;
    return (
      <div aria-hidden="true" className="pointer-events-none absolute overflow-hidden" style={{ left: A.x, top: A.y, width: A.w, height: A.h }}>
        {Array.from({ length: n + 1 }, (_, i) => {
          const pi = ease.saida(clamp01(p * 1.6 - (i / Math.max(1, n)) * 0.6));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: i * passo + off,
                width: "100%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${linha} 12%, ${linha} 88%, transparent)`,
                transform: `scaleX(${pi.toFixed(4)})`,
                transformOrigin: "left center",
              }}
            />
          );
        })}
      </div>
    );
  }
  const fundo = `linear-gradient(${linha} 1px, transparent 1px), linear-gradient(90deg, ${linha} 1px, transparent 1px)`;
  if (tipo === "quadriculado") {
    const off = t * deriva;
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: A.x,
          top: A.y,
          width: A.w,
          height: A.h,
          backgroundImage: fundo,
          backgroundSize: `${passo}px ${passo}px`,
          backgroundPosition: `${off.toFixed(2)}px ${off.toFixed(2)}px`,
          opacity: ease.outCubic(p),
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 40%, transparent 100%)",
        }}
      />
    );
  }
  // Chão em perspectiva: plano inclinado que some no horizonte
  const off = t * deriva;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute overflow-hidden" style={{ left: 0, top: horizonte, width: 1920, height: 1080 - horizonte, opacity: ease.outCubic(p), perspective: 700, perspectiveOrigin: "50% 0%" }}>
      <div
        style={{
          position: "absolute",
          left: -1920,
          top: 0,
          width: 1920 * 3,
          height: 1400,
          backgroundImage: fundo,
          backgroundSize: `${passo * 1.5}px ${passo * 1.5}px`,
          backgroundPosition: `0px ${off.toFixed(2)}px`,
          transform: "rotateX(76deg)",
          transformOrigin: "50% 0%",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 100%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* <Cartao>                                                            */
/* ------------------------------------------------------------------ */

export interface CartaoProps {
  em: number;
  saida?: number;
  /** Posição absoluta opcional (px do palco). */
  x?: number;
  y?: number;
  largura?: number;
  altura?: number;
  /** Barra de cor à esquerda (verde e coral com o mesmo peso). */
  tom?: Tom;
  /** Halo na cor do tom, 0..1 (padrão 0). */
  brilho?: number;
  entrada?: "subir" | "escala" | "esquerda" | "direita";
  padding?: number | string;
  raio?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Cartão com profundidade (superfície, borda fina, sombra longa), entrada em mola. */
export function Cartao({ em, saida, x, y, largura, altura, tom, brilho = 0, entrada = "subir", padding = 32, raio = 20, children, className, style }: CartaoProps) {
  const { t } = useFilme();
  const s = spring(t - em, { k: 190, d: 24 });
  const o = ease.outCubic(prog(t, em, em + 0.3));
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.35)) : 0;
  if (o <= 0) return null;
  const u = 1 - s;
  const tr =
    entrada === "escala"
      ? `scale(${(0.9 + 0.1 * s).toFixed(4)})`
      : entrada === "esquerda"
        ? `translate3d(${(u * -60).toFixed(2)}px, 0, 0)`
        : entrada === "direita"
          ? `translate3d(${(u * 60).toFixed(2)}px, 0, 0)`
          : `translate3d(0, ${(u * 44).toFixed(2)}px, 0) scale(${(0.97 + 0.03 * s).toFixed(4)})`;
  const posicao: CSSProperties = x !== undefined || y !== undefined ? { position: "absolute", left: x, top: y } : { position: "relative" };
  return (
    <div
      className={className}
      style={{
        ...posicao,
        width: largura,
        height: altura,
        padding,
        borderRadius: raio,
        background: "linear-gradient(180deg, rgb(33 41 52 / 0.94) 0%, rgb(22 27 34 / 0.96) 100%)",
        border: "1px solid rgb(255 255 255 / 0.075)",
        boxShadow: [SOMBRA_PROFUNDA, tom && brilho ? brilhoCaixa(tom, brilho) : ""].filter(Boolean).join(", "),
        opacity: o * (1 - q),
        transform: tr,
        transformOrigin: "50% 100%",
        ...style,
      }}
    >
      {tom ? (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: -1,
            top: 22,
            bottom: 22,
            width: 5,
            borderRadius: "0 4px 4px 0",
            background: COR[tom],
            boxShadow: tom === "verde" || tom === "coral" ? `0 0 18px ${rgba(tom, 0.45)}` : undefined,
          }}
        />
      ) : null}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* <Seta>                                                              */
/* ------------------------------------------------------------------ */

export interface SetaProps {
  /** Origem e destino em px do contêiner (em geral o palco). */
  de: [number, number];
  para: [number, number];
  /** Arqueamento: 0 = reta; ±0,2 a ±0,4 = curva suave (sinal escolhe o lado). */
  curvatura?: number;
  em: number;
  /** Duração do desenho (padrão 0,6 s). */
  dur?: number;
  tom?: Tom;
  espessura?: number;
  tracejado?: boolean;
  /** Tamanho da ponta em px (padrão 16). */
  cabeca?: number;
  saida?: number;
}

/** Seta que se desenha (curva quadrática) com a ponta acompanhando o traço. */
export function Seta({ de, para, curvatura = 0, em, dur = 0.6, tom = "texto", espessura = 3, tracejado = false, cabeca = 16, saida }: SetaProps) {
  const { t } = useFilme();
  const u = ease.inOutCubic(prog(t, em, em + dur));
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.3)) : 0;
  if (u <= 0.001) return null;
  const [x0, y0] = de;
  const [x2, y2] = para;
  const mx = (x0 + x2) / 2;
  const my = (y0 + y2) / 2;
  const len = Math.hypot(x2 - x0, y2 - y0) || 1;
  const nx = -(y2 - y0) / len;
  const ny = (x2 - x0) / len;
  const x1 = mx + nx * curvatura * len;
  const y1 = my + ny * curvatura * len;
  // De Casteljau: sub-curva de 0 até u (a ponta fica exatamente no fim do traço)
  const ax = x0 + (x1 - x0) * u;
  const ay = y0 + (y1 - y0) * u;
  const bx = x1 + (x2 - x1) * u;
  const by = y1 + (y2 - y1) * u;
  const px = ax + (bx - ax) * u;
  const py = ay + (by - ay) * u;
  const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  const cor = COR[tom];
  const pc = ease.outBack(clamp01(u * 4));
  return (
    <svg aria-hidden="true" width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - q, pointerEvents: "none" }}>
      <path d={`M${x0} ${y0} Q${ax.toFixed(2)} ${ay.toFixed(2)} ${px.toFixed(2)} ${py.toFixed(2)}`} fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeDasharray={tracejado ? "8 9" : undefined} />
      <g transform={`translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${ang.toFixed(2)}) scale(${pc.toFixed(4)})`}>
        <path d={`M${-cabeca} ${-cabeca * 0.62} L0 0 L${-cabeca} ${cabeca * 0.62}`} fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
