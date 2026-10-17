/**
 * Ato 6 — Números (F053–F066). Tom preciso, micro pausas antes de cada número.
 * Contém o pico do filme: "quem decide é a perda" (F061–F063, V16).
 *
 * Fio visual: R$ 400 (F053) vira o 1º termo da equação R$ 400 × 5% × 4 = R$ 80 (F054) →
 * 37,5% ao mês gigante (F055) que encolhe até o topo da barra da Vapti contra a Zippi (F056) →
 * a barra se divide nos quatro níveis (F057) → KPIs da fase 1 (F058) → R$ 3,54 mi por ano (F059) →
 * cascata até a margem (F060) → tudo escurece e o holofote cai na perda (F061) → curva margem × perda
 * cruza o zero em 16,75% (F062) → silêncio, o ponto coral vira "PERDA" (F063) → régua de 90 dias e
 * termômetro da perda (F064) → três degraus da carteira (F065) → R$ 464,7 mil por mês (F066).
 */
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { fase1, fases, gamificacao, niveis, piloto, preco, produto, projeto } from "../../../../src/data/vapti";
import { curvaMargemPerda } from "../../../../src/lib/modelo";
import { Camada, Camera, ease, estadoFrase, Grade, Halo, lerp, Numero, oscilar, prog, Respiracao, rgba, ruido, Selo, spring, Titulo, useFilme, Palavra, Rotulo } from "../../kit";
import { COR_NIVEL, dentro, ESTILO_EYEBROW, ESTILO_MONO, ESTILO_ROTULO, ESTILO_TITULO, Holofote, Onda, poseEmChaves, Surge, tPal } from "./comum";

export const frases: string[] = ["F053", "F054", "F055", "F056", "F057", "F058", "F059", "F060", "F061", "F062", "F063", "F064", "F065", "F066"];

/* ---------- barras de preço (F056–F057): escala comum ---------- */
const BASE = 800;
const PX_POR_PCT = 1000; // 37,5% → 375 px; 45,8% → 458 px
const hBarra = (v: number) => v * PX_POR_PCT;
const ZIPPI_X = 520;
const VAPTI_X = 980;
const LARG_BARRA = 170;
const NIVEL_X = [840, 1040, 1240, 1440];
const LARG_NIVEL = 150;

/* ---------- cascata (F060) ---------- */
const CASC_BASE = 800;
const CASC_K = 520 / fase1.receitaMes.valor; // px por real
const CASC_X = [330, 640, 950, 1260];
const CASC_W = 210;

