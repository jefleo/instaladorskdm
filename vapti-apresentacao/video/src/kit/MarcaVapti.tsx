/**
 * V01 — Marca Vapti animada (mesma geometria de src/components/base/Wordmark.tsx).
 * Bricolage Grotesque 800; o pingo do "i" é o traço "vupt": entra voando da esquerda,
 * com um rastro curto, e assenta em mola — o vapt-vupt.
 */
import type { CSSProperties } from "react";
import { config } from "../../../src/data/vapti";
import { useFilme } from "./contexto";
import { rgba } from "./cores";
import { ease, prog, spring } from "./tempo";

export interface MarcaVaptiProps {
  /** Tamanho da letra (font-size) em px (padrão 160). */
  tamanho?: number;
  /** Instante da entrada animada. Sem `em`, a marca aparece pronta (estática). */
  em?: number;
  /** Instante de saída (fade). */
  saida?: number;
  /** Mostra o slogan ("Capital de giro na velocidade do Pix") ou um texto próprio. */
  slogan?: boolean | string;
  /** "cor": pingo verde; "mono": tudo na cor do texto. */
  variante?: "cor" | "mono";
  /** Halo verde atrás do pingo, 0..1 (padrão 0,6). */
  brilho?: number;
  alinhar?: "esquerda" | "centro";
  className?: string;
  style?: CSSProperties;
}

const LETRAS = ["V", "a", "p", "t"];

/** Marca Vapti (wordmark) com entrada em três tempos: letras, haste do "i", pingo vupt. */
export function MarcaVapti({ tamanho = 160, em, saida, slogan = false, variante = "cor", brilho = 0.6, alinhar = "esquerda", className, style }: MarcaVaptiProps) {
  const { t } = useFilme();
  const animado = em !== undefined;
  const t0 = em ?? -1e9;
  const qSaida = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.45)) : 0;

  // Pingo: voa de −1,8em até 0 com mola; rastro = posições um pouco atrasadas no tempo
  const tPingo = t0 + 0.42;
  const xPingo = (tt: number) => (animado ? (1 - spring(tt - tPingo, { k: 210, d: 21 })) * -1.8 : 0);
  const pPingo = animado ? prog(t, tPingo, tPingo + 0.08) : 1;
  const corPingo = variante === "cor" ? "var(--cor-verde)" : "currentColor";
  const chegada = t - tPingo;
  const halo = animado ? brilho * (chegada < 0 ? 0 : 0.55 + 0.45 * Math.exp(-chegada * 1.8)) : brilho * 0.55;
  const movendo = Math.abs(xPingo(t)) > 0.01;

  const pingo = (x: number, a: number, k: string) => (
    <span
      key={k}
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "0.03em",
        top: "-0.255em",
        width: "0.42em",
        height: "0.15em",
        background: corPingo,
        transform: `translate3d(${x.toFixed(4)}em, 0, 0) skewX(-24deg)`,
        borderRadius: "0.025em",
        opacity: a,
      }}
    />
  );

  const sloganTexto = slogan === true ? config.slogan : slogan || "";
  const pSlogan = animado ? ease.outCubic(prog(t, t0 + 0.95, t0 + 1.55)) : 1;

  return (
    <div
      className={className}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: alinhar === "centro" ? "center" : "flex-start", opacity: 1 - qSaida, ...style }}
    >
      <span
        role="img"
        aria-label="Vapti"
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "baseline",
          fontSize: tamanho,
          fontFamily: "var(--fonte-titulo)",
          fontWeight: 800,
          letterSpacing: "-0.055em",
          lineHeight: 1,
          color: "var(--cor-texto)",
        }}
      >
        {LETRAS.map((l, i) => {
          const p = animado ? prog(t, t0 + i * 0.05, t0 + i * 0.05 + 0.6) : 1;
          return (
            <span key={i} aria-hidden="true" style={{ display: "inline-block", overflow: p < 1 ? "hidden" : "visible", padding: "0.08em 0 0.14em", margin: "-0.08em 0 -0.14em" }}>
              <span style={{ display: "inline-block", transform: `translate3d(0, ${((1 - ease.outExpo(p)) * 110).toFixed(2)}%, 0)` }}>{l}</span>
            </span>
          );
        })}
        {/* "i" desenhado: haste + pingo em movimento */}
        <span aria-hidden="true" style={{ position: "relative", display: "inline-block", width: "0.27em", height: "0.53em", marginLeft: "0.03em" }}>
          <span
            style={{
              position: "absolute",
              bottom: 0,
              left: "0.045em",
              width: "0.165em",
              height: "100%",
              background: "currentColor",
              borderRadius: "0.02em",
              transform: `scaleY(${(animado ? ease.outExpo(prog(t, t0 + 0.2, t0 + 0.6)) : 1).toFixed(4)})`,
              transformOrigin: "bottom",
            }}
          />
          {/* halo verde atrás do pingo (gradiente, sem filter) */}
          {variante === "cor" && halo > 0.01 ? (
            <span
              style={{
                position: "absolute",
                left: "-0.35em",
                top: "-0.62em",
                width: "1.2em",
                height: "0.9em",
                background: `radial-gradient(ellipse, ${rgba("verde", 0.32 * halo)} 0%, ${rgba("verde", 0.1 * halo)} 45%, transparent 70%)`,
                opacity: pPingo,
              }}
            />
          ) : null}
          {movendo ? [pingo(xPingo(t - 0.05), 0.16 * pPingo, "r3"), pingo(xPingo(t - 0.033), 0.3 * pPingo, "r2"), pingo(xPingo(t - 0.016), 0.5 * pPingo, "r1")] : null}
          {pingo(xPingo(t), pPingo, "p")}
        </span>
      </span>
      {sloganTexto ? (
        <span
          style={{
            marginTop: tamanho * 0.16,
            fontFamily: "var(--fonte-texto)",
            fontWeight: 500,
            fontSize: Math.max(22, tamanho * 0.17),
            letterSpacing: "0.005em",
            color: "var(--cor-texto-2)",
            opacity: pSlogan,
            transform: `translate3d(0, ${((1 - pSlogan) * 10).toFixed(2)}px, 0)`,
          }}
        >
          {sloganTexto}
        </span>
      ) : null}
    </div>
  );
}
