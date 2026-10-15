import { preco, premissas, produto } from "../../data/vapti";
import { viz } from "../../content/ui";
import { planoDiario } from "../../lib/modelo";
import { barraV, entrada, escala, Figura, TabelaSr, textoVisual, useViz, type VizProps } from "./comum";
import { efetivaMes, rotulosPlanoDiario } from "./rotulos";

/** V08 — Planos de pagamento: 4 semanais de R$ 120 (R$ 100 + R$ 20) × plano diário de 14 dias. */
export function PlanosPagamento({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, fs, ativo, animar } = useViz();
  const t = textoVisual("V08");
  const ex = preco.exemplo;
  const n = produto.parcelasSemanais.valor;
  const diasSemana = premissas.diasPorSemana.valor;
  const dias = produto.planoDiarioRecomendado;
  const pd = planoDiario(dias);
  const rd = rotulosPlanoDiario(dias);
  const efSemanal = efetivaMes(ex.taxa.valor);
  const outros = produto.planosDiarios.filter((d) => d !== dias).join(" ou ");

  const lado = !compacto && largura >= 1000;
  const wInfo = lado ? largura * 0.34 : largura;
  const W = lado ? largura - wInfo - fs.apoio * 2 : largura;
  const f = fs.apoio;
  const ultimoDia = n * diasSemana;
  const m = { t: f * 1.6, r: f * 1.2, b: f * 3.4, l: f * 0.6 };
  const linhaH = f * (compacto ? 5.5 : 7.4);
  const gapLinha = f * 2.6;
  const H = m.t + linhaH * 2 + gapLinha + m.b;
  const x = escala(0, ultimoDia, m.l + f * 0.6, W - m.r);
  const passoDia = x(1) - x(0);
  const yMax = ex.parcela.valor;
  const alt = (v: number) => (v / yMax) * (linhaH - f * 1.5);
  const base1 = m.t + linhaH;
  const base2 = m.t + linhaH * 2 + gapLinha;
  const bwSem = Math.min(passoDia * 3, f * 3.2);
  const bwDia = Math.max(passoDia * 0.62, 3);
  const fracJuros = pd.juros / (preco.base.valor + pd.juros);
  const espacoRotulo = x(diasSemana) - bwSem / 2 - x(0);
  const rotulosLaterais = espacoRotulo > f * 8;

  const linhaInfo = (titulo: string, grande: string, linhas: string[], tag?: string) => (
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-[0.5em] font-texto text-corpo font-semibold text-texto">
        {titulo}
        {tag ? <span className="rounded-full border border-verde-borda bg-verde-suave px-[0.55em] py-[0.15em] font-mono text-[max(12px,0.62em)] uppercase tracking-[0.08em] text-verde">{tag}</span> : null}
      </p>
      <p className="mt-[0.15em] font-mono text-h3 font-bold tracking-[-0.03em] text-texto">{grande}</p>
      {linhas.map((l) => (
        <p key={l} className="font-texto text-apoio leading-snug text-texto-2">
          {l}
        </p>
      ))}
    </div>
  );

  return (
    <Figura visual="V08" titulo={viz.planos.titulo} legenda={legenda} className={className}>
      <div ref={ref} className="w-full">
        {largura > 0 ? (
          <div className="flex w-full flex-wrap items-start" style={{ gap: f * 2 }}>
            <div className="flex flex-col" style={{ width: wInfo, gap: f * 1.1 }}>
              <p className="font-texto text-apoio text-texto-3">
                <span className="mr-[0.45em] inline-block size-[0.6em] rounded-full bg-verde align-middle" aria-hidden="true" />
                {viz.planos.recebe} · {viz.planos.taxa}
              </p>
              {linhaInfo(viz.planos.semanal, viz.planos.parcelas(n, ex.parcela.rotulo), [
                viz.planos.composicao,
                `${viz.planos.juros(ex.juros.rotulo)} · ${viz.planos.efetiva(efSemanal)}`,
              ])}
              {linhaInfo(
                viz.planos.diario(dias),
                viz.planos.parcelas(dias, rd.parcela),
                [`${viz.planos.juros(rd.juros)} · ${viz.planos.efetiva(rd.efetiva)}`, viz.planos.outrosPrazos(outros)],
                viz.planos.recomendado,
              )}
            </div>
            <svg role="img" aria-label={t.alt} width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block h-auto overflow-visible" style={{ width: W, maxWidth: "100%" }}>
              <text x={0} y={f * 0.8} className="fill-texto-3 font-texto" style={{ fontSize: f }}>
                {viz.planos.eixoY}
              </text>
              {[
                { base: base1, nome: viz.planos.semanalCurto },
                { base: base2, nome: viz.planos.diarioCurto },
              ].map((l) => (
                <g key={l.nome}>
                  <line x1={m.l} x2={W - m.r} y1={l.base} y2={l.base} className="stroke-borda-forte" strokeWidth={1} />
                  <text x={W - m.r} y={l.base - linhaH + f * 1.1} textAnchor="end" className="fill-texto-2 font-texto font-semibold" style={{ fontSize: f }}>
                    {l.nome}
                  </text>
                  {/* saque no dia 0 (marcador, fora de escala) */}
                  <circle cx={x(0)} cy={l.base} r={f * 0.42} className="stroke-tinta" strokeWidth={3} style={{ fill: "var(--cor-verde)" }} />
                </g>
              ))}
              <text x={x(0)} y={base1 + f * 1.5} textAnchor="start" className="fill-texto-2 font-texto" style={{ fontSize: f * 0.9 }}>
                {viz.planos.saque}
              </text>
              {/* semanal: 4 barras empilhadas (valor + juros) */}
              {Array.from({ length: n }, (_, i) => {
                const d = (i + 1) * diasSemana;
                const cx = x(d);
                const hv = alt(ex.amortizacao.valor);
                const hj = alt(ex.jurosParcela.valor);
                const estilo = entrada(ativo, animar, "y", i * 70, 380);
                return (
                  <g key={d} style={estilo}>
                    <path d={barraV(cx - bwSem / 2, base1 - hv, bwSem, hv, 0)} style={{ fill: "var(--cor-azul)" }} />
                    <path d={barraV(cx - bwSem / 2, base1 - hv - hj, bwSem, hj - 2, 4)} style={{ fill: "var(--cor-verde)" }} />
                    <text x={cx} y={base1 - hv - hj - f * 0.45} textAnchor="middle" className="fill-texto font-mono font-bold" style={{ fontSize: f }}>
                      {ex.parcela.rotulo}
                    </text>
                    {i === 0 && rotulosLaterais ? (
                      <>
                        <text x={cx - bwSem / 2 - f * 0.4} y={base1 - hv / 2} dy="0.35em" textAnchor="end" className="fill-texto-2 font-texto" style={{ fontSize: f * 0.9 }}>
                          {ex.amortizacao.rotulo} {viz.planos.valorSerie}
                        </text>
                        <text x={cx - bwSem / 2 - f * 0.4} y={base1 - hv - hj / 2} dy="0.35em" textAnchor="end" className="fill-texto-2 font-texto" style={{ fontSize: f * 0.9 }}>
                          {ex.jurosParcela.rotulo} {viz.planos.jurosSerie}
                        </text>
                      </>
                    ) : null}
                  </g>
                );
              })}
              {/* diário: 14 barras */}
              {Array.from({ length: dias }, (_, i) => {
                const cx = x(i + 1);
                const h = alt(pd.parcela);
                const hj = h * fracJuros;
                return (
                  <g key={i} style={entrada(ativo, animar, "y", 120 + i * 18, 300)}>
                    <path d={barraV(cx - bwDia / 2, base2 - h + hj, bwDia, h - hj, 0)} style={{ fill: "var(--cor-azul)" }} />
                    <path d={barraV(cx - bwDia / 2, base2 - h, bwDia, Math.max(hj - 1, 1), 2)} style={{ fill: "var(--cor-verde)" }} />
                  </g>
                );
              })}
              <text x={(x(1) + x(dias)) / 2} y={base2 - alt(pd.parcela) - f * 0.5} textAnchor="middle" className="fill-texto font-mono font-bold" style={{ fontSize: f }}>
                {viz.planos.parcelas(dias, rd.parcela)}
              </text>
              {/* eixo x: dias */}
              {Array.from({ length: n + 1 }, (_, i) => i * diasSemana).map((d) => (
                <text key={d} x={x(d)} y={base2 + f * 1.3} textAnchor="middle" className="fill-texto-3 font-mono" style={{ fontSize: f }}>
                  {d}
                </text>
              ))}
              <text x={(m.l + W - m.r) / 2} y={H - f * 0.3} textAnchor="middle" className="fill-texto-3 font-texto" style={{ fontSize: f }}>
                {viz.planos.eixoX}
              </text>
            </svg>
          </div>
        ) : null}
      </div>
      <TabelaSr
        legenda={viz.planos.tabela}
        cabecalho={[viz.planos.plano, viz.planos.quantas, viz.planos.parcela, viz.planos.totalJuros, viz.planos.efetivaCol]}
        linhas={[
          [viz.planos.semanal, String(n), ex.parcela.rotulo, ex.juros.rotulo, efSemanal],
          [viz.planos.diario(dias), String(dias), rd.parcela, rd.juros, rd.efetiva],
        ]}
      />
    </Figura>
  );
}
