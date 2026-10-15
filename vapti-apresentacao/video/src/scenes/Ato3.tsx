/**
 * Ato 3 — O produto (F022–F031). Celular com dados fictícios (selo Protótipo fora do aparelho).
 * F022: o celular entra pela direita, tela apagada · F023: "Seu limite" e o toque em Sacar R$ 400.
 * F024: conversa com balões genéricos e um áudio com forma de onda · F025: link → plataforma com a
 * barra de 7 etapas até o Pix · F026: proposta (recebe, paga, quando; taxa = efetiva = juros; credora).
 * F027/F028: V08 — R$ 400 vira 4 blocos de R$ 100 + R$ 20 num calendário; depois 14 dias de R$ 31,43.
 * F029/F030: V09 — Pix Automático: autoriza uma vez; tentativas 1 ✕, 2 ✕, 3 ✓.
 * F031: o limite volta e cresce (a coluna reenche e sobe, sem número novo).
 */
import { Check, X } from "lucide-react";
import { prototipo } from "../../../src/content/ui";
import { preco, produto } from "../../../src/data/vapti";
import { Camada, Camera, CelularMoldura, COR, ease, Halo, prog, Respiracao, rgba, Rotulo, Selo, spring, useFilme, useFrase } from "../kit";
import { etapaEm, TelaConversa, TelaJornada, TelaLimite, TelaLimiteCresce, TelaProposta, Toque } from "./atos1a3/celular";
import { abs, ChaveL2, mix, mola, Plano, some, surge, tPal } from "./atos1a3/comum";

export const frases: string[] = ["F022", "F023", "F024", "F025", "F026", "F027", "F028", "F029", "F030", "F031"];

