import { useState, type PointerEvent } from "react";
import { premissas } from "../../data/vapti";
import { viz } from "../../content/ui";
import { formatInt, formatMi, formatPct } from "../../lib/formato";
import { curvaMargemPerda, simularFase } from "../../lib/modelo";
import { entrada, escala, Figura, TabelaSr, textoVisual, ticks, useViz, type VizProps } from "./comum";
import { comMenos, formatEquilibrio, pctCurto } from "./rotulos";

/** V16 — Margem por mês da fase 1 (5% por semana) para perda de 4% a 20%; zera em 16,75%. Projeção. */
export function CurvaMargemPerda({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura: W, fs, ativo, animar } = useViz();
  const t = textoVisual("V16");
  const taxa = premissas.taxaBase.valor;
  const pontos = curvaMargemPerda(1, taxa);
  const base = simularFase(1, taxa, premissas.perdaBase.valor);
  const estresse = simularFase(1, taxa, premissas.perdaEstresse.valor);
  const eq = base.perdaEquilibrio;
  const [foco, setFoco] = useState<number | null>(null);

  const f = fs.apoio;
  const H = Math.round(Math.min(Math.max(W * 0.5, f * 15), f * (compacto ? 17 : 22.5)));
  const m = { t: f * 3.2, r: f * 1.2, b: f * 3.6, l: f * 3.2 };
  const p0 = pontos[0].perda;
  const p1 = pontos[pontos.length - 1].perda;
  const margens = pontos.map((p) => p.margem);
  const yt = ticks(Math.min(...margens), Math.max(...margens), 5);
  const x = escala(p0, p1, m.l, W - m.r);
  const y = escala(yt[0], yt[yt.length - 1], H - m.b, m.t);
  const xt = ticks(p0, p1, 4).filter((v) => v >= p0 - 1e-9 && v <= p1 + 1e-9);

  const linha = pontos.map((p, i) => `${i ? "L" : "M"}${x(p.perda)},${y(p.margem)}`).join("");
  const acima = pontos.filter((p) => p.margem >= 0);
  const abaixo = pontos.filter((p) => p.margem <= 0);
  const areaAcima = `M${x(p0)},${y(0)}${acima.map((p) => `L${x(p.perda)},${y(p.margem)}`).join("")}L${x(eq)},${y(0)}Z`;
  const areaAbaixo = `M${x(eq)},${y(0)}${abaixo.map((p) => `L${x(p.perda)},${y(p.margem)}`).join("")}L${x(p1)},${y(0)}Z`;

  const marcados = [
    { p: premissas.perdaBase.valor, r: base },
    { p: premissas.perdaEstresse.valor, r: estresse },
  ];

  const aoMover = (e: PointerEvent<SVGRectElement>) => {
    const caixa = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!caixa || !caixa.width) return;
    const px = ((e.clientX - caixa.left) / caixa.width) * W;
    let melhor = 0;
    for (let i = 1; i < pontos.length; i++) if (Math.abs(x(pontos[i].perda) - px) < Math.abs(x(pontos[melhor].perda) - px)) melhor = i;
    setFoco(melhor);
  };
  const pf = foco !== null ? pontos[foco] : null;
  const rotEq = viz.curva.equilibrio(formatEquilibrio(eq));
  const tipLarg = f * 9.5;

  return (
    <Figura visual="V16" titulo={viz.curva.titulo} selo="projecao" legenda={legenda} className={className}>
      <div ref={ref} className="w-full">
        {W > 0 ? (
          <svg role="img" aria-label={t.alt} width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-none overflow-visible select-none">
            <text x={0} y={f * 0.9} className="fill-texto-3 font-texto" style={{ fontSize: f }}>
              {viz.curva.eixoY}
            </text>
            {yt.map((v) => (
              <g key={v}>
                <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} className={v === 0 ? "stroke-texto-3" : "stroke-borda"} strokeWidth={v === 0 ? 1.5 : 1} />
                <text x={m.l - f * 0.4} y={y(v)} dy="0.35em" textAnchor="end" className="fill-texto-3 font-mono" style={{ fontSize: f }}>
                  {comMenos(formatInt(v / 1e3))}
                </text>
              </g>
            ))}
            {xt.map((v) => (
              <text key={v} x={x(v)} y={H - m.b + f * 1.4} textAnchor="middle" className="fill-texto-3 font-mono" style={{ fontSize: f }}>
                {formatPct(v, 0)}
              </text>
            ))}
            <text x={(m.l + W - m.r) / 2} y={H - f * 0.3} textAnchor="middle" className="fill-texto-3 font-texto" style={{ fontSize: f }}>
              {viz.curva.eixoX}
            </text>

            <path d={areaAcima} style={{ fill: "var(--cor-verde)", fillOpacity: 0.1, ...entrada(ativo, animar, "fade", 250, 300) }} />
            <path d={areaAbaixo} style={{ fill: "var(--cor-coral)", fillOpacity: 0.24, ...entrada(ativo, animar, "fade", 300, 300) }} />
            <text
              x={(x(eq) + x(p1)) / 2}
              y={y(0) + f * 1.3}
              textAnchor="middle"
              className="fill-coral font-texto font-semibold"
              style={{ fontSize: f * 0.9, ...entrada(ativo, animar, "fade", 350, 300) }}
            >
              {x(p1) - x(eq) > f * 8 ? viz.curva.negativa : ""}
            </text>

            {/* equilíbrio */}
            <line x1={x(eq)} x2={x(eq)} y1={m.t - f * 0.6} y2={H - m.b} className="stroke-coral" strokeWidth={2} strokeDasharray="6 5" />
            <text
              x={x(eq)}
              y={m.t - f * 0.95}
              textAnchor={x(eq) + f * 6 > W ? "end" : "middle"}
              className="fill-texto font-mono font-bold"
              style={{ fontSize: fs.corpo }}
            >
              {rotEq}
            </text>

            <path d={linha} pathLength={1} fill="none" className="stroke-verde" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={entrada(ativo, animar, "traco", 0, 400)} />
            <circle cx={x(eq)} cy={y(0)} r={7} className="stroke-tinta" strokeWidth={3} style={{ fill: "var(--cor-coral)" }} />

            {marcados.map(({ p, r }, i) => (
              <g key={p} style={entrada(ativo, animar, "fade", 300 + i * 60, 300)}>
                <circle cx={x(p)} cy={y(r.margemMes)} r={8} className="stroke-tinta" strokeWidth={3} style={{ fill: "var(--cor-verde)" }} />
                <text x={x(p) + f * 0.6} y={y(r.margemMes) - f * 1.75} className="fill-texto-2 font-texto" style={{ fontSize: f }}>
                  {viz.curva.perdaDe(pctCurto(p))}
                </text>
                <text x={x(p) + f * 0.6} y={y(r.margemMes) - f * 0.55} className="fill-texto font-mono font-bold" style={{ fontSize: fs.corpo }}>
                  {formatMi(r.margemMes)}
                </text>
              </g>
            ))}

            {pf ? (
              <g pointerEvents="none">
                <line x1={x(pf.perda)} x2={x(pf.perda)} y1={m.t} y2={H - m.b} className="stroke-texto-2" strokeWidth={1} />
                <circle cx={x(pf.perda)} cy={y(pf.margem)} r={6} className="stroke-tinta" strokeWidth={2} style={{ fill: "var(--cor-texto)" }} />
                {(() => {
                  const tx = Math.min(Math.max(x(pf.perda) + 12, m.l), W - m.r - tipLarg);
                  const ty = m.t + f * 0.3;
                  return (
                    <g>
                      <rect x={tx} y={ty} width={tipLarg} height={f * 2.9} rx={8} className="stroke-borda-forte" style={{ fill: "var(--cor-superficie-2)" }} />
                      <text x={tx + f * 0.6} y={ty + f * 1.25} className="fill-texto font-mono font-bold" style={{ fontSize: f }}>
                        {comMenos(formatMi(pf.margem))}
                      </text>
                      <text x={tx + f * 0.6} y={ty + f * 2.4} className="fill-texto-3 font-texto" style={{ fontSize: f * 0.85 }}>
                        {viz.curva.perdaDe(pctCurto(pf.perda))}
                      </text>
                    </g>
                  );
                })()}
              </g>
            ) : null}
            <rect x={m.l} y={m.t} width={Math.max(W - m.l - m.r, 0)} height={Math.max(H - m.t - m.b, 0)} fill="transparent" onPointerMove={aoMover} onPointerLeave={() => setFoco(null)} />
          </svg>
        ) : null}
      </div>
      <TabelaSr
        legenda={viz.curva.tabela}
        cabecalho={[viz.curva.perda, viz.curva.margem]}
        linhas={[
          ...pontos.filter((_, i) => i % 2 === 0).map((p) => [pctCurto(p.perda), comMenos(formatMi(p.margem))]),
          [rotEq, formatMi(0)],
        ]}
      />
    </Figura>
  );
}
