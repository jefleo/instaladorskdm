import { useId, useState, type ReactNode } from "react";
import { zippi } from "../../data/vapti";
import { viz } from "../../content/ui";
import { entrada, Figura, useViz, type VizProps } from "./comum";

/**
 * V04 — Linha do tempo da Zippi: tudo em cinza, só texto. Vertical em contêiner estreito.
 * Com `interativo`, cada marco vira botão e abre embaixo os números e a fonte daquele marco.
 */
export function LinhaTempoZippi({ compacto = false, legenda = true, className, interativo = false }: VizProps & { interativo?: boolean } = {}) {
  const { ref, largura, ativo, animar } = useViz<HTMLOListElement>();
  const itens = zippi.timeline;
  const vertical = compacto || (largura > 0 && largura < 900);
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const idPainel = useId();
  const detalhe = escolhido !== null ? viz.linhaZippi.detalhes[escolhido] : null;

  /** Envolve o conteúdo do marco num botão (modo interativo). */
  const marco = (i: number, conteudo: ReactNode, classe: string) =>
    interativo ? (
      <button
        type="button"
        aria-expanded={escolhido === i}
        aria-controls={idPainel}
        onClick={() => setEscolhido((atual) => (atual === i ? null : i))}
        className={`${classe} w-full cursor-pointer rounded-2 text-left transition-colors hover:bg-cinza-suave ${escolhido === i ? "bg-cinza-suave" : ""}`}
      >
        {conteudo}
      </button>
    ) : (
      <div className={classe}>{conteudo}</div>
    );

  return (
    <Figura visual="V04" titulo={viz.linhaZippi.titulo} legenda={legenda} className={className}>
      <ol
        ref={ref}
        className="m-0 grid list-none p-0 font-texto"
        style={vertical ? { gridTemplateColumns: "1fr" } : { gridTemplateColumns: `repeat(${itens.length}, minmax(0, 1fr))` }}
      >
        {itens.map((it, i) => {
          const ultimo = i === itens.length - 1;
          const estilo = entrada(ativo, animar, "subir", i * 45, 300);
          const cheio = escolhido === i;
          const ponto = `relative z-10 block rounded-full border-2 border-cinza ${cheio ? "bg-cinza" : "bg-tinta"}`;
          if (vertical) {
            return (
              <li key={it.quando + i} style={estilo}>
                {marco(
                  i,
                  <>
                    <span className="pt-[0.1em] text-right font-mono text-apoio font-bold text-cinza">{it.quando}</span>
                    <span className="relative flex justify-center" aria-hidden="true">
                      <span className={`${ponto} mt-[0.35em] size-[0.75em]`} />
                      {!ultimo ? <span className="absolute top-[0.9em] bottom-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-cinza-borda" /> : null}
                    </span>
                    <span className="pb-[1em] text-apoio leading-snug text-texto-2">{it.texto}</span>
                  </>,
                  "grid grid-cols-[7.5ch_1.4em_1fr] gap-x-[0.7em]",
                )}
              </li>
            );
          }
          return (
            <li key={it.quando + i} className="min-w-0" style={estilo}>
              {marco(
                i,
                <>
                  <span className="font-mono text-apoio font-bold text-cinza">{it.quando}</span>
                  <span className="relative my-[0.55em] block h-[0.9em]" aria-hidden="true">
                    <span
                      className="absolute top-1/2 border-t-2 border-dashed border-cinza-borda"
                      style={{ left: 0, right: ultimo ? "auto" : 0, width: ultimo ? "0.9em" : undefined }}
                    />
                    <span className={`${ponto} absolute top-0 left-0 size-[0.9em]`} />
                  </span>
                  <span className="pr-[1em] text-apoio leading-snug text-texto-2">{it.texto}</span>
                </>,
                "flex min-w-0 flex-col",
              )}
            </li>
          );
        })}
      </ol>
      {interativo ? (
        <div
          id={idPainel}
          aria-live="polite"
          className={`mt-[0.8em] rounded-3 border px-[0.9em] py-[0.6em] text-apoio leading-snug ${detalhe ? "border-cinza-borda bg-cinza-suave" : "border-dashed border-borda"}`}
        >
          {detalhe && escolhido !== null ? (
            <p className="text-texto-2">
              <span className="mr-[0.5em] font-mono font-bold text-cinza">{itens[escolhido].quando}</span>
              {detalhe.texto}{" "}
              <span className="text-texto-3">
                {viz.linhaZippi.fonteRotulo}: {detalhe.fonte}.
              </span>
            </p>
          ) : (
            <p className="text-texto-3">{viz.linhaZippi.instrucao}</p>
          )}
        </div>
      ) : null}
    </Figura>
  );
}
