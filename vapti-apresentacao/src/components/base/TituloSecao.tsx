import type { ReactNode } from "react";

export interface TituloSecaoProps {
  /** Número da seção (ex.: 3 ou "03"). Exibido com dois dígitos. */
  numero: number | string;
  /** Nome curto da seção (eyebrow). */
  nome: string;
  /** Título-conclusão: a frase que o cliente deve levar. */
  titulo: ReactNode;
  subtitulo?: ReactNode;
  /** "display" para abertura (96px no palco), "secao" padrão (76px). */
  tamanho?: "display" | "secao";
  /** Nível do título. Padrão h2. */
  como?: "h1" | "h2";
  className?: string;
}

/** Eyebrow (número + traço + nome), título-conclusão e subtítulo. */
export function TituloSecao({ numero, nome, titulo, subtitulo, tamanho = "secao", como = "h2", className }: TituloSecaoProps) {
  const H = como;
  const num = typeof numero === "number" ? String(numero).padStart(2, "0") : numero;
  return (
    <header className={className}>
      <p className="flex items-center gap-[0.6em] font-mono text-eyebrow font-medium uppercase text-texto-2" style={{ letterSpacing: "var(--tracking-eyebrow)" }}>
        <span className="text-verde">{num}</span>
        <span className="traco-vupt" aria-hidden="true" style={{ width: "1.1em", height: "0.22em" }} />
        <span>{nome}</span>
      </p>
      <H
        className={`mt-[0.32em] font-titulo font-extrabold text-texto ${tamanho === "display" ? "text-display" : "text-titulo"}`}
        style={{ lineHeight: "var(--lh-titulo)", letterSpacing: "var(--tracking-titulo)", maxWidth: "20ch" }}
      >
        {titulo}
      </H>
      {subtitulo ? (
        <p className="mt-[0.7em] font-texto text-subtitulo font-medium text-texto-2" style={{ lineHeight: 1.3, maxWidth: "46ch" }}>
          {subtitulo}
        </p>
      ) : null}
    </header>
  );
}
