/**
 * Selos de honestidade (mesmo visual do site, src/components/base/Selo.tsx), sem interação:
 *  - Projeção: pílula verde contornada — todo número projetado (F058–F066, F078–F082).
 *  - Ilustrativo: contorno tracejado azul-gelo — "desenho, não dado".
 *  - Estimativa: contorno tracejado neutro — estimativa de terceiros (ex.: Dealroom).
 *  - Protótipo: etiqueta cinza de canto reto — tela do app com dados fictícios.
 * Cole o selo AO número (mesmo bloco), nunca solto num canto.
 */
import type { CSSProperties } from "react";
import { ChartLine, EqualApproximately, MousePointerClick, Shapes, type LucideIcon } from "lucide-react";
import { useFilme } from "./contexto";
import { ease, prog, spring } from "./tempo";

export type TipoSelo = "projecao" | "ilustrativo" | "estimativa" | "prototipo";

const ROTULO: Record<TipoSelo, string> = { projecao: "Projeção", ilustrativo: "Ilustrativo", estimativa: "Estimativa", prototipo: "Protótipo" };
const ICONE: Record<TipoSelo, LucideIcon> = { projecao: ChartLine, ilustrativo: Shapes, estimativa: EqualApproximately, prototipo: MousePointerClick };
const ESTILO: Record<TipoSelo, CSSProperties> = {
  projecao: { borderRadius: 999, border: "1.5px solid var(--cor-verde-borda)", background: "var(--cor-verde-suave)", color: "var(--cor-verde)" },
  ilustrativo: { borderRadius: 999, border: "1.5px dashed var(--cor-azul)", background: "rgb(14 17 22 / 0.55)", color: "var(--cor-azul)" },
  estimativa: { borderRadius: 999, border: "1.5px dashed var(--cor-borda-forte)", background: "rgb(14 17 22 / 0.55)", color: "var(--cor-texto-2)" },
  prototipo: { borderRadius: 4, border: "1.5px solid var(--cor-cinza-borda)", background: "var(--cor-cinza-suave)", color: "var(--cor-texto-2)" },
};

/** Converte o campo `selo` da timeline ("Projeção", "Ilustrativo") no tipo do kit. */
export function tipoDoSelo(selo: string): TipoSelo | null {
  const s = selo.toLowerCase();
  if (s.startsWith("proje")) return "projecao";
  if (s.startsWith("ilustr")) return "ilustrativo";
  if (s.startsWith("estim")) return "estimativa";
  if (s.startsWith("prot")) return "prototipo";
  return null;
}

export interface SeloProps {
  tipo: TipoSelo;
  /** Texto (padrão "Projeção", "Ilustrativo", "Estimativa", "Protótipo"). */
  rotulo?: string;
  /** Instante de entrada (absoluto). Sem `em`, aparece direto. */
  em?: number;
  saida?: number;
  /** Tamanho da fonte em px (padrão 22, o mínimo legível do palco). */
  tamanho?: number;
  className?: string;
  style?: CSSProperties;
}

/** Selo "Projeção" / "Ilustrativo" / "Estimativa" / "Protótipo" com entrada em mola. */
export function Selo({ tipo, rotulo, em, saida, tamanho = 22, className, style }: SeloProps) {
  const { t } = useFilme();
  const Icone = ICONE[tipo];
  const s = em !== undefined ? spring(t - em, { k: 260, d: 20 }) : 1;
  const o = em !== undefined ? ease.outCubic(prog(t, em, em + 0.25)) : 1;
  const q = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.3)) : 0;
  return (
    <span
      className={className}
      data-selo={tipo}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45em",
        whiteSpace: "nowrap",
        fontFamily: "var(--fonte-mono)",
        fontWeight: 500,
        fontSize: tamanho,
        lineHeight: 1,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "0.42em 0.72em 0.42em 0.62em",
        opacity: o * (1 - q),
        transform: `scale(${(0.82 + 0.18 * s).toFixed(4)})`,
        transformOrigin: "left center",
        ...ESTILO[tipo],
        ...style,
      }}
    >
      <Icone size="1em" strokeWidth={1.75} aria-hidden="true" />
      <span>{rotulo ?? ROTULO[tipo]}</span>
    </span>
  );
}
