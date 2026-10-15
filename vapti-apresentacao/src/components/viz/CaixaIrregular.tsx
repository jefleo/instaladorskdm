import { viz } from "../../content/ui";
import { barraV, entrada, Figura, TabelaSr, textoVisual, useViz, type VizProps } from "./comum";

/**
 * ILUSTRATIVO — não são dados. Altura relativa (0 a 1) da entrada de cada dia,
 * segunda a domingo, desenhada para mostrar o padrão: pouco, todo dia, com um buraco no meio da semana.
 * Por isso o eixo é qualitativo, sem reais.
 */
const ENTRADAS_ILUSTRATIVAS: readonly (readonly number[])[] = [
  [0.78, 0.55, 0.1, 0.05, 0.66, 1, 0.58], // motorista de aplicativo
  [0.46, 0.62, 0.07, 0.14, 0.82, 0.96, 0.22], // barbeiro
];
/** ILUSTRATIVO — dias do buraco (índices: quarta e quinta). */
const BURACO_ILUSTRATIVO = { de: 2, ate: 3 } as const;

const nivelQualitativo = (v: number) => {
  const n = viz.caixa.niveis;
  return v >= 0.75 ? n[3] : v >= 0.4 ? n[2] : v >= 0.12 ? n[1] : n[0];
};

function Painel({ nome, valores, largura, f, fTitulo, ativo, animar, atraso }: {
  nome: string;
  valores: readonly number[];
  largura: number;
  f: number;
  fTitulo: number;
  ativo: boolean;
  animar: boolean;
  atraso: number;
}) {
  const W = largura;
  const H = Math.round(f * 14);
  const m = { t: f * 4.2, r: f * 0.3, b: f * 2.1, l: f * 3.4 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const banda = pw / valores.length;
  const bw = Math.min(banda * 0.58, f * 3.2);
  const yBase = m.t + ph;
  const bx0 = m.l + banda * BURACO_ILUSTRATIVO.de;
  const bx1 = m.l + banda * (BURACO_ILUSTRATIVO.ate + 1);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
      <text x={0} y={fTitulo * 0.85} className="fill-texto font-titulo font-bold" style={{ fontSize: fTitulo }}>
        {nome}
      </text>
      <text x={0} y={fTitulo * 0.85 + f * 1.5} className="fill-texto-3 font-texto" style={{ fontSize: f * 0.92 }}>
        {viz.caixa.eixoY}
      </text>
      {/* eixo qualitativo: só "mais" e "menos" */}
      <line x1={m.l - f * 0.9} x2={m.l - f * 0.9} y1={m.t + f * 0.4} y2={yBase} className="stroke-borda-forte" strokeWidth={1.5} />
      <path d={`M${m.l - f * 0.9 - 5},${m.t + f * 0.4 + 7} L${m.l - f * 0.9},${m.t + f * 0.4} L${m.l - f * 0.9 + 5},${m.t + f * 0.4 + 7}`} className="stroke-borda-forte" fill="none" strokeWidth={1.5} />
      <text x={m.l - f * 1.2} y={m.t + f * 0.6} textAnchor="end" className="fill-texto-3 font-texto" style={{ fontSize: f * 0.92 }}>
        {viz.caixa.mais}
      </text>
      <text x={m.l - f * 1.2} y={yBase} textAnchor="end" className="fill-texto-3 font-texto" style={{ fontSize: f * 0.92 }}>
        {viz.caixa.menos}
      </text>
      {/* buraco no meio da semana */}
      <rect
        x={bx0 + 2}
        y={m.t - f * 0.2}
        width={bx1 - bx0 - 4}
        height={ph + f * 0.2}
        rx={10}
        className="stroke-coral"
        strokeDasharray="7 6"
        strokeWidth={2}
        style={{ fill: "var(--cor-coral-suave)", ...entrada(ativo, animar, "fade", atraso + 280, 300) }}
      />
      <text x={(bx0 + bx1) / 2} y={m.t - f * 0.65} textAnchor="middle" className="fill-coral font-texto font-semibold" style={{ fontSize: f, ...entrada(ativo, animar, "fade", atraso + 280, 300) }}>
        {viz.caixa.buraco}
      </text>
      <line x1={m.l} x2={W - m.r} y1={yBase} y2={yBase} className="stroke-borda-forte" strokeWidth={1} />
      {valores.map((v, i) => {
        const cx = m.l + banda * (i + 0.5);
        const h = Math.max(v * ph, 3);
        return (
          <g key={i}>
            <path d={barraV(cx - bw / 2, yBase - h, bw, h, 4)} style={{ fill: "var(--cor-azul)", ...entrada(ativo, animar, "y", atraso + i * 35, 350) }} />
            <text x={cx} y={H - f * 0.4} textAnchor="middle" className="fill-texto-2 font-texto" style={{ fontSize: f }}>
              {viz.caixa.dias[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** V02 — Caixa irregular do autônomo. ILUSTRATIVO: eixo qualitativo, sem reais. */
export function CaixaIrregular({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, fs, ativo, animar } = useViz();
  const t = textoVisual("V02");
  const gap = fs.apoio * 2.2;
  const lado = !compacto && largura >= 760;
  const wPainel = lado ? (largura - gap) / 2 : largura;
  return (
    <Figura visual="V02" titulo={viz.caixa.titulo} selo="ilustrativo" legenda={legenda} className={className}>
      <div ref={ref} role="img" aria-label={t.alt} className="w-full">
        {largura > 0 ? (
          <div className="flex w-full flex-wrap" style={{ columnGap: gap, rowGap: fs.apoio * 1.4 }}>
            {ENTRADAS_ILUSTRATIVAS.map((vals, i) => (
              <div key={i} style={{ width: wPainel }}>
                <Painel
                  nome={viz.caixa.pessoas[i]}
                  valores={vals}
                  largura={wPainel}
                  f={fs.apoio}
                  fTitulo={fs.corpoG}
                  ativo={ativo}
                  animar={animar}
                  atraso={i * 120}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <TabelaSr
        legenda={viz.caixa.tabela}
        cabecalho={[viz.caixa.dia, ...viz.caixa.pessoas]}
        linhas={viz.caixa.diasExtenso.map((d, i) => [d, ...ENTRADAS_ILUSTRATIVAS.map((vals) => nivelQualitativo(vals[i]))])}
      />
    </Figura>
  );
}
