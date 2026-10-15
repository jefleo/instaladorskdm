/**
 * <CelularMoldura> — o aparelho genérico do site (src/components/base/MolduraCelular),
 * sem marca, com entrada em mola, leve giro 3D, sombra longa e reflexo de vidro.
 * O conteúdo da tela vem como `children` (dados fictícios + selo "Protótipo" na cena).
 */
import type { CSSProperties, ReactNode } from "react";
import { MolduraCelular } from "../../../src/components/base/MolduraCelular";
import { useFilme } from "./contexto";
import { Halo } from "./acabamento";
import { ease, prog, spring } from "./tempo";

/** Proporção da tela da moldura (390 × 844) e borda (12 px a 390). */
export const CELULAR = { telaL: 390, telaA: 844, borda: 12 } as const;

/** Altura total do aparelho para uma largura de tela `largura`. */
export const alturaCelular = (largura: number): number => (largura * CELULAR.telaA) / CELULAR.telaL + 2 * Math.round((CELULAR.borda * largura) / CELULAR.telaL);

export interface CelularMolduraProps {
  em: number;
  saida?: number;
  /** Largura da TELA em px (padrão 360; o aparelho fica ~24 px mais largo). */
  largura?: number;
  /** Posição absoluta (canto superior esquerdo do aparelho). */
  x?: number;
  y?: number;
  /** Giro final em Y, em graus (padrão −7: vira levemente para o centro). */
  giro?: number;
  /** Halo verde atrás do aparelho, 0..1 (padrão 0,45). */
  brilho?: number;
  /** Fundo da tela (padrão tinta). */
  fundoTela?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Celular que entra subindo com mola e assenta com um giro sutil. */
export function CelularMoldura({ em, saida, largura = 360, x, y, giro = -7, brilho = 0.45, fundoTela, children, className, style }: CelularMolduraProps) {
  const { t } = useFilme();
  const s = spring(t - em, { k: 120, d: 19 });
  const o = ease.outCubic(prog(t, em, em + 0.35));
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.4)) : 0;
  if (o <= 0) return null;
  const u = 1 - s;
  const ry = giro * (0.35 + 0.65 * s) + u * 18;
  const posicao: CSSProperties = x !== undefined || y !== undefined ? { position: "absolute", left: x, top: y } : { position: "relative" };
  const aparelhoL = largura + 2 * Math.round((CELULAR.borda * largura) / CELULAR.telaL);
  // reflexo acompanha o giro
  const brilhoX = 30 + ry * 2.2;
  return (
    <div className={className} style={{ ...posicao, width: aparelhoL, perspective: 1800, opacity: o * (1 - q), ...style }}>
      {brilho > 0 ? <Halo tom="verde" x={aparelhoL / 2} y={alturaCelular(largura) / 2} w={aparelhoL * 2.6} h={aparelhoL * 3.4} intensidade={0.2 * brilho} /> : null}
      <div
        style={{
          transform: `translate3d(0, ${(u * 120).toFixed(2)}px, 0) rotateY(${ry.toFixed(3)}deg) rotateX(${(2 + u * 6).toFixed(3)}deg)`,
          transformOrigin: "50% 60%",
        }}
      >
        {/* sombra de contato (gradiente, sem filter) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            bottom: -46,
            height: 90,
            background: "radial-gradient(ellipse at 50% 30%, rgb(0 0 0 / 0.6) 0%, rgb(0 0 0 / 0.25) 45%, transparent 72%)",
          }}
        />
        <MolduraCelular largura={largura} fundoTela={fundoTela}>
          <div className="relative h-full w-full overflow-hidden">
            {children}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: `linear-gradient(115deg, rgb(255 255 255 / 0.07) 0%, rgb(255 255 255 / 0.02) ${brilhoX.toFixed(1)}%, transparent ${(brilhoX + 12).toFixed(1)}%)` }}
            />
          </div>
        </MolduraCelular>
      </div>
    </div>
  );
}
