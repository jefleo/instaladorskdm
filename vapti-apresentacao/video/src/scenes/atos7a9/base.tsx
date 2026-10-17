/**
 * Peças locais dos atos 7–9 (funções puras de t): tempo de palavras, engrenagem,
 * balão de mensagem, caixa de seleção, pilha de contratos e semáforo.
 * Ficam aqui (e não no kit) porque só estes atos as usam.
 */
import type { CSSProperties, ReactNode } from "react";
import { brilhoCaixa, clamp01, COR, ease, normalizar, prog, rgba, spring, type Tom } from "../../kit";
import type { Frase } from "../../timeline";

/** Início da primeira palavra `alvo` dita na frase a partir de `depois` (s absolutos). */
export function tPalavra(f: Frase, alvo: string, depois = -Infinity, padrao?: number): number {
  const n = normalizar(alvo);
  const p = f.palavras.find((w) => normalizar(w.w) === n && w.t0 >= depois - 1e-6);
  return p ? p.t0 : (padrao ?? f.tEnfase);
}

/** Fim da palavra `alvo` (para contadores que param quando a palavra termina). */
export function tFimPalavra(f: Frase, alvo: string, depois = -Infinity, padrao?: number): number {
  const n = normalizar(alvo);
  const p = f.palavras.find((w) => normalizar(w.w) === n && w.t0 >= depois - 1e-6);
  return p ? p.t1 : (padrao ?? f.fim);
}

/** Interpolação de poses simples. */
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/* ------------------------------------------------------------------ */
/* Engrenagem                                                          */
/* ------------------------------------------------------------------ */

const cacheEng = new Map<string, string>();

/** Contorno de engrenagem (dentes trapezoidais) com furo central, centrado em (0,0). */
export function caminhoEngrenagem(r: number, dentes: number, h: number, furo: number): string {
  const chave = `${r}-${dentes}-${h}-${furo}`;
  const c = cacheEng.get(chave);
  if (c) return c;
  const passo = (Math.PI * 2) / dentes;
  const pts: string[] = [];
  const pt = (a: number, rr: number) => `${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`;
  for (let i = 0; i < dentes; i++) {
    const a = i * passo;
    pts.push(pt(a, r - h), pt(a + passo * 0.14, r), pt(a + passo * 0.46, r), pt(a + passo * 0.6, r - h));
  }
  const externo = `M${pts[0]} L${pts.slice(1).join(" L")} Z`;
  const k = furo;
  const interno = `M${k} 0 A${k} ${k} 0 1 0 ${-k} 0 A${k} ${k} 0 1 0 ${k} 0 Z`;
  const d = `${externo} ${interno}`;
  cacheEng.set(chave, d);
  return d;
}

export interface EngrenagemProps {
  x: number;
  y: number;
  r: number;
  dentes: number;
  /** Ângulo em graus. */
  angulo: number;
  tom?: Tom;
  opacidade?: number;
  escala?: number;
  brilho?: number;
}

/** Engrenagem desenhada em SVG; gira só por transform (barato). */
export function Engrenagem({ x, y, r, dentes, angulo, tom = "verde", opacidade = 1, escala = 1, brilho = 0.5 }: EngrenagemProps) {
  if (opacidade <= 0.002) return null;
  const lado = r * 2 + 20;
  const d = caminhoEngrenagem(r, dentes, Math.max(10, r * 0.16), r * 0.22);
  return (
    <svg
      aria-hidden="true"
      width={lado}
      height={lado}
      viewBox={`${-lado / 2} ${-lado / 2} ${lado} ${lado}`}
      style={{ position: "absolute", left: x - lado / 2, top: y - lado / 2, overflow: "visible", opacity: opacidade, transform: `scale(${escala.toFixed(4)})` }}
    >
      <circle r={r * 1.05} fill={rgba(tom === "texto" ? "texto" : tom, 0.07 * brilho)} />
      <g transform={`rotate(${angulo.toFixed(3)})`}>
        <path d={d} fillRule="evenodd" fill={rgba(tom === "texto" ? "texto" : tom, 0.16)} stroke={COR[tom]} strokeWidth={3.5} strokeLinejoin="round" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * Math.PI) / 3;
          return <line key={i} x1={Math.cos(a) * r * 0.3} y1={Math.sin(a) * r * 0.3} x2={Math.cos(a) * r * 0.66} y2={Math.sin(a) * r * 0.66} stroke={COR[tom]} strokeWidth={3} strokeLinecap="round" opacity={0.55} />;
        })}
        <circle r={r * 0.68} fill="none" stroke={COR[tom]} strokeWidth={2} opacity={0.4} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Balão de mensagem (genérico, sem marca de terceiros)                */
/* ------------------------------------------------------------------ */

