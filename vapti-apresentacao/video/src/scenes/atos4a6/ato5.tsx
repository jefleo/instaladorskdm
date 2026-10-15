/**
 * Ato 5 — Estrutura (F042–F052). Tom sério, mais lento, quase só pad.
 *
 * Fio visual: "Dentro da lei" (F042) → três caminhos lado a lado (V12): empresa comum ✕,
 * ESC com três travas e teto ✕, BaaS ✓ (F043–F047) → o cartão BaaS se abre no fluxo (V13):
 * Vapti, instituição parceira credora, cessão da CCB, Pix Automático na conta da parceira
 * (F048–F051), com o carimbo da norma → o Brasil inteiro acende e a porta dos fundos se abre (F052).
 */
import type { CSSProperties, ReactNode } from "react";
import { BellRing, FileText, Lock, ScanSearch, Scale, Store, UserRound } from "lucide-react";
import { caminhos, config, estrutura, projeto } from "../../../../src/data/vapti";
import { Camada, Camera, ease, estadoFrase, Grade, lerp, Numero, prog, Respiracao, rgba, spring, Titulo, useFilme } from "../../kit";
import { caminhoBrasil, NATAL, projetar } from "./brasil";
import { Avatar, Cadeado, Check, dentro, ESTILO_EYEBROW, ESTILO_MONO, ESTILO_ROTULO, ESTILO_TITULO, Onda, poseEmChaves, Surge, tPal, vida, Xis } from "./comum";

export const frases: string[] = ["F042", "F043", "F044", "F045", "F046", "F047", "F048", "F049", "F050", "F051", "F052"];

/** "12% ao ano" → ["12%", "ao ano"]. */
const [USURA_NUM, USURA_UNID] = (() => {
  const r = caminhos.usuraAoAno.rotulo;
  const i = r.indexOf(" ");
  return [r.slice(0, i), r.slice(i + 1)];
})();

