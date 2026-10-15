import { zippi } from "../../data/vapti";
import { viz } from "../../content/ui";
import { entrada, Figura, useViz, type VizProps } from "./comum";

/** V04 — Linha do tempo da Zippi: tudo em cinza, só texto. Vertical em contêiner estreito. */
export function LinhaTempoZippi({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, ativo, animar } = useViz<HTMLOListElement>();
  const itens = zippi.timeline;
  const vertical = compacto || (largura > 0 && largura < 900);

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
          if (vertical) {
            return (
              <li key={it.quando + i} className="grid grid-cols-[7.5ch_1.4em_1fr] gap-x-[0.7em]" style={estilo}>
                <span className="pt-[0.1em] text-right font-mono text-apoio font-bold text-cinza">{it.quando}</span>
                <span className="relative flex justify-center" aria-hidden="true">
                  <span className="relative z-10 mt-[0.35em] block size-[0.75em] rounded-full border-2 border-cinza bg-tinta" />
                  {!ultimo ? <span className="absolute top-[0.9em] bottom-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-cinza-borda" /> : null}
                </span>
                <span className="pb-[1em] text-apoio leading-snug text-texto-2">{it.texto}</span>
              </li>
            );
          }
          return (
            <li key={it.quando + i} className="flex min-w-0 flex-col" style={estilo}>
              <span className="font-mono text-apoio font-bold text-cinza">{it.quando}</span>
              <span className="relative my-[0.55em] block h-[0.9em]" aria-hidden="true">
                <span
                  className="absolute top-1/2 border-t-2 border-dashed border-cinza-borda"
                  style={{ left: 0, right: ultimo ? "auto" : 0, width: ultimo ? "0.9em" : undefined }}
                />
                <span className="absolute top-0 left-0 z-10 block size-[0.9em] rounded-full border-2 border-cinza bg-tinta" />
              </span>
              <span className="pr-[1em] text-apoio leading-snug text-texto-2">{it.texto}</span>
            </li>
          );
        })}
      </ol>
    </Figura>
  );
}