/* ---------- curva margem × perda (F062), fase 1 a 5% por semana ---------- */
const CURVA = curvaMargemPerda(1, preco.exemplo.taxa.valor);
const PL = { x0: 330, x1: 1560, zero: 690, k: 1 / 420 }; // y = zero − margem × k
const xPerda = (p: number) => PL.x0 + ((p - 0.04) / 0.16) * (PL.x1 - PL.x0);
const yMargem = (m: number) => PL.zero - m * PL.k;
const PERDA_EQ = fase1.perdaEquilibrio.valor;
const FRAC_EQ = (PERDA_EQ - 0.04) / 0.16;
const PTS = CURVA.map((c) => [xPerda(c.perda), yMargem(c.margem)] as const);
const caminhoAte = (lim: number) => {
  const out: string[] = [];
  for (const [x, y] of PTS) if (x <= lim + 0.01) out.push(`${out.length ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
  return out.join(" ");
};
const X_EQ = xPerda(PERDA_EQ);
const PTS_NEG = PTS.filter(([x]) => x >= X_EQ);
const CAMINHO_POS = caminhoAte(X_EQ) + ` L${X_EQ.toFixed(1)} ${PL.zero}`;
const CAMINHO_NEG = `M${X_EQ.toFixed(1)} ${PL.zero} ` + PTS_NEG.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const AREA_NEG = CAMINHO_NEG + ` L${PL.x1} ${PL.zero} Z`;
const AREA_POS = `M${PL.x0} ${PL.zero} ` + caminhoAte(X_EQ).replace(/^M/, "L") + ` L${X_EQ.toFixed(1)} ${PL.zero} Z`;
const BASE8 = premissaBase();
function premissaBase() {
  const p = 0.08;
  const c = CURVA.find((k) => Math.abs(k.perda - p) < 1e-9);
  return { x: xPerda(p), y: yMargem(c ? c.margem : 0) };
}

/* ---------- três fases (F065–F066) ---------- */
const FASE_X = [420, 860, 1300];
const FASE_W = 300;
const FASE_K = 540 / fases[2].carteira.valor;

export default function Ato6() {
  const { t, tl } = useFilme();
  const F = (id: string) => estadoFrase(tl, id, t);
  const w = (id: string, p: string, k = 0) => tPal(tl, id, p, k);
  const f53 = F("F053");
  const f54 = F("F054");
  const f55 = F("F055");
  const f56 = F("F056");
  const f57 = F("F057");
  const f58 = F("F058");
  const f59 = F("F059");
  const f60 = F("F060");
  const f61 = F("F061");
  const f62 = F("F062");
  const f63 = F("F063");
  const f64 = F("F064");
  const f65 = F("F065");
  const f66 = F("F066");

  // momentos falados
  const tCinco = w("F054", "cinco");
  const tSemana = w("F054", "semana,");
  const tQuatrocentos = w("F054", "quatrocentos");
  const tCusta = w("F054", "custa");
  const tPara80 = f54.tE + 0.2;
  const tPara375 = w("F055", "meio") + 0.25;
  const tDezoito = w("F056", "dezoito") + 0.4;
  const tPara147 = w("F058", "meio") + 0.2;
  const tPara354 = w("F059", "meio") + 0.25;
  const tPara1289 = w("F060", "mil") + 0.15;
  const tPara1675 = w("F062", "cento,") + 0.12;
  const tPara34 = w("F065", "quatro") + 0.3;
  const tPara4647 = w("F066", "mil") + 0.15;

  /* ---------- câmera ---------- */
  const camChaves = [
    { t: f53.t0 - 0.7, zoom: 1, x: 0, y: 0 },
    { t: f54.t0, zoom: 1.02 },
    { t: f54.t1, zoom: 1.0 },
    { t: f55.t1, zoom: 1.04, y: -8 },
    { t: f56.t0 + 0.6, zoom: 1.0, y: 0 },
    { t: f57.t1, zoom: 1.03, x: 10 },
    { t: f58.t0 + 0.5, zoom: 1.0, x: 0 },
    { t: f59.t1, zoom: 1.04 },
    { t: f60.t0 + 0.5, zoom: 1.0 },
    { t: f60.t1, zoom: 1.02 },
    // F061: tudo escurece e a câmera se aproxima da perda
    { t: f61.t0 + 0.2, zoom: 1.02, x: 0, y: 0 },
    { t: f61.tE + 0.6, zoom: 1.07, x: -170, y: -40, curva: ease.inOutCubic },
    { t: f62.t0 - 0.1, zoom: 1.08, x: -180, y: -40 },
    { t: f62.t0 + 0.7, zoom: 1.0, x: 0, y: 0 },
    { t: f62.tE, zoom: 1.03, x: 20, y: 0 },
    // respiro: aproxima do ponto que pulsa
    { t: f63.t0 + 0.2, zoom: 1.06, x: 60, y: 10 },
    { t: f63.tE - 0.02, zoom: 1.0, x: 0, y: 0 },
    { t: f63.tE + 0.5, zoom: 1.045, curva: ease.outExpo },
    { t: f64.t0 + 0.4, zoom: 1.0 },
    { t: f64.t1, zoom: 1.02 },
    { t: f65.t0 + 0.5, zoom: 1.0 },
    { t: f65.t1, zoom: 1.03 },
    { t: f66.t0 + 0.5, zoom: 1.0 },
    { t: f66.t1 + 1, zoom: 1.04 },
  ];

  /* ---------- escurecer (F061) e respiro antes do pico (F063) ---------- */
  const escuro61 = ease.inOutSine(prog(t, f61.t0 + 0.1, f61.tE + 0.2)) * (1 - ease.inOutSine(prog(t, f62.t0 - 0.2, f62.t0 + 0.4)));
  const respiro = ease.inOutSine(prog(t, f62.t1 + 0.15, f63.t0 + 0.35));

  /* ---------- 37,5%: gigante (F055) → topo da barra da Vapti (F056) ---------- */
  const voo = ease.inOutCubic(prog(t, f56.t0 - 0.25, f56.t0 + 0.65));
  const alvo375 = { x: VAPTI_X + LARG_BARRA / 2, y: BASE - hBarra(preco.exemplo.efetivaMes.valor) - 56 };

  return (
    <Camera chaves={camChaves} deriva={3} seed={6}>
      {/* ------------ fundo: grade de dados ------------ */}
      <Camada z={3}>
        <Grade tipo="quadriculado" passo={64} em={f53.tE - 0.2} dur={1.4} opacidade={0.9 * (1 - 0.7 * respiro * (1 - prog(t, f63.tE + 0.6, f64.t0 + 0.4)))} />
        <Respiracao tom="azul" x={760} y={420} raio={700} intensidade={0.08 * (1 - escuro61)} periodo={8} />
      </Camada>

      {/* ------------ F053–F055: R$ 400 → equação → 37,5% ------------ */}
      {dentro(t, f53.t0 - 0.4, f56.t0 + 0.8) ? (
        <Camada z={0}>
          <Equacao t={t} tm={{ f53: f53.t0, tE53: f53.tE, cinco: tCinco, semana: tSemana, quatrocentos: tQuatrocentos, custa: tCusta, para80: tPara80, juros: w("F054", "juros."), f55: f55.t0, f56: f56.t0 }} />
        </Camada>
      ) : null}

      {/* 37,5% gigante (fundo, L5) que voa até a barra da Vapti */}
      {dentro(t, f55.t0 - 0.2, f58.t0 + 0.5) && t >= f55.tE - 0.05 ? (
        <Camada z={lerp(1.2, 0, voo)}>
          <div style={{ position: "absolute", left: lerp(960, alvo375.x, voo), top: lerp(430, alvo375.y, voo), transform: `translate(-50%, -50%) scale(${lerp(1, 0.19, voo).toFixed(4)})`, transformOrigin: "50% 50%", opacity: (1 - prog(t, f57.t0 + 0.2, f57.t0 + 0.6)) }}>
            <Numero valor={preco.exemplo.efetivaMes.valor} final={preco.exemplo.efetivaMes.rotulo} formato="pct" tParada={tPara375} dur={1.3} de={0} tamanho={380} alinhar="centro" escalaUnidade={0.55} em={f55.tE - 0.05} brilho={0.5} />
          </div>
          <Surge em={tPara375 - 0.1} saida={f56.t0 - 0.35} dy={16} style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18 }}>
            <span style={{ ...ESTILO_TITULO, fontSize: 64 }}>ao mês</span>
            <span style={{ ...ESTILO_ROTULO, fontSize: 40 }}>(taxa efetiva)</span>
          </Surge>
        </Camada>
      ) : null}

      {/* ------------ F056–F057: Zippi × Vapti; a barra se divide nos níveis ------------ */}
      {dentro(t, f56.t0 - 0.3, f58.t0 + 0.6) ? (
        <Camada z={0}>
          <Precos t={t} tm={{ f56: f56.t0, zippi: w("F056", "Zippi"), semana: w("F056", "semana,"), dezoito: tDezoito, tE56: f56.tE, taxa57: w("F057", "taxa"), nivel57: w("F057", "nível:"), tE57: f57.tE, f58: f58.t0 }} />
        </Camada>
      ) : null}

      {/* ------------ F058–F059: KPIs da fase 1 e receita por ano ------------ */}
      {dentro(t, f58.t0 - 0.3, f60.t0 + 0.6) ? (
        <Camada z={0}>
          <Kpis t={t} tm={{ f58: f58.t0, milhao: w("F058", "milhão"), reais: w("F058", "reais,"), carteira: w("F058", "carteira"), para147: tPara147, f59: f59.t0, f60: f60.t0 }} />
        </Camada>
      ) : null}
      {dentro(t, f59.t0 - 0.3, f60.t0 + 0.6) ? (
        <Camada z={1.2}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center", opacity: 1 - ease.inOutSine(prog(t, f60.t0 - 0.15, f60.t0 + 0.35)) }}>
            <Numero valor={fase1.receitaAno.valor} final={fase1.receitaAno.rotulo} formato="mi" tParada={tPara354} dur={1.1} de={0} tamanho={300} alinhar="centro" escalaUnidade={0.45} em={f59.tE - 0.1} brilho={0.5} />
          </div>
        </Camada>
      ) : null}
      {dentro(t, f59.t0 - 0.3, f60.t0 + 0.6) ? (
        <Camada z={0}>
          <Surge em={tPara354 - 0.15} saida={f60.t0 - 0.15} dy={16} style={{ position: "absolute", left: 0, right: 0, top: 540, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
            <span style={{ ...ESTILO_TITULO, fontSize: 60 }}>de receita por ano</span>
            <Selo tipo="projecao" em={tPara354} tamanho={28} />
          </Surge>
        </Camada>
      ) : null}

      {/* ------------ F060–F061: cascata até a margem; holofote na perda ------------ */}
      {dentro(t, f60.t0 - 0.3, f62.t0 + 0.7) ? (
        <Camada z={0}>
          <Cascata t={t} escuro={escuro61} tm={{ f60: f60.t0, tE60: f60.tE, para: tPara1289, antes: w("F060", "antes"), tE61: f61.tE, f62: f62.t0 }} />
        </Camada>
      ) : null}

      {/* ------------ F062–F063: curva margem × perda e o pico ------------ */}
      {dentro(t, f62.t0 - 0.3, f64.t0 + 0.4) ? (
        <Camada z={0}>
          <CurvaPerda t={t} respiro={respiro} tm={{ f62: f62.t0, perda: w("F062", "perda"), para: tPara1675, tE: f62.tE, f63: f63.t0, tE63: f63.tE }} />
        </Camada>
      ) : null}
      {dentro(t, f62.t1, f64.t0 + 1) ? (
        <Camada z={0}>
          <Pico t={t} tm={{ fim62: f62.t1, f63: f63.t0, decide: w("F063", "decide"), taxa: w("F063", "taxa."), tE: f63.tE, f64: f64.t0 }} />
        </Camada>
      ) : null}

      {/* ------------ F064: piloto — régua de 90 dias e termômetro da perda ------------ */}
      {dentro(t, f64.t0 - 0.3, f65.t0 + 0.6) ? (
        <Camada z={0}>
          <Piloto t={t} tm={{ f64: f64.t0, piloto: w("F064", "piloto"), tE: f64.tE, f65: f65.t0 }} />
        </Camada>
      ) : null}

      {/* ------------ F065–F066: três degraus da carteira; R$ 464,7 mil por mês ------------ */}
      {dentro(t, f65.t0 - 0.3, Infinity) ? (
        <Camada z={0}>
          <TresFases t={t} tm={{ f65: f65.t0, divida: w("F065", "dívida"), tE: f65.tE, para: tPara34, f66: f66.t0 }} />
        </Camada>
      ) : null}
      {dentro(t, f66.t0 - 0.3, Infinity) ? (
        <>
          <Camada z={1.2}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center" }}>
              <Numero valor={fases[1].margem8.valor} final={fases[1].margem8.rotulo} formato="mi" tParada={tPara4647} dur={1.6} de={fase1.margemMes.valor} tamanho={250} alinhar="centro" escalaUnidade={0.45} em={f66.tE - 0.3} brilho={0.55} />
            </div>
          </Camada>
          <Camada z={0}>
            <Surge em={tPara4647 - 0.2} dy={16} style={{ position: "absolute", left: 0, right: 0, top: 480, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
              <span style={{ ...ESTILO_TITULO, fontSize: 58 }}>de margem por mês</span>
              <Selo tipo="projecao" em={tPara4647} tamanho={28} />
            </Surge>
          </Camada>
        </>
      ) : null}
    </Camera>
  );
}

/* ================================================================== */
/* F053–F055: equação                                                  */
/* ================================================================== */

function Termo({ x, y, em, saida, valor, legenda, cor = "var(--cor-texto)", tamanho = 120 }: { x: number; y: number; em: number; saida?: number; valor: ReactNode; legenda?: string; cor?: string; tamanho?: number }) {
  return (
    <Surge em={em} saida={saida} dy={30} mola style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, 0)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ ...ESTILO_MONO, fontSize: tamanho, lineHeight: 1, color: cor }}>{valor}</div>
      {legenda ? <div style={{ ...ESTILO_ROTULO, fontSize: 34 }}>{legenda}</div> : null}
    </Surge>
  );
}

function Rs({ txt, escala = 0.5 }: { txt: string; escala?: number }) {
  const m = txt.match(/^(R\$)\s?(.*)$/);
  if (!m) return <>{txt}</>;
  return (
    <>
      <span style={{ fontSize: `${escala}em`, fontWeight: 600, marginRight: "0.18em" }}>{m[1]}</span>
      {m[2]}
    </>
  );
}

function Equacao({ t, tm }: { t: number; tm: { f53: number; tE53: number; cinco: number; semana: number; quatrocentos: number; custa: number; para80: number; juros: number; f55: number; f56: number } }) {
  // R$ 400: centro grande (F053) → 1º termo (F054) → linha menor à frente (F055)
  const m1 = ease.inOutCubic(prog(t, tm.cinco - 0.55, tm.cinco + 0.05));
  const m2 = ease.inOutCubic(prog(t, tm.f55 - 0.1, tm.f55 + 0.6));
  const q = ease.inOutSine(prog(t, tm.f56 - 0.25, tm.f56 + 0.2));
  const e400 = ease.saida(prog(t, tm.tE53 - 0.1, tm.tE53 + 0.5));
  const pulso400 = t >= tm.quatrocentos ? 0.08 * Math.exp(-(t - tm.quatrocentos) * 4) : 0;
  const Y = 380;
  const xs = [330, 590, 790, 990, 1150, 1310, 1560];
  const ex = preco.exemplo;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - q }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(0, ${(m2 * 390).toFixed(1)}px) scale(${lerp(1, 0.55, m2).toFixed(4)})`, transformOrigin: "960px 440px", opacity: 1 - 0.35 * m2 }}>
        {/* R$ 400 */}
        <div style={{ position: "absolute", left: lerp(960, xs[0], m1), top: lerp(380, Y, m1), transform: `translate(-50%, 0) scale(${(lerp(1.75, 1, m1) + pulso400).toFixed(4)})`, transformOrigin: "50% 30%", opacity: e400, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ ...ESTILO_MONO, fontSize: 120, lineHeight: 1 }}>
            <Rs txt={ex.sacado.rotulo} />
          </div>
          <div style={{ ...ESTILO_ROTULO, fontSize: 34, opacity: m1 }}>saque</div>
        </div>
        <Termo x={xs[1]} y={Y} em={tm.cinco - 0.05} valor="×" cor="var(--cor-texto-3)" tamanho={90} />
        <Termo x={xs[2]} y={Y} em={tm.cinco} valor={ex.taxa.rotulo} legenda="por semana" />
        <Termo x={xs[3]} y={Y} em={tm.semana + 0.1} valor="×" cor="var(--cor-texto-3)" tamanho={90} />
        <Termo x={xs[4]} y={Y} em={tm.semana + 0.2} valor={produto.parcelasSemanais.rotulo} legenda="semanas" />
        <Termo x={xs[5]} y={Y} em={tm.custa} valor="=" cor="var(--cor-texto-3)" tamanho={90} />
        {t >= tm.custa ? (
          <div style={{ position: "absolute", left: xs[6], top: Y, transform: "translate(-50%, 0)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Numero valor={ex.juros.valor} final={ex.juros.rotulo} formato="brl0" tParada={tm.para80} dur={0.55} tamanho={120} alinhar="centro" em={tm.custa} escalaUnidade={0.5} />
            <Surge em={tm.juros - 0.1} dy={10} style={{ ...ESTILO_ROTULO, fontSize: 34 }}>
              de juros
            </Surge>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ================================================================== */
/* F056–F057: Zippi × Vapti; níveis                                    */
/* ================================================================== */

function Precos({ t, tm }: { t: number; tm: { f56: number; zippi: number; semana: number; dezoito: number; tE56: number; taxa57: number; nivel57: number; tE57: number; f58: number } }) {
  const q = ease.inOutSine(prog(t, tm.f58 - 0.2, tm.f58 + 0.35));
  const vapti = preco.exemplo.efetivaMes.valor;
  const zippi = preco.zippiEfetivaMes.valor;
  const divide = ease.inOutCubic(prog(t, tm.taxa57 - 0.1, tm.nivel57 + 0.35));
  const gZ = spring(t - tm.zippi, { k: 110, d: 17 });
  const gV = spring(t - (tm.f56 + 0.1), { k: 110, d: 17 });
  const ouro = ease.outCubic(prog(t, tm.tE57 - 0.05, tm.tE57 + 0.4));
  const nomeO = 1 - 0.6 * ouro;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - q, transform: `translate(0, ${(q * 30).toFixed(1)}px)` }}>
      {/* rótulo do eixo */}
      <Surge em={tm.f56 + 0.2} dy={10} style={{ position: "absolute", left: 160, top: 300, ...ESTILO_EYEBROW, fontSize: 30 }}>
        ao mês
      </Surge>
      {/* chão */}
      <div style={{ position: "absolute", left: 160, top: BASE, width: 1600, height: 2, background: "rgb(242 244 247 / 0.25)" }} />
      {/* referência da Zippi atravessando (F057) */}
      <div style={{ position: "absolute", left: ZIPPI_X, top: BASE - hBarra(zippi), width: 1100 * divide, height: 0, borderTop: "3px dashed rgb(139 149 161 / 0.8)", opacity: divide }} />

      {/* Zippi (cinza, tracejado, só texto) */}
      <div style={{ position: "absolute", left: ZIPPI_X, top: BASE - hBarra(zippi) * Math.max(0, gZ), width: LARG_BARRA, height: hBarra(zippi) * Math.max(0, gZ), borderRadius: "8px 8px 0 0", border: "2px dashed rgb(139 149 161 / 0.85)", background: "repeating-linear-gradient(135deg, rgb(139 149 161 / 0.16) 0 2px, transparent 2px 11px)", opacity: t >= tm.zippi ? 1 : 0 }} />
      {t >= tm.dezoito - 0.9 ? (
        <div style={{ position: "absolute", left: ZIPPI_X + LARG_BARRA / 2, top: BASE - hBarra(zippi) - 90, transform: "translate(-50%, 0)" }}>
          <Numero valor={zippi} final={preco.zippiEfetivaMes.rotulo} formato="pct" tParada={tm.dezoito} dur={0.9} de={0.1} tamanho={72} tom="cinza" alinhar="centro" escalaUnidade={0.6} em={tm.dezoito - 0.9} brilho={0} />
        </div>
      ) : null}
      <Surge em={tm.zippi} dy={10} style={{ position: "absolute", left: ZIPPI_X + LARG_BARRA / 2, top: BASE + 18, transform: "translate(-50%, 0)", ...ESTILO_TITULO, fontSize: 46, color: "var(--cor-cinza)", whiteSpace: "nowrap" }}>
        Zippi
      </Surge>
      <Surge em={tm.semana - 0.4} saida={tm.tE56 - 0.6} dy={10} style={{ position: "absolute", left: ZIPPI_X + LARG_BARRA / 2, top: BASE + 80, transform: "translate(-50%, 0)", ...ESTILO_ROTULO, fontSize: 32, color: "var(--cor-cinza)" }}>
        a partir de {preco.zippiTaxaSemanal.rotulo} por semana
      </Surge>

      {/* Vapti: uma barra (F056) que se divide em quatro níveis (F057) */}
      {niveis
        .map((n, i) => ({ n, i }))
        .reverse()
        .map(({ n, i }) => {
          const x = lerp(VAPTI_X, NIVEL_X[i], divide);
          const wd = lerp(LARG_BARRA, LARG_NIVEL, divide);
          const h = lerp(hBarra(vapti), hBarra(n.efetivaMes.valor), divide) * Math.max(0, gV);
          const destaque = i === 3 ? ouro : 0;
          const vis = i === 2 ? 1 : divide > 0.01 ? 1 : 0; // antes da divisão, só uma barra (a do meio) aparece
          if (!vis) return null;
          return (
            <div key={n.id} style={{ position: "absolute", left: x, top: BASE - h, width: wd, height: h, borderRadius: "8px 8px 0 0", background: `linear-gradient(180deg, rgb(182 242 58 / ${(0.95 - 0.25 * divide * (i === 3 ? 0 : 1) * ouro).toFixed(3)}) 0%, rgb(182 242 58 / 0.45) 100%)`, boxShadow: `0 0 ${(30 + 40 * destaque).toFixed(0)}px ${rgba("verde", 0.25 + 0.35 * destaque)}`, opacity: t >= tm.f56 + 0.05 ? 1 : 0 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 8, borderRadius: "8px 8px 0 0", background: COR_NIVEL[n.id], opacity: divide }} />
            </div>
          );
        })}
      {/* nome Vapti (F056) → nomes e valores dos níveis (F057) */}
      <div style={{ position: "absolute", left: VAPTI_X + LARG_BARRA / 2, top: BASE + 18, transform: "translate(-50%, 0)", ...ESTILO_TITULO, fontSize: 46, color: "var(--cor-verde)", opacity: (1 - divide) * Math.min(1, Math.max(0, (t - tm.f56) * 3)) }}>Vapti</div>
      {divide > 0.01
        ? niveis.map((n, i) => (
            <div key={n.id} style={{ position: "absolute", left: NIVEL_X[i] + LARG_NIVEL / 2, top: 0, transform: "translate(-50%, 0)", opacity: divide }}>
              <div style={{ position: "absolute", left: 0, top: BASE - hBarra(n.efetivaMes.valor) - 76, transform: "translate(-50%, 0)", ...ESTILO_MONO, fontSize: i === 3 ? 64 : 54, color: i === 3 ? "var(--cor-verde)" : "var(--cor-texto)", opacity: i === 3 ? 1 : nomeO + 0.2 }}>
                {n.efetivaMes.rotulo}
              </div>
              <div style={{ position: "absolute", left: 0, top: BASE + 18, transform: "translate(-50%, 0)", ...ESTILO_TITULO, fontSize: 40, color: COR_NIVEL[n.id], opacity: i === 3 ? 1 : nomeO, whiteSpace: "nowrap" }}>{n.nome}</div>
            </div>
          ))
        : null}
      {/* "inclui público negativado" (F056) */}
      <Surge em={tm.tE56} saida={tm.taxa57 - 0.2} dx={-16} dy={0} style={{ position: "absolute", left: VAPTI_X + LARG_BARRA + 40, top: BASE - hBarra(vapti) / 2 - 30, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 4, height: hBarra(vapti) * 0.9, marginTop: 30, borderRadius: 2, background: "rgb(242 244 247 / 0.35)", position: "absolute", left: -22, top: -hBarra(vapti) * 0.45 + 30 }} />
        <span style={{ ...ESTILO_TITULO, fontSize: 48, fontWeight: 700, whiteSpace: "nowrap" }}>inclui público negativado</span>
      </Surge>
      {/* F057: rótulo da tela, no alto (números fora da faixa da legenda) */}
      <div style={{ position: "absolute", left: 160, top: 170 }}>
        <Rotulo texto={`${niveis[3].nome}: ${niveis[3].efetivaMes.rotulo} ao mês, cerca de ${gamificacao.ouroAcimaZippi.rotulo} acima da Zippi`} em={tm.tE57} tamanho={40} />
      </div>
    </div>
  );
}

/* ================================================================== */
/* F058: KPIs                                                          */
/* ================================================================== */

function Kpis({ t, tm }: { t: number; tm: { f58: number; milhao: number; reais: number; carteira: number; para147: number; f59: number; f60: number } }) {
  const r = ease.inOutCubic(prog(t, tm.f59 - 0.1, tm.f59 + 0.6));
  const q = ease.inOutSine(prog(t, tm.f60 - 0.25, tm.f60 + 0.25));
  const bloco = (rot: string, filho: ReactNode) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{ ...ESTILO_EYEBROW, fontSize: 30 }}>{rot}</span>
      {filho}
    </div>
  );
  const seta = (em: number) => (
    <Surge em={em} dx={-20} dy={0} style={{ paddingTop: 70 }}>
      <ArrowRight size={64} color="var(--cor-texto-3)" strokeWidth={2} />
    </Surge>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - q }}>
      <div style={{ position: "absolute", left: 150, top: 400, display: "flex", alignItems: "flex-start", gap: 52, transform: `translate(${(r * 160).toFixed(1)}px, ${(r * 380).toFixed(1)}px) scale(${lerp(1, 0.62, r).toFixed(4)})`, transformOrigin: "0 0" }}>
        <div style={{ opacity: 1 - r }}>
          <Surge em={tm.milhao - 0.15} dy={24} mola>
            {bloco("Capital", <Numero valor={projeto.capitalInicial.valor} final={projeto.capitalInicial.rotulo} formato="mi" tParada={tm.reais} dur={0.5} de={projeto.capitalInicial.valor} tamanho={112} tom="texto" brilho={0} />)}
          </Surge>
        </div>
        <div style={{ opacity: 1 - r }}>{seta(tm.carteira - 0.2)}</div>
        <div style={{ opacity: 1 - r }}>
          <Surge em={tm.carteira - 0.1} dy={24} mola>
            {bloco("carteira", <span style={{ ...ESTILO_MONO, fontSize: 96, lineHeight: 0.92, color: "var(--cor-texto-2)" }}><Rs txt={fase1.carteira.rotulo} escala={0.5} /></span>)}
          </Surge>
        </div>
        <div style={{ opacity: 1 - r }}>{seta(tm.para147 - 1.2)}</div>
        <Surge em={tm.para147 - 1.1} dy={24} mola>
          {bloco(
            "sacados por mês",
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Numero valor={fase1.sacadoMes.valor} final={fase1.sacadoMes.rotulo} formato="mi" tParada={tm.para147} dur={1.0} de={projeto.capitalInicial.valor} tamanho={132} />
              <Selo tipo="projecao" em={tm.para147} tamanho={28} />
            </div>,
          )}
        </Surge>
      </div>
    </div>
  );
}

