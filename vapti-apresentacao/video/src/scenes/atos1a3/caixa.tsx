/**
 * V02 — Caixa irregular do autônomo (ILUSTRATIVO: alturas relativas, sem eixo em reais).
 * Mesmo padrão de src/components/viz/CaixaIrregular.tsx: pouco, todo dia, com um buraco
 * no meio da semana. Desenhado como função pura de `t`, em coordenadas locais do painel.
 */
import { CalendarDays, FileText, Fuel, Scissors } from "lucide-react";
import { COR, ease, prog, rgba, Selo, spring, useFilme } from "../../kit";
import { mix, surge } from "./comum";

/** ILUSTRATIVO — altura relativa da entrada de cada dia (seg a dom): motorista e barbeiro. */
const ENTRADAS_ILUSTRATIVAS: readonly (readonly number[])[] = [
  [0.78, 0.55, 0.1, 0.05, 0.66, 1, 0.58],
  [0.46, 0.62, 0.07, 0.14, 0.82, 0.96, 0.22],
];
/** Índices do buraco (quarta e quinta). */
const BURACO = { de: 2, ate: 3 } as const;
const LETRAS = ["S", "T", "Q", "Q", "S", "S", "D"];

/** Geometria local do painel (px). */
export const CX = {
  largura: 1000,
  base: [330, 650] as const,
  alturaMax: 220,
  icone: { x: 60, r: 48 },
  col0: 170,
  passo: 124,
  barra: 72,
} as const;
export const colCentro = (i: number) => CX.col0 + CX.barra / 2 + i * CX.passo;
/** Retângulo do buraco (cobre as duas linhas). */
export const RET_BURACO = {
  x: colCentro(BURACO.de) - CX.barra / 2 - 16,
  w: colCentro(BURACO.ate) - colCentro(BURACO.de) + CX.barra + 32,
  y: CX.base[0] - CX.alturaMax - 34,
  h: CX.base[1] - CX.base[0] + CX.alturaMax + 56,
};

export interface TemposCaixa {
  /** F003: linha do motorista desenha; ícone + tanque na ênfase. */
  linha1: number;
  icone1: number;
  /** F004: barbeiro; vira semana; sexta em destaque. */
  icone2: number;
  semana: number;
  sexta: number;
  /** F005: barras entram dia a dia. */
  barras: number;
  selo: number;
  /** F006: bloco mensal desce; holerite com X. */
  bloco: number;
  holerite: number;
  blocoSai: number;
  /** F007: buraco em coral. */
  buraco: number;
  /** F009: bloco verde preenche o buraco (opcional). */
  preenche?: number;
  /** Instante em que tudo fica verde (caixa completo). */
  completo?: number;
}

