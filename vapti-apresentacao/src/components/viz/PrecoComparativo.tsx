import { niveis, preco, zippi } from "../../data/vapti";
import { viz } from "../../content/ui";
import { efetivaSemanalSobreSacado, efetivaSobreSaldo } from "../../lib/modelo";
import { formatPct } from "../../lib/formato";
import { EtiquetaEstimativa, entrada, Figura, TabelaSr, ticks, useViz, type VizProps } from "./comum";
import { efetivaMes, efetivaSaldoMes, formatTaxa, jurosEm400, jurosSobreSaldoEm400 } from "./rotulos";

interface Linha {
  id: string;
  nome: string;
  taxa: string;
  valor: number;
  efetiva: string;
  juros: string;
  zippi: boolean;
}

/** V14 — Preço: R$ 400 × 5% × 4 semanas = R$ 80 → 37,5% ao mês; efetiva ao mês Zippi (cinza) × Vapti por nível (verde). */
export function PrecoComparativo({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, ativo, animar } = useViz();
  const ex = preco.exemplo;
  const tz = preco.zippiTaxaSemanal.valor;
  const linhas: Linha[] = [
    { id: "zippi", nome: zippi.nome, taxa: viz.precoComp.zippiTaxa, valor: efetivaSobreSaldo(tz), efetiva: efetivaSaldoMes(tz), juros: jurosSobreSaldoEm400(tz), zippi: true },
    ...niveis.map((nv) => ({
      id: nv.id,
      nome: viz.precoComp.nivel(nv.nome),
      taxa: viz.precoComp.porSemanaDe(formatTaxa(nv.taxaSemanal.valor)),
      valor: efetivaSemanalSobreSacado(nv.taxaSemanal.valor),
      efetiva: efetivaMes(nv.taxaSemanal.valor),
      juros: jurosEm400(nv.taxaSemanal.valor),
      zippi: false,
    })),
  ];
  const max = Math.max(...linhas.map((l) => l.valor));
  const marcas = ticks(0, max, 5).filter((v) => v <= max * 1.12);
  const dom = max * 1.12;
  const pct = (v: number) => `${(v / dom) * 100}%`;
  const largo = !compacto && largura >= 900;
  const ref0 = linhas[0].valor;

  const token = (valor: string, sub?: string, destaque = false) => (
    <span className={`inline-flex flex-col rounded-2 border px-[0.5em] py-[0.25em] ${destaque ? "border-verde-borda bg-verde-suave" : "border-borda bg-superficie"}`}>
      <span className={`font-mono font-bold leading-none ${destaque ? "text-verde" : "text-texto"}`}>{valor}</span>
      {sub ? <span className="mt-[0.3em] font-texto text-apoio leading-none text-texto-3">{sub}</span> : null}
    </span>
  );
  const op = (s: string) => (
    <span className="font-mono text-texto-3" aria-hidden="true">
      {s}
    </span>
  );

  return (
    <Figura visual="V14" titulo={viz.precoComp.titulo} legenda={legenda} className={className}>
      <div ref={ref} className="w-full font-texto">
        {/* a conta do cenário-base */}
        <p className="mb-[1em] flex flex-wrap items-center gap-x-[0.5em] gap-y-[0.4em] text-corpo-g" style={entrada(ativo, animar, "subir", 0, 300)}>
          {token(ex.sacado.rotulo)}
          {op(viz.precoComp.vezes)}
          {token(ex.taxa.rotulo, viz.precoComp.porSemana)}
          {op(viz.precoComp.vezes)}
          {token(viz.precoComp.semanas)}
          {op(viz.precoComp.igual)}
          {token(ex.juros.rotulo, viz.precoComp.deJuros)}
          {op(viz.precoComp.seta)}
          {token(efetivaMes(ex.taxa.valor), viz.precoComp.aoMes, true)}
        </p>

        <div
          className="relative grid items-center"
          style={{
            gridTemplateColumns: largo ? "minmax(0, 15em) minmax(0, 1fr) minmax(0, 7.5em)" : "minmax(0, 1fr) auto",
            columnGap: "1.2em",
            rowGap: largo ? "0.55em" : "0.3em",
          }}
        >
          {largo ? (
            <>
              <span />
              <span className="text-right font-texto text-apoio text-texto-3" style={{ gridColumn: 2 }}>
                {viz.precoComp.eixoX}
              </span>
              <span className="text-right font-texto text-apoio text-texto-3">{viz.precoComp.colunaJuros}</span>
            </>
          ) : null}
          {linhas.map((l, i) => {
            const cor = l.zippi ? "var(--cor-cinza)" : "var(--cor-verde)";
            const barra = (
              <div className={`relative min-w-0 ${largo ? "self-stretch" : "h-[1.5em]"}`} style={{ gridColumn: largo ? 2 : "1 / -1", minHeight: "1.5em" }}>
                {largo
                  ? marcas.map((v) => (
                      <span key={v} aria-hidden="true" className={`absolute -top-[0.3em] -bottom-[0.3em] border-l ${v === 0 ? "border-borda-forte" : "border-borda"}`} style={{ left: pct(v) }} />
                    ))
                  : null}
                {largo && !l.zippi ? (
                  <span aria-hidden="true" className="absolute -top-[0.3em] -bottom-[0.3em] border-l-2 border-dashed border-cinza-borda" style={{ left: pct(ref0) }} />
                ) : null}
                <div
                  className="absolute top-1/2 left-0 h-[1.1em] -translate-y-1/2 rounded-r-[5px]"
                  style={{
                    width: pct(l.valor),
                    background: l.zippi ? "var(--cor-cinza-suave)" : cor,
                    border: l.zippi ? `2px dashed ${cor}` : undefined,
                    ...entrada(ativo, animar, "x", 120 + i * 60, 400),
                  }}
                />
                <span
                  className="absolute top-1/2 -translate-y-1/2 pl-[0.45em] font-mono text-corpo font-bold whitespace-nowrap text-texto"
                  style={{ left: pct(l.valor), ...entrada(ativo, animar, "fade", 300 + i * 60, 250) }}
                >
                  {l.efetiva}
                  {!largo ? <span className="font-texto text-apoio font-normal text-texto-3"> {viz.precoComp.aoMes}</span> : null}
                </span>
              </div>
            );
            return (
              <div key={l.id} className="contents">
                <div className="min-w-0" style={{ gridColumn: 1 }}>
                  <p className={`flex flex-wrap items-center gap-[0.5em] text-corpo font-semibold leading-tight ${l.zippi ? "text-texto-2" : "text-texto"}`}>
                    {l.nome}
                    {l.zippi ? <EtiquetaEstimativa /> : null}
                  </p>
                  <p className="text-apoio leading-tight text-texto-3">{l.taxa}</p>
                </div>
                {largo ? barra : null}
                <p className={`text-right font-mono text-corpo font-bold ${l.zippi ? "text-texto-2" : "text-texto"}`} style={{ gridColumn: largo ? 3 : 2 }}>
                  {l.juros}
                  {!largo ? <span className="block font-texto text-apoio font-normal text-texto-3">{viz.precoComp.colunaJuros}</span> : null}
                </p>
                {!largo ? barra : null}
                {l.zippi ? <span className="h-[0.5em]" style={{ gridColumn: "1 / -1" }} /> : null}
              </div>
            );
          })}
          {largo ? (
            <>
              <span />
              <div className="relative h-[1.6em]" style={{ gridColumn: 2 }} aria-hidden="true">
                {marcas.map((v) => (
                  <span key={v} className="absolute top-[0.2em] -translate-x-1/2 font-mono text-apoio text-texto-3" style={{ left: pct(v) }}>
                    {formatPct(v, 0)}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>
        <p className="mt-[0.8em] text-apoio text-texto-3">{viz.precoComp.zippiNota}</p>
      </div>
      <TabelaSr
        legenda={viz.precoComp.tabela}
        cabecalho={[viz.precoComp.quem, viz.precoComp.taxaSemanal, viz.precoComp.efetiva, viz.precoComp.colunaJuros]}
        linhas={linhas.map((l) => [l.nome, l.taxa, l.efetiva, l.juros])}
      />
    </Figura>
  );
}