/* ================================================================== */
/* F060–F061: cascata                                                  */
/* ================================================================== */

function Cascata({ t, escuro, tm }: { t: number; escuro: number; tm: { f60: number; tE60: number; para: number; antes: number; tE61: number; f62: number } }) {
  const q = ease.inOutSine(prog(t, tm.f62 - 0.15, tm.f62 + 0.45));
  const rec = fase1.receitaMes.valor;
  const per = fase1.perdaMes.valor;
  const cus = fase1.custoMes.valor;
  const mar = fase1.margemMes.valor;
  const yTopo = CASC_BASE - rec * CASC_K;
  const yPer = yTopo + per * CASC_K;
  const yCus = yPer + cus * CASC_K;
  const ems = [tm.f60 + 0.05, tm.f60 + 0.45, tm.f60 + 0.85, tm.tE60 - 0.05];
  const g = ems.map((e) => Math.max(0, Math.min(1.04, spring(t - e, { k: 140, d: 18 }))));
  const apaga = 1 - 0.82 * escuro;
  const holo = escuro;
  const pulso = t >= tm.tE61 ? 0.5 * Math.exp(-(t - tm.tE61) * 2.5) : 0;
  const barra = (i: number, y0: number, y1: number, cor: string, sombra: string, o: number) => (
    <div style={{ position: "absolute", left: CASC_X[i], top: Math.min(y0, y1), width: CASC_W, height: Math.abs(y1 - y0), borderRadius: 8, background: cor, boxShadow: sombra, opacity: o * (t >= ems[i] ? 1 : 0) }} />
  );
  const nome = (i: number, txt: string, o: number) => (
    <Surge em={ems[i]} dy={10} style={{ position: "absolute", left: CASC_X[i] + CASC_W / 2, top: CASC_BASE + 16, transform: "translate(-50%, 0)", ...ESTILO_TITULO, fontSize: 42, opacity: o, whiteSpace: "nowrap" }}>
      {txt}
    </Surge>
  );
  const valor = (i: number, y: number, txt: string, cor: string, o: number) => (
    <Surge em={ems[i] + 0.1} dy={10} style={{ position: "absolute", left: CASC_X[i] + CASC_W / 2, top: y - 66, transform: "translate(-50%, 0)", ...ESTILO_MONO, fontSize: 46, color: cor, opacity: o }}>
      <Rs txt={txt} escala={0.6} />
    </Surge>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - q }}>
      <div style={{ position: "absolute", left: 250, top: CASC_BASE, width: 1320, height: 2, background: "rgb(242 244 247 / 0.25)", opacity: apaga }} />
      {/* receita */}
      {barra(0, CASC_BASE, CASC_BASE - (CASC_BASE - yTopo) * g[0], "linear-gradient(180deg, rgb(182 242 58 / 0.85), rgb(182 242 58 / 0.4))", `0 0 30px ${rgba("verde", 0.2)}`, apaga)}
      {valor(0, yTopo, fase1.receitaMes.rotulo, "var(--cor-texto)", apaga)}
      {nome(0, "receita", apaga)}
      {/* perda (fica acesa no holofote) */}
      {holo > 0.01 ? <Holofote x={CASC_X[1] + CASC_W / 2} y={yPer + 40} largura={620} intensidade={holo} /> : null}
      {holo > 0.01 ? <Halo tom="coral" x={CASC_X[1] + CASC_W / 2} y={(yTopo + yPer) / 2} w={700} h={520} intensidade={0.35 * holo} /> : null}
      {barra(1, yTopo, yTopo + (yPer - yTopo) * g[1], "linear-gradient(180deg, rgb(255 122 69 / 0.95), rgb(255 122 69 / 0.6))", `0 0 ${(30 + 50 * holo + 60 * pulso).toFixed(0)}px ${rgba("coral", 0.3 + 0.3 * holo + pulso)}`, 1)}
      <Surge em={ems[1] + 0.1} dy={10} style={{ position: "absolute", left: CASC_X[1] + CASC_W + 16, top: (yTopo + yPer) / 2 - 28, ...ESTILO_MONO, fontSize: 46 + 10 * holo, color: "var(--cor-coral)" }}>
        − <Rs txt={fase1.perdaMes.rotulo} escala={0.6} />
      </Surge>
      {nome(1, "perda", 1)}
      {/* custos */}
      {barra(2, yPer, yPer + (yCus - yPer) * g[2], "linear-gradient(180deg, rgb(143 184 255 / 0.85), rgb(143 184 255 / 0.5))", "none", apaga)}
      <Surge em={ems[2] + 0.1} dy={10} style={{ position: "absolute", left: CASC_X[2] + CASC_W / 2, top: yCus + 14, transform: "translate(-50%, 0)", ...ESTILO_MONO, fontSize: 46, color: "var(--cor-azul)", opacity: apaga }}>
        − <Rs txt={fase1.custoMes.rotulo} escala={0.6} />
      </Surge>
      {nome(2, "custos", apaga)}
      {/* conectores */}
      {[
        [0, yTopo],
        [1, yPer],
        [2, yCus],
      ].map(([i, y]) => (
        <div key={i} style={{ position: "absolute", left: CASC_X[i] + CASC_W, top: y, width: (CASC_X[1] - CASC_X[0] - CASC_W) * Math.min(1, g[i + 1]), height: 0, borderTop: "2px dashed rgb(242 244 247 / 0.3)", opacity: apaga }} />
      ))}
      {/* margem */}
      {barra(3, CASC_BASE, CASC_BASE - (CASC_BASE - yCus) * g[3], "linear-gradient(180deg, rgb(182 242 58 / 1), rgb(182 242 58 / 0.55))", `0 0 40px ${rgba("verde", 0.35)}`, apaga)}
      {t >= tm.tE60 - 0.1 ? (
        <div style={{ position: "absolute", left: CASC_X[3] - 10, top: yCus - 210, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, opacity: apaga }}>
          <Selo tipo="projecao" em={tm.tE60} tamanho={28} />
          <Numero valor={mar} final={fase1.margemMes.rotulo} formato="mi" tParada={tm.para} dur={0.95} tamanho={96} em={tm.tE60 - 0.1} escalaUnidade={0.5} />
        </div>
      ) : null}
      {nome(3, "margem", apaga)}
      <Surge em={tm.antes - 0.05} dy={10} style={{ position: "absolute", left: CASC_X[3] - 150, top: CASC_BASE + 80, width: 640, textAlign: "center", ...ESTILO_ROTULO, fontSize: 32, opacity: apaga }}>
        antes de equipe, tecnologia e impostos
      </Surge>
    </div>
  );
}

