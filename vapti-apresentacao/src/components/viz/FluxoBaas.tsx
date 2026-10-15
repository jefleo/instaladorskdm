import { ArrowDown, ArrowRight, Lock, ScrollText } from "lucide-react";
import { estrutura } from "../../data/vapti";
import { viz } from "../../content/ui";
import { Icone } from "../base";
import { entrada, Figura, useViz, type VizProps } from "./comum";

type Tom = "neutro" | "verde" | "cinza" | "azul";
const TONS: Tom[] = ["neutro", "verde", "cinza", "azul", "neutro"];
const CAIXA: Record<Tom, { borda: string; fundo: string; titulo: string; tracejado?: boolean }> = {
  neutro: { borda: "var(--cor-borda-forte)", fundo: "var(--cor-superficie)", titulo: "var(--cor-texto)" },
  verde: { borda: "var(--cor-verde)", fundo: "var(--cor-verde-suave)", titulo: "var(--cor-verde)" },
  cinza: { borda: "var(--cor-cinza)", fundo: "var(--cor-cinza-suave)", titulo: "var(--cor-texto)", tracejado: true },
  azul: { borda: "var(--cor-azul-borda)", fundo: "var(--cor-azul-suave)", titulo: "var(--cor-azul)" },
};

/** Selo de texto da norma (não é logotipo). */
function SeloNorma({ compacto }: { compacto: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.45em] whitespace-nowrap rounded-full border border-borda-forte bg-superficie-2 font-mono font-medium text-texto-2 ${
        compacto ? "px-[0.6em] py-[0.25em] text-[11px]" : "px-[0.7em] py-[0.38em] text-apoio"
      }`}
    >
      <Icone icone={ScrollText} tamanho="1em" />
      {viz.fluxo.norma}
    </span>
  );
}

/** V13 — Fluxo BaaS em 5 passos. `compacto`: versão do resumo A4 (tipografia fixa e pequena). */
export function FluxoBaas({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, ativo, animar } = useViz();
  const horizontal = largura >= (compacto ? 560 : 1100);
  const passos = viz.fluxo.passos;

  const corpo = (i: number) => {
    const p = passos[i];
    const c = CAIXA[TONS[i]];
    return (
      <div
        className="flex h-full w-full min-w-0 flex-col rounded-3 border-2"
        style={{
          borderColor: c.borda,
          background: c.fundo,
          borderStyle: c.tracejado ? "dashed" : "solid",
          padding: compacto ? "0.55em 0.6em" : "0.8em 0.85em",
          ...entrada(ativo, animar, "subir", i * 70, 300),
        }}
      >
        <p className={`font-mono text-texto-3 ${compacto ? "text-[10px]" : "text-apoio"}`}>{String(i + 1).padStart(2, "0")}</p>
        <p className={`font-titulo font-bold leading-tight ${compacto ? "text-[13px]" : "text-corpo-g"}`} style={{ color: c.titulo }}>
          {p.quem}
        </p>
        <p className={`font-mono uppercase tracking-[0.06em] text-texto-2 ${compacto ? "mt-[0.2em] text-[9.5px]" : "mt-[0.3em] text-apoio"}`}>{p.papel}</p>
        {!compacto ? <p className="mt-[0.45em] text-apoio leading-snug text-texto-2">{p.texto}</p> : null}
        {i === 3 ? (
          <ul className={`m-0 flex list-none flex-col p-0 ${compacto ? "mt-[0.35em] gap-[0.2em]" : "mt-[0.6em] gap-[0.35em]"}`}>
            {estrutura.financiadores.map((fz) => (
              <li
                key={fz.fase}
                className={`rounded-2 border border-azul-borda bg-superficie leading-tight text-texto ${compacto ? "px-[0.4em] py-[0.15em] text-[10px]" : "px-[0.55em] py-[0.3em] text-apoio"}`}
              >
                <span className="font-mono font-bold text-azul">{viz.fluxo.fase(fz.fase)}</span> · {fz.quem}
              </li>
            ))}
          </ul>
        ) : null}
        {i === 4 ? (
          <p className={`flex items-center gap-[0.4em] font-semibold text-texto ${compacto ? "mt-[0.35em] text-[10.5px]" : "mt-[0.6em] text-apoio"}`}>
            <Icone icone={Lock} tamanho="1em" className="flex-none text-texto-2" />
            {viz.fluxo.nunca}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <Figura visual="V13" titulo={compacto ? undefined : viz.fluxo.titulo} extra={compacto ? undefined : <SeloNorma compacto={false} />} legenda={legenda && !compacto} className={className}>
      <div ref={ref} className="w-full font-texto">
        {compacto ? (
          <div className="mb-[8px]">
            <SeloNorma compacto />
          </div>
        ) : null}
        <ol className={`m-0 flex list-none p-0 ${horizontal ? "flex-row items-stretch" : "flex-col"}`}>
          {passos.map((p, i) => (
            <li key={p.quem} className={`flex ${horizontal ? "min-w-0 flex-row" : "flex-col"}`} style={{ flex: horizontal ? "1 1 0" : undefined }}>
              {corpo(i)}
              {i < passos.length - 1 ? (
                <span
                  className="grid flex-none place-items-center text-texto-3"
                  aria-hidden="true"
                  style={horizontal ? { width: compacto ? 18 : "2em" } : { height: compacto ? 16 : "1.7em" }}
                >
                  <Icone icone={horizontal ? ArrowRight : ArrowDown} tamanho={compacto ? 13 : "1.15em"} />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </Figura>
  );
}