function Icone({ x, y, em, children, anel }: { x: number; y: number; em: number; children: React.ReactNode; anel?: number }) {
  const { t } = useFilme();
  const s = spring(t - em, { k: 230, d: 18 });
  if (t < em) return null;
  const r = CX.icone.r;
  const pa = anel !== undefined ? ease.inOutCubic(prog(t, anel, anel + 1.0)) : 0;
  const C = 2 * Math.PI * (r + 10);
  return (
    <div style={{ position: "absolute", left: x - r - 14, top: y - r - 14, width: 2 * r + 28, height: 2 * r + 28, transform: `scale(${(0.6 + 0.4 * s).toFixed(4)})`, opacity: Math.min(1, (t - em) * 5) }}>
      <svg width={2 * r + 28} height={2 * r + 28} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle cx={r + 14} cy={r + 14} r={r} fill="var(--cor-superficie-2)" stroke="rgb(255 255 255 / 0.1)" strokeWidth={1.5} />
        {anel !== undefined ? (
          <>
            <circle cx={r + 14} cy={r + 14} r={r + 10} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth={6} />
            <circle cx={r + 14} cy={r + 14} r={r + 10} fill="none" stroke={COR.verde} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${(C * pa).toFixed(1)} ${C.toFixed(1)}`} transform={`rotate(-90 ${r + 14} ${r + 14})`} style={{ filter: "none" }} />
          </>
        ) : null}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--cor-texto)" }}>{children}</div>
    </div>
  );
}

/**
 * Painel da caixa irregular em coordenadas locais (1000 × 720). `vida` controla a opacidade
 * geral; `apagar` (0..1) escurece as barras (usado quando o foco vai para o buraco).
 */
export function CaixaIrregular({ tempos: T }: { tempos: TemposCaixa }) {
  const { t } = useFilme();
  const pLinha = (i: number) => ease.inOutCubic(prog(t, i === 0 ? T.linha1 : T.icone2 + 0.1, (i === 0 ? T.linha1 : T.icone2 + 0.1) + 0.9));
  const pSemana = ease.outCubic(prog(t, T.semana, T.semana + 0.6));
  const sexta = Math.min(ease.outCubic(prog(t, T.sexta, T.sexta + 0.4)), 1 - ease.inOutSine(prog(t, T.barras + 0.6, T.barras + 1.2)));
  const pBuraco = ease.outCubic(prog(t, T.buraco - 0.1, T.buraco + 0.35));
  const pulso = 0.72 + 0.28 * Math.cos((t - T.buraco) * Math.PI * 2 * 0.9);
  const preenche = T.preenche !== undefined ? spring(t - T.preenche, { k: 200, d: 20 }) : 0;
  const completo = T.completo !== undefined ? ease.inOutCubic(prog(t, T.completo, T.completo + 0.8)) : 0;
  // bloco mensal
  const sb = spring(t - T.bloco, { k: 150, d: 15 });
  const tilt = spring(t - T.bloco - 0.42, { k: 140, d: 11 });
  const vidaBloco = t < T.bloco ? 0 : Math.min(1, (t - T.bloco) * 6) * (1 - ease.inOutSine(prog(t, T.blocoSai, T.blocoSai + 0.5)));
  const subirBloco = ease.inCubic(prog(t, T.blocoSai, T.blocoSai + 0.5));
  const xMon = colCentro(0);
  const xSab = colCentro(5);
  const topoSab = CX.base[0] - CX.alturaMax * ENTRADAS_ILUSTRATIVAS[0][5];
  const topoSeg = CX.base[0] - CX.alturaMax * ENTRADAS_ILUSTRATIVAS[0][0];
  const angulo = -(Math.atan2(topoSeg - topoSab, xSab - xMon) * 180) / Math.PI;
  const blocoX = CX.col0 - 20;
  const blocoW = colCentro(6) + CX.barra / 2 + 20 - blocoX;
  const blocoH = 86;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: CX.largura, height: 720 }}>
      {/* coluna da sexta-feira em destaque (F004) */}
      {sexta > 0.01 ? (
        <div style={{ position: "absolute", left: colCentro(4) - CX.barra / 2 - 18, top: CX.base[0] - CX.alturaMax - 30, width: CX.barra + 36, height: CX.base[1] - CX.base[0] + CX.alturaMax + 74, borderRadius: 14, background: rgba("verde", 0.07), border: `1.5px solid ${rgba("verde", 0.35)}`, opacity: sexta }} />
      ) : null}
      {/* buraco no caixa (F007) */}
      {pBuraco > 0.01 ? (
        <div style={{ position: "absolute", left: RET_BURACO.x, top: RET_BURACO.y, width: RET_BURACO.w, height: RET_BURACO.h, borderRadius: 16, border: `2.5px dashed ${COR.coral}`, background: rgba("coral", 0.12 * pulso), boxShadow: `0 0 40px ${rgba("coral", 0.22 * pulso)}`, opacity: pBuraco * (1 - Math.min(1, preenche)) }} />
      ) : null}
      {[0, 1].map((linha) => {
        const base = CX.base[linha];
        const pl = pLinha(linha);
        return (
          <div key={linha}>
            {/* linha do dia que vira semana */}
            <div style={{ position: "absolute", left: CX.col0 - 20, top: base, width: (colCentro(6) + CX.barra / 2 + 20 - (CX.col0 - 20)) * pl, height: 3, borderRadius: 2, background: "rgb(242 244 247 / 0.28)" }} />
            {/* marcas dos dias */}
            {LETRAS.map((_, i) => (
              <div key={i} style={{ position: "absolute", left: colCentro(i) - 1, top: base + 6, width: 2, height: 12, background: "rgb(242 244 247 / 0.3)", opacity: ease.outCubic(prog(t, T.semana + i * 0.06, T.semana + i * 0.06 + 0.3)) }} />
            ))}
            {/* barras do dia (ILUSTRATIVO) */}
            {ENTRADAS_ILUSTRATIVAS[linha].map((v, i) => {
              const em = T.barras + i * 0.13 + linha * 0.05;
              const s = spring(t - em, { k: 160, d: 16 });
              if (s <= 0.001) return null;
              const h = CX.alturaMax * v * s;
              const noBuraco = i >= BURACO.de && i <= BURACO.ate;
              const cor = noBuraco ? rgba("coral", mix(0.0, 0.85, pBuraco) + 0.0) : COR.verde;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: colCentro(i) - CX.barra / 2,
                    top: base - h,
                    width: CX.barra,
                    height: Math.max(0, h),
                    borderRadius: 6,
                    background: noBuraco && pBuraco > 0.02 ? cor : `linear-gradient(180deg, ${rgba("verde", 1)} 0%, ${rgba("verde", 0.62)} 100%)`,
                    boxShadow: noBuraco ? undefined : `0 0 ${Math.round(18 + 18 * completo)}px ${rgba("verde", 0.18 + 0.2 * completo)}`,
                    opacity: noBuraco ? 1 : 0.9 + 0.1 * completo,
                  }}
                />
              );
            })}
          </div>
        );
      })}
      {/* letras dos dias (sob a segunda linha) */}
      {LETRAS.map((l, i) => {
        const destaque = i === 4 ? sexta : 0;
        return (
          <span key={i} className="font-mono" style={{ position: "absolute", left: colCentro(i) - 20, top: CX.base[1] + 24, width: 40, textAlign: "center", fontSize: 28, fontWeight: 600, color: destaque > 0.5 ? COR.verde : "var(--cor-texto-3)", opacity: pSemana }}>
            {l}
          </span>
        );
      })}
      {/* ícones */}
      <Icone x={CX.icone.x} y={CX.base[0] - CX.alturaMax / 2} em={T.icone1} anel={T.icone1 + 0.2}>
        <Fuel size={46} strokeWidth={1.8} />
      </Icone>
      <Icone x={CX.icone.x} y={CX.base[1] - CX.alturaMax / 2} em={T.icone2}>
        <Scissors size={46} strokeWidth={1.8} />
      </Icone>
      {/* bloco mensal rígido (F006): desce, apoia no sábado e tomba até a segunda — não encaixa */}
      {vidaBloco > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: blocoX,
            top: topoSab - blocoH - (1 - sb) * 520 - subirBloco * 260,
            width: blocoW,
            height: blocoH,
            borderRadius: 12,
            border: "2.5px dashed rgb(139 149 161 / 0.9)",
            background: "linear-gradient(180deg, rgb(52 60 72 / 0.96), rgb(40 46 56 / 0.96))",
            boxShadow: "0 30px 60px -20px rgb(0 0 0 / 0.8)",
            transform: `rotate(${(angulo * Math.min(1.08, tilt)).toFixed(3)}deg)`,
            transformOrigin: `${xSab - blocoX}px ${blocoH}px`,
            opacity: vidaBloco,
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "0 30px",
            color: "var(--cor-cinza)",
          }}
        >
          <CalendarDays size={44} strokeWidth={1.8} />
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgb(139 149 161 / 0.35)" }} />
          <div style={{ position: "relative", width: 52, height: 52, display: "grid", placeItems: "center", opacity: surge(t, T.holerite - 0.15, 0.3) }}>
            <FileText size={46} strokeWidth={1.8} />
            <svg width={64} height={64} style={{ position: "absolute", left: -6, top: -6, overflow: "visible" }}>
              {[
                [10, 10, 54, 54],
                [54, 10, 10, 54],
              ].map(([x1, y1, x2, y2], k) => {
                const p = ease.outCubic(prog(t, T.holerite + 0.15 + k * 0.14, T.holerite + 0.4 + k * 0.14));
                return <line key={k} x1={x1} y1={y1} x2={mix(x1, x2, p)} y2={mix(y1, y2, p)} stroke={COR.coral} strokeWidth={5} strokeLinecap="round" opacity={p > 0 ? 1 : 0} />;
              })}
            </svg>
          </div>
        </div>
      ) : null}
      {/* selo colado ao gráfico */}
      <div style={{ position: "absolute", right: 14, top: 716 }}>
        <Selo tipo="ilustrativo" em={T.selo} />
      </div>
      {/* bloco verde que preenche o buraco (F009) */}
      {preenche > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: RET_BURACO.x + 6,
            top: RET_BURACO.y + 6 - (1 - Math.min(1, preenche)) * 380,
            width: RET_BURACO.w - 12,
            height: RET_BURACO.h - 12,
            borderRadius: 14,
            background: `linear-gradient(180deg, ${rgba("verde", 1)} 0%, ${rgba("verde", 0.82)} 100%)`,
            boxShadow: `0 0 70px ${rgba("verde", 0.35)}, 0 1px 0 rgb(255 255 255 / 0.4) inset`,
            opacity: Math.min(1, (t - (T.preenche ?? 0)) * 7),
            transform: `scale(${(1 + 0.04 * Math.max(0, preenche - 1)).toFixed(4)}, ${(1 - 0.06 * Math.max(0, preenche - 1)).toFixed(4)})`,
          }}
        />
      ) : null}
    </div>
  );
}
