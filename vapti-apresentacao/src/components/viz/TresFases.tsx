import { ChevronRight } from "lucide-react";
import { fases, premissas } from "../../data/vapti";
import { viz } from "../../content/ui";
import { simularFase } from "../../lib/modelo";
import { Icone } from "../base";
import { entrada, Figura, TabelaSr, useViz, type VizProps } from "./comum";
import { emMi, rotulosResultado } from "./rotulos";

/** V17 — As três fases: carteira, margem/mês (perda de 8%), financiamento e perda de equilíbrio. Projeção. */
export function TresFases({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, ativo, animar } = useViz();
  const dados = fases.map((f) => {
    const r = simularFase(f.fase, premissas.taxaBase.valor, premissas.perdaBase.valor);
    return { f, r, rot: rotulosResultado(r), carteira: emMi(r.carteira) };
  });
  const maxCart = Math.max(...dados.map((d) => d.r.carteira));
  const maxMarg = Math.max(...dados.map((d) => d.r.margemMes));
  const largo = !compacto && largura >= 1000;

  const Barra = ({ v, max, i, linha }: { v: number; max: number; i: number; linha: number }) => (
    <div className="relative h-[0.9em] w-full rounded-[3px] bg-superficie-2" aria-hidden="true">
      <div
        className="absolute inset-y-0 left-0 rounded-[3px] bg-verde"
        style={{ width: `${Math.max((v / max) * 100, 0.8)}%`, ...entrada(ativo, animar, "x", 150 + linha * 120 + i * 70, 400) }}
      />
    </div>
  );

  const linhas = [
    { chave: "fin", rotulo: viz.fases.financiamento },
    { chave: "cart", rotulo: viz.fases.carteira },
    { chave: "marg", rotulo: viz.fases.margem },
    { chave: "eq", rotulo: viz.fases.equilibrio },
  ] as const;

  const celula = (chave: (typeof linhas)[number]["chave"], d: (typeof dados)[number], i: number) => {
    switch (chave) {
      case "fin":
        return <p className="text-apoio leading-snug text-texto-2">{d.f.financiamento}</p>;
      case "cart":
        return (
          <div>
            <p className="font-mono text-corpo-g font-bold text-texto">{d.carteira}</p>
            <Barra v={d.r.carteira} max={maxCart} i={i} linha={0} />
          </div>
        );
      case "marg":
        return (
          <div>
            <p className="font-mono text-corpo-g font-bold text-verde">{d.rot.margemMes}</p>
            <Barra v={d.r.margemMes} max={maxMarg} i={i} linha={1} />
          </div>
        );
      case "eq":
        return <p className="font-mono text-corpo font-bold text-texto">{d.rot.perdaEquilibrio}</p>;
    }
  };

  return (
    <Figura visual="V17" titulo={viz.fases.titulo} selo="projecao" legenda={legenda} className={className}>
      <div ref={ref} className="w-full font-texto">
        {largo ? (
          <div className="grid items-start" style={{ gridTemplateColumns: "minmax(0, 13em) repeat(3, minmax(0, 1fr))", columnGap: "2em", rowGap: "1em" }}>
            <span />
            {dados.map((d, i) => (
              <p key={d.f.fase} className="flex items-center gap-[0.3em] border-b-2 border-verde pb-[0.3em] font-titulo text-corpo-g font-bold text-texto" style={entrada(ativo, animar, "subir", i * 70, 300)}>
                {viz.fases.fase(d.f.fase, d.f.periodo)}
                {i < dados.length - 1 ? <Icone icone={ChevronRight} tamanho="0.9em" className="ml-auto text-texto-3" /> : null}
              </p>
            ))}
            {linhas.map((l) => (
              <div key={l.chave} className="contents">
                <p className="pt-[0.2em] text-apoio font-semibold leading-snug text-texto-3">{l.rotulo}</p>
                {dados.map((d, i) => (
                  <div key={d.f.fase} className="min-w-0" style={entrada(ativo, animar, "fade", 100 + i * 70, 300)}>
                    {celula(l.chave, d, i)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-[0.9em] p-0">
            {dados.map((d, i) => (
              <li key={d.f.fase} className="rounded-3 border border-borda bg-superficie p-[0.9em]" style={entrada(ativo, animar, "subir", i * 70, 300)}>
                <p className="font-titulo text-corpo-g font-bold text-texto">{viz.fases.fase(d.f.fase, d.f.periodo)}</p>
                <dl className="mt-[0.5em] grid gap-[0.55em]">
                  {linhas.map((l) => (
                    <div key={l.chave}>
                      <dt className="text-apoio font-semibold text-texto-3">{l.rotulo}</dt>
                      <dd className="m-0">{celula(l.chave, d, i)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-[0.9em] text-apoio text-texto-3">{viz.fases.escala}</p>
      </div>
      <TabelaSr
        legenda={viz.fases.tabela}
        cabecalho={["", ...dados.map((d) => viz.fases.fase(d.f.fase, d.f.periodo))]}
        linhas={[
          [viz.fases.financiamento, ...dados.map((d) => d.f.financiamento)],
          [viz.fases.carteira, ...dados.map((d) => d.carteira)],
          [viz.fases.margem, ...dados.map((d) => d.rot.margemMes)],
          [viz.fases.equilibrio, ...dados.map((d) => d.rot.perdaEquilibrio)],
        ]}
      />
    </Figura>
  );
}
