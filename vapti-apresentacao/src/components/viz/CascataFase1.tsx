import { ArrowDown, ArrowRight } from "lucide-react";
import { premissas, projeto } from "../../data/vapti";
import { simulador, viz } from "../../content/ui";
import { formatInt, formatMi } from "../../lib/formato";
import { simularFase } from "../../lib/modelo";
import { Icone } from "../base";
import { entrada, Figura, TabelaSr, ticks, useViz, type VizProps } from "./comum";
import { emMi, formatCapital, pctCurto, rotulosResultado } from "./rotulos";

/** V15 — Fase 1 em números: capital → na rua → sacado/mês → receita − perda − custos = margem. Projeção. */
export function CascataFase1({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, ativo, animar } = useViz();
  const capital = projeto.capitalInicial.valor;
  const r = simularFase(1, premissas.taxaBase.valor, premissas.perdaBase.valor, capital);
  const rot = rotulosResultado(r);
  const largo = !compacto && largura >= 900;

  const cadeia = [
    { valor: formatCapital(capital), nome: viz.cascata.capital },
    { valor: emMi(r.carteira), nome: viz.cascata.naRua(premissas.pctNaRua.rotulo) },
    { valor: rot.sacadoMes, nome: viz.cascata.sacado },
  ];

  const R = r.receitaMes;
  const P = r.perdaMes;
  const C = r.custoMes;
  const M = r.margemMes;
  const passos = [
    { nome: viz.cascata.receita, de: 0, ate: R, valor: rot.receitaMes, sub: viz.cascata.porAno(rot.receitaAno), cor: "var(--cor-verde)", sinal: "", dir: false },
    { nome: viz.cascata.perda(pctCurto(premissas.perdaBase.valor)), de: R - P, ate: R, valor: rot.perdaMes, cor: "var(--cor-coral)", sinal: "− ", dir: true },
    { nome: viz.cascata.custos(premissas.custoPorSaque.rotulo), de: R - P - C, ate: R - P, valor: rot.custoMes, cor: "var(--cor-azul)", sinal: "− ", dir: true },
    { nome: viz.cascata.margem, de: 0, ate: M, valor: rot.margemMes, sub: simulador.margemNota, cor: "var(--cor-verde)", sinal: "= ", dir: false, total: true },
  ];
  const marcas = ticks(0, R, 3);
  const dom = marcas[marcas.length - 1];
  const pct = (v: number) => `${(v / dom) * 100}%`;

  return (
    <Figura visual="V15" titulo={viz.cascata.titulo} selo="projecao" legenda={legenda} className={className}>
      <div ref={ref} className="w-full font-texto">
        <ol className={`m-0 flex list-none p-0 ${largo ? "flex-row items-stretch" : "flex-col"}`}>
          {cadeia.map((c, i) => (
            <li key={c.nome} className={`flex ${largo ? "flex-row" : "flex-col"}`} style={{ flex: largo ? "1 1 0" : undefined }}>
              <div className="w-full rounded-3 border border-borda bg-superficie px-[0.9em] py-[0.6em]" style={entrada(ativo, animar, "subir", i * 70, 300)}>
                <p className="font-mono text-h3 font-bold tracking-[-0.03em] text-texto">{c.valor}</p>
                <p className="text-apoio text-texto-2">{c.nome}</p>
              </div>
              {i < cadeia.length - 1 ? (
                <span className="grid flex-none place-items-center text-texto-3" style={largo ? { width: "2em" } : { height: "1.5em" }} aria-hidden="true">
                  <Icone icone={largo ? ArrowRight : ArrowDown} tamanho="1.1em" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="my-[0.9em] flex items-center gap-[0.5em] text-apoio text-texto-3">
          <Icone icone={ArrowDown} tamanho="1em" />
          {viz.cascata.receitaConta(premissas.taxaBase.rotulo)}
        </p>

        <div
          className="grid items-center"
          style={{ gridTemplateColumns: largo ? "minmax(0, 14em) minmax(0, 1fr) minmax(0, 11em)" : "minmax(0, 1fr) auto", columnGap: "1.2em", rowGap: largo ? "0.7em" : "0.25em" }}
        >
          {passos.map((p, i) => {
            const barra = (
              <div className="relative min-w-0 self-stretch" style={{ gridColumn: largo ? 2 : "1 / -1", minHeight: "1.6em" }}>
                {largo
                  ? marcas.map((v) => (
                      <span key={v} aria-hidden="true" className={`absolute -top-[0.35em] -bottom-[0.35em] border-l ${v === 0 ? "border-borda-forte" : "border-borda"}`} style={{ left: pct(v) }} />
                    ))
                  : null}
                {i > 0 ? (
                  <span aria-hidden="true" className="absolute -top-[0.75em] h-[0.9em] border-l border-dashed border-texto-3" style={{ left: pct(p.ate) }} />
                ) : null}
                <div
                  className="absolute top-1/2 h-[1.2em] -translate-y-1/2 rounded-[4px]"
                  style={{
                    left: pct(p.de),
                    width: `${((p.ate - p.de) / dom) * 100}%`,
                    background: p.cor,
                    ...entrada(ativo, animar, p.dir ? "x-dir" : "x", 200 + i * 90, 380),
                  }}
                />
              </div>
            );
            return (
              <div key={p.nome} className="contents">
                <p className={`min-w-0 text-corpo leading-tight ${p.total ? "font-bold text-texto" : "font-semibold text-texto-2"}`} style={{ gridColumn: 1 }}>
                  {p.nome}
                </p>
                {largo ? barra : null}
                <div className="text-right" style={{ gridColumn: largo ? 3 : 2 }}>
                  <p className={`font-mono font-bold whitespace-nowrap ${p.total ? "text-corpo-g text-verde" : "text-corpo text-texto"}`}>
                    {p.sinal}
                    {p.valor}
                  </p>
                  {p.sub ? <p className="text-apoio leading-tight text-texto-3">{p.sub}</p> : null}
                </div>
                {!largo ? barra : null}
              </div>
            );
          })}
          {largo ? (
            <>
              <span className="text-apoio text-texto-3">{viz.cascata.eixoX}</span>
              <div className="relative h-[1.4em]" aria-hidden="true">
                {marcas.map((v) => (
                  <span key={v} className="absolute -translate-x-1/2 font-mono text-apoio text-texto-3" style={{ left: pct(v) }}>
                    {formatInt(v / 1e3)}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
      <TabelaSr
        legenda={viz.cascata.tabela}
        cabecalho={[viz.cascata.item, viz.cascata.valor]}
        linhas={[
          ...cadeia.map((c) => [c.nome, c.valor]),
          [viz.cascata.receita, `${rot.receitaMes} (${viz.cascata.porAno(rot.receitaAno)})`],
          [passos[1].nome, `− ${rot.perdaMes}`],
          [passos[2].nome, `− ${rot.custoMes}`],
          [viz.cascata.margem, formatMi(M)],
        ]}
      />
    </Figura>
  );
}
