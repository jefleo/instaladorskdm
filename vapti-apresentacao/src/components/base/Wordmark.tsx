import type { CSSProperties } from "react";

export interface WordmarkProps {
  /** Altura da letra (font-size) em px ou unidade CSS. Padrão 48px. */
  tamanho?: number | string;
  /** "cor": pingo verde; "mono": tudo na cor do texto (ex.: carimbo em impressão P&B). */
  variante?: "cor" | "mono";
  className?: string;
}

/**
 * Marca provisória da Vapti: Bricolage Grotesque 800, espacejamento justo.
 * Assinatura: o pingo do "i" virou um traço inclinado que "já saiu" para a frente —
 * o vupt do vapt-vupt. Sem raio, sem moeda.
 */
export function Wordmark({ tamanho = 48, variante = "cor", className }: WordmarkProps) {
  const fs = typeof tamanho === "number" ? `${tamanho}px` : tamanho;
  const estilo: CSSProperties = {
    fontSize: fs,
    fontFamily: "var(--fonte-titulo)",
    fontWeight: 800,
    letterSpacing: "-0.055em",
    lineHeight: 1,
  };
  const corPingo = variante === "cor" ? "var(--cor-verde)" : "currentColor";
  return (
    <span role="img" aria-label="Vapti" className={`inline-flex items-baseline ${className ?? ""}`} style={estilo}>
      <span aria-hidden="true">Vapt</span>
      {/* "i" desenhado: haste com a espessura do 800 + pingo em movimento */}
      <span aria-hidden="true" className="relative inline-block" style={{ width: "0.27em", height: "0.53em", marginLeft: "0.03em" }}>
        <span className="absolute bottom-0 left-[0.045em] block bg-current" style={{ width: "0.165em", height: "100%", borderRadius: "0.02em" }} />
        <span
          className="absolute block"
          style={{
            left: "0.03em",
            top: "-0.255em",
            width: "0.42em",
            height: "0.15em",
            background: corPingo,
            transform: "skewX(-24deg)",
            borderRadius: "0.025em",
          }}
        />
      </span>
    </span>
  );
}