export default function Ato5() {
  const { t, tl } = useFilme();
  const F = (id: string) => estadoFrase(tl, id, t);
  const w = (id: string, p: string, k = 0) => tPal(tl, id, p, k);
  const f42 = F("F042");
  const f43 = F("F043");
  const f44 = F("F044");
  const f45 = F("F045");
  const f46 = F("F046");
  const f47 = F("F047");
  const f48 = F("F048");
  const f49 = F("F049");
  const f50 = F("F050");
  const f51 = F("F051");
  const f52 = F("F052");

  const camChaves = [
    { t: f42.t0 - 0.7, zoom: 1, x: 0, y: 0 },
    { t: f42.t1 + 0.6, zoom: 1.04 },
    { t: f43.t0 + 0.6, zoom: 1.0 },
    { t: f44.t1, zoom: 1.02, x: 6 },
    { t: f45.t1, zoom: 1.035, x: 0, y: -6 },
    { t: f47.t0 + 0.5, zoom: 1.0, y: 0 },
    { t: f48.t0 + 0.3, zoom: 1.0 },
    { t: f50.t1, zoom: 1.03 },
    { t: f51.tE, zoom: 1.02 },
    { t: f52.t0 + 0.3, zoom: 1.0 },
    { t: f52.t1 + 1.2, zoom: 1.04 },
  ];

  /* ---------- poses dos três cartões (V12) ---------- */
  const W0 = 480;
  const H0 = 560;
  const c1 = poseEmChaves(t, [
    { t: f43.t0, x: 140, y: 250, w: W0, h: H0, o: 1 },
    { t: f45.t0 - 0.1, x: 140, y: 250, w: W0, h: H0, o: 1 },
    { t: f45.t0 + 0.8, x: 60, y: 300, w: 400, h: 460, o: 0.4 },
    { t: f47.t0 - 0.1, x: 60, y: 300, w: 400, h: 460, o: 0.4 },
    { t: f47.t0 + 0.7, x: 150, y: 260, w: W0, h: H0, o: 0.5 },
    { t: f48.t0 - 0.2, x: 150, o: 0.5 },
    { t: f48.t0 + 0.25, x: -60, o: 0 },
  ]);
  const c2 = poseEmChaves(t, [
    { t: f44.t0, x: 720, y: 250, w: W0, h: H0, o: 1 },
    { t: f45.t0 - 0.1, x: 720, y: 250, w: W0, h: H0 },
    { t: f45.t0 + 0.8, x: 560, y: 250, w: 820, h: 600 },
    { t: f47.t0 - 0.1, x: 560, y: 250, w: 820, h: 600, o: 1 },
    { t: f47.t0 + 0.7, x: 720, y: 260, w: W0, h: H0, o: 0.5 },
    { t: f48.t0 - 0.2, x: 720, o: 0.5 },
    { t: f48.t0 + 0.25, x: 600, o: 0 },
  ]);
  const c3 = poseEmChaves(t, [
    { t: f47.t0, x: 1300, y: 260, w: W0, h: H0, o: 1 },
    { t: f48.t0 - 0.15, x: 1300, y: 260, w: W0, h: H0 },
    { t: f48.t0 + 0.7, x: 110, y: 170, w: 1700, h: 740 },
  ]);
  const tESC = w("F044", "Empresa");
  const travas = [
    { txt: "Sem pessoa física", em: w("F045", "pessoa"), fecha: w("F045", "física") + 0.15 },
    { txt: "Só a cidade", em: w("F045", "cidade") - 0.2, fecha: w("F045", "vizinhas") },
    { txt: "Sem fundos", em: f45.tE - 0.1, fecha: w("F045", "fundos") },
  ];
  const vidaTravasTexto = 1 - ease.inOutSine(prog(t, f47.t0, f47.t0 + 0.4));
  const tTeto = f46.t0 + 0.15;
  const vidaCartoes = dentro(t, f43.t0 - 0.5, f48.t0 + 0.8);

  return (
    <Camera chaves={camChaves} deriva={3} seed={5}>
      {/* ------------ fundo: sério, frio ------------ */}
      <Camada z={3}>
        <Grade tipo="quadriculado" passo={80} em={f42.t0} dur={2.2} opacidade={0.6} />
        <Respiracao tom="azul" x={960} y={500} raio={680} intensidade={0.09} periodo={9} />
        <Respiracao tom="verde" x={1540} y={520} raio={520} intensidade={0.12} periodo={7} opacidade={ease.outCubic(prog(t, f47.tE - 0.2, f47.tE + 0.8)) * (1 - prog(t, f48.t0, f48.t0 + 0.8))} />
      </Camada>

      {/* ------------ F042: dentro da lei ------------ */}
      {dentro(t, f42.t0 - 0.6, f43.t0 + 0.6) ? (
        <Camada z={0.2}>
          <DentroDaLei t={t} f42={{ t0: f42.t0, tE: f42.tE, pergunta: w("F042", "pergunta") }} saida={f43.t0 - 0.2} />
        </Camada>
      ) : null}

      {/* ------------ F043–F047: três caminhos ------------ */}
      {vidaCartoes ? (
        <Camada z={0}>
          {/* lugares vazios à espera (F043) */}
          {[720, 1300].map((x, i) => {
            const o = vida(t, f43.t0 + 0.4 + i * 0.15, (i === 0 ? f44.t0 : f47.t0) + 0.3, 0.6, 0.4) * 0.6;
            return o > 0.01 ? <div key={x} style={{ position: "absolute", left: x, top: 250, width: W0, height: H0, borderRadius: 24, border: "2px dashed rgb(242 244 247 / 0.14)", opacity: o }} /> : null;
          })}

          {/* 1 · Empresa comum */}
          {c1.o > 0.01 && t >= f43.t0 - 0.1 ? (
            <CartaoCaminho p={c1} em={f43.t0} t={t} tom="coral">
              <TituloCartao>Empresa comum</TituloCartao>
              <Surge em={w("F043", "lei") - 0.1} saida={f44.t0 + 0.2} dy={14} style={{ ...ESTILO_ROTULO, marginTop: 36 }}>
                juros limitados
              </Surge>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 10 }}>
                <Numero valor={caminhos.usuraAoAno.valor} final={USURA_NUM} formato="pct0" tParada={w("F043", "doze") + 0.3} dur={0.7} tamanho={150} tom="texto" em={w("F043", "limita")} escalaUnidade={0.6} brilho={0} />
                <Surge em={w("F043", "ao")} dy={10} style={{ ...ESTILO_ROTULO, fontSize: 38, color: "var(--cor-texto)" }}>
                  {USURA_UNID}
                </Surge>
              </div>
              <div style={{ position: "absolute", right: 28, top: 26 }}>
                <Xis em={w("F043", "ano") + 0.15} tamanho={84} />
              </div>
            </CartaoCaminho>
          ) : null}

          {/* 2 · ESC */}
          {c2.o > 0.01 && t >= f44.t0 - 0.1 ? (
            <CartaoCaminho p={c2} em={f44.t0 + 0.1} t={t} tom={t >= f46.tE ? "coral" : "azul"}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
                <TituloCartao tamanho={92}>ESC</TituloCartao>
              </div>
              <Surge em={tESC - 0.05} saida={f45.t0 + 0.1} dy={12} style={{ ...ESTILO_ROTULO, marginTop: 18, whiteSpace: "normal", width: 380 }}>
                Empresa Simples de Crédito
              </Surge>
              {/* "?" na ênfase "parecia" */}
              <Interrogacao t={t} em={f44.tE} saida={f45.t0 + 0.3} />
              {/* três travas, uma por fala */}
              <div style={{ position: "absolute", left: 48, top: 190, display: "flex", flexDirection: "column", gap: 34 }}>
                {travas.map((tr) =>
                  t >= tr.em - 0.05 ? (
                    <Surge key={tr.txt} em={tr.em} dx={-24} dy={0} style={{ display: "flex", alignItems: "center", gap: 26 }}>
                      <Cadeado fechar={ease.inOutCubic(prog(t, tr.fecha, tr.fecha + 0.28))} tamanho={70} />
                      <span style={{ ...ESTILO_TITULO, fontSize: 54, whiteSpace: "nowrap", opacity: vidaTravasTexto, color: t >= tr.fecha + 0.28 ? "var(--cor-texto)" : "var(--cor-texto-2)" }}>{tr.txt}</span>
                    </Surge>
                  ) : null,
                )}
              </div>
              <div style={{ position: "absolute", right: 28, top: 26 }}>{t >= f46.tE ? <Xis em={f46.tE} tamanho={84} /> : null}</div>
            </CartaoCaminho>
          ) : null}

          {/* F046: o teto que baixa sobre a ESC */}
          {dentro(t, tTeto, f47.t0 + 0.6) ? <Teto t={t} em={tTeto} c2={c2} saida={f47.t0} /> : null}

          {/* 3 · BaaS (vira a moldura do fluxo em F048) */}
          {t >= f47.tE - 0.15 && dentro(t, f47.t0, f52.t0) ? (
            <CartaoCaminho p={c3} em={f47.tE - 0.1} t={t} tom="verde" brilho={0.45 * (1 - prog(t, f48.t0, f48.t0 + 0.6))} moldura={ease.inOutCubic(prog(t, f48.t0 - 0.15, f48.t0 + 0.6))} saida={f52.t0 - 0.2}>
              <div style={{ opacity: 1 - prog(t, f48.t0 - 0.15, f48.t0 + 0.2) }}>
                <TituloCartao tamanho={92} cor="var(--cor-verde)">
                  BaaS
                </TituloCartao>
                <Surge em={w("F047", "Zippi") - 0.2} dy={12} style={{ ...ESTILO_ROTULO, fontSize: 38, marginTop: 30, color: "var(--cor-texto)" }}>
                  O modelo da <span style={{ color: "var(--cor-cinza)" }}>Zippi</span>
                </Surge>
                <div style={{ position: "absolute", right: 28, top: 26 }}>
                  <Check em={f47.tE + 0.1} tamanho={84} />
                </div>
              </div>
            </CartaoCaminho>
          ) : null}
        </Camada>
      ) : null}

      {/* ------------ F048–F051: fluxo BaaS ------------ */}
      {dentro(t, f48.t0 - 0.3, f52.t0 + 0.8) ? (
        <Camada z={0}>
          <Fluxo
            t={t}
            saida={f52.t0 - 0.15}
            tm={{
              f48: f48.t0,
              chips: [w("F048", "cliente"), w("F048", "análise"), w("F048", "cobrança")],
              parceira: w("F049", "instituição"),
              autorizada: f49.tE,
              credora: w("F049", "Central"),
              emite: w("F049", "emite"),
              libera: w("F049", "libera"),
              compra: f50.tE,
              credito: w("F050", "crédito"),
              capital: w("F050", "capital"),
              f51: f51.t0,
              regulamentado: f51.tE,
            }}
          />
        </Camada>
      ) : null}

      {/* ------------ F052: Brasil inteiro, PF e MEI, porta para os fundos ------------ */}
      {dentro(t, f52.t0 - 0.4, f52.tProxima + 1) ? (
        <Camada z={0}>
          <Nacional t={t} tm={{ t0: f52.t0, brasil: w("F052", "Brasil"), pessoa: w("F052", "pessoa"), mei: w("F052", "MEI"), tE: f52.tE, fundos: w("F052", "fundos") }} />
        </Camada>
      ) : null}
    </Camera>
  );
}

