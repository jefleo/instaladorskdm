import type { ReactNode } from "react";

export interface MolduraCelularProps {
  children?: ReactNode;
  /** Largura da tela em px (proporção fixa 390×844). Padrão 390. */
  largura?: number;
  /** Nome acessível da região (ex.: "Protótipo: tela inicial"). */
  rotulo?: string;
  /** Cor de fundo da tela. Padrão: tinta. */
  fundoTela?: string;
  className?: string;
}

/** Moldura genérica de celular, em CSS puro, sem marca. O conteúdo rola dentro da tela. */
export function MolduraCelular({ children, largura = 390, rotulo, fundoTela, className }: MolduraCelularProps) {
  const escala = largura / 390;
  const borda = Math.round(12 * escala);
  return (
    <div
      role={rotulo ? "region" : undefined}
      aria-label={rotulo}
      className={`relative inline-block flex-none ${className ?? ""}`}
      style={{ width: largura + borda * 2, maxWidth: "100%" }}
    >
      {/* botões laterais */}
      <span aria-hidden="true" className="absolute rounded-l-[3px] bg-borda-forte" style={{ left: -3 * escala, top: 170 * escala, width: 3 * escala, height: 56 * escala }} />
      <span aria-hidden="true" className="absolute rounded-l-[3px] bg-borda-forte" style={{ left: -3 * escala, top: 240 * escala, width: 3 * escala, height: 56 * escala }} />
      <span aria-hidden="true" className="absolute rounded-r-[3px] bg-borda-forte" style={{ right: -3 * escala, top: 200 * escala, width: 3 * escala, height: 88 * escala }} />
      <div
        className="relative"
        style={{
          padding: borda,
          borderRadius: 58 * escala,
          background: "linear-gradient(160deg, #2b333e, #12161c 55%, #232a33)",
          boxShadow: "0 0 0 1px rgb(255 255 255 / 0.08) inset, 0 0 0 1.5px #0a0c10, var(--sombra-3)",
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: "390 / 844",
            borderRadius: 46 * escala,
            background: fundoTela ?? "var(--cor-tinta)",
            color: "var(--cor-texto)",
          }}
        >
          {/* ilha da câmera */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-black"
            style={{ top: 11 * escala, width: 112 * escala, height: 32 * escala }}
          />
          <div className="absolute inset-0 overflow-y-auto overscroll-contain">{children}</div>
          {/* indicador inferior */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[8px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/60"
            style={{ width: 134 * escala, height: 5 * escala }}
          />
        </div>
      </div>
    </div>
  );
}
