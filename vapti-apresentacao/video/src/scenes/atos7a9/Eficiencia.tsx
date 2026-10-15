/**
 * Ato 7, primeira metade (F067–F069) — V18 Eficiência.
 * F067: "Custo por saque" com uma lupa que passa por cima (o texto aumenta dentro dela).
 * F068: R$ 1,05 → R$ 0,20 por saque: a barra encolhe enquanto 30 balões viram "4 a 6".
 * F069: funil de quatro camadas e o custo da consulta caindo em degraus (estimativas marcadas).
 */
import type { ReactNode } from "react";
import { eficiencia as ef } from "../../../../src/data/vapti";
import { formatBRL } from "../../../../src/lib/formato";
import {
  Barra,
  Camada,
  Camera,
  clamp01,
  ease,
  envelope,
  mulberry32,
  Numero,
  prog,
  rgba,
  Rotulo,
  Selo,
  Seta,
  spring,
  Titulo,
  Tracado,
  useFilme,
  useFrase,
} from "../../kit";
import { Balao, mix, tFimPalavra, tPalavra } from "./base";

/* Faixa "4 a 6" do briefing → [4, 6]. Na tela nunca aparece o ponto médio. */
const FAIXA = (ef.msgsDepoisFaixa.match(/\d+/g) ?? ["4", "6"]).map(Number) as [number, number];

/* Grade dos 30 balões (geometria) e os que sobram (FAIXA[1] = 6). */
const COLS = 6;
const BW = 104;
const BH = 56;
const GX = 20;
const GY = 22;
const GRADE_X = 1040;
const GRADE_Y = 440;
const N_ANTES = ef.msgsAntes.valor;
const FICAM = [2, 7, 15, 16, 22, 27].slice(0, FAIXA[1]);
const ordemSaida = (() => {
  const r = mulberry32(68);
  return Array.from({ length: N_ANTES }, () => r());
})();

/* Funil: rótulos do briefing (a primeira camada encurtada para caber). */
const FUNIL = ef.funil.map((s, i) => (i === 0 ? s.replace(/\s*público\s*/, " ").replace(/[()]/g, "").trim() : s));
const LARG_FUNIL = [720, 590, 460, 330, 230];
const ALT_CAMADA = 106;
const GAP_CAMADA = 14;

/* Pontinhos que descem pelo funil (pedidos sendo filtrados): deterministas. */
const PONTOS = (() => {
  const r = mulberry32(69);
  return Array.from({ length: 18 }, (_, i) => ({ x: r() * 2 - 1, fase: r(), vel: 0.42 + r() * 0.25, morre: i % 3 === 0 ? 4 : Math.floor(r() * 4) }));
})();

/* Degraus do custo da consulta. */
const BASE = 800;
const ALT_MAX = 440;
const escalaReais = ALT_MAX / ef.serasaBalcaoMin.valor;
const faixaMadura = `${ef.bureauMaduroMin.rotulo} a ${ef.bureauMaduroMax.rotulo.replace(/^R\$\s*/, "")}`;

/** Lupa: aro, cabo e o título aumentado dentro dela. */
function Lupa({ cx, cy, r, opacidade, children }: { cx: number; cy: number; r: number; opacidade: number; children: ReactNode }) {
  if (opacidade <= 0.002) return null;
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: opacidade, pointerEvents: "none" }}>
      {/* cabo */}
      <div
        style={{
          position: "absolute",
          left: cx + r * 0.62,
          top: cy + r * 0.62,
          width: 150,
          height: 26,
          borderRadius: 13,
          background: "linear-gradient(180deg, #3a4452, #1d242e)",
          border: "1.5px solid rgb(242 244 247 / 0.35)",
          transform: "rotate(45deg)",
          transformOrigin: "0 50%",
          boxShadow: "0 18px 30px -12px rgb(0 0 0 / 0.8)",
        }}
      />
      {/* vidro com o conteúdo aumentado */}
      <div style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%", overflow: "hidden", background: "rgb(14 17 22 / 0.92)" }}>
        <div style={{ position: "absolute", left: -(cx - r), top: -(cy - r), width: 1920, height: 1080, transform: "scale(1.5)", transformOrigin: `${cx}px ${cy}px` }}>{children}</div>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.16) 0%, rgb(255 255 255 / 0) 42%)" }} />
      </div>
      {/* aro */}
      <div
        style={{
          position: "absolute",
          left: cx - r - 9,
          top: cy - r - 9,
          width: r * 2 + 18,
          height: r * 2 + 18,
          borderRadius: "50%",
          border: "9px solid rgb(242 244 247 / 0.86)",
          boxShadow: `0 0 0 1.5px rgb(14 17 22 / 0.6) inset, 0 24px 50px -20px rgb(0 0 0 / 0.9), 0 0 36px ${rgba("azul", 0.25)}`,
        }}
      />
    </div>
  );
}