/* ================================================================== */
/* Peças                                                               */
/* ================================================================== */

function DentroDaLei({ t, f42, saida }: { t: number; f42: { t0: number; tE: number; pergunta: number }; saida: number }) {
  const q = ease.inOutSine(prog(t, saida, saida + 0.5));
  const pBal = ease.saida(prog(t, f42.t0 - 0.1, f42.t0 + 1.4));
  const sub = ease.saida(prog(t, f42.tE + 0.5, f42.tE + 1.1));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - q, transform: `translate(0, ${(-40 * q).toFixed(1)}px)` }}>
      <div style={{ position: "absolute", left: 960 - 80, top: 250, width: 160, height: 160, display: "grid", placeItems: "center", opacity: 0.85 * pBal, transform: `translate(0, ${((1 - pBal) * 20).toFixed(1)}px) rotate(${(Math.sin(t * 0.9) * 1.6).toFixed(3)}deg)` }}>
        <Scale size={130} color="var(--cor-azul)" strokeWidth={1.2} />
      </div>
      <Surge em={f42.pergunta - 0.05} saida={f42.tE - 0.35} dy={14} style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", ...ESTILO_EYEBROW, fontSize: 32, color: "var(--cor-texto-2)" }}>
        A pergunta que define tudo
      </Surge>
      <div style={{ position: "absolute", left: 0, right: 0, top: 452, display: "flex", justifyContent: "center" }}>
        <Titulo texto="Dentro da lei" em={f42.tE - 0.05} destaque={false} tamanho={140} alinhar="centro" />
      </div>
      <div style={{ position: "absolute", left: 960 - 260, top: 625, width: 520, height: 6, borderRadius: 3, background: "var(--cor-verde)", boxShadow: `0 0 20px ${rgba("verde", 0.5)}`, transform: `scaleX(${sub.toFixed(4)})`, transformOrigin: "50% 50%" }} />
    </div>
  );
}

