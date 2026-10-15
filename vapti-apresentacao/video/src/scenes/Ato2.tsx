/**
 * Ato 2 — A prova (F010–F021). Zippi sempre em cinza e só texto (sem logotipo).
 * F010: o horizonte acende e o chão de dados aparece (o tema muda para "dados").
 * F011–F014: o horizonte vira a linha do tempo da Zippi (V04): 2019 seed, 2021 cartão de crédito
 *            semanal, 2022 R$ 275 mi com a barra 9x.
 * F015: R$ 7,6 bi gigante (L5) · F016: vira cartão; entra ≈ US$ 80 mi com o selo de estimativa.
 * F017: tela limpa; um ponto vira traço · F018/F019: reservatório com teto × fundos (FIDC) enchendo
 * a carteira · F020: barras 66/80/220 (V05), uma por número dito · F021: as barras viram a seta da Vapti.
 */
import { zippi } from "../../../src/data/vapti";
import { formatInt } from "../../../src/lib/formato";
import { Camada, Camera, COR, ease, Grade, Halo, MarcaVapti, Numero, prog, Respiracao, rgba, Rotulo, Selo, Seta, spring, useFilme, useFrase } from "../kit";
import { abs, ChaveL2, mix, mola, Plano, some, surge, tPal } from "./atos1a3/comum";

export const frases: string[] = ["F010", "F011", "F012", "F013", "F014", "F015", "F016", "F017", "F018", "F019", "F020", "F021"];

const HORIZONTE = 620;
const EIXO = { x0: 760, x1: 1760 };
const anoX = (ano: number) => EIXO.x0 + ((ano - zippi.fundacao) * (EIXO.x1 - EIXO.x0)) / 7;

const fmtMil = (v: number) => `US$ ${formatInt(v / 1000)} mil`;
const fmtMi = (v: number) => `R$ ${formatInt(v / 1e6)} mi`;
const fmtBi = (v: number) => `R$ ${(Math.round(v / 1e8) / 10).toFixed(1).replace(".", ",")} bi`;
const fmtUsMi = (v: number) => `≈ US$ ${formatInt(v / 1e6)} mi`;

