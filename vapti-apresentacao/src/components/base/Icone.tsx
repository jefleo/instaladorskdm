import type { LucideIcon, LucideProps } from "lucide-react";

export interface IconeProps extends Omit<LucideProps, "ref"> {
  /** Componente do lucide-react, ex.: `icone={ArrowRight}`. */
  icone: LucideIcon;
  /** Tamanho em px ou em unidade CSS (padrão "1em", acompanha o texto). */
  tamanho?: number | string;
  /** Rótulo acessível. Sem rótulo, o ícone é decorativo (aria-hidden). */
  rotulo?: string;
}

/** Ícone do conjunto único (Lucide) com traço fino. */
export function Icone({ icone: Comp, tamanho = "1em", rotulo, strokeWidth = 1.5, ...resto }: IconeProps) {
  return (
    <Comp
      size={tamanho}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={false}
      aria-hidden={rotulo ? undefined : true}
      aria-label={rotulo}
      role={rotulo ? "img" : undefined}
      focusable="false"
      {...resto}
    />
  );
}
