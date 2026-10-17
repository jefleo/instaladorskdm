import type { ElementType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Icone } from "./Icone";

export type TomCard = "neutro" | "verde" | "coral" | "azul" | "cinza";

export interface CardProps {
  tom?: TomCard;
  /** Título do cartão (opcional). */
  titulo?: ReactNode;
  /** Ícone do lucide-react ao lado do título. */
  icone?: LucideIcon;
  /** Elevado: superfície mais clara e sombra. */
  elevado?: boolean;
  /** Elemento HTML. Padrão "div" (use "article" ou "li" quando fizer sentido). */
  como?: ElementType;
  className?: string;
  children?: ReactNode;
}

/*
 * Verde e coral compartilham exatamente a mesma estrutura: mesma opacidade de fundo,
 * mesma borda, mesma barra superior de 4px, mesmo peso de título. Só muda a cor.
 * Assim vantagens e riscos têm o mesmo peso visual.
 */
const TOM: Record<TomCard, { caixa: string; barra: string; titulo: string }> = {
  neutro: { caixa: "bg-superficie border-borda", barra: "bg-borda-forte", titulo: "text-texto" },
  verde: { caixa: "bg-verde-suave border-verde-borda", barra: "bg-verde", titulo: "text-verde" },
  coral: { caixa: "bg-coral-suave border-coral-borda", barra: "bg-coral", titulo: "text-coral" },
  azul: { caixa: "bg-azul-suave border-azul-borda", barra: "bg-azul", titulo: "text-azul" },
  cinza: { caixa: "bg-cinza-suave border-cinza-borda", barra: "bg-cinza", titulo: "text-texto-2" },
};

export function Card({ tom = "neutro", titulo, icone, elevado = false, como: Tag = "div", className, children }: CardProps) {
  const t = TOM[tom];
  return (
    <Tag
      data-tom={tom}
      className={`relative overflow-hidden rounded-3 border p-[1.25em] font-texto text-corpo text-texto ${t.caixa} ${
        elevado ? "shadow-2" : ""
      } ${className ?? ""}`}
      style={elevado && tom === "neutro" ? { background: "var(--cor-superficie-2)" } : undefined}
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[4px] ${t.barra}`} />
      {titulo ? (
        <h3 className={`mb-[0.55em] flex items-center gap-[0.45em] font-titulo text-h3 font-bold ${t.titulo}`} style={{ lineHeight: 1.08 }}>
          {icone ? <Icone icone={icone} tamanho="0.9em" className="flex-none" /> : null}
          <span>{titulo}</span>
        </h3>
      ) : null}
      <div className="text-texto-2 [&_strong]:font-semibold [&_strong]:text-texto">{children}</div>
    </Tag>
  );
}
