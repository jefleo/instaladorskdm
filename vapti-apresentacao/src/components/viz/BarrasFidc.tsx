import { zippi } from "../../data/vapti";
import { viz } from "../../content/ui";
import { formatInt } from "../../lib/formato";
import { barraV, entrada, escala, Figura, TabelaSr, textoVisual, ticks, useViz, type VizProps } from "./comum";

/** V05 — FIDC da Zippi por captação (R$ 66 mi, 80 mi, 220 mi). Zippi em cinza, só texto. */
export function BarrasFidc({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura: W, fs, ativo, animar } = useViz();
  const dados = zippi.fidc;
  const t = textoVisual("V05");
  const emMi = (v: number) => v / 1e6;
  const max = Math.max(...dados.map((d) => emMi(d.valor.valor)));
  const marcas = ticks(0, max, 4);

  const f = fs.apoio;
  const H = Math.round(Math.min(f * (compacto ? 14 : 18), Math.max(W * 0.72, f * 12)));
  const m = { t: f * 2.8, r: f * 0.5, b: f * 2.2, l: f * 2.6 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const y = escala(0, marcas[marcas.length - 1], m.t + ph, m.t);
  const banda = pw / dados.length;
  const bw = Math.min(banda * 0.5, f * 6);
  const fsValor = Math.min(fs.corpoG, banda / (9 * 0.62));

  return (
    <Figura visual="V05" titulo={viz.fidc.titulo} legenda={legenda} className={className}>
      <div ref={ref} className="w-full">
        {W > 0 ? (
          <svg role="img" aria-label={t.alt} width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible">
            <text x={0} y={f * 0.9} className="fill-texto-3 font-texto" style={{ fontSize: f }}>
              {viz.fidc.eixoY}
            </text>
            {marcas.map((v) => (
              <g key={v}>
                <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} className={v === 0 ? "stroke-borda-forte" : "stroke-borda"} strokeWidth={1} />
                <text x={m.l - f * 0.4} y={y(v)} dy="0.35em" textAnchor="end" className="fill-texto-3 font-mono" style={{ fontSize: f }}>
                  {formatInt(v)}
                </text>
              </g>
            ))}
            {dados.map((d, i) => {
              const cx = m.l + banda * (i + 0.5);
              const v = emMi(d.valor.valor);
              const yt = y(v);
              return (
                <g key={d.ano}>
                  <path d={barraV(cx - bw / 2, yt, bw, y(0) - yt, 5)} style={{ fill: "var(--cor-cinza)", ...entrada(ativo, animar, "y", i * 80, 400) }} />
                  <text x={cx} y={yt - f * 0.5} textAnchor="middle" className="fill-texto font-mono font-bold" style={{ fontSize: fsValor, ...entrada(ativo, animar, "fade", 200 + i * 80, 300) }}>
                    {d.valor.rotulo}
                  </text>
                  <text x={cx} y={H - f * 0.7} textAnchor="middle" className="fill-texto-2 font-mono" style={{ fontSize: f }}>
                    {d.ano}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : null}
      </div>
      <TabelaSr legenda={viz.fidc.titulo} cabecalho={[viz.fidc.captacao, viz.fidc.valor]} linhas={dados.map((d) => [d.ano, d.valor.rotulo])} />
    </Figura>
  );
}