const titulo = { fontFamily: "var(--fonte-titulo)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1 } as const;
const eyebrow = { fontFamily: "var(--fonte-texto)", fontWeight: 700, fontSize: 26, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cor-texto-2)" } as const;

/* ------------------------------------------------------------------ */
/* Linha do tempo da Zippi (F010–F014)                                  */
/* ------------------------------------------------------------------ */

function Marco({ x, em, tom = "cinza" }: { x: number; em: number; tom?: "cinza" | "texto" }) {
  const { t } = useFilme();
  const s = spring(t - em, { k: 240, d: 16 });
  if (s <= 0.001) return null;
  const halo = Math.exp(-Math.max(0, t - em) * 1.5);
  return (
    <div style={abs(x - 13, HORIZONTE - 13, { width: 26, height: 26, borderRadius: 99, background: tom === "cinza" ? "var(--cor-texto-2)" : COR.texto, border: "4px solid var(--cor-tinta)", boxShadow: `0 0 0 2px rgb(180 188 199 / 0.6), 0 0 ${Math.round(20 + 30 * halo)}px rgb(242 244 247 / ${(0.15 + 0.35 * halo).toFixed(3)})`, transform: `scale(${s.toFixed(4)})` })} />
  );
}

function LinhaTempo() {
  const { t } = useFilme();
  const f10 = useFrase("F010");
  const f11 = useFrase("F011");
  const f12 = useFrase("F012");
  const f13 = useFrase("F013");
  const f14 = useFrase("F014");
  const f15 = useFrase("F015");
  // horizonte: acende na F010, encolhe até virar o eixo na ênfase da F011
  const pAcende = ease.inOutCubic(prog(t, f10.tE - 0.05, f10.tE + 0.9));
  const pEixo = ease.inOutCubic(prog(t, f11.tE - 0.1, f11.tE + 0.8));
  const x0 = mix(960 - 960 * pAcende, EIXO.x0, pEixo);
  const x1 = mix(960 + 960 * pAcende, EIXO.x1, pEixo);
  const vidaTL = 1 - ease.inOutSine(prog(t, f15.t0 + 0.2, f15.tE - 0.45));
  if (vidaTL <= 0.002) return null;
  const t2019 = tPal(f12.f, "2019");
  const t2021 = tPal(f13.f, "2021");
  const t2022 = tPal(f14.f, "2022");
  const tFlip = f13.tE - 0.25;
  const pFlip = ease.inOutCubic(prog(t, tFlip, tFlip + 0.6));
  const tVolta = tPal(f13.f, "voltando");
  const barraLimite = t < tVolta ? 1 - 0.75 * ease.inOutCubic(prog(t, tFlip + 0.9, tFlip + 1.6)) : 0.25 + 0.75 * ease.saida(prog(t, tVolta, tVolta + 0.7));
  const saiCartoes = some(t, f14.t0 - 0.05, 0.5);
  // barras 2021 × 2022 (9x)
  const unid = 38;
  const h21 = unid * mola(t, t2022 - 0.3, 160, 18);
  const h22 = unid * zippi.crescimento2022.valor * spring(t - (f14.tE - 0.2), { k: 70, d: 13 });
  const tParada275 = tPal(f14.f, "milhões") + 0.05;
  return (
    <div className="absolute inset-0" style={{ opacity: vidaTL }}>
      {/* eixo */}
      <div style={abs(x0, HORIZONTE - 1.5, { width: Math.max(0, x1 - x0), height: 3, borderRadius: 2, background: `linear-gradient(90deg, rgb(242 244 247 / ${(0.2 + 0.3 * pEixo).toFixed(3)}), rgb(242 244 247 / 0.75), rgb(242 244 247 / ${(0.2 + 0.3 * pEixo).toFixed(3)}))`, boxShadow: `0 0 ${Math.round(40 - 26 * pEixo)}px rgb(242 244 247 / ${(0.5 - 0.3 * pEixo).toFixed(3)})`, opacity: pAcende })} />
      {/* anos */}
      {Array.from({ length: 8 }, (_, i) => {
        const ano = zippi.fundacao + i;
        const em = f11.tE + 0.45 + i * 0.07;
        const a = surge(t, em, 0.35);
        if (a <= 0) return null;
        const marcado = ano === 2019 || ano === 2021 || ano === 2022;
        return (
          <div key={ano}>
            <div style={abs(anoX(ano) - 1, HORIZONTE + 8, { width: 2, height: 14, background: "rgb(242 244 247 / 0.35)", opacity: a })} />
            <span className="font-mono" style={abs(anoX(ano) - 50, HORIZONTE + 30, { width: 100, textAlign: "center", fontSize: 28, fontWeight: 600, color: marcado ? "var(--cor-texto-2)" : "var(--cor-texto-3)", opacity: a })}>
              {ano}
            </span>
          </div>
        );
      })}
      <Marco x={anoX(2019)} em={t2019} />
      <Marco x={anoX(2021)} em={t2021} />
      <Marco x={anoX(2022)} em={t2022} tom="texto" />

      {/* 2019 · seed */}
      {t > t2019 && saiCartoes > 0 ? (
        <div style={{ opacity: saiCartoes }}>
          <div style={abs(anoX(2019) - 1, 548, { width: 2, height: (HORIZONTE - 560) * ease.outCubic(prog(t, t2019, t2019 + 0.4)), background: "rgb(180 188 199 / 0.5)" })} />
          <div style={abs(anoX(2019) - 215, 316 + (1 - mola(t, t2019 + 0.1)) * 30, { width: 430, height: 234, borderRadius: 20, padding: "30px 32px", background: "linear-gradient(180deg, rgb(33 41 52 / 0.94), rgb(22 27 34 / 0.96))", border: "1.5px dashed rgb(139 149 161 / 0.55)", boxShadow: "0 30px 70px -30px rgb(0 0 0 / 0.85)", opacity: surge(t, t2019 + 0.1) })}>
            <div style={eyebrow}>Seed · Y Combinator</div>
            <div style={{ marginTop: 26 }}>
              <Numero valor={zippi.seed.valor} final={zippi.seed.rotulo} formato={fmtMil} tParada={tPal(f12.f, "mil") + 0.12} dur={1.25} tamanho={78} tom="texto" escalaUnidade={0.55} em={f12.tE - 0.3} />
            </div>
          </div>
        </div>
      ) : null}

      {/* 2021 · cartão de crédito semanal (gira) */}
      {t > t2021 && saiCartoes > 0 ? (
        <div style={{ opacity: saiCartoes }}>
          <svg width={1920} height={1080} className="absolute inset-0" style={{ overflow: "visible" }}>
            <path d={`M${anoX(2021)} ${HORIZONTE - 14} L${anoX(2021)} 590 L${anoX(2021) + 60} 572`} fill="none" stroke="rgb(180 188 199 / 0.5)" strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease.outCubic(prog(t, t2021, t2021 + 0.5))} />
          </svg>
          <div style={abs(1040, 300 + (1 - mola(t, t2021 + 0.15)) * 30, { width: 430, height: 270, perspective: 1200, opacity: surge(t, t2021 + 0.15) })}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                padding: "28px 32px",
                background: "linear-gradient(135deg, rgb(58 66 78 / 0.98), rgb(32 38 47 / 0.98))",
                border: "1.5px dashed rgb(139 149 161 / 0.7)",
                boxShadow: "0 30px 70px -30px rgb(0 0 0 / 0.85)",
                transform: `scaleX(${Math.abs(Math.cos(pFlip * Math.PI)).toFixed(4)})`,
              }}
            >
              {pFlip < 0.5 ? (
                <>
                  <div style={{ width: 64, height: 48, borderRadius: 8, background: "rgb(180 188 199 / 0.35)", marginTop: 54 }} />
                  <div style={{ marginTop: 40, display: "flex", gap: 14 }}>
                    {[0, 1, 2, 3].map((k) => (
                      <div key={k} style={{ width: 70, height: 12, borderRadius: 6, background: "rgb(180 188 199 / 0.25)" }} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-mono" style={{ fontSize: 28, fontWeight: 600, color: "var(--cor-texto-2)" }}>
                    2021
                  </div>
                  <div style={{ ...titulo, fontSize: 56, marginTop: 18, color: "var(--cor-texto)" }}>crédito semanal</div>
                  <div style={{ marginTop: 34, height: 16, borderRadius: 8, background: "rgb(139 149 161 / 0.22)", overflow: "hidden" }}>
                    <div style={{ width: `${(100 * barraLimite).toFixed(2)}%`, height: "100%", borderRadius: 8, background: "var(--cor-texto-2)", boxShadow: t > tVolta ? `0 0 18px rgb(242 244 247 / ${(0.4 * Math.exp(-(t - tVolta) * 2)).toFixed(3)})` : undefined }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* 2022: barras 2021 × 2022 (9x) e o contador */}
      {t > t2022 - 0.3 ? (
        <>
          {[
            { x: anoX(2021), h: h21 },
            { x: anoX(2022), h: h22 },
          ].map(({ x, h }, k) => (
            <div key={k} style={abs(x - 46, HORIZONTE - Math.max(0, h), { width: 92, height: Math.max(0, h), borderRadius: 8, border: "2px dashed rgb(139 149 161 / 0.9)", borderBottom: "none", background: `repeating-linear-gradient(135deg, rgb(139 149 161 / ${k ? 0.3 : 0.2}) 0 2px, transparent 2px 11px)` })} />
          ))}
          <div className="font-mono" style={abs(anoX(2022) + 70, HORIZONTE - unid * zippi.crescimento2022.valor - 6, { fontSize: 76, fontWeight: 700, color: "var(--cor-texto)", letterSpacing: "-0.04em", opacity: surge(t, tParada275 + 0.25, 0.3), transform: `scale(${(0.85 + 0.15 * mola(t, tParada275 + 0.25, 260, 16)).toFixed(4)})`, transformOrigin: "left center" })}>
            {zippi.crescimento2022.valor}x
          </div>
          <div style={abs(130, 300)}>
            <div style={{ ...eyebrow, opacity: surge(t, t2022, 0.4) }}>2022 · liberados</div>
            <div style={{ marginTop: 24 }}>
              <Numero valor={zippi.liberado2022.valor} final={zippi.liberado2022.rotulo} formato={fmtMi} tParada={tParada275} dur={tParada275 - f14.tE + 0.1} tamanho={150} tom="texto" em={f14.tE - 0.35} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* R$ 7,6 bi → cartões (F015–F017)                                      */
/* ------------------------------------------------------------------ */

function ZippiHoje() {
  const { t } = useFilme();
  const f15 = useFrase("F015");
  const f16 = useFrase("F016");
  const f17 = useFrase("F017");
  const vira = ease.inOutCubic(prog(t, f16.t0 - 0.25, f16.t0 + 0.75));
  const sai = some(t, f17.t0 + 0.05, 0.55);
  const desce = ease.inCubic(prog(t, f17.t0 + 0.05, f17.t0 + 0.6)) * 40;
  const tParada = tPal(f15.f, "meio") + 0.12;
  const tOitenta = f16.tE;
  const tParada80 = tPal(f16.f, "milhões") + 0.15;
  const cartao = surge(t, f16.t0 + 0.2, 0.5);
  const fundoCartao = { position: "absolute", borderRadius: 22, background: "linear-gradient(180deg, rgb(33 41 52 / 0.94), rgb(22 27 34 / 0.96))", border: "1px solid rgb(255 255 255 / 0.075)", boxShadow: "0 40px 90px -30px rgb(0 0 0 / 0.85)" } as const;
  return (
    <div className="absolute inset-0" style={{ opacity: sai, transform: `translate(0, ${desce.toFixed(1)}px)` }}>
      <Halo tom="azul" x={mix(960, 900, vira)} y={mix(470, 530, vira)} w={mix(1500, 700, vira)} h={mix(700, 420, vira)} intensidade={0.08} />
      {/* cartão 1 (o número gigante encolhe para dentro dele) */}
      <div style={{ ...fundoCartao, left: 680, top: 390, width: 440, height: 300, opacity: cartao, transform: `scale(${(0.94 + 0.06 * cartao).toFixed(4)})` }} />
      <div style={{ ...eyebrow, position: "absolute", left: 960 - 300, top: mix(250, 300, vira), width: 600, textAlign: "center", opacity: surge(t, f15.tE - 0.4, 0.4) * (1 - vira) }}>Zippi · hoje</div>
      <div style={{ position: "absolute", left: mix(960, 900, vira), top: mix(470, 500, vira), transform: `translate(-50%, -50%) scale(${mix(1, 0.34, vira).toFixed(4)})` }}>
        <Numero valor={zippi.concedido.valor} final={zippi.concedido.rotulo} formato={fmtBi} tParada={tParada} dur={tParada - f15.tE + 0.15} tamanho={330} tom="texto" alinhar="centro" em={f15.tE - 0.45} brilho={0.15} />
      </div>
      <div style={{ ...titulo, position: "absolute", left: mix(960, 900, vira) - 400, top: mix(680, 590, vira), width: 800, textAlign: "center", fontSize: mix(80, 40, vira), color: "var(--cor-texto-2)", opacity: surge(t, tPal(f15.f, "concedidos") - 0.05, 0.45) }}>concedidos</div>
      {/* cartão 2: ≈ US$ 80 mi · estimativa de terceiros (Dealroom) */}
      {t > tOitenta - 0.5 ? (
        <>
          <div style={{ ...fundoCartao, left: 1180, top: 390 + (1 - mola(t, tOitenta - 0.35)) * 40, width: 580, height: 300, padding: "40px 44px", opacity: surge(t, tOitenta - 0.35, 0.35) }}>
            <Numero valor={zippi.valorEstimado.valor} final={zippi.valorEstimado.rotulo} formato={fmtUsMi} tParada={tParada80} dur={tParada80 - tOitenta + 0.1} tamanho={104} tom="texto" escalaUnidade={0.5} em={tOitenta - 0.2} />
            <div style={{ ...titulo, fontSize: 40, marginTop: 30, color: "var(--cor-texto-2)" }}>valor estimado</div>
          </div>
          <div style={abs(1180, 714)}>
            <Selo tipo="estimativa" rotulo="Estimativa de terceiros (Dealroom)" em={tPal(f16.f, "estimativa") - 0.1} />
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reservatório: capital próprio × fundos (F017–F019)                  */
/* ------------------------------------------------------------------ */

const TANQUE = { x: 980, y: 250, w: 540, h: 610 };
const TETO_Y = 640;

function Reservatorio() {
  const { t } = useFilme();
  const f17 = useFrase("F017");
  const f18 = useFrase("F018");
  const f19 = useFrase("F019");
  const f20 = useFrase("F020");
  const base = TANQUE.y + TANQUE.h;
  // ponto → traço (F017) → superfície do líquido (F018)
  const tPonto = tPal(f17.f, "importa");
  const sPonto = mola(t, tPonto, 200, 18);
  const pTraco = ease.saida(prog(t, f17.tE, f17.tE + 0.6));
  const pDesce = ease.inOutCubic(prog(t, f18.t0 - 0.2, f18.t0 + 0.6));
  const vidaTanque = surge(t, f18.t0 - 0.05, 0.5) * some(t, f20.t0 - 0.15, 0.45);
  // nível do líquido
  const tSobe = tPal(f18.f, "emprestando");
  const tBate = f18.tE;
  const subir1 = ease.inCubic(prog(t, tSobe, tBate));
  const batida = t > tBate ? Math.sin((t - tBate) * 22) * Math.exp(-(t - tBate) * 6) * 10 : 0;
  const tCanos = f19.tE - 0.15;
  const subir2 = ease.inOutSine(prog(t, tCanos + 0.45, tPal(f19.f, "carteira") + 0.2));
  const nivel = mix(mix(base - 4, TETO_Y + 6, subir1) + Math.max(0, batida), 330, subir2);
  const tetoSai = ease.inOutCubic(prog(t, tCanos + 0.2, tCanos + 0.8));
  const flash = t > tBate ? Math.exp(-(t - tBate) * 3) : 0;
  const pCanos = ease.inOutCubic(prog(t, tCanos, tCanos + 0.7));
  const fluxo = (t * 140) % 40;
  const tCarteira = tPal(f19.f, "carteira");
  // traço da F017
  const tracoW = mix(18, 600, pTraco);
  const tracoX = mix(960 - tracoW / 2, TANQUE.x + 12, pDesce);
  const tracoY = mix(540, base - 10, pDesce);
  const tracoL = mix(tracoW, TANQUE.w - 24, pDesce);
  return (
    <>
      {sPonto > 0.001 && pDesce < 1 ? (
        <div style={abs(tracoX, tracoY - 9, { width: tracoL, height: 18 * (1 - 0.4 * pTraco), borderRadius: 9, background: COR.verde, transform: `scale(${pTraco > 0 ? 1 : sPonto.toFixed(4)})`, boxShadow: `0 0 34px ${rgba("verde", 0.55)}`, opacity: 1 - pDesce * 0.9 })} />
      ) : null}
      {vidaTanque > 0.002 ? (
        <div className="absolute inset-0" style={{ opacity: vidaTanque }}>
          {/* canos do fundo (F019): entram da direita */}
          {[360, 460].map((y, k) => {
            const w = (1920 - (TANQUE.x + TANQUE.w)) * pCanos;
            return (
              <div key={k} style={abs(1920 - w, y, { width: w, height: 34, borderRadius: "17px 0 0 17px", background: "linear-gradient(180deg, rgb(70 79 92), rgb(44 51 61))", border: "1.5px solid rgb(139 149 161 / 0.6)", overflow: "hidden" })}>
                <div style={{ position: "absolute", left: -40 + fluxo, top: 13, right: 0, height: 8, backgroundImage: `repeating-linear-gradient(90deg, ${rgba("verde", 0.9)} 0 18px, transparent 18px 40px)`, opacity: ease.outCubic(prog(t, tCanos + 0.4, tCanos + 0.8)) }} />
              </div>
            );
          })}
          <div className="font-mono" style={abs(1600, 290, { fontSize: 34, fontWeight: 700, color: "var(--cor-cinza)", letterSpacing: "0.04em", opacity: surge(t, tCanos + 0.3, 0.4) })}>
            FIDC
          </div>
          {/* tanque */}
          <div style={abs(TANQUE.x, TANQUE.y, { width: TANQUE.w, height: TANQUE.h, borderRadius: 30, border: "3px solid rgb(242 244 247 / 0.28)", background: "rgb(22 27 34 / 0.6)", overflow: "hidden", boxShadow: "0 40px 90px -40px rgb(0 0 0 / 0.9)" })}>
            <div style={{ position: "absolute", left: 0, right: 0, top: nivel - TANQUE.y, bottom: 0, background: `linear-gradient(180deg, ${rgba("verde", 0.95)} 0%, ${rgba("verde", 0.55)} 100%)`, boxShadow: `0 -10px 40px ${rgba("verde", 0.35)}` }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: "rgb(255 255 255 / 0.45)" }} />
            </div>
            <div style={{ ...titulo, position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center", fontSize: 54, color: "var(--cor-tinta)", opacity: surge(t, tCarteira - 0.05, 0.4) }}>carteira</div>
          </div>
          {/* teto baixo do capital próprio */}
          <div style={abs(TANQUE.x - 40, TETO_Y - 4 - tetoSai * 120, { width: TANQUE.w + 80, height: 8, borderRadius: 4, background: COR.coral, boxShadow: `0 0 ${Math.round(18 + 40 * flash)}px ${rgba("coral", 0.4 + 0.5 * flash)}`, opacity: surge(t, f18.t0 + 0.3, 0.4) * (1 - tetoSai), transform: `scaleX(${ease.saida(prog(t, f18.t0 + 0.3, f18.t0 + 0.9)).toFixed(4)})` })} />
          <div className="font-mono" style={abs(TANQUE.x - 40, TETO_Y - 52 - tetoSai * 120, { fontSize: 28, fontWeight: 700, color: COR.coral, letterSpacing: "0.1em", textTransform: "uppercase", opacity: surge(t, f18.t0 + 0.6, 0.4) * (1 - tetoSai) })}>
            teto
          </div>
          {/* entrada de baixo (capital próprio) */}
          <div style={abs(TANQUE.x - 200 * ease.outCubic(prog(t, f18.t0 + 0.2, f18.t0 + 0.8)), base - 70, { width: 200 * ease.outCubic(prog(t, f18.t0 + 0.2, f18.t0 + 0.8)), height: 30, borderRadius: "15px 0 0 15px", background: "linear-gradient(180deg, rgb(70 79 92), rgb(44 51 61))", border: "1.5px solid rgb(139 149 161 / 0.5)", overflow: "hidden" })}>
            <div style={{ position: "absolute", left: -40 + fluxo, top: 11, width: 300, height: 8, backgroundImage: `repeating-linear-gradient(90deg, ${rgba("verde", 0.9)} 0 18px, transparent 18px 40px)`, opacity: 1 - ease.outCubic(prog(t, tBate, tBate + 0.6)) * 0.8 }} />
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* FIDC 66 / 80 / 220 → seta da Vapti (F020–F021)                      */
/* ------------------------------------------------------------------ */

const BASE_FIDC = 870;
const K_FIDC = 4.3 / 1e6; // px por real (geometria)
const XS_FIDC = [520, 900, 1280];
const W_FIDC = 150;
const SETA = { de: [250, 840] as [number, number], para: [1130, 486] as [number, number] };

function Fidc() {
  const { t } = useFilme();
  const f20 = useFrase("F020");
  const f21 = useFrase("F021");
  const ems = [tPal(f20.f, "Sessenta"), tPal(f20.f, "Oitenta"), tPal(f20.f, "Duzentos")];
  const paradas = [tPal(f20.f, "seis", 0, true), tPal(f20.f, "Oitenta", 0, true), tPal(f20.f, "vinte", 0, true)];
  const achata = ease.inOutCubic(prog(t, f21.t0 - 0.2, f21.t0 + 0.35));
  const funde = ease.inOutCubic(prog(t, f21.t0 + 0.2, f21.tE + 0.1));
  const ang = Math.atan2(SETA.para[1] - SETA.de[1], SETA.para[0] - SETA.de[0]);
  const vidaSeg = 1 - ease.inOutSine(prog(t, f21.tE + 0.25, f21.tE + 0.75));
  const rotulos = some(t, f21.t0 - 0.2, 0.35);
  return (
    <div className="absolute inset-0">
      {zippi.fidc.map((c, i) => {
        const s = spring(t - ems[i] + 0.05, { k: i === 2 ? 60 : 110, d: i === 2 ? 12 : 15 });
        if (s <= 0.001) return null;
        const h = c.valor.valor * K_FIDC * s;
        // destino: segmento da seta
        const fr = 0.18 + i * 0.3;
        const cxS = mix(SETA.de[0], SETA.para[0], fr);
        const cyS = mix(SETA.de[1], SETA.para[1], fr);
        const w = mix(mix(W_FIDC, 200, achata), 240, funde);
        const hh = mix(h, 16, achata);
        const cx = mix(XS_FIDC[i], cxS, funde);
        const cy = mix(mix(BASE_FIDC - h / 2, BASE_FIDC - 8, achata), cyS, funde);
        return (
          <div key={i}>
            <div
              style={abs(cx - w / 2, cy - hh / 2, {
                width: w,
                height: Math.max(0, hh),
                borderRadius: mix(10, 8, funde),
                border: `2px dashed rgb(139 149 161 / ${(0.9 * (1 - achata)).toFixed(3)})`,
                borderBottom: achata > 0 ? undefined : "none",
                background: achata > 0.02 ? rgba("verde", achata) : "repeating-linear-gradient(135deg, rgb(139 149 161 / 0.26) 0 2px, transparent 2px 11px)",
                boxShadow: achata > 0.02 ? `0 0 30px ${rgba("verde", 0.4 * achata)}` : undefined,
                transform: `rotate(${((ang * 180) / Math.PI) * funde}deg)`,
                opacity: vidaSeg,
              })}
            />
            <span className="font-mono" style={abs(XS_FIDC[i] - 100, BASE_FIDC + 16, { width: 200, textAlign: "center", fontSize: 28, fontWeight: 600, color: "var(--cor-texto-3)", opacity: surge(t, ems[i]) * rotulos })}>
              {c.ano}
            </span>
            <div style={i < 2 ? abs(XS_FIDC[i] - 160, BASE_FIDC - c.valor.valor * K_FIDC - 100, { width: 320, display: "flex", justifyContent: "center", opacity: rotulos }) : abs(XS_FIDC[i] + W_FIDC / 2 + 40, 360, { opacity: rotulos })}>
              <Numero valor={c.valor.valor} final={c.valor.rotulo} formato={fmtMi} tParada={paradas[i]} dur={Math.max(0.5, paradas[i] - ems[i])} tamanho={i < 2 ? 64 : 104} tom="texto" alinhar={i < 2 ? "centro" : "esquerda"} em={ems[i] - 0.05} />
            </div>
          </div>
        );
      })}
      <div style={abs(120, 930, { opacity: rotulos })}>
        <Rotulo texto="FIDC: captações da Zippi" em={f20.t0 + 0.3} tom="texto" tamanho={28} />
      </div>
      <Seta de={SETA.de} para={SETA.para} curvatura={-0.08} em={f21.tE - 0.05} dur={0.7} tom="verde" espessura={12} cabeca={38} />
      {t > f21.tE ? <Halo tom="verde" x={1330} y={440} w={900} h={520} intensidade={0.18 * surge(t, f21.tE + 0.2, 0.6)} /> : null}
      <div style={abs(1180, 400)}>
        {t > f21.tE + 0.1 ? <MarcaVapti tamanho={150} em={f21.tE + 0.15} /> : null}
      </div>
      <div style={abs(1186, 600, { ...eyebrow, opacity: surge(t, f21.tE + 0.7, 0.4) })}>o caminho</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ato                                                                  */
/* ------------------------------------------------------------------ */

export default function Ato2() {
  const { t } = useFilme();
  const f10 = useFrase("F010");
  const f11 = useFrase("F011");
  const f13 = useFrase("F013");
  const f14 = useFrase("F014");
  const f15 = useFrase("F015");
  const f16 = useFrase("F016");
  const f17 = useFrase("F017");
  const f18 = useFrase("F018");
  const f19 = useFrase("F019");
  const f20 = useFrase("F020");
  const f21 = useFrase("F021");
  const luz = ease.inOutSine(prog(t, f10.tE - 0.2, f10.tE + 1.2));
  const chao = 1 - 0.6 * ease.inOutSine(prog(t, f17.t0, f17.t0 + 1.2));
  return (
    <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }}>
      <Camera
        chaves={[
          { t: f10.t0 - 0.6, zoom: 1.0 },
          { t: f11.t0, zoom: 1.02, y: -4 },
          { t: f13.tProxima, zoom: 1.035, x: 30 },
          { t: f14.tProxima, zoom: 1.05, x: 40, y: -10 },
          { t: f15.tProxima, zoom: 1.0, x: 0, y: 0 },
          { t: f17.tE, zoom: 1.06 },
          { t: f18.t0 + 0.4, zoom: 1.0 },
          { t: f19.tProxima, zoom: 1.03, x: 20 },
          { t: f20.t0 + 0.6, zoom: 1.0, x: 0, y: 0 },
          { t: tPal(f20.f, "Duzentos"), zoom: 1.0, y: 0 },
          { t: tPal(f20.f, "vinte") + 0.6, zoom: 1.03, y: -34 },
          { t: f21.t0 + 0.3, zoom: 1.0, y: 0 },
          { t: f21.t1 + 1.2, zoom: 1.04, x: 20, y: -6 },
        ]}
        deriva={4}
        seed={21}
      >
        <Camada z={3}>
          <Respiracao tom="azul" x={960} y={330} raio={900} intensidade={0.09 * luz} periodo={8} achatar={0.5} />
          <Halo tom="texto" x={960} y={HORIZONTE} w={2400} h={300} intensidade={0.06 * luz * (1 - 0.6 * ease.inOutSine(prog(t, f11.tE, f11.tE + 1)))} />
        </Camada>
        <Camada z={1.2} opacidade={chao}>
          <Grade tipo="chao" em={f10.tE + 0.15} dur={1.6} horizonte={HORIZONTE} deriva={10} opacidade={1.1} />
        </Camada>
        <Camada z={0}>
          <LinhaTempo />
          <ChaveL2 eyebrow="a referência" titulo="Zippi" em={f11.tE} emTitulo={tPal(f11.f, "Zippi") - 0.1} saida={f14.t0 - 0.2} tom="cinza" tomDestaque="cinza" tamanho={150} top={330} />
          <Plano de={f15.t0 - 0.3} ate={f18.t0} entrada={0.4} saida={0.3}>
            <ZippiHoje />
          </Plano>
          <ChaveL2 titulo="Zippi" em={f16.t0 + 0.3} emTitulo={f16.t0 + 0.3} saida={f17.t0 + 0.05} tom="cinza" tomDestaque="cinza" tamanho={120} top={470} />
          <Plano de={f17.t0} ate={f20.t0 + 0.4} entrada={0.2} saida={0.4}>
            <Reservatorio />
          </Plano>
          <ChaveL2 eyebrow="Capital próprio" titulo="tem teto" em={f18.t0 + 0.1} emTitulo={tPal(f18.f, "próprio") - 0.4} saida={f19.t0 - 0.1} destaque="teto" tomDestaque="coral" tamanho={110} />
          <ChaveL2 eyebrow="FIDC" titulo="fundos compram a carteira" em={f19.t0 + 0.05} emTitulo={f19.tE - 0.05} passo={0.16} saida={f20.t0 - 0.15} destaque="fundos" tamanho={92} />
          <Plano de={f20.t0 - 0.1} ate={Infinity} entrada={0.3}>
            <Fidc />
          </Plano>
        </Camada>
      </Camera>
    </div>
  );
}