interface PoseCartao {
  x: number;
  y: number;
  w: number;
  h: number;
  o: number;
}

/** Cartão de caminho com pose animada (posição, tamanho, opacidade). */
function CartaoCaminho({ p, em, t, tom, brilho = 0, moldura = 0, saida, children }: { p: Record<string, number>; em: number; t: number; tom: "verde" | "coral" | "azul"; brilho?: number; moldura?: number; saida?: number; children?: ReactNode }) {
  const pc = p as unknown as PoseCartao;
  const s = spring(t - em, { k: 170, d: 22 });
  const o = ease.outCubic(prog(t, em, em + 0.35)) * (saida !== undefined ? 1 - ease.inOutSine(prog(t, saida, saida + 0.5)) : 1);
  if (o * pc.o <= 0.005) return null;
  const fundo = 1 - moldura * 0.85;
  return (
    <div
      style={{
        position: "absolute",
        left: pc.x,
        top: pc.y,
        width: pc.w,
        height: pc.h,
        padding: "44px 48px",
        borderRadius: 26,
        background: `linear-gradient(180deg, rgb(33 41 52 / ${(0.94 * fundo).toFixed(3)}) 0%, rgb(22 27 34 / ${(0.96 * fundo).toFixed(3)}) 100%)`,
        border: `${moldura > 0.5 ? 2 : 1}px solid ${moldura > 0.01 ? rgba("verde", 0.08 + 0.14 * moldura) : "rgb(255 255 255 / 0.075)"}`,
        boxShadow: brilho > 0.01 ? `0 0 ${(40 + 50 * brilho).toFixed(0)}px ${rgba(tom, 0.3 * brilho)}, 0 40px 90px -30px rgb(0 0 0 / 0.85)` : moldura > 0.5 ? "none" : "0 40px 90px -30px rgb(0 0 0 / 0.85)",
        opacity: o * pc.o,
        transform: `translate(0, ${((1 - s) * 50).toFixed(1)}px)`,
        overflow: "hidden",
      }}
    >
      <span style={{ position: "absolute", left: -1, top: 26, bottom: 26, width: 6, borderRadius: "0 4px 4px 0", background: `var(--cor-${tom})`, boxShadow: `0 0 18px ${rgba(tom, 0.45)}`, opacity: 1 - moldura }} />
      {children}
    </div>
  );
}

function TituloCartao({ children, tamanho = 58, cor }: { children: ReactNode; tamanho?: number; cor?: string }) {
  return <div style={{ ...ESTILO_TITULO, fontSize: tamanho, color: cor ?? "var(--cor-texto)", maxWidth: 300 }}>{children}</div>;
}

function Interrogacao({ t, em, saida }: { t: number; em: number; saida: number }) {
  const s = spring(t - em, { k: 200, d: 14 });
  const q = ease.inOutSine(prog(t, saida, saida + 0.35));
  if (t < em || q >= 1) return null;
  return (
    <div style={{ position: "absolute", right: 60, bottom: 40, ...ESTILO_TITULO, fontSize: 260, lineHeight: 1, color: "var(--cor-azul)", opacity: Math.min(1, (t - em) * 5) * (1 - q), transform: `scale(${(0.7 + 0.3 * s).toFixed(4)}) rotate(${((1 - s) * 12).toFixed(2)}deg)`, transformOrigin: "50% 80%", textShadow: `0 0 40px ${rgba("azul", 0.35)}` }}>
      ?
    </div>
  );
}

/** Teto coral que baixa até o topo do cartão da ESC, com "Teto: R$ 4,8 mi por ano". */
function Teto({ t, em, c2, saida }: { t: number; em: number; c2: Record<string, number>; saida: number }) {
  const s = spring(t - em, { k: 120, d: 15 });
  const q = ease.inOutSine(prog(t, saida, saida + 0.5));
  const yFinal = c2.y - 4;
  const y = lerp(130, yFinal, Math.min(1.04, s));
  const largura = c2.w + 90;
  return (
    <div style={{ position: "absolute", left: c2.x - 45, top: y - 96, width: largura, opacity: Math.min(1, (t - em) * 5) * (1 - q) }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16, height: 74 }}>
        <span style={{ ...ESTILO_TITULO, fontSize: 46, color: "var(--cor-coral)" }}>Teto</span>
        <span style={{ ...ESTILO_MONO, fontSize: 56, color: "var(--cor-texto)" }}>{caminhos.escTetoReceita.rotulo}</span>
        <span style={{ ...ESTILO_ROTULO, fontSize: 36, color: "var(--cor-texto)" }}>por ano</span>
      </div>
      <div style={{ height: 16, marginTop: 6, borderRadius: 8, background: "repeating-linear-gradient(135deg, var(--cor-coral) 0 14px, rgb(255 122 69 / 0.55) 14px 28px)", boxShadow: `0 0 30px ${rgba("coral", 0.45)}` }} />
    </div>
  );
}