const TITULO_POS = { x: 120, y: 330 };

export function Eficiencia() {
  const { t } = useFilme();
  const f67 = useFrase("F067");
  const f68 = useFrase("F068");
  const f69 = useFrase("F069");
  const f70 = useFrase("F070");

  // Some quando os riscos entram (F070)
  const saida = ease.inOutCubic(prog(t, f70.t0 - 0.05, f70.t0 + 0.7));
  if (saida >= 1) return null;

  /* ---------------- F067: título e lupa ---------------- */
  const e67 = f67.tE;
  const vaiEyebrow = ease.inOutCubic(prog(t, f68.t0 - 0.25, f68.t0 + 0.55));
  const lP = ease.inOutSine(prog(t, e67 + 0.55, f67.t1 + 0.05));
  const lQ = ease.inOutCubic(prog(t, f67.t1 + 0.05, f68.t0 + 0.9));
  const lensX = mix(mix(150, 610, lP), 1330, lQ);
  const lensY = mix(385 + 100 * lP - 40 * Math.sin(Math.PI * lP), 600, lQ);
  const lensO = envelope(t, e67 + 0.3, f68.t0 + 0.75, 0.35, 0.45);
  const titulo = (em: number) => <Titulo texto="Custo por saque" em={em} tamanho={104} largura={560} destaque={false} />;

  /* ---------------- F068: mensagens e custo ---------------- */
  const tMsg = tPalavra(f68.f, "mensagem", f68.t0, f68.t0 + 0.2);
  const tUm = tPalavra(f68.f, "um", f68.t0, f68.t0 + 2.2);
  const tParaA = tPalavra(f68.f, "centavos", tUm, tUm + 1) + 0.12;
  const tC0 = tPalavra(f68.f, "jornada", tParaA, f68.tE - 1) - 0.1;
  const tParaB = f68.tE + 0.3;
  const vidaA = 1 - ease.inOutSine(prog(t, tC0 - 0.05, tC0 + 0.3));
  const BARRA_MAX = 760;
  const cresce = spring(t - (tUm - 0.15), { k: 120, d: 17 });
  const encolhe = ease.inOutCubic(prog(t, tC0, tParaB));
  const compBarra = t < tUm - 0.15 ? 0 : BARRA_MAX * cresce * mix(1, ef.custoMsgDepois.valor / ef.custoMsgAntes.valor, encolhe);
  const verdeBarra = ease.inOutSine(prog(t, tC0 + 0.2, tParaB));
  const fantasma = ease.outCubic(prog(t, tC0, tC0 + 0.4));
  const tickFlash = t >= tParaB ? Math.exp(-(t - tParaB) * 4) : 0;

  // Balões: discretos na F067 (prenúncio), acendem na "mensagem", 24 saem na "jornada certa"
  const balaoPrevia = envelope(t, f67.t0 + 0.3, Infinity, 0.8) * 0.16;
  const balaoVida = (i: number) => {
    const s = spring(t - (tMsg + i * 0.035), { k: 240, d: 19 });
    return { s: Math.max(0, Math.min(1.15, s)), on: t >= tMsg + i * 0.035 };
  };

  /* ---------------- F069: funil e degraus ---------------- */
  const tCons = tPalavra(f69.f, "consulta", f69.t0, f69.t0 + 0.2);
  const tQuinze = tPalavra(f69.f, "quinze", f69.t0, f69.t0 + 2.4);
  const tB = tQuinze - 0.3;
  const tPara1 = tFimPalavra(f69.f, "reais", tQuinze, tQuinze + 0.5) - 0.05;
  const tBalcao = tPalavra(f69.f, "balcao", tQuinze, tQuinze + 1);
  const tTres = tPalavra(f69.f, "tres", f69.tE, f69.tE + 0.4);
  const fasB = ease.inOutCubic(prog(t, tB - 0.2, tB + 0.5));
  const em2 = tBalcao + 0.05;
  const em3 = f69.tE - 0.15;
  const h = (v: number) => v * escalaReais;

  return (
    <div className="absolute inset-0" style={{ opacity: 1 - saida, transform: `scale(${(1 - 0.03 * saida).toFixed(4)})`, transformOrigin: "50% 50%" }}>
      <Camera
        chaves={[
          { t: f67.t0 - 1, x: 0, zoom: 1 },
          { t: f68.t0 + 0.8, x: 0, zoom: 1.015 },
          { t: f69.t0 - 0.2, x: 0, zoom: 1.03, curva: ease.inOutSine },
          { t: f69.t0 + 0.85, x: 1920, zoom: 1.0, curva: ease.inOutCubic },
          { t: f70.t0 + 0.6, x: 1920, zoom: 1.015, curva: ease.inOutSine },
        ]}
        deriva={4}
        seed={7}
      >
        {/* ======== Parte A: F067–F068 ======== */}
        <Camada z={0}>
          {/* Título da F067 → vira o rótulo do custo na F068 */}
          <div
            style={{
              position: "absolute",
              left: TITULO_POS.x,
              top: TITULO_POS.y,
              opacity: 1 - ease.inOutSine(prog(t, f68.t0 + 0.05, f68.t0 + 0.5)),
              transform: `translate(${(40 * vaiEyebrow).toFixed(2)}px, ${(-100 * vaiEyebrow).toFixed(2)}px) scale(${(1 - 0.62 * vaiEyebrow).toFixed(4)})`,
              transformOrigin: "0 0",
            }}
          >
            {titulo(e67 - 0.1)}
          </div>

          {/* Custo: eyebrow, número, barra */}
          <div style={{ position: "absolute", left: 160, top: 232 }}>
            <Rotulo texto="Custo por saque" em={f68.t0 + 0.15} tom="azul" tamanho={34} />
          </div>
          <div style={{ position: "absolute", left: 160, top: 300, opacity: vidaA }}>
            <Numero valor={ef.custoMsgAntes.valor} final={ef.custoMsgAntes.rotulo} formato="brl" tParada={tParaA} dur={1.0} tamanho={168} tom="azul" em={f68.t0 + 0.4} brilho={0.25} />
          </div>
          {t >= tC0 - 0.1 ? (
            <div style={{ position: "absolute", left: 160, top: 300, opacity: 1 - vidaA }}>
              <Numero valor={ef.custoMsgDepois.valor} de={ef.custoMsgAntes.valor} final={ef.custoMsgDepois.rotulo} formato="brl" tParada={tParaB} dur={tParaB - tC0} tamanho={168} tom="verde" />
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 164, top: 470 }}>
            <Selo tipo="estimativa" em={tParaA + 0.1} tamanho={24} />
          </div>
          {/* barra */}
          <div style={{ position: "absolute", left: 160, top: 540, width: BARRA_MAX, height: 76 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: BARRA_MAX,
                height: 76,
                borderRadius: 10,
                border: `2px dashed ${rgba("azul", 0.45)}`,
                opacity: fantasma * 0.9,
              }}
            />
            {[
              { tom: "azul" as const, o: 1 - verdeBarra },
              { tom: "verde" as const, o: verdeBarra },
            ].map(({ tom, o }) =>
              o > 0.003 ? (
                <div
                  key={tom}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: Math.max(0, compBarra),
                    height: 76,
                    borderRadius: 10,
                    opacity: o,
                    background: `linear-gradient(90deg, ${rgba(tom, 0.5)} 0%, ${rgba(tom, 0.85)} 60%, ${rgba(tom, 1)} 100%)`,
                    boxShadow: `0 1px 0 rgb(255 255 255 / 0.35) inset, 0 0 ${Math.round(34 + 40 * tickFlash)}px ${rgba(tom, 0.25 + 0.3 * tickFlash)}`,
                  }}
                />
              ) : null,
            )}
          </div>

          {/* Mensagens: rótulo, contagem, balões */}
          <div style={{ position: "absolute", left: GRADE_X, top: 232 }}>
            <Rotulo texto="Mensagens por saque" em={tMsg - 0.05} tom="azul" tamanho={34} />
          </div>
          <div style={{ position: "absolute", left: GRADE_X, top: 296, opacity: vidaA }}>
            <Numero valor={N_ANTES} formato="int" tParada={tMsg + 1.1} dur={1.0} tamanho={112} tom="azul" em={tMsg} brilho={0.2} />
          </div>
          {t >= tC0 - 0.1 ? (
            <div style={{ position: "absolute", left: GRADE_X, top: 296, opacity: 1 - vidaA }}>
              <Numero valor={FAIXA[1]} de={N_ANTES} final={ef.msgsDepoisFaixa} formato={(v) => String(Math.max(FAIXA[1], Math.round(v)))} tParada={tParaB} dur={tParaB - tC0} tamanho={112} tom="verde" />
            </div>
          ) : null}
          {Array.from({ length: N_ANTES }, (_, i) => {
            const col = i % COLS;
            const lin = Math.floor(i / COLS);
            const x0 = GRADE_X + col * (BW + GX);
            const y0 = GRADE_Y + lin * (BH + GY);
            const lado = (lin + col) % 2 ? "d" : "e";
            const { s, on } = balaoVida(i);
            const k = FICAM.indexOf(i);
            if (k < 0) {
              const sai = ease.inCubic(prog(t, tC0 + ordemSaida[i] * 0.7, tC0 + ordemSaida[i] * 0.7 + 0.35));
              const o = on ? 1 - sai : balaoPrevia;
              const esc = on ? s * (1 - sai * 0.6) : 1;
              return <Balao key={i} x={x0} y={y0} w={BW} h={BH} lado={lado} tom="azul" opacidade={o} escala={esc} />;
            }
            // os que ficam: vão para uma fileira só; os últimos ficam tracejados ("até 6")
            const mv = ease.inOutCubic(prog(t, tC0 + 0.45, tParaB + 0.1));
            const x = mix(x0, GRADE_X + k * (BW + GX), mv);
            const y = mix(y0, GRADE_Y + 2 * (BH + GY), mv);
            const tracejado = k >= FAIXA[0];
            const o = on ? 1 : balaoPrevia;
            const esc = on ? s : 1;
            return (
              <div key={i}>
                <Balao x={x} y={y} w={BW} h={BH} lado={lado} tom="azul" opacidade={o * (1 - verdeBarra)} escala={esc} />
                <Balao x={x} y={y} w={BW} h={BH} lado={lado} tom="verde" tracejado={tracejado} opacidade={o * verdeBarra} escala={esc * (1 + 0.08 * tickFlash)} />
              </div>
            );
          })}

          {/* Lupa por cima do título */}
          <Lupa cx={lensX} cy={lensY} r={118} opacidade={lensO}>
            <div style={{ position: "absolute", left: TITULO_POS.x, top: TITULO_POS.y }}>{titulo(-100)}</div>
          </Lupa>
        </Camada>

        {/* ======== Parte B: F069 (deslocada 1920 px à direita) ======== */}
        <Camada z={0}>
          <div style={{ position: "absolute", left: 1920, top: 0, width: 1920, height: 1080 }}>
            <div style={{ position: "absolute", left: 160, top: 196 }}>
              <Rotulo texto="Consulta de crédito" em={tB} tom="verde" tamanho={34} />
            </div>

            {/* Funil */}
            <div style={{ position: "absolute", left: 160, top: 290, width: 720, height: 4 * ALT_CAMADA + 3 * GAP_CAMADA, opacity: mix(1, 0.42, fasB), transform: `scale(${mix(1, 0.86, fasB).toFixed(4)})`, transformOrigin: "50% 40%" }}>
              <svg width={720} height={4 * ALT_CAMADA + 3 * GAP_CAMADA} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
                {FUNIL.map((_, i) => {
                  const a = ease.outCubic(prog(t, tCons + i * 0.28, tCons + i * 0.28 + 0.45));
                  const y = i * (ALT_CAMADA + GAP_CAMADA) + (1 - a) * -18;
                  const w0 = LARG_FUNIL[i];
                  const w1 = LARG_FUNIL[i + 1];
                  const ultimo = i === FUNIL.length - 1;
                  const c = ultimo ? "cinza" : "verde";
                  const pts = `${360 - w0 / 2},${y} ${360 + w0 / 2},${y} ${360 + w1 / 2},${y + ALT_CAMADA} ${360 - w1 / 2},${y + ALT_CAMADA}`;
                  return <polygon key={i} points={pts} opacity={a} fill={rgba(c, ultimo ? 0.1 : 0.12 + 0.05 * i)} stroke={rgba(c, 0.85)} strokeWidth={2.5} strokeDasharray={ultimo ? "9 8" : undefined} strokeLinejoin="round" />;
                })}
                {PONTOS.map((p, i) => {
                  const vida = envelope(t, tCons + 0.6, tB + 1.2, 0.4, 0.6);
                  if (vida <= 0) return null;
                  const ciclo = (((t - tCons) * p.vel + p.fase) % 1 + 1) % 1;
                  const H = 4 * ALT_CAMADA + 3 * GAP_CAMADA;
                  const y = ciclo * (H + 40) - 20;
                  const camada = Math.floor(y / (ALT_CAMADA + GAP_CAMADA));
                  const fim = p.morre >= 4 ? H + 20 : (p.morre + 0.75) * (ALT_CAMADA + GAP_CAMADA);
                  if (y > fim) return null;
                  const meia = mix(LARG_FUNIL[Math.min(4, Math.max(0, camada))] / 2, LARG_FUNIL[Math.min(4, Math.max(0, camada + 1))] / 2, clamp01((y % (ALT_CAMADA + GAP_CAMADA)) / ALT_CAMADA)) - 26;
                  const o = vida * (1 - clamp01((y - (fim - 30)) / 30));
                  return <circle key={i} cx={360 + p.x * Math.max(10, meia)} cy={y} r={5} fill={rgba(p.morre >= 4 ? "verde" : "texto", 0.8)} opacity={o} />;
                })}
              </svg>
              {FUNIL.map((rot, i) => {
                const a = ease.outCubic(prog(t, tCons + i * 0.28 + 0.1, tCons + i * 0.28 + 0.55)) * (1 - fasB);
                return (
                  <p
                    key={rot}
                    style={{
                      position: "absolute",
                      left: 0,
                      width: 720,
                      top: i * (ALT_CAMADA + GAP_CAMADA) + 30,
                      margin: 0,
                      textAlign: "center",
                      fontFamily: "var(--fonte-texto)",
                      fontWeight: 600,
                      fontSize: 34,
                      color: i === FUNIL.length - 1 ? "var(--cor-texto-2)" : "var(--cor-texto)",
                      opacity: a,
                    }}
                  >
                    {rot}
                  </p>
                );
              })}
            </div>
            <Seta de={[790, 560]} para={[1268, 620]} curvatura={-0.18} em={em2 - 0.15} dur={0.5} tom="verde" espessura={3} tracejado />

            {/* Degraus */}
            <div style={{ position: "absolute", left: 960, top: BASE, width: 800, height: 2, background: "var(--cor-borda-forte)", opacity: ease.outCubic(prog(t, tB, tB + 0.5)) }} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
              <Tracado d={`M1150 ${BASE - h(ef.serasaBalcaoMin.valor) + 2} C1215 ${BASE - h(ef.serasaBalcaoMin.valor)}, 1215 ${BASE - h(ef.custoAprovadoComFunil.valor)}, 1280 ${BASE - h(ef.custoAprovadoComFunil.valor) + 2}`} em={em2} dur={0.5} tom="verde" espessura={3} tracejado />
              <Tracado d={`M1430 ${BASE - h(ef.custoAprovadoComFunil.valor) + 2} C1495 ${BASE - h(ef.custoAprovadoComFunil.valor)}, 1495 ${BASE - h(ef.bureauMaduroMax.valor)}, 1560 ${BASE - h(ef.bureauMaduroMax.valor) + 2}`} em={em3} dur={0.5} tom="verde" espessura={3} tracejado />
            </svg>
            {[
              {
                x: 1000,
                v: ef.serasaBalcaoMin.valor,
                tom: "cinza" as const,
                em: tQuinze - 0.1,
                rot: "balcão",
                num: <Numero valor={ef.serasaBalcaoMin.valor} final={ef.serasaBalcaoMin.rotulo} formato="brl" tParada={tPara1} dur={0.7} tamanho={60} tom="texto" brilho={0} alinhar="centro" />,
                selo: false,
              },
              {
                x: 1280,
                v: ef.custoAprovadoComFunil.valor,
                tom: "verde" as const,
                em: em2,
                rot: "por aprovado",
                num: <Numero valor={ef.custoAprovadoComFunil.valor} de={ef.serasaBalcaoMin.valor} final={ef.custoAprovadoComFunil.rotulo} formato="brl" tParada={em2 + 0.5} dur={0.5} tamanho={60} tom="verde" alinhar="centro" />,
                selo: true,
              },
              {
                x: 1560,
                v: ef.bureauMaduroMax.valor,
                tom: "verde" as const,
                em: em3,
                rot: "por saque",
                num: <Numero valor={ef.bureauMaduroMax.valor} de={ef.custoAprovadoComFunil.valor} final={faixaMadura} formato={(v) => formatBRL(v, 2)} tParada={tTres + 0.1} dur={tTres + 0.1 - em3} tamanho={72} tom="verde" alinhar="centro" sublinhar />,
                selo: true,
              },
            ].map((b) => (
              <div key={b.x}>
                <div style={{ position: "absolute", left: b.x, top: BASE - ALT_MAX }}>
                  <Barra valor={b.v} max={ef.serasaBalcaoMin.valor} comprimento={ALT_MAX} espessura={150} em={b.em} tom={b.tom} raio={8}>
                    <div className="flex flex-col items-center" style={{ gap: 10 }}>
                      {b.num}
                      {b.selo ? <Selo tipo="estimativa" em={b.em + 0.3} tamanho={22} style={{ transformOrigin: "center" }} /> : null}
                    </div>
                  </Barra>
                </div>
                {b.x === 1560 ? (
                  // linha do R$ 2 dentro da barra (faixa 2 a 3)
                  <div style={{ position: "absolute", left: b.x, top: BASE - h(ef.bureauMaduroMin.valor), width: 150, height: 0, borderTop: "2px dashed rgb(14 17 22 / 0.7)", opacity: ease.outCubic(prog(t, b.em + 0.3, b.em + 0.6)) }} />
                ) : null}
                <p
                  style={{
                    position: "absolute",
                    left: b.x - 40,
                    width: 230,
                    top: BASE + 16,
                    margin: 0,
                    textAlign: "center",
                    fontSize: 30,
                    fontWeight: 600,
                    color: "var(--cor-texto-2)",
                    opacity: ease.outCubic(prog(t, b.em, b.em + 0.4)),
                  }}
                >
                  {b.rot}
                </p>
              </div>
            ))}
          </div>
        </Camada>
      </Camera>
    </div>
  );
}