export function Balao({ x, y, w, h, lado, tom, tracejado = false, opacidade = 1, escala = 1 }: { x: number; y: number; w: number; h: number; lado: "e" | "d"; tom: Tom; tracejado?: boolean; opacidade?: number; escala?: number }) {
  if (opacidade <= 0.002 || escala <= 0.002) return null;
  const c = tom === "texto" ? "texto" : tom;
  const raio = h / 2.2;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: opacidade,
        transform: `scale(${escala.toFixed(4)})`,
        transformOrigin: lado === "e" ? "0% 100%" : "100% 100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: lado === "e" ? `${raio}px ${raio}px ${raio}px 6px` : `${raio}px ${raio}px 6px ${raio}px`,
          background: tracejado ? "transparent" : rgba(c, 0.85),
          border: tracejado ? `3px dashed ${rgba(c, 0.9)}` : undefined,
          boxShadow: tracejado ? undefined : `0 1px 0 rgb(255 255 255 / 0.3) inset`,
        }}
      />
      {/* "linhas de texto" do balão */}
      {!tracejado ? (
        <>
          <span style={{ position: "absolute", left: w * 0.16, top: h * 0.3, width: w * 0.62, height: Math.max(3, h * 0.11), borderRadius: 4, background: "rgb(14 17 22 / 0.35)" }} />
          <span style={{ position: "absolute", left: w * 0.16, top: h * 0.56, width: w * 0.4, height: Math.max(3, h * 0.11), borderRadius: 4, background: "rgb(14 17 22 / 0.35)" }} />
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Caixa de seleção que se marca                                       */
/* ------------------------------------------------------------------ */

/** Caixa com o número dentro (vazia) que vira verde com o tique ao ser marcada em `em`. */
export function Caixa({ t, em, lado = 76, numero }: { t: number; em: number; lado?: number; numero: string }) {
  const s = spring(t - em, { k: 320, d: 18 });
  const p = clamp01((t - em) * 8);
  const tique = ease.outCubic(prog(t, em + 0.04, em + 0.32));
  const flash = t >= em ? Math.exp(-(t - em) * 4) : 0;
  return (
    <div
      style={{
        position: "relative",
        width: lado,
        height: lado,
        flex: "none",
        borderRadius: lado * 0.24,
        border: `3px solid ${p > 0.5 ? "var(--cor-verde)" : "rgb(242 244 247 / 0.28)"}`,
        background: p > 0 ? rgba("verde", 0.16 + 0.1 * flash) : "rgb(255 255 255 / 0.03)",
        boxShadow: p > 0 ? brilhoCaixa("verde", 0.35 + 0.6 * flash) : undefined,
        transform: `scale(${(t >= em ? 0.86 + 0.14 * s : 1).toFixed(4)})`,
      }}
    >
      <span
        className="font-mono"
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: lado * 0.42,
          fontWeight: 700,
          color: "var(--cor-texto-3)",
          opacity: 1 - p,
        }}
      >
        {numero}
      </span>
      <svg width={lado} height={lado} viewBox="0 0 100 100" style={{ position: "absolute", inset: -3, overflow: "visible" }} aria-hidden="true">
        <path
          d="M26 53 L44 70 L76 32"
          fill="none"
          stroke="var(--cor-verde)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={(1 - tique).toFixed(4)}
          opacity={tique > 0 ? 1 : 0}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pilha de contratos ("carteira")                                     */
/* ------------------------------------------------------------------ */

/** Pilha de placas finas: a carteira. `n` placas visíveis de `total` (crescimento). */
export function Pilha({ x, y, largura = 300, total = 8, visiveis = total, tom = "azul", opacidade = 1, children }: { x: number; y: number; largura?: number; total?: number; visiveis?: number; tom?: Tom; opacidade?: number; children?: ReactNode }) {
  if (opacidade <= 0.002) return null;
  const c = tom === "texto" ? "texto" : tom;
  const alt = 34;
  const passo = 22;
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: x, top: y, width: largura, height: total * passo + alt, opacity: opacidade }}>
      {Array.from({ length: total }, (_, i) => {
        const v = clamp01(visiveis - i);
        if (v <= 0) return null;
        const yy = (total - 1 - i) * passo;
        const estilo: CSSProperties = {
          position: "absolute",
          left: i % 2 ? 6 : 0,
          top: yy - (1 - ease.outCubic(v)) * 40,
          width: largura - 6,
          height: alt,
          borderRadius: 8,
          background: `linear-gradient(180deg, ${rgba(c, 0.5)} 0%, ${rgba(c, 0.22)} 100%)`,
          border: `1.5px solid ${rgba(c, 0.85)}`,
          boxShadow: "0 10px 18px -10px rgb(0 0 0 / 0.8)",
          opacity: ease.outCubic(v),
        };
        return (
          <div key={i} style={estilo}>
            <span style={{ position: "absolute", left: 18, top: 13, width: largura * 0.36, height: 6, borderRadius: 3, background: rgba(c, 0.6) }} />
            <span style={{ position: "absolute", right: 22, top: 13, width: largura * 0.14, height: 6, borderRadius: 3, background: rgba(c, 0.6) }} />
          </div>
        );
      })}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Semáforo do piloto                                                  */
/* ------------------------------------------------------------------ */

const AMARELO = "232 197 71";

/** Mini semáforo horizontal (verde, amarelo, vermelho) que acende em três tempos. */
export function Semaforo({ t, tempos, contorno }: { t: number; tempos: [number, number, number]; contorno: number }) {
  const cores = ["182 242 58", AMARELO, "255 122 69"];
  const pc = ease.saida(prog(t, contorno, contorno + 0.5));
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 999,
        background: "rgb(14 17 22 / 0.7)",
        border: `2px solid rgb(242 244 247 / ${(0.12 + 0.5 * pc).toFixed(3)})`,
        boxShadow: pc > 0 ? `0 0 ${Math.round(24 * pc)}px rgb(242 244 247 / ${(0.12 * pc).toFixed(3)})` : undefined,
      }}
    >
      {cores.map((c, i) => {
        const a = ease.outCubic(prog(t, tempos[i], tempos[i] + 0.25));
        const flash = t >= tempos[i] ? Math.exp(-(t - tempos[i]) * 3) : 0;
        return (
          <span
            key={i}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: `rgb(${c} / ${(0.14 + 0.86 * a).toFixed(3)})`,
              boxShadow: a > 0 ? `0 0 ${Math.round(14 + 20 * flash)}px rgb(${c} / ${(0.5 * a).toFixed(3)})` : undefined,
              transform: `scale(${(1 + 0.18 * flash).toFixed(4)})`,
            }}
          />
        );
      })}
    </div>
  );
}