/* ---------------------------- fluxo BaaS ---------------------------- */

interface TemposFluxo {
  f48: number;
  chips: number[];
  parceira: number;
  autorizada: number;
  credora: number;
  emite: number;
  libera: number;
  compra: number;
  credito: number;
  capital: number;
  f51: number;
  regulamentado: number;
}

const CLI = { x: 300, y: 500 };
const VAP = { x: 520, y: 300, w: 440, h: 400 };
const PAR = { x: 1260, y: 300, w: 500, h: 400 };

/** Ponto de uma bézier quadrática. */
const bez = (a: [number, number], c: [number, number], b: [number, number], u: number): [number, number] => [
  (1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
  (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
];

function Fluxo({ t, tm, saida }: { t: number; tm: TemposFluxo; saida: number }) {
  const q = ease.inOutSine(prog(t, saida, saida + 0.5));
  const apagar = 1 - 0.62 * ease.inOutSine(prog(t, tm.regulamentado - 0.15, tm.regulamentado + 0.35));
  const oFluxo = (1 - q) * ease.outCubic(prog(t, tm.f48 + 0.3, tm.f48 + 0.8));
  if (oFluxo <= 0.005) return null;
  // arco do contrato + Pix (parceira → cliente), depois do pagamento (cliente → parceira)
  const A: [number, number] = [PAR.x + 140, PAR.y + PAR.h];
  const B: [number, number] = [CLI.x, CLI.y + 100];
  const C: [number, number] = [880, 980];
  const pContrato = ease.inOutCubic(prog(t, tm.emite, tm.emite + 1.1));
  const vidaContrato = 1 - prog(t, tm.f51 - 0.1, tm.f51 + 0.35);
  const pPag = ease.inOutCubic(prog(t, tm.f51 + 0.2, tm.f51 + 1.3));
  // arco da cessão (parceira → Vapti), por cima
  const CA: [number, number] = [PAR.x + 60, PAR.y];
  const CB: [number, number] = [VAP.x + VAP.w - 60, VAP.y];
  const CC: [number, number] = [(CA[0] + CB[0]) / 2, 120];
  const pCessao = ease.inOutCubic(prog(t, tm.compra - 0.1, tm.compra + 0.9));
  const [dx, dy] = bez(CA, CC, CB, ease.inOutCubic(prog(t, tm.compra + 0.1, tm.credito + 0.6)));
  const caminho = (a: [number, number], c: [number, number], b: [number, number]) => `M${a[0]} ${a[1]} Q ${c[0]} ${c[1]}, ${b[0]} ${b[1]}`;
  const pDin = ease.inOutCubic(prog(t, tm.credito, tm.capital + 0.2));
  const [mx, my] = bez(A, C, B, ease.inOutCubic(prog(t, tm.libera - 0.2, tm.libera + 0.9)));
  const [px, py] = bez(B, C, A, pPag);
  const parc = ease.outCubic(prog(t, tm.parceira - 0.1, tm.parceira + 0.5));
  const parcAcesa = ease.outCubic(prog(t, tm.autorizada - 0.1, tm.autorizada + 0.5));
  const chipsTexto = 1 - 0.5 * prog(t, tm.compra, tm.compra + 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: oFluxo }}>
      <div style={{ position: "absolute", inset: 0, opacity: apagar }}>
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* pedido: cliente → Vapti */}
          <path d={`M${CLI.x + 90} ${CLI.y} L${VAP.x - 16} ${CLI.y}`} stroke="rgb(242 244 247 / 0.4)" strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease.inOutCubic(prog(t, tm.f48 + 0.4, tm.f48 + 1))} />
          {/* contrato + Pix */}
          {vidaContrato > 0.01 ? (
            <g opacity={vidaContrato}>
              <path d={caminho(A, C, B)} fill="none" stroke={rgba("verde", 0.16)} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pContrato} />
              <path d={caminho(A, C, B)} fill="none" stroke="var(--cor-verde)" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pContrato} />
            </g>
          ) : null}
          {/* pagamento: Pix Automático na conta da parceira */}
          {pPag > 0.001 ? <path d={caminho(B, C, A)} fill="none" stroke="var(--cor-azul)" strokeWidth={5} strokeLinecap="round" strokeDasharray="14 12" opacity={0.9} clipPath="url(#corte-pag)" /> : null}
          <defs>
            <clipPath id="corte-pag">
              <rect x={B[0] - 40} y={0} width={(A[0] - B[0] + 80) * pPag} height={1080} />
            </clipPath>
          </defs>
          {/* cessão da CCB */}
          {pCessao > 0.001 ? (
            <>
              <path d={caminho(CA, CC, CB)} fill="none" stroke="var(--cor-azul)" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pCessao} />
              {pCessao > 0.95 ? <path d={`M${CB[0] + 20} ${CB[1] - 34} L${CB[0]} ${CB[1]} L${CB[0] + 38} ${CB[1] - 10}`} fill="none" stroke="var(--cor-azul)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /> : null}
            </>
          ) : null}
        </svg>

        {/* cliente */}
        <Surge em={tm.f48 + 0.1} dy={20} style={{ position: "absolute", left: CLI.x - 85, top: CLI.y - 85 }}>
          <Avatar tamanho={170} tom="texto" />
          <div style={{ ...ESTILO_ROTULO, fontSize: 36, color: "var(--cor-texto)", textAlign: "center", marginTop: 14 }}>Cliente</div>
        </Surge>

        {/* Vapti: cliente · análise · cobrança */}
        <Surge em={tm.f48 + 0.2} dy={30} style={{ position: "absolute", left: VAP.x, top: VAP.y, width: VAP.w, height: VAP.h, borderRadius: 24, padding: "34px 36px", background: "linear-gradient(180deg, rgb(36 46 34 / 0.96), rgb(22 27 26 / 0.96))", border: `2px solid ${rgba("verde", 0.55)}`, boxShadow: `0 0 50px ${rgba("verde", 0.16)}, 0 40px 90px -30px rgb(0 0 0 / 0.85)` }}>
          <div style={{ ...ESTILO_TITULO, fontSize: 64, color: "var(--cor-verde)" }}>{config.marca}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 26 }}>
            {[
              { txt: "cliente", Ic: UserRound },
              { txt: "análise", Ic: ScanSearch },
              { txt: "cobrança", Ic: BellRing },
            ].map(({ txt, Ic }, i) => {
              const a = ease.outCubic(prog(t, tm.chips[i] - 0.08, tm.chips[i] + 0.3));
              return (
                <div key={txt} style={{ display: "flex", alignItems: "center", gap: 18, height: 64, padding: "0 20px", borderRadius: 14, border: `2px solid ${a > 0.5 ? rgba("verde", 0.6) : "rgb(242 244 247 / 0.12)"}`, background: rgba("verde", 0.1 * a), opacity: (0.35 + 0.65 * a) * (a > 0 ? chipsTexto : 1) }}>
                  <Ic size={34} color={a > 0.5 ? "var(--cor-verde)" : "var(--cor-texto-2)"} strokeWidth={2} />
                  <span style={{ ...ESTILO_ROTULO, fontSize: 36, color: "var(--cor-texto)" }}>{txt}</span>
                </div>
              );
            })}
          </div>
        </Surge>

        {/* instituição parceira (credora) */}
        {parc > 0.001 ? (
          <div style={{ position: "absolute", left: PAR.x, top: PAR.y, width: PAR.w, height: PAR.h, borderRadius: 24, padding: "34px 40px", opacity: 0.4 + 0.6 * parc, transform: `translate(0, ${((1 - parc) * 30).toFixed(1)}px)`, background: "linear-gradient(180deg, rgb(30 38 54 / 0.96), rgb(22 27 34 / 0.96))", border: `2px solid ${rgba("azul", 0.25 + 0.4 * parcAcesa)}`, boxShadow: `0 0 ${(20 + 40 * parcAcesa).toFixed(0)}px ${rgba("azul", 0.2 * parcAcesa)}, 0 40px 90px -30px rgb(0 0 0 / 0.85)` }}>
            <div style={{ ...ESTILO_TITULO, fontSize: 56, color: parcAcesa > 0.5 ? "var(--cor-azul)" : "var(--cor-texto-2)" }}>
              Instituição
              <br />
              parceira
            </div>
            <Surge em={tm.credora} dy={12} style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 30, padding: "10px 22px", borderRadius: 999, border: `2px solid ${rgba("azul", 0.6)}`, background: rgba("azul", 0.1) }}>
              <span style={{ ...ESTILO_EYEBROW, fontSize: 30, color: "var(--cor-azul)" }}>credora</span>
            </Surge>
            {/* CCB que sai na cessão */}
          </div>
        ) : null}

        {/* rótulo do contrato + Pix e o Pix viajando até o cliente */}
        {vidaContrato > 0.01 && t >= tm.libera - 0.2 ? (
          <>
            <Surge em={tm.libera - 0.2} dy={14} style={{ position: "absolute", left: 790, top: 872, display: "flex", alignItems: "center", gap: 14, opacity: vidaContrato }}>
              <span style={{ ...ESTILO_MONO, fontSize: 40, color: "var(--cor-verde)" }}>CCB + Pix</span>
            </Surge>
            {prog(t, tm.libera - 0.2, tm.libera + 0.9) < 1 ? <div style={{ position: "absolute", left: mx - 14, top: my - 14, width: 28, height: 28, borderRadius: "50%", background: "var(--cor-verde)", boxShadow: `0 0 24px ${rgba("verde", 0.8)}` }} /> : null}
          </>
        ) : null}

        {/* cessão: a CCB vai da parceira para a Vapti; o capital vai da Vapti para a parceira */}
        {pCessao > 0.001 ? (
          <>
            <Surge em={tm.compra + 0.3} dy={10} style={{ position: "absolute", left: (CA[0] + CB[0]) / 2 - 150, top: 140, width: 300, textAlign: "center", ...ESTILO_ROTULO, fontSize: 36, color: "var(--cor-azul)" }}>
              cessão da CCB
            </Surge>
            {prog(t, tm.compra + 0.1, tm.credito + 0.6) < 1 ? (
              <div style={{ position: "absolute", left: dx - 26, top: dy - 30, width: 52, height: 60, display: "grid", placeItems: "center", borderRadius: 8, background: "var(--cor-tinta)", border: `2px solid var(--cor-azul)` }}>
                <FileText size={32} color="var(--cor-azul)" />
              </div>
            ) : null}
            {t >= tm.credito ? (
              <div style={{ position: "absolute", left: lerp(VAP.x + VAP.w + 8, PAR.x - 236, pDin), top: 452, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: Math.min(1, (t - tm.credito) * 4) }}>
                <span style={{ ...ESTILO_MONO, fontSize: 44, color: "var(--cor-verde)", padding: "6px 16px", borderRadius: 12, background: "var(--cor-tinta)", border: `2px solid ${rgba("verde", 0.6)}`, boxShadow: `0 0 24px ${rgba("verde", 0.3)}` }}>{projeto.capitalInicial.rotulo}</span>
                <span style={{ ...ESTILO_ROTULO, fontSize: 30 }}>fase 1</span>
              </div>
            ) : null}
          </>
        ) : null}

        {/* F051: Pix Automático na conta da parceira — nunca na da Vapti */}
        {pPag > 0.001 ? (
          <>
            <Surge em={tm.f51 + 0.5} dy={14} style={{ position: "absolute", left: 760, top: 872 }}>
              <span style={{ ...ESTILO_ROTULO, fontSize: 38, color: "var(--cor-azul)" }}>Pix Automático</span>
            </Surge>
            {pPag < 1 ? <div style={{ position: "absolute", left: px - 14, top: py - 14, width: 28, height: 28, borderRadius: "50%", background: "var(--cor-azul)", boxShadow: `0 0 24px ${rgba("azul", 0.8)}` }} /> : null}
            <Surge em={tm.f51 + 1.0} dy={10} style={{ position: "absolute", left: VAP.x + 30, top: VAP.y + VAP.h + 26, display: "flex", alignItems: "center", gap: 14 }}>
              <Lock size={32} color="var(--cor-texto-2)" strokeWidth={2.2} />
              <span style={{ ...ESTILO_ROTULO, fontSize: 32 }}>nunca na conta da {config.marca}</span>
            </Surge>
          </>
        ) : null}
      </div>

      {/* carimbo da norma (F051) */}
      {t >= tm.regulamentado - 0.05 ? <Carimbo t={t} em={tm.regulamentado} /> : null}
    </div>
  );
}