/* ================================================================== */
/* F062: curva margem × perda                                          */
/* ================================================================== */

function CurvaPerda({ t, respiro, tm }: { t: number; respiro: number; tm: { f62: number; perda: number; para: number; tE: number; f63: number; tE63: number } }) {
  const ent = ease.outCubic(prog(t, tm.f62 - 0.1, tm.f62 + 0.5));
  const fim = 1 - ease.inOutSine(prog(t, tm.f63 + 0.3, tm.f63 + 1.0));
  // desenho: até 16,75% quando o número é dito; o resto até o "zera"
  const p = t < tm.para ? FRAC_EQ * ease.inOutSine(prog(t, tm.perda, tm.para)) : FRAC_EQ + (1 - FRAC_EQ) * ease.outCubic(prog(t, tm.para, tm.tE + 0.25));
  const xp = PL.x0 + (PL.x1 - PL.x0) * p;
  const zera = ease.outCubic(prog(t, tm.tE, tm.tE + 0.45));
  const resto = 1 - 0.88 * respiro; // tudo some no respiro, menos o ponto
  const pulsoPonto = t >= tm.tE ? 1 + 0.35 * Math.max(0, oscilar(t - tm.tE, 1.1, -0.5)) : 1;
  const ticks = [0.04, 0.08, 0.12, 0.16, 0.2];
  // ponta que caminha na linha
  const yp = (() => {
    let y = PTS[0][1];
    for (const [x, yy] of PTS) if (x <= xp) y = yy;
    return y;
  })();
  if (ent * fim <= 0.003) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: ent * fim }}>
      <div style={{ position: "absolute", inset: 0, opacity: resto }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <clipPath id="ate-xp">
              <rect x={0} y={0} width={xp + 2} height={1080} />
            </clipPath>
            <linearGradient id="area-pos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cor-verde)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--cor-verde)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {/* eixos */}
          <line x1={PL.x0} x2={PL.x1 + 40} y1={PL.zero} y2={PL.zero} stroke="rgb(242 244 247 / 0.45)" strokeWidth={2} />
          <line x1={PL.x0} x2={PL.x0} y1={200} y2={870} stroke="rgb(242 244 247 / 0.2)" strokeWidth={2} />
          {ticks.map((k) => (
            <line key={k} x1={xPerda(k)} x2={xPerda(k)} y1={200} y2={870} stroke="rgb(242 244 247 / 0.06)" strokeWidth={2} />
          ))}
          <g clipPath="url(#ate-xp)">
            <path d={AREA_POS} fill="url(#area-pos)" />
            <path d={AREA_NEG} fill={rgba("coral", 0.12 + 0.22 * zera)} />
            <path d={CAMINHO_POS} fill="none" stroke={rgba("verde", 0.15)} strokeWidth={18} strokeLinecap="round" />
            <path d={CAMINHO_POS} fill="none" stroke="var(--cor-verde)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            <path d={CAMINHO_NEG} fill="none" stroke="var(--cor-coral)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* ponto do cenário-base (8%: a margem de F060) */}
          <circle cx={BASE8.x} cy={BASE8.y} r={11} fill="var(--cor-verde)" stroke="var(--cor-tinta)" strokeWidth={3} opacity={ease.outCubic(prog(t, tm.perda + 0.9, tm.perda + 1.2))} />
          {/* ponta */}
          {p < 0.999 ? <circle cx={xp} cy={yp} r={10} fill={xp > X_EQ ? "var(--cor-coral)" : "var(--cor-verde)"} stroke="var(--cor-tinta)" strokeWidth={3} /> : null}
        </svg>
        {/* rótulos */}
        <div style={{ position: "absolute", left: PL.x0 - 10, top: 150, ...ESTILO_EYEBROW, fontSize: 30 }}>margem por mês</div>
        <div style={{ position: "absolute", left: PL.x1 + 56, top: PL.zero - 22, ...ESTILO_TITULO, fontSize: 40, color: "var(--cor-texto-2)" }}>perda</div>
        {ticks.map((k) => (
          <div key={k} style={{ position: "absolute", left: xPerda(k), top: 884, transform: "translate(-50%, 0)", ...ESTILO_MONO, fontWeight: 500, fontSize: 30, color: "var(--cor-texto-3)" }}>
            {Math.round(k * 100)}%
          </div>
        ))}
        <Surge em={tm.perda + 1.0} dy={10} style={{ position: "absolute", left: BASE8.x + 22, top: BASE8.y - 74, ...ESTILO_MONO, fontSize: 38, color: "var(--cor-verde)" }}>
          <Rs txt={fase1.margemMes.rotulo} escala={0.6} />
        </Surge>
        {/* 16,75% + selo, colados ao ponto */}
        {t >= tm.para - 0.9 ? (
          <div style={{ position: "absolute", left: X_EQ - 150, top: PL.zero - 190, display: "flex", flexDirection: "column", alignItems: "center", width: 300, gap: 10 }}>
            <Selo tipo="projecao" em={tm.para} tamanho={28} />
            <Numero valor={PERDA_EQ} final={fase1.perdaEquilibrio.rotulo} formato="pct2" tParada={tm.para} dur={0.8} de={0.04} tamanho={84} tom="coral" alinhar="centro" escalaUnidade={0.65} em={tm.para - 0.9} />
          </div>
        ) : null}
        <Surge em={tm.tE} dy={-14} mola style={{ position: "absolute", left: X_EQ - 150, top: PL.zero + 40, width: 300, display: "flex", justifyContent: "center" }}>
          <span style={{ ...ESTILO_TITULO, fontSize: 44, color: "var(--cor-sobre-coral)", background: "var(--cor-coral)", padding: "8px 22px", borderRadius: 12, whiteSpace: "nowrap", boxShadow: `0 0 30px ${rgba("coral", 0.5)}` }}>margem zero</span>
        </Surge>
      </div>
      {/* o ponto do zero: pulsa e fica no respiro */}
      {t >= tm.para - 0.05 ? (
        <>
          <Onda em={tm.tE} x={X_EQ} y={PL.zero} tom="coral" raio={260} dur={0.9} intensidade={0.8} espessura={4} />
          <div style={{ position: "absolute", left: X_EQ - 18, top: PL.zero - 18, width: 36, height: 36, borderRadius: "50%", background: "var(--cor-coral)", border: "4px solid var(--cor-tinta)", boxShadow: `0 0 ${(24 + 26 * (pulsoPonto - 1) * 3).toFixed(0)}px ${rgba("coral", 0.7)}`, transform: `scale(${pulsoPonto.toFixed(4)})`, opacity: 1 - prog(t, tm.f63 + 0.15, tm.f63 + 0.45) }} />
        </>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* F063: o pico — "taxa" pequena × "PERDA" enorme                     */
/* ================================================================== */

function Pico({ t, tm }: { t: number; tm: { fim62: number; f63: number; decide: number; taxa: number; tE: number; f64: number } }) {
  // o ponto coral sai da curva e vem para o centro, pulsando devagar no silêncio
  const vem = ease.inOutCubic(prog(t, tm.f63 + 0.1, tm.f63 + 1.0));
  const xPt = lerp(X_EQ, 960, vem);
  const yPt = lerp(PL.zero, 600, vem);
  const pPt = vem > 0 ? 1 + 0.18 * oscilar(t, 1.4) : 1;
  const explode = spring(t - tm.tE, { k: 210, d: 15 });
  const aberto = t >= tm.tE;
  const q = ease.inOutSine(prog(t, tm.f64 - 0.1, tm.f64 + 0.45));
  const taxaSai = ease.inOutCubic(prog(t, tm.tE - 0.05, tm.tE + 0.5));
  const respiraLuz = aberto ? Math.min(1, (t - tm.tE) * 3) : 0;
  if (t < tm.f63 + 0.1) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - q }}>
      {/* luz coral que cresce com a perda */}
      <Respiracao tom="coral" x={960} y={600} raio={760} intensidade={0.32 * respiraLuz} periodo={4} />
      <Halo tom="coral" x={960} y={600} w={1500} h={700} intensidade={0.28 * respiraLuz * (1 - 0.5 * prog(t, tm.tE + 0.4, tm.tE + 1.2))} />
      {/* "Quem decide" */}
      <Surge em={tm.decide - 0.05} dy={16} style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", ...ESTILO_EYEBROW, fontSize: 40, letterSpacing: "0.22em", color: "var(--cor-texto-2)" }}>
        Quem decide
      </Surge>
      {/* "não é a taxa" — pequeno, cinza; recua quando entra a perda */}
      <div style={{ position: "absolute", left: 0, right: 0, top: lerp(370, 330, taxaSai), display: "flex", justifyContent: "center", opacity: 1 - 0.55 * taxaSai, transform: `scale(${lerp(1, 0.8, taxaSai).toFixed(4)})`, transformOrigin: "50% 50%" }}>
        <Palavra texto="não é a taxa" em={tm.taxa - 0.55} passo={0.13} destaque={false} cor="var(--cor-texto-3)" modo="subir" style={{ ...ESTILO_TITULO, fontSize: 64, fontWeight: 700 }} />
      </div>
      {/* o ponto (antes da ênfase) */}
      {!aberto ? (
        <div style={{ position: "absolute", left: xPt - 18, top: yPt - 18, width: 36, height: 36, borderRadius: "50%", background: "var(--cor-coral)", boxShadow: `0 0 ${(30 * pPt).toFixed(0)}px ${rgba("coral", 0.75)}`, transform: `scale(${pPt.toFixed(4)})` }} />
      ) : null}
      {/* PERDA */}
      {aberto ? (
        <>
          <Onda em={tm.tE} x={960} y={600} tom="coral" raio={980} dur={1.4} intensidade={0.7} espessura={5} />
          <Onda em={tm.tE + 0.18} x={960} y={600} tom="coral" raio={720} dur={1.2} intensidade={0.45} espessura={3} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 600 - 175, height: 350, display: "flex", justifyContent: "center", alignItems: "center", transform: `scale(${(0.35 + 0.65 * explode).toFixed(4)})`, transformOrigin: "50% 50%", opacity: Math.min(1, (t - tm.tE) * 8) }}>
            <span style={{ ...ESTILO_TITULO, fontSize: 330, letterSpacing: "-0.045em", lineHeight: 1, color: "var(--cor-coral)", textShadow: `0 0 40px ${rgba("coral", 0.45)}` }}>PERDA</span>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* F064: piloto — régua de 90 dias + termômetro da perda               */
/* ================================================================== */

function Piloto({ t, tm }: { t: number; tm: { f64: number; piloto: number; tE: number; f65: number } }) {
  const q = ease.inOutSine(prog(t, tm.f65 - 0.15, tm.f65 + 0.4));
  const ent = ease.outCubic(prog(t, tm.f64 - 0.1, tm.f64 + 0.5));
  const dias = piloto.dias.valor;
  const R = { x: 760, x1: 1440, y: 700 };
  const pr = ease.inOutSine(prog(t, tm.f64 + 0.4, tm.f65 - 0.2));
  const T = { x: 1610, y0: 760, y1: 260, w: 76 };
  const nivelTerm = 0.32 + 0.14 * pr + 0.03 * ruido(t * 1.3, 9); // ilustrativo: a perda sendo medida
  const yEq = T.y0 - (PERDA_EQ / 0.2) * (T.y0 - T.y1);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: ent * (1 - q) }}>
      <div style={{ position: "absolute", left: 120, top: 330, width: 560 }}>
        <Titulo texto="Piloto: medir antes de crescer" frase="F064" destaque="antes de crescer" tamanho={76} largura={560} />
      </div>
      {/* régua de 90 dias */}
      <div style={{ position: "absolute", left: R.x, top: R.y, width: R.x1 - R.x, height: 4, borderRadius: 2, background: "rgb(242 244 247 / 0.25)" }} />
      <div style={{ position: "absolute", left: R.x, top: R.y, width: (R.x1 - R.x) * pr, height: 4, borderRadius: 2, background: "var(--cor-verde)", boxShadow: `0 0 16px ${rgba("verde", 0.6)}` }} />
      {[0, 1, 2, 3].map((k) => {
        const x = R.x + ((R.x1 - R.x) * k) / 3;
        return (
          <div key={k}>
            <div style={{ position: "absolute", left: x - 2, top: R.y - 18, width: 4, height: 40, borderRadius: 2, background: pr >= k / 3 - 0.001 ? "var(--cor-verde)" : "rgb(242 244 247 / 0.35)" }} />
            <div style={{ position: "absolute", left: x, top: R.y + 36, transform: "translate(-50%, 0)", ...ESTILO_MONO, fontWeight: 600, fontSize: 40, color: "var(--cor-texto-2)" }}>{Math.round((dias * k) / 3)}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: R.x1 + 40, top: R.y + 36, ...ESTILO_ROTULO, fontSize: 38 }}>dias</div>
      <div style={{ position: "absolute", left: R.x + (R.x1 - R.x) * pr - 16, top: R.y - 14, width: 32, height: 32, borderRadius: "50%", background: "var(--cor-verde)", boxShadow: `0 0 20px ${rgba("verde", 0.8)}` }} />
      {/* termômetro da perda */}
      <div style={{ position: "absolute", left: T.x - 60, top: T.y1 - 92, width: T.w + 120, textAlign: "center", ...ESTILO_TITULO, fontSize: 48, color: "var(--cor-coral)" }}>perda</div>
      <div style={{ position: "absolute", left: T.x, top: T.y1, width: T.w, height: T.y0 - T.y1, borderRadius: T.w / 2, border: "3px solid rgb(242 244 247 / 0.3)", background: "rgb(242 244 247 / 0.04)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${(nivelTerm * 100).toFixed(2)}%`, background: "linear-gradient(180deg, rgb(255 122 69 / 1), rgb(255 122 69 / 0.6))", boxShadow: `0 0 30px ${rgba("coral", 0.5)}` }} />
      </div>
      <div style={{ position: "absolute", left: T.x - 22, top: yEq, width: T.w + 44, height: 0, borderTop: "3px dashed var(--cor-texto)" }} />
      <div style={{ position: "absolute", left: T.x - 44 - 260, top: yEq - 26, width: 260, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        <span style={{ ...ESTILO_MONO, fontSize: 44, color: "var(--cor-texto)" }}>{fase1.perdaEquilibrio.rotulo}</span>
        <Selo tipo="projecao" em={tm.f64 + 0.5} tamanho={28} />
      </div>
      <div style={{ position: "absolute", left: T.x - 40, top: T.y0 + 30 }}>
        <Selo tipo="ilustrativo" em={tm.f64 + 0.4} tamanho={28} />
      </div>
    </div>
  );
}

/* ================================================================== */
/* F065–F066: três fases                                               */
/* ================================================================== */

function TresFases({ t, tm }: { t: number; tm: { f65: number; divida: number; tE: number; para: number; f66: number } }) {
  const enc = ease.inOutCubic(prog(t, tm.f66 - 0.1, tm.f66 + 0.7));
  const ent = ease.outCubic(prog(t, tm.f65 - 0.1, tm.f65 + 0.5));
  const acende = ease.outCubic(prog(t, tm.tE - 0.05, tm.tE + 0.4));
  const pose = poseEmChaves(t, [
    { t: tm.f66 - 0.1, y: 0, s: 1 },
    { t: tm.f66 + 0.7, y: 60, s: 0.5 },
  ]);
  const BASE_F = 840;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: ent, transform: `translate(0, ${pose.y.toFixed(1)}px) scale(${pose.s.toFixed(4)})`, transformOrigin: "960px 840px" }}>
      <Surge em={tm.f65 + 0.1} dy={10} style={{ position: "absolute", left: 300, top: 180, ...ESTILO_EYEBROW, fontSize: 32, opacity: 1 - enc }}>
        carteira
      </Surge>
      <div style={{ position: "absolute", left: 300, top: BASE_F, width: 1380, height: 2, background: "rgb(242 244 247 / 0.25)" }} />
      {fases.map((f, i) => {
        const h = f.carteira.valor * FASE_K;
        const g = Math.max(0, Math.min(1.04, spring(t - (tm.f65 + 0.15 + i * 0.25), { k: 120, d: 18 })));
        const e2 = i === 1;
        const luz = e2 ? acende : 0;
        return (
          <div key={f.fase}>
            <div style={{ position: "absolute", left: FASE_X[i], top: BASE_F - h * g, width: FASE_W, height: h * g, borderRadius: "10px 10px 0 0", background: e2 ? `linear-gradient(180deg, rgb(182 242 58 / ${(0.25 + 0.7 * luz).toFixed(3)}), rgb(182 242 58 / ${(0.08 + 0.35 * luz).toFixed(3)}))` : "linear-gradient(180deg, rgb(38 47 59), rgb(25 31 40))", border: e2 ? `2px solid ${rgba("verde", 0.4 + 0.5 * luz)}` : "1px solid rgb(255 255 255 / 0.1)", boxShadow: e2 ? `0 0 ${(60 * luz).toFixed(0)}px ${rgba("verde", 0.35 * luz)}` : "none" }} />
            {/* valor */}
            <div style={{ position: "absolute", left: FASE_X[i] + FASE_W / 2, top: BASE_F - h - (e2 ? 128 : 90), transform: "translate(-50%, 0)" }}>
              {e2 ? (
                t >= tm.tE - 0.1 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Numero valor={f.carteira.valor} final={f.carteira.rotulo} formato="mi" tParada={tm.para} dur={1.0} de={fases[0].carteira.valor} tamanho={100} alinhar="centro" em={tm.tE - 0.1} escalaUnidade={0.45} />
                    <div style={{ opacity: 1 - enc }}>
                      <Selo tipo="projecao" em={tm.para} tamanho={28} />
                    </div>
                  </div>
                ) : null
              ) : (
                <Surge em={tm.f65 + 0.3 + i * 0.25} dy={12}>
                  <span style={{ ...ESTILO_MONO, fontSize: 60, color: "var(--cor-texto-2)" }}>
                    <Rs txt={f.carteira.rotulo} escala={0.5} />
                  </span>
                </Surge>
              )}
            </div>
            <div style={{ position: "absolute", left: FASE_X[i] + FASE_W / 2, top: BASE_F + 18, transform: "translate(-50%, 0)", opacity: 1 - enc, ...ESTILO_TITULO, fontSize: 44, color: e2 ? "var(--cor-verde)" : "var(--cor-texto-2)", whiteSpace: "nowrap" }}>Ano {f.fase}</div>
          </div>
        );
      })}
      <Surge em={tm.divida - 0.1} saida={tm.f66} dy={10} style={{ position: "absolute", left: FASE_X[1] + FASE_W / 2, top: BASE_F + 80, transform: "translate(-50%, 0)", ...ESTILO_ROTULO, fontSize: 34, whiteSpace: "nowrap" }}>
        dívida estruturada
      </Surge>
      {/* cada degrau ganha um selo de projeção ao lado dos valores (as três carteiras são projeções) */}
      <div style={{ position: "absolute", left: FASE_X[2] + FASE_W + 24, top: BASE_F - fases[2].carteira.valor * FASE_K + 10, opacity: 1 - enc }}>
        <Selo tipo="projecao" em={tm.f65 + 0.9} tamanho={28} />
      </div>
    </div>
  );
}
