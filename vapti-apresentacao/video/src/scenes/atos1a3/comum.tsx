/**
 * Utilidades locais dos atos 1 a 3 (não fazem parte do kit).
 * Tudo é função pura de `t`: nada de estado, relógio ou aleatório fora do mulberry32.
 */
import type { CSSProperties, ReactNode } from "react";
import { COR, ease, envelope, normalizar, prog, rgba, spring, useFilme, type Tom } from "../../kit";
import type { Frase } from "../../timeline";

/**
 * Instante (absoluto) em que uma palavra é dita na frase. `ocorrencia` escolhe a n-ésima
 * repetição; `fim` devolve o fim da palavra. Sem par na fala, cai na ênfase da frase.
 */
export function tPal(f: Frase, palavra: string, ocorrencia = 0, fim = false): number {
  const alvo = normalizar(palavra);
  let k = 0;
  for (const p of f.palavras) {
    if (normalizar(p.w) === alvo) {
      if (k === ocorrencia) return fim ? p.t1 : p.t0;
      k++;
    }
  }
  return f.tEnfase;
}

/** Envelope de um plano: some do DOM quando invisível (desempenho). */
export function Plano({ de, ate, entrada = 0.4, saida = 0.4, children, style }: { de: number; ate: number; entrada?: number; saida?: number; children?: ReactNode; style?: CSSProperties }) {
  const { t } = useFilme();
  const v = envelope(t, de, ate, entrada, saida);
  if (v <= 0.002) return null;
  return (
    <div className="absolute inset-0" style={{ opacity: v, ...style }}>
      {children}
    </div>
  );
}

/** Entrada em mola: 0 → 1 a partir de `em` (pode passar levemente de 1). */
export const mola = (t: number, em: number, k = 190, d = 22): number => spring(t - em, { k, d });

/** Opacidade de entrada curta. */
export const surge = (t: number, em: number, dur = 0.3): number => ease.outCubic(prog(t, em, em + dur));

/** Opacidade de saída curta (1 → 0 a partir de `em`). */
export const some = (t: number, em: number, dur = 0.35): number => 1 - ease.inOutSine(prog(t, em, em + dur));

/** Interpolação entre dois números com progresso já "easado". */
export const mix = (a: number, b: number, p: number): number => a + (b - a) * p;

/** Posição absoluta curta. */
export const abs = (left: number, top: number, extra?: CSSProperties): CSSProperties => ({ position: "absolute", left, top, ...extra });

/**
 * Chave à esquerda do L2: eyebrow curto + título grande, com troca por "máscara".
 * As palavras entram em `em` (escalonadas por `passo`), saem em `saida`.
 */
export function ChaveL2({
  eyebrow,
  titulo,
  em,
  emTitulo,
  saida,
  destaque,
  tomDestaque = "verde",
  tom = "texto",
  tamanho = 84,
  top = 300,
  largura = 540,
  passo = 0.12,
}: {
  eyebrow?: string;
  titulo: string;
  em: number;
  emTitulo?: number;
  saida?: number;
  destaque?: string | string[];
  tomDestaque?: Tom;
  tom?: Tom;
  tamanho?: number;
  top?: number;
  largura?: number;
  passo?: number;
}) {
  const { t } = useFilme();
  if (t < em - 0.05) return null;
  if (saida !== undefined && t > saida + 0.6) return null;
  const pTraco = ease.saida(prog(t, em, em + 0.5));
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.45)) : 0;
  const tt = emTitulo ?? em + 0.15;
  const ws = titulo.split(/\s+/);
  const dest = new Set((Array.isArray(destaque) ? destaque : destaque ? [destaque] : []).map(normalizar));
  return (
    <div style={{ position: "absolute", left: 120, top, width: largura, opacity: 1 - q, transform: `translate(0, ${(-q * 26).toFixed(1)}px)` }}>
      {eyebrow ? (
        <div className="flex items-center" style={{ gap: 16, marginBottom: 22 }}>
          <span style={{ display: "inline-block", width: 36, height: 8, borderRadius: 2, background: COR[tomDestaque === "coral" ? "coral" : "verde"], transform: `skewX(-24deg) scaleX(${pTraco.toFixed(3)})`, transformOrigin: "left center", boxShadow: `0 0 16px ${rgba(tomDestaque === "coral" ? "coral" : "verde", 0.4 * pTraco)}` }} />
          <span style={{ fontFamily: "var(--fonte-texto)", fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cor-texto-2)", opacity: surge(t, em + 0.08, 0.4), transform: `translate(0, ${((1 - ease.saida(prog(t, em + 0.08, em + 0.6))) * 14).toFixed(1)}px)` }}>{eyebrow}</span>
        </div>
      ) : null}
      <h2 style={{ margin: 0, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: tamanho, lineHeight: 1.02, letterSpacing: "-0.035em", textWrap: "balance" }}>
        {ws.map((w, i) => {
          const te = tt + i * passo;
          const p = prog(t, te, te + 0.6);
          const e = ease.outExpo(p);
          const ehD = dest.has(normalizar(w));
          const lt = t - te;
          const brilho = ehD && p > 0 ? 0.6 + 0.6 * Math.exp(-Math.max(0, lt) * 2) : 0;
          return (
            <span key={i}>
              <span style={{ display: "inline-block", overflow: p < 1 ? "hidden" : "visible", verticalAlign: "top", padding: "0.06em 0.05em 0.16em", margin: "-0.06em -0.05em -0.16em" }}>
                <span style={{ display: "inline-block", transform: `translate(0, ${((1 - e) * 108).toFixed(2)}%)`, opacity: Math.min(1, p * 2.4), color: ehD ? COR[tomDestaque] : COR[tom], textShadow: brilho > 0 ? `0 0 ${Math.round(16 + 14 * brilho)}px ${rgba(tomDestaque === "texto" ? "texto" : tomDestaque, 0.3 * brilho)}` : undefined }}>{w}</span>
              </span>
              {i < ws.length - 1 ? " " : null}
            </span>
          );
        })}
      </h2>
    </div>
  );
}

/** Texto miúdo de apoio em 28 px (o piso que usamos no palco). */
export function Apoio({ children, style, cor = "var(--cor-texto-2)" }: { children: ReactNode; style?: CSSProperties; cor?: string }) {
  return <p style={{ margin: 0, fontFamily: "var(--fonte-texto)", fontWeight: 600, fontSize: 28, lineHeight: 1.3, color: cor, ...style }}>{children}</p>;
}

/** Fundo do palco: tinta com uma luz ambiente baixa (o Film já põe grão e vinheta). */
export function FundoTinta() {
  return <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }} />;
}