function Carimbo({ t, em }: { t: number; em: number }) {
  const s = spring(t - em, { k: 320, d: 20 });
  const o = ease.outCubic(prog(t, em, em + 0.12));
  const esc = 1.5 - 0.5 * Math.min(1.05, s);
  return (
    <>
      <Onda em={em + 0.12} x={960} y={500} tom="texto" raio={620} intensidade={0.35} />
      <div style={{ position: "absolute", left: 960 - 520, top: 500 - 150, width: 1040, height: 300, opacity: o, transform: `scale(${esc.toFixed(4)}) rotate(-4deg)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: "5px solid var(--cor-texto)", background: "rgb(14 17 22 / 0.88)", boxShadow: "0 30px 80px -20px rgb(0 0 0 / 0.9)" }} />
        <div style={{ position: "absolute", inset: 14, borderRadius: 10, border: "2px solid rgb(242 244 247 / 0.45)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ ...ESTILO_TITULO, fontSize: 84, color: "var(--cor-verde)" }}>BaaS</span>
          <span style={{ ...ESTILO_MONO, fontWeight: 600, fontSize: 40, letterSpacing: "0.02em", color: "var(--cor-texto)", textTransform: "uppercase" }}>
            {estrutura.normaCurta} · {estrutura.normaData}
          </span>
        </div>
      </div>
    </>
  );
}

/* --------------------------- Brasil inteiro --------------------------- */

const MAPA = { x: 300, y: 190, w: 640, h: 637 };
const CAMINHO_BR = caminhoBrasil(MAPA.w, MAPA.h);
const [NX, NY] = projetar(NATAL, MAPA.w, MAPA.h);

function Nacional({ t, tm }: { t: number; tm: { t0: number; brasil: number; pessoa: number; mei: number; tE: number; fundos: number } }) {
  const o = ease.outCubic(prog(t, tm.t0 - 0.2, tm.t0 + 0.5));
  const acende = ease.inOutCubic(prog(t, tm.brasil - 0.1, tm.brasil + 1.3));
  const r = 30 + acende * 900;
  const porta = ease.inOutCubic(prog(t, tm.tE - 0.05, tm.tE + 0.75));
  const luz = ease.outCubic(prog(t, tm.tE + 0.1, tm.tE + 0.9));
  const chip = (em: number, Ic: typeof Store, txt: string): ReactNode => (
    <Surge em={em} dy={20} mola style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 26px", borderRadius: 999, background: rgba("verde", 0.1), border: `2px solid ${rgba("verde", 0.55)}` }}>
      <Ic size={36} color="var(--cor-verde)" strokeWidth={2} />
      <span style={{ ...ESTILO_TITULO, fontSize: 44, color: "var(--cor-texto)" }}>{txt}</span>
    </Surge>
  );
  const estiloPorta: CSSProperties = { position: "absolute", left: 1310, top: 230, width: 330, height: 520 };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      {/* mapa */}
      <svg width={MAPA.w} height={MAPA.h} style={{ position: "absolute", left: MAPA.x, top: MAPA.y, overflow: "visible" }}>
        <defs>
          <pattern id="pontos-br" width={16} height={16} patternUnits="userSpaceOnUse">
            <circle cx={8} cy={8} r={3} fill="rgb(242 244 247 / 0.22)" />
          </pattern>
          <pattern id="pontos-br-v" width={16} height={16} patternUnits="userSpaceOnUse">
            <circle cx={8} cy={8} r={3.4} fill="var(--cor-verde)" />
          </pattern>
          <clipPath id="acende-br">
            <circle cx={NX} cy={NY} r={r} />
          </clipPath>
        </defs>
        <path d={CAMINHO_BR} fill="url(#pontos-br)" stroke="rgb(242 244 247 / 0.2)" strokeWidth={2} />
        <g clipPath="url(#acende-br)" opacity={acende > 0 ? 1 : 0}>
          <path d={CAMINHO_BR} fill={rgba("verde", 0.1)} />
          <path d={CAMINHO_BR} fill="url(#pontos-br-v)" opacity={0.85} />
          <path d={CAMINHO_BR} fill="none" stroke="var(--cor-verde)" strokeWidth={3} />
        </g>
        <circle cx={NX} cy={NY} r={9} fill="var(--cor-verde)" opacity={ease.outCubic(prog(t, tm.t0, tm.t0 + 0.4))} />
      </svg>
      <Onda em={tm.brasil} x={MAPA.x + NX} y={MAPA.y + NY} tom="verde" raio={700} dur={1.4} intensidade={0.5} />
      <Surge em={tm.brasil - 0.05} dy={16} style={{ position: "absolute", left: MAPA.x + 20, top: MAPA.y + MAPA.h + 6, ...ESTILO_TITULO, fontSize: 52 }}>
        Brasil inteiro
      </Surge>
      {/* PF e MEI */}
      <div style={{ position: "absolute", left: 1000, top: 360, display: "flex", flexDirection: "column", gap: 24 }}>
        {chip(tm.pessoa, UserRound, "PF")}
        {chip(tm.mei, Store, "MEI")}
      </div>
      {/* porta para os fundos */}
      <div style={estiloPorta}>
        <Surge em={tm.t0 + 0.4} dy={20} style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "14px 14px 0 0", background: `linear-gradient(180deg, ${rgba("verde", 0.08 + 0.3 * luz)}, ${rgba("verde", 0.03 + 0.12 * luz)})`, boxShadow: `0 0 ${(80 * luz).toFixed(0)}px ${rgba("verde", 0.35 * luz)}`, border: "4px solid rgb(242 244 247 / 0.35)" }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: luz }}>
            <span style={{ ...ESTILO_TITULO, fontSize: 92, color: "var(--cor-verde)", textShadow: `0 0 30px ${rgba("verde", 0.5)}` }}>FIDC</span>
          </div>
          {/* folha da porta: gira em torno da dobradiça (esquerda) */}
          <div style={{ position: "absolute", left: 4, top: 4, bottom: 0, width: 322, transformOrigin: "0 50%", transform: `perspective(1400px) rotateY(${(-78 * porta).toFixed(2)}deg)`, background: "linear-gradient(90deg, rgb(44 54 68), rgb(30 37 47))", border: "2px solid rgb(242 244 247 / 0.18)", borderRadius: "10px 10px 0 0" }}>
            <div style={{ position: "absolute", right: 30, top: "52%", width: 16, height: 46, borderRadius: 8, background: "rgb(242 244 247 / 0.5)" }} />
          </div>
        </Surge>
        <div style={{ position: "absolute", left: -40, right: -40, bottom: -4, height: 4, background: "rgb(242 244 247 / 0.3)" }} />
        <Surge em={tm.fundos - 0.1} dy={12} style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", ...ESTILO_ROTULO, fontSize: 40, color: "var(--cor-texto)" }}>
          fundos
        </Surge>
      </div>
    </div>
  );
}