const CEL = { x: 1190, y: 132, largura: 370 };
const tit = { fontFamily: "var(--fonte-titulo)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02 } as const;
const mono = { fontFamily: "var(--fonte-mono)", fontVariantNumeric: "tabular-nums", fontWeight: 700, letterSpacing: "-0.04em" } as const;

/** Troca de tela por deslize horizontal dentro do aparelho. */
function Troca({ de, ate, children }: { de: number; ate: number; children: React.ReactNode }) {
  const { t } = useFilme();
  const a = ease.inOutCubic(prog(t, de - 0.3, de));
  const b = ease.inOutCubic(prog(t, ate - 0.3, ate));
  if (a <= 0 || b >= 1) return null;
  const x = (1 - a) * 380 - b * 380;
  return <div className="absolute inset-0" style={{ transform: `translate(${x.toFixed(1)}px, 0)`, opacity: Math.min(a, 1 - b) * 0.6 + 0.4 }}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Celular da jornada (F022–F026)                                       */
/* ------------------------------------------------------------------ */

function CelularJornada() {
  const { t } = useFilme();
  const f22 = useFrase("F022");
  const f23 = useFrase("F023");
  const f24 = useFrase("F024");
  const f25 = useFrase("F025");
  const f26 = useFrase("F026");
  const f27 = useFrase("F027");
  const entra = spring(t - f22.t0 + 0.55, { k: 90, d: 17 });
  const sai = ease.inOutCubic(prog(t, f27.t0 - 0.2, f27.t0 + 0.5));
  if (sai >= 1) return null;
  const acende = surge(t, f23.t0 + 0.05, 0.5);
  const tLink = tPal(f25.f, "link");
  const tToqueLink = tLink + 0.5;
  const tA = tPal(f25.f, "tela");
  const tB = tPal(f25.f, "Pix");
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${((1 - entra) * 760 + sai * 900).toFixed(1)}px, 0)` }}>
      <CelularMoldura em={f22.t0 - 0.55} x={CEL.x} y={CEL.y} largura={CEL.largura} giro={-6} brilho={0.35 + 0.25 * acende}>
        <div className="absolute inset-0" style={{ opacity: acende }}>
          <Troca de={f23.t0 + 0.05} ate={f24.t0 + 0.15}>
            <TelaLimite tSaca={f23.tE} />
          </Troca>
          <Troca de={f24.t0 + 0.15} ate={tToqueLink + 0.35}>
            <TelaConversa tGrava={tPal(f24.f, "mensagem")} tAudio={f24.tE} tResposta={f25.t0 + 0.1} tLink={tLink} tToqueLink={tToqueLink} />
          </Troca>
          <Troca de={tToqueLink + 0.35} ate={f26.t0 + 0.1}>
            <TelaJornada tA={tA} tB={tB} tConta={tPal(f25.f, "conta")} />
          </Troca>
          <Troca de={f26.t0 + 0.1} ate={Infinity}>
            <TelaProposta tRecebe={tPal(f26.f, "recebe")} tPaga={tPal(f26.f, "paga")} tQuando={tPal(f26.f, "quando")} tTaxa={f26.tE} />
          </Troca>
        </div>
      </CelularMoldura>
    </div>
  );
}

/** Lado esquerdo da F025: nome da etapa, n/7 e a barra grande de 7 segmentos. */
function EtapasGrandes() {
  const { t } = useFilme();
  const f25 = useFrase("F025");
  const f26 = useFrase("F026");
  const tA = tPal(f25.f, "tela");
  const tB = tPal(f25.f, "Pix");
  const vida = Math.min(surge(t, tA - 0.5, 0.4), some(t, f26.t0 - 0.1, 0.4));
  if (vida <= 0) return null;
  const { n } = etapaEm(t, tA, tB);
  const nome = produto.jornada7[n - 1];
  const tN = tA + ((tB - tA) / 6) * (n - 1);
  const pNome = ease.outExpo(prog(t, tN, tN + 0.35));
  const fim = n === 7;
  return (
    <div style={abs(120, 330, { width: 900, opacity: vida })}>
      <div style={{ ...mono, fontSize: 34, color: "var(--cor-texto-2)", fontWeight: 600 }}>
        {n}/{produto.jornada7.length}
      </div>
      <div style={{ height: 116, overflow: "hidden", marginTop: 10 }}>
        <div style={{ ...tit, fontSize: 100, color: fim ? COR.verde : "var(--cor-texto)", transform: `translate(0, ${((1 - pNome) * 100).toFixed(1)}%)`, textShadow: fim ? `0 0 30px ${rgba("verde", 0.35)}` : undefined, whiteSpace: "nowrap" }}>{nome}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 34, width: 860 }}>
        {produto.jornada7.map((_, i) => {
          const tI = tA + ((tB - tA) / 6) * i;
          const f = ease.outCubic(prog(t, tI - 0.15, tI + 0.15));
          return (
            <div key={i} style={{ flex: 1, height: 22, borderRadius: 11, background: "var(--cor-superficie-3)", overflow: "hidden" }}>
              <div style={{ width: `${(100 * f).toFixed(1)}%`, height: "100%", background: COR.verde, boxShadow: `0 0 18px ${rgba("verde", 0.5)}` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** F026: Recebe · Paga · Quando, cada palavra na sua vez. */
function RecebePagaQuando() {
  const { t } = useFilme();
  const f26 = useFrase("F026");
  const f27 = useFrase("F027");
  const ts = [tPal(f26.f, "recebe"), tPal(f26.f, "paga"), tPal(f26.f, "quando")];
  const vida = some(t, f27.t0 - 0.2, 0.4);
  if (t < f26.t0 || vida <= 0) return null;
  const atual = ts.filter((x) => t >= x).length - 1;
  return (
    <div style={abs(120, 270, { opacity: vida })}>
      <div className="flex items-center" style={{ gap: 16, marginBottom: 30, opacity: surge(t, f26.tE - 0.1, 0.4) }}>
        <span style={{ width: 36, height: 8, borderRadius: 2, background: COR.verde, transform: "skewX(-24deg)" }} />
        <span style={{ fontFamily: "var(--fonte-texto)", fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cor-texto-2)" }}>antes de aceitar</span>
      </div>
      {["Recebe", "Paga", "Quando"].map((w, i) => {
        const p = prog(t, ts[i] - 0.05, ts[i] + 0.5);
        const ativo = i === atual;
        return (
          <div key={w} style={{ height: 132, overflow: "hidden" }}>
            <div style={{ ...tit, fontSize: 120, color: ativo ? COR.verde : "var(--cor-texto)", opacity: p > 0 ? (ativo ? 1 : 0.55) : 0, transform: `translate(0, ${((1 - ease.outExpo(p)) * 105).toFixed(1)}%)`, textShadow: ativo ? `0 0 30px ${rgba("verde", 0.3)}` : undefined }}>{w}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V08 — planos de pagamento (F027–F028)                                */
/* ------------------------------------------------------------------ */

const CAL = { x0: 380, larg: 1160, gap: 40, topoBarra: 300, alturaBarra: 96, base: 770, hValor: 240, hJuros: 52 };
const colW = (CAL.larg - 3 * CAL.gap) / 4;

function Planos() {
  const { t } = useFilme();
  const f27 = useFrase("F027");
  const f28 = useFrase("F028");
  const f29 = useFrase("F029");
  const ex = preco.exemplo;
  const pd = preco.planoDiario.find((p) => p.dias === produto.planoDiarioRecomendado) ?? preco.planoDiario[1];
  const t400 = tPal(f27.f, "quatrocentos");
  const tDivide = f27.tE - 0.05;
  const tDatas = tPal(f27.f, "semanais");
  const tJuros = tPal(f27.f, "cento");
  const t120 = tPal(f27.f, "vinte");
  const tPlano = tPal(f28.f, "plano");
  const tGrade = f28.tE - 0.05;
  const tTrinta = tPal(f28.f, "trinta");
  const saiSemanal = ease.inOutCubic(prog(t, tGrade - 0.55, tGrade + 0.05));
  const vidaTudo = some(t, f29.t0 - 0.25, 0.45);
  const pBarra = ease.saida(prog(t, t400 - 0.05, t400 + 0.55));
  const valor = ex.amortizacao;
  const n = produto.parcelasSemanais.valor;
  const titulo1 = `${ex.sacado.rotulo} → ${n} × ${ex.parcela.rotulo} por semana`;
  const titulo2 = `Plano de ${pd.dias} dias: ${pd.parcela.rotulo} por dia`;
  const trocaTitulo = ease.inOutCubic(prog(t, tPlano - 0.1, tPlano + 0.45));
  return (
    <div className="absolute inset-0" style={{ opacity: vidaTudo }}>
      {/* título no alto (fora da faixa da legenda) */}
      <div style={abs(120, 150, { height: 84, overflow: "hidden", width: 1680 })}>
        <div style={{ ...tit, position: "absolute", left: 0, top: 0, fontSize: 64, color: "var(--cor-texto)", transform: `translate(0, ${(-trocaTitulo * 100).toFixed(1)}px)`, opacity: surge(t, tDivide + 0.2, 0.5) }}>{titulo1}</div>
        <div style={{ ...tit, position: "absolute", left: 0, top: 0, fontSize: 64, color: "var(--cor-texto)", transform: `translate(0, ${((1 - trocaTitulo) * 100).toFixed(1)}px)` }}>{titulo2}</div>
      </div>
      {/* semanal: R$ 400 que se divide em 4 blocos de R$ 100 + R$ 20 */}
      {saiSemanal < 1
        ? Array.from({ length: n }, (_, i) => {
            const d = ease.inOutCubic(prog(t, tDivide + i * 0.08, tDivide + 0.7 + i * 0.08));
            const xA = CAL.x0 + (i * CAL.larg) / n;
            const wA = CAL.larg / n;
            const xB = CAL.x0 + i * (colW + CAL.gap);
            const x = mix(xA, xB, d);
            const w = mix(wA, colW, d);
            const y = mix(CAL.topoBarra, CAL.base - CAL.hValor, d);
            const h = mix(CAL.alturaBarra, CAL.hValor, d);
            const sJ = spring(t - tJuros - i * 0.1, { k: 220, d: 18 });
            const p120 = surge(t, t120 + i * 0.07, 0.3);
            const datas = surge(t, tDatas + i * 0.07, 0.35);
            const cair = saiSemanal * 60;
            return (
              <div key={i} style={{ opacity: (1 - saiSemanal) * pBarra, transform: `translate(0, ${cair.toFixed(1)}px)` }}>
                {/* moldura do calendário */}
                <div style={abs(xB - 10, CAL.base - CAL.hValor - CAL.hJuros - 120, { width: colW + 20, height: CAL.hValor + CAL.hJuros + 186, borderRadius: 22, border: "1.5px solid rgb(255 255 255 / 0.09)", background: "rgb(22 27 34 / 0.55)", opacity: datas })} />
                <div style={abs(xB, CAL.base + 16, { width: colW, textAlign: "center", ...mono, fontSize: 30, fontWeight: 600, color: "var(--cor-texto-2)", opacity: datas })}>{prototipo.ficticio.vencimentos[i]}</div>
                {/* juros por cima */}
                {sJ > 0.001 ? (
                  <div style={abs(xB, CAL.base - CAL.hValor - CAL.hJuros * sJ - 4, { width: colW, height: CAL.hJuros * Math.min(1.1, sJ), borderRadius: 10, background: COR.verde, display: "grid", placeItems: "center", boxShadow: `0 0 24px ${rgba("verde", 0.35)}` })}>
                    <span style={{ ...mono, fontSize: 28, color: "var(--cor-tinta)", opacity: Math.min(1, sJ) }}>+ {ex.jurosParcela.rotulo}</span>
                  </div>
                ) : null}
                {/* bloco: R$ 400 (verde) → R$ 100 (azul) — só depois da divisão */}
                {t < tDivide ? null : <div style={abs(x + (d > 0 ? 0 : i === 0 ? 0 : 0), y, { width: w - (d > 0.01 ? 0 : 0), height: h, borderRadius: d > 0 ? 12 : i === 0 ? "14px 0 0 14px" : i === n - 1 ? "0 14px 14px 0" : 0, background: d > 0 ? `color-mix(in srgb, var(--cor-azul) ${(100 * d).toFixed(1)}%, var(--cor-verde))` : COR.verde, boxShadow: d < 1 ? `0 0 40px ${rgba("verde", 0.3 * (1 - d))}` : undefined, display: "grid", placeItems: "center", transformOrigin: "left center", transform: d > 0 ? undefined : `scaleX(${pBarra.toFixed(4)})` })}>
                  <span style={{ ...mono, fontSize: 36, color: "var(--cor-tinta)", opacity: surge(t, tDivide + 0.4, 0.3) }}>{valor.rotulo}</span>
                </div>}
                <div style={abs(xB, CAL.base - CAL.hValor - CAL.hJuros - 86, { width: colW, textAlign: "center", ...mono, fontSize: 48, color: "var(--cor-texto)", opacity: p120, transform: `scale(${(0.9 + 0.1 * mola(t, t120 + i * 0.07, 260, 16)).toFixed(4)})` })}>{ex.parcela.rotulo}</div>
              </div>
            );
          })
        : null}
      {/* a barra inteira de R$ 400 antes de dividir (traço vupt que cresce) */}
      {t < tDivide && pBarra > 0 ? (
        <div style={abs(CAL.x0, CAL.topoBarra, { width: CAL.larg, height: CAL.alturaBarra, borderRadius: 14, background: COR.verde, boxShadow: `0 0 50px ${rgba("verde", 0.35)}`, transform: `scaleX(${pBarra.toFixed(4)})`, transformOrigin: "left center", display: "grid", placeItems: "center" })}>
          <span style={{ ...mono, fontSize: 60, color: "var(--cor-tinta)", opacity: surge(t, t400 + 0.25, 0.3) }}>{ex.sacado.rotulo}</span>
        </div>
      ) : null}
      {/* linha de honestidade: taxa = efetiva = juros em reais */}
      <div style={abs(0, 864, { width: 1920, textAlign: "center", fontFamily: "var(--fonte-texto)", fontWeight: 700, fontSize: 34, color: "var(--cor-texto-2)", opacity: surge(t, t120 + 0.35, 0.4) * (1 - saiSemanal) })}>
        {ex.taxa.rotulo} por semana = <span style={{ color: "var(--cor-texto)" }}>{ex.efetivaMes.rotulo} ao mês</span> = <span style={{ color: "var(--cor-texto)" }}>{ex.juros.rotulo} de juros</span>
      </div>
      {/* diário: grade de 14 dias */}
      {t > tGrade - 0.1
        ? Array.from({ length: pd.dias }, (_, i) => {
            const col = i % 7;
            const lin = Math.floor(i / 7);
            const L = 150;
            const g = 16;
            const x = 960 - (7 * L + 6 * g) / 2 + col * (L + g);
            const y = 360 + lin * (L + g + 10);
            const s = spring(t - tGrade - i * 0.05, { k: 240, d: 19 });
            if (s <= 0.001) return null;
            return (
              <div key={i} style={abs(x, y, { width: L, height: L, borderRadius: 16, background: rgba("azul", 0.14), border: `1.5px solid ${rgba("azul", 0.45)}`, transform: `scale(${(0.6 + 0.4 * s).toFixed(4)})`, opacity: Math.min(1, s * 2), overflow: "hidden" })}>
                <div style={{ height: Math.round(L * (pd.juros.valor / (preco.base.valor + pd.juros.valor))), background: COR.verde }} />
                <div style={{ position: "absolute", left: 14, top: 22, ...mono, fontSize: 24, fontWeight: 600, color: "var(--cor-texto-3)" }}>{i + 1}</div>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", ...mono, fontSize: 30, color: "var(--cor-texto)" }}>{pd.parcela.rotulo}</div>
              </div>
            );
          })
        : null}
      <div style={abs(0, 760, { width: 1920, textAlign: "center", fontFamily: "var(--fonte-texto)", fontWeight: 700, fontSize: 34, color: "var(--cor-texto-2)", opacity: surge(t, tTrinta + 0.1, 0.4) })}>
        <span style={{ color: "var(--cor-texto)" }}>{pd.juros.rotulo} de juros</span> = <span style={{ color: "var(--cor-texto)" }}>{pd.efetivaMes.rotulo} ao mês</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V09 — Pix Automático (F029–F030)                                     */
/* ------------------------------------------------------------------ */

function PixAutomatico() {
  const { t } = useFilme();
  const f29 = useFrase("F029");
  const f30 = useFrase("F030");
  const f31 = useFrase("F031");
  const tToque = f29.tE;
  const vira = ease.inOutCubic(prog(t, tToque + 0.3, tToque + 0.8));
  const sobe = ease.inOutCubic(prog(t, f30.t0 - 0.1, f30.t0 + 0.6));
  const tUma = tPal(f30.f, "uma");
  const pulso = t > tUma ? Math.exp(-(t - tUma) * 2.5) : 0;
  const tTenta = tPal(f30.f, "tenta");
  const tentativas = [tTenta, (tTenta + f30.tE) / 2, f30.tE];
  const vida = some(t, f31.t0 - 0.3, 0.4);
  const entra = spring(t - f29.t0 - 0.15, { k: 160, d: 18 });
  const aperta = t > tToque && t < tToque + 0.22 ? 0.96 : 1;
  const cx = 1190;
  const yBotao = mix(470, 290, sobe);
  const wBotao = mix(760, 420, vira);
  return (
    <div className="absolute inset-0" style={{ opacity: vida * Math.min(1, entra * 1.5) }}>
      <Halo tom="verde" x={cx} y={yBotao + 60} w={1000} h={500} intensidade={0.12 + 0.12 * pulso + 0.1 * vira} />
      <div style={abs(cx - wBotao / 2, yBotao + (1 - entra) * 60, { width: wBotao, height: 120, borderRadius: 999, background: vira < 0.5 ? COR.verde : rgba("verde", 0.12), border: `3px solid ${COR.verde}`, display: "grid", placeItems: "center", transform: `scale(${aperta})`, boxShadow: `0 20px 50px -15px ${rgba("verde", 0.5)}, 0 0 ${Math.round(30 + 60 * pulso)}px ${rgba("verde", 0.2 + 0.5 * pulso)}` })}>
        {vira < 0.5 ? (
          <span style={{ fontFamily: "var(--fonte-texto)", fontSize: 42, fontWeight: 800, color: "var(--cor-tinta)", opacity: 1 - vira * 2, whiteSpace: "nowrap" }}>{prototipo.etapas.lista[5].botao}</span>
        ) : (
          <span className="flex items-center" style={{ gap: 16, fontFamily: "var(--fonte-texto)", fontSize: 44, fontWeight: 800, color: COR.verde, opacity: (vira - 0.5) * 2, whiteSpace: "nowrap" }}>
            <Check size={46} strokeWidth={3} /> Autorizado
          </span>
        )}
      </div>
      <Toque x={cx + 120} y={yBotao + 60} em={tToque} />
      {/* tentativas: 1 ✕, 2 ✕, 3 ✓ */}
      {t > f30.t0 ? (
        <>
          <svg width={1920} height={1080} className="absolute inset-0" style={{ overflow: "visible" }}>
            <path d={`M${cx} ${yBotao + 120} L${cx} 520 M${cx - 330} 600 L${cx + 330} 600`} stroke="rgb(242 244 247 / 0.25)" strokeWidth={3} strokeDasharray="8 10" fill="none" opacity={surge(t, tTenta - 0.6, 0.5)} />
          </svg>
          {tentativas.map((em, i) => {
            const x = cx - 330 + i * 330;
            const ok = i === 2;
            const s = spring(t - em, { k: 260, d: 17 });
            const aparece = surge(t, tTenta - 0.6 + i * 0.12, 0.35);
            const cor = ok ? "verde" : "coral";
            return (
              <div key={i}>
                <div style={abs(x - 70, 530, { width: 140, height: 140, borderRadius: 999, border: `4px solid ${s > 0.05 ? COR[cor] : "rgb(242 244 247 / 0.25)"}`, background: s > 0.05 ? rgba(cor, ok ? 0.9 * Math.min(1, s) : 0.12) : "var(--cor-tinta)", display: "grid", placeItems: "center", opacity: aparece, boxShadow: s > 0.05 ? `0 0 40px ${rgba(cor, 0.35)}` : undefined })}>
                  {s > 0.02 ? (
                    <div style={{ transform: `scale(${(0.4 + 0.6 * s).toFixed(4)})`, color: ok ? "var(--cor-tinta)" : COR.coral }}>{ok ? <Check size={76} strokeWidth={3.2} /> : <X size={76} strokeWidth={3.2} />}</div>
                  ) : (
                    <span style={{ ...mono, fontSize: 52, color: "var(--cor-texto-2)" }}>{i + 1}</span>
                  )}
                </div>
                <div style={abs(x - 60, 690, { width: 120, textAlign: "center", ...mono, fontSize: 30, color: "var(--cor-texto-3)", opacity: aparece })}>{i + 1}</div>
                {ok ? <div style={abs(x - 100, 736, { width: 200, textAlign: "center", fontFamily: "var(--fonte-texto)", fontSize: 34, fontWeight: 800, color: COR.verde, opacity: surge(t, em + 0.2, 0.3) })}>Pago</div> : null}
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ato                                                                  */
/* ------------------------------------------------------------------ */

export default function Ato3() {
  const { t } = useFilme();
  const f22 = useFrase("F022");
  const f23 = useFrase("F023");
  const f24 = useFrase("F024");
  const f25 = useFrase("F025");
  const f26 = useFrase("F026");
  const f27 = useFrase("F027");
  const f28 = useFrase("F028");
  const f29 = useFrase("F029");
  const f30 = useFrase("F030");
  const f31 = useFrase("F031");
  const tCresce = f31.tE;
  const focoCel: [number, number] = [CEL.x + 192, CEL.y + 410];
  const cresceLuz = t > tCresce ? 1 - Math.exp(-(t - tCresce) * 2) : 0;
  return (
    <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }}>
      <Camera
        foco={focoCel}
        chaves={[
          { t: f22.t0 - 0.6, zoom: 1.0 },
          { t: f24.t0, zoom: 1.03, x: 10 },
          { t: f24.t1 + 0.2, zoom: 1.06, x: 16 },
          { t: f25.t0 + 0.6, zoom: 1.0, x: 0 },
          { t: f26.t0, zoom: 1.0 },
          { t: tPal(f26.f, "recebe"), zoom: 1.14, y: -30 },
          { t: f26.t1 + 0.2, zoom: 1.17, y: -42 },
          { t: f27.t0 + 0.4, zoom: 1.0, y: 0 },
          { t: f28.tProxima, zoom: 1.03, y: 0 },
          { t: f29.t0 + 0.6, zoom: 1.0 },
          { t: f30.tProxima, zoom: 1.03 },
          { t: f31.t0 + 0.5, zoom: 1.0 },
          { t: f31.t1 + 1, zoom: 1.04 },
        ]}
        deriva={3}
        seed={33}
      >
        <Camada z={2.5}>
          <Respiracao tom="verde" x={focoCel[0]} y={focoCel[1]} raio={620} intensidade={0.07 + 0.08 * cresceLuz} periodo={7} />
          <Respiracao tom="azul" x={520} y={420} raio={700} intensidade={0.05} periodo={9} />
        </Camada>
        <Camada z={0}>
          <CelularJornada />
          <Plano de={f27.t0 - 0.1} ate={f29.t0 + 0.2} entrada={0.3} saida={0.45}>
            <Planos />
          </Plano>
          <Plano de={f29.t0 - 0.2} ate={f31.t0 + 0.2} entrada={0.3} saida={0.45}>
            <PixAutomatico />
          </Plano>
          {t > f31.t0 - 0.1 ? (
            <CelularMoldura em={f31.t0 - 0.02} x={CEL.x} y={CEL.y} largura={CEL.largura} giro={-6} brilho={0.4 + 0.4 * cresceLuz}>
              <TelaLimiteCresce tVolta={tPal(f31.f, "volta")} tCresce={tCresce} />
            </CelularMoldura>
          ) : null}
        </Camada>
      </Camera>
      {/* selo Protótipo fora do aparelho */}
      <div style={abs(CEL.x - 200, 880, { opacity: Math.max(envelopeSelo(t, f23.t0, f27.t0), envelopeSelo(t, f31.t0, Infinity)) })}>
        <Selo tipo="prototipo" />
      </div>
      {/* chaves à esquerda (fixas, fora da câmera) */}
      <ChaveL2 titulo="Limite rotativo" em={tPal(f23.f, "limite") - 0.1} emTitulo={tPal(f23.f, "limite") - 0.1} passo={0.4} saida={f24.t0 - 0.1} destaque="rotativo" tamanho={110} top={360} />
      <ChaveL2 eyebrow="Pedido por" titulo="mensagem ou áudio" em={tPal(f24.f, "pede")} tempos={[tPal(f24.f, "mensagem") - 0.05, (tPal(f24.f, "mensagem") + f24.tE) / 2, f24.tE - 0.05]} saida={f25.t0 + 0.4} destaque="áudio" tamanho={110} top={330} />
      <EtapasGrandes />
      {t > tPal(f25.f, "tela") - 0.5 && t < f26.t0 + 0.5 ? (
        <div style={abs(120, 930, { opacity: some(t, f26.t0, 0.35) })}>
          <Rotulo texto="7 etapas até o Pix" em={tPal(f25.f, "tela") - 0.3} tamanho={30} />
        </div>
      ) : null}
      <RecebePagaQuando />
      <ChaveL2 eyebrow="Banco Central" titulo="Pix Automático" em={f29.t0 + 0.1} tempos={[tPal(f29.f, "Pix") - 0.05, tPal(f29.f, "Automático", 1) - 0.05]} emTitulo={f29.tE - 0.2} saida={f30.t0 - 0.1} destaque="Automático" tamanho={110} />
      <ChaveL2 eyebrow="Se faltar saldo" titulo="até 3 novas tentativas" em={f30.t0 + 0.1} tempos={[tPal(f30.f, "até") - 0.05, f30.tE - 0.05, f30.tE + 0.1, f30.tE + 0.22]} saida={f31.t0 - 0.2} destaque="3" tamanho={100} />
      <ChaveL2 titulo="O limite volta e cresce" em={f31.t0} tempos={[tPal(f31.f, "o"), tPal(f31.f, "limite"), tPal(f31.f, "volta") - 0.05, tPal(f31.f, "E") - 0.05, tCresce - 0.05]} destaque={["volta", "cresce"]} tamanho={110} top={330} />
    </div>
  );
}

function envelopeSelo(t: number, de: number, ate: number): number {
  return Math.min(surge(t, de, 0.4), some(t, ate - 0.3, 0.4));
}
