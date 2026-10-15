/**
 * Ato 4 — Gamificação (F032–F041). Tom leve, com um momento firme no "nunca".
 *
 * Fio visual: a paleta dos níveis (F032) vira o topo dos degraus (F033); um marcador sobe a
 * escada enquanto a linha da taxa desce (F034–F035, com efetiva ao mês e juros de R$ 400);
 * o limite volta em pedaços (F036); a reserva dourada do Ouro (F037); a indicação faz o
 * marcador de quem indicou subir (F038); regras visíveis (F039–F040); selo "Jogo justo" (F041).
 */
import type { ReactNode } from "react";
import { Scale, Umbrella, Unlink } from "lucide-react";
import { gamificacao, niveis, projeto } from "../../../../src/data/vapti";
import {
  Camada,
  Camera,
  Cartao,

  ease,
  estadoFrase,
  lerp,
  oscilar,
  Palavra,
  Poeira,
  prog,
  Respiracao,
  rgba,
  spring,
  Titulo,
  useFilme,
} from "../../kit";
import {
  Avatar,
  Check,
  COR_NIVEL,
  dentro,
  ESTILO_EYEBROW,
  ESTILO_MONO,
  ESTILO_ROTULO,
  ESTILO_TITULO,
  Onda,
  poseEmChaves,
  RGB_NIVEL,
  Surge,
  tPal,
  vida,
  Xis,
} from "./comum";

export const frases: string[] = ["F032", "F033", "F034", "F035", "F036", "F037", "F038", "F039", "F040", "F041"];

/* Geometria local da escada (origem no chão, à esquerda; y cresce para baixo, degraus em y < 0). */
const PASSO = 300;
const LARG = 270;
const ALTURAS = [130, 240, 350, 460];
const cxDegrau = (i: number) => i * PASSO + LARG / 2;
/** y local do número da taxa semanal (sobe com a taxa: a linha DESCE do Entrada ao Ouro). */
const yTaxa = (taxa: number) => -(650 + ((taxa - 0.04) / 0.02) * 230);

/** Princípios do jogo justo (texto de vapti.ts, encurtado só no recorte). */
const REGRA_ALEATORIO = gamificacao.principios[2].split(":")[0];
const REGRA_LIMITE = (() => {
  const p = gamificacao.principios[3];
  const corpo = p.replace(/^Sinal de /, "").split(" em vez")[0];
  return corpo.charAt(0).toUpperCase() + corpo.slice(1);
})();

export default function Ato4() {
  const { t, tl } = useFilme();
  const F = (id: string) => estadoFrase(tl, id, t);
  const w = (id: string, p: string, k = 0) => tPal(tl, id, p, k);
  const f32 = F("F032");
  const f33 = F("F033");
  const f34 = F("F034");
  const f35 = F("F035");
  const f36 = F("F036");
  const f37 = F("F037");
  const f38 = F("F038");
  const f39 = F("F039");
  const f40 = F("F040");
  const f41 = F("F041");

  /* ---------- tempos-chave ---------- */
  const tNome = [w("F033", "Entrada"), w("F033", "Bronze"), w("F033", "Prata"), w("F033", "Ouro")];
  const hop1 = w("F034", "sobe");
  const hop2 = w("F034", "cada");
  const hop3 = f34.tE + 0.45;
  const tSeis = w("F035", "seis");
  const tRot35 = [tSeis, tSeis + 0.75, tSeis + 1.2, f35.tE];
  const tSobe38 = w("F038", "sobe");

  /* ---------- câmera ---------- */
  const camChaves = [
    { t: f32.t0 - 0.8, zoom: 1, x: 0, y: 0 },
    { t: f32.t1 + 0.1, zoom: 1.035, y: -6 },
    { t: f33.t1 + 0.3, zoom: 1.0, y: 0 },
    { t: f34.t1, zoom: 1.02, x: 8 },
    { t: f35.t0 + 0.4, zoom: 1.0, x: 0 },
    { t: f35.tE + 0.6, zoom: 1.03, x: 10, y: -10 },
    { t: f36.t0 + 0.6, zoom: 1.0, x: 0, y: 0 },
    { t: f37.t1, zoom: 1.03, x: 10 },
    { t: f38.t0 + 0.6, zoom: 1.0, x: 0 },
    { t: f39.t1, zoom: 1.02 },
    { t: f40.t0 + 0.2, zoom: 1.0 },
    { t: f40.t1 + 0.2, zoom: 1.035, y: -6 },
    { t: f41.t0 + 0.6, zoom: 1.0, y: 0 },
    { t: f41.t1 + 1.2, zoom: 1.045 },
  ];

  /* ---------- escada: pose do grupo ---------- */
  const pose = poseEmChaves(t, [
    { t: f33.t0, x: 375, y: 880, s: 1, o: 1 },
    { t: f34.t0 - 0.1, x: 375, y: 880, s: 1 },
    { t: f34.t0 + 0.7, x: 800, y: 935, s: 0.8 },
    { t: f35.t0 - 0.05, x: 800, y: 935, s: 0.8 },
    { t: f35.t0 + 0.7, x: 600, y: 935, s: 0.8 },
    { t: f36.t0 - 0.05, o: 1 },
    { t: f36.t0 + 0.5, o: 0 },
    { t: f38.t0 - 0.3, x: 1010, y: 860, s: 0.62, o: 0 },
    { t: f38.t0 + 0.4, o: 1 },
    { t: f39.t0, o: 1 },
    { t: f39.t0 + 0.45, o: 0 },
  ]);

  /* ---------- marcador (ponto em F034–F035; avatar de quem indica em F038) ---------- */
  const hop = (a: number, b: number, t0: number) => ({ a, b, p: ease.inOutCubic(prog(t, t0, t0 + 0.42)) });
  let marc = { a: 0, b: 0, p: 0 };
  if (t < hop1) marc = { a: 0, b: 0, p: 0 };
  else if (t < hop2) marc = hop(0, 1, hop1);
  else if (t < hop3) marc = hop(1, 2, hop2);
  else marc = hop(2, 3, hop3);
  const marcVis = Math.min(ease.outCubic(prog(t, f34.t0 + 0.15, f34.t0 + 0.5)), 1 - prog(t, f35.t0 + 0.2, f35.t0 + 0.6));
  const marcA = t < tSobe38 ? { a: 1, b: 1, p: 0 } : hop(1, 2, tSobe38);
  const avatarVis = vida(t, f38.t0 + 0.2, f39.t0 + 0.4);

  /* ---------- paleta (F032) que vira o topo dos degraus (F033) ---------- */
  const paleta = vida(t, f32.t0 - 0.2, Infinity, 0.9);
  const fundoNivel = paleta * lerp(1, 0.25, ease.inOutSine(prog(t, f33.t1, f34.t1)));

  return (
    <Camera chaves={camChaves} deriva={4} seed={4}>
      {/* ------------ fundo ------------ */}
      <Camada z={3}>
        {fundoNivel > 0.01
          ? niveis.map((n, i) => (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: i * 480 - 60,
                  top: 0,
                  width: 600,
                  height: 1080,
                  background: `linear-gradient(180deg, rgb(${RGB_NIVEL[n.id]} / 0) 0%, rgb(${RGB_NIVEL[n.id]} / 0.16) 62%, rgb(${RGB_NIVEL[n.id]} / 0) 100%)`,
                  opacity: fundoNivel * ease.outCubic(prog(t, f32.t0 + i * 0.18, f32.t0 + 0.9 + i * 0.18)),
                }}
              />
            ))
          : null}
        <Respiracao tom="verde" x={960} y={560} raio={640} intensidade={0.1} periodo={7} />
        <Respiracao tom="coral" x={1500} y={300} raio={520} intensidade={0.05} periodo={9} fase={0.4} />
      </Camada>

      {/* ------------ F032: "querer ficar" + paleta ------------ */}
      {dentro(t, f32.t0 - 0.8, f33.t0 + 0.8) ? (
        <Camada z={0.15}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center", opacity: 1 - ease.inOutSine(prog(t, f33.t0 - 0.05, f33.t0 + 0.45)), transform: `translate(0, ${(-60 * ease.inOutSine(prog(t, f33.t0 - 0.05, f33.t0 + 0.5))).toFixed(1)}px)` }}>
            <Titulo texto="Querer ficar" frase="F032" tamanho={176} alinhar="centro" brilho={0.9} />
          </div>
        </Camada>
      ) : null}

      {/* pílulas da paleta: linha em F032 → topo de cada degrau no nome falado (F033) */}
      {dentro(t, f32.t0 - 0.5, f34.t0) ? (
        <Camada z={0}>
          {niveis.map((n, i) => {
            const ent = ease.saida(prog(t, f32.t0 - 0.1 + i * 0.22, f32.t0 + 0.5 + i * 0.22));
            const m = ease.inOutCubic(prog(t, tNome[i] - 0.5, tNome[i] + 0.05));
            const x0 = 960 - 2 * 170 + i * 170 + 15;
            const y0 = 650;
            const x1 = 375 + i * PASSO;
            const y1 = 880 - ALTURAS[i];
            const x = lerp(x0, x1, m);
            const y = lerp(y0, y1, m);
            const wd = lerp(140, LARG, m);
            const fim = 1 - prog(t, tNome[i] + 0.3, tNome[i] + 0.55);
            if (ent <= 0 || fim <= 0) return null;
            return (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: wd,
                  height: 8,
                  borderRadius: 4,
                  background: COR_NIVEL[n.id],
                  boxShadow: `0 0 26px rgb(${RGB_NIVEL[n.id]} / 0.6)`,
                  opacity: ent * fim,
                  transform: `translate(0, ${((1 - ent) * 30).toFixed(1)}px) scaleX(${(0.3 + 0.7 * ent).toFixed(3)})`,
                  transformOrigin: "left center",
                }}
              />
            );
          })}
        </Camada>
      ) : null}

      {/* ------------ ESCADA (F033–F035, F038) ------------ */}
      {pose.o > 0.005 && dentro(t, f33.t0 - 0.5, f39.t0 + 0.6) ? (
        <Camada z={0}>
          <div style={{ position: "absolute", left: pose.x, top: pose.y, width: 0, height: 0, transform: `scale(${pose.s.toFixed(4)})`, transformOrigin: "0 0", opacity: pose.o }}>
            {/* chão */}
            <div style={{ position: "absolute", left: -80, top: 0, width: 1290, height: 2, background: "linear-gradient(90deg, transparent, rgb(242 244 247 / 0.22) 15%, rgb(242 244 247 / 0.22) 85%, transparent)", transform: `scaleX(${ease.saida(prog(t, f33.t0, f33.t0 + 0.9)).toFixed(3)})` }} />
            <div style={{ position: "absolute", left: -40, top: 2, width: 1210, height: 120, background: "linear-gradient(180deg, rgb(182 242 58 / 0.05), transparent)", opacity: ease.outCubic(prog(t, tNome[0], tNome[3] + 0.5)) }} />

            {niveis.map((n, i) => {
              const h = ALTURAS[i];
              const sobe = spring(t - (tNome[i] - 0.12), { k: 150, d: 19 });
              const ouroBrilho = i === 3 ? 0.5 * ease.outCubic(prog(t, f35.tE, f35.tE + 0.5)) * (1 - prog(t, f36.t0, f36.t0 + 0.4)) : 0;
              if (t < tNome[i] - 0.12) return null;
              return (
                <div key={n.id} style={{ position: "absolute", left: i * PASSO, top: -h, width: LARG, height: h, overflow: "hidden" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      transform: `translate(0, ${((1 - Math.min(1, sobe)) * (h + 10)).toFixed(1)}px)`,
                      borderRadius: "10px 10px 0 0",
                      background: "linear-gradient(180deg, rgb(38 47 59) 0%, rgb(25 31 40) 70%, rgb(20 25 32) 100%)",
                      border: "1px solid rgb(255 255 255 / 0.07)",
                      borderBottom: "none",
                    }}
                  >
                    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 8, borderRadius: "8px 8px 0 0", background: COR_NIVEL[n.id], boxShadow: `0 0 ${(26 + 30 * ouroBrilho).toFixed(0)}px rgb(${RGB_NIVEL[n.id]} / ${(0.55 + ouroBrilho).toFixed(2)})` }} />
                    <div style={{ ...ESTILO_TITULO, position: "absolute", left: 24, top: 26, fontSize: 48, color: COR_NIVEL[n.id] }}>{n.nome}</div>
                  </div>
                </div>
              );
            })}

            {/* F034: a linha da taxa desce enquanto a escada sobe */}
            {dentro(t, f34.tE - 0.3, f36.t0 + 0.6) ? <LinhaTaxa em={f34.tE - 0.05} t={t} saida={f36.t0} /> : null}
            {/* F035: taxa semanal + efetiva ao mês + juros de R$ 400, por degrau */}
            {dentro(t, f35.t0, f36.t0 + 0.6) ? (
              <>
                {niveis.map((n, i) => (
                  <RotuloTaxa key={n.id} i={i} em={tRot35[i]} saida={f36.t0 - 0.1} destaque={i === 3} principal={i === 0 || i === 3} />
                ))}
                <Legenda35 em={tSeis + 0.2} saida={f36.t0 - 0.1} y={yTaxa(niveis[0].taxaSemanal.valor)} />
              </>
            ) : null}

            {/* marcador que sobe (F034–F035) */}
            {marcVis > 0.01 ? <Marcador a={marc.a} b={marc.b} p={marc.p} opacidade={marcVis} t={t} /> : null}
            {/* ✓ de pagamento em dia sobre o marcador (F034) */}
            {dentro(t, f34.t0, hop2 + 0.6)
              ? [w("F034", "paga"), hop1 + 0.5].map((tc, k) => {
                  const i = k === 0 ? 0 : 1;
                  const o = vida(t, tc, (k === 0 ? hop1 : hop2) + 0.05, 0.2, 0.25);
                  if (o <= 0.01) return null;
                  return (
                    <div key={k} style={{ position: "absolute", left: cxDegrau(i) - 28, top: -ALTURAS[i] - 132, opacity: o }}>
                      <Check em={tc} tamanho={56} />
                    </div>
                  );
                })
              : null}

            {/* F038: quem indica (no degrau) e quem foi indicado (no chão) */}
            {avatarVis > 0.01 ? <Indicacao t={t} marc={marcA} vis={avatarVis} f38={{ t0: f38.t0, tE: f38.tE, indica: w("F038", "indica"), sobe: tSobe38 }} /> : null}
          </div>
        </Camada>
      ) : null}

      {/* ------------ F034: palavra-chave (L2) ------------ */}
      {dentro(t, f34.t0, f35.t0 + 0.4) ? (
        <Camada z={0}>
          <div style={{ position: "absolute", left: 120, top: 330, width: 600, display: "flex", flexDirection: "column", gap: 14, ...ESTILO_TITULO, fontSize: 76, opacity: 1 - ease.inOutSine(prog(t, f35.t0 - 0.1, f35.t0 + 0.35)) }}>
            <Palavra texto="Paga em dia" frase="F034" destaque={false} />
            <Palavra texto="→ sobe" frase="F034" em={hop1 - 0.1} destaque={false} cor="var(--cor-texto-2)" />
            <Palavra texto="→ a taxa cai" frase="F034" em={f34.tE - 0.12} destaque="taxa cai" />
          </div>
        </Camada>
      ) : null}

      {/* ------------ F036: o limite volta em pedaços (L2) ------------ */}
      {dentro(t, f36.t0 - 0.3, f37.t0 + 0.5) ? (
        <Camada z={0}>
          <EsquerdaL2 t={t} eyebrow="Prata e Ouro" pontos={["prata", "ouro"]} emEyebrow={w("F036", "Prata")} saida={f37.t0 - 0.1}>
            <Titulo texto="O limite volta conforme paga" frase="F036" em={w("F036", "limite") - 0.1} destaque="conforme paga" tamanho={70} largura={560} />
          </EsquerdaL2>
          <BarraLimite t={t} em={f36.t0 + 0.25} pagos={[w("F036", "volta"), w("F036", "medida") + 0.3, w("F036", "paga"), f36.t1 + 0.1]} tE={f36.tE} saida={f37.t0 - 0.1} />
        </Camada>
      ) : null}

      {/* ------------ F037: reserva de emergência no Ouro (L2) ------------ */}
      {dentro(t, f37.t0 - 0.3, f38.t0 + 0.5) ? (
        <Camada z={0}>
          <EsquerdaL2 t={t} eyebrow="Ouro" pontos={["ouro"]} emEyebrow={w("F037", "Ouro")} saida={f38.t0 - 0.1}>
            <Titulo texto="Reserva de emergência" frase="F037" tamanho={76} largura={560} />
          </EsquerdaL2>
          <CartaoReserva t={t} em={f37.tE} varrer={[w("F037", "liberada"), w("F037", "segundos") + 0.25]} saida={f38.t0 - 0.1} />
        </Camada>
      ) : null}

      {/* ------------ F038: indicação (palavra-chave; a cena está na escada) ------------ */}
      {dentro(t, f38.t0 - 0.3, f39.t0 + 0.5) ? (
        <Camada z={0}>
          <div style={{ position: "absolute", left: 120, top: 330, width: 560, opacity: 1 - ease.inOutSine(prog(t, f39.t0 - 0.1, f39.t0 + 0.3)) }}>
            <Titulo texto="Indicação acelera o nível" frase="F038" em={w("F038", "indica") - 0.05} destaque="acelera" tamanho={72} largura={560} />
          </div>
        </Camada>
      ) : null}

      {/* ------------ F039: regras visíveis (L2) ------------ */}
      {dentro(t, f39.t0 - 0.3, f40.t0 + 0.5) ? (
        <Camada z={0}>
          <div style={{ position: "absolute", left: 120, top: 360, width: 560, opacity: 1 - ease.inOutSine(prog(t, f40.t0 - 0.25, f40.t0 + 0.15)) }}>
            <Titulo texto="Regras visíveis" em={f39.tE - 0.04} destaque="visíveis" tamanho={84} largura={560} />
          </div>
          <Cartao em={f39.t0 + 0.15} x={760} y={330} largura={1000} altura={330} padding="56px 60px" tom="verde" brilho={0.15} saida={f40.t0 - 0.25}>
            <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
              {[REGRA_ALEATORIO, REGRA_LIMITE].map((txt, k) => {
                const tr = f39.tE + 0.2 + k * 0.85;
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 30 }}>
                    <Check em={tr + 0.2} tamanho={76} />
                    <Surge em={tr - 0.15} dx={-24} dy={0}>
                      <span style={{ ...ESTILO_TITULO, fontSize: 56, whiteSpace: "nowrap" }}>{txt}</span>
                    </Surge>
                  </div>
                );
              })}
            </div>
          </Cartao>
        </Camada>
      ) : null}

      {/* ------------ F040: premia quem paga bem — nunca quem se endivida mais (L1) ------------ */}
      {dentro(t, f40.t0 - 0.3, f41.t0 + 0.8) ? (
        <Camada z={0}>
          <Premia t={t} f40={{ t0: f40.t0, tE: f40.tE, bem: w("F040", "bem"), endivida: w("F040", "endivida"), mais: w("F040", "mais") }} saida={f41.t0 + 0.1} />
        </Camada>
      ) : null}

      {/* ------------ F041: selo "Jogo justo" ------------ */}
      {dentro(t, f41.t0 - 0.3, f41.t1 + 2) ? (
        <Camada z={0}>
          <SeloJogoJusto t={t} em={w("F041", "certo")} tE={f41.tE} emFrase={w("F041", "que") - 0.05} />
        </Camada>
      ) : null}

      {/* primeiro plano */}
      <Camada z={-0.25}>
        <Poeira n={22} bokeh={3} seed={44} opacidade={0.7} velocidade={8} />
      </Camada>
    </Camera>
  );
}

/* ================================================================== */
/* Peças do ato                                                        */
/* ================================================================== */

/** Marcador verde que pula de degrau em degrau (arco). Coordenadas locais da escada. */
function Marcador({ a, b, p, opacidade, t }: { a: number; b: number; p: number; opacidade: number; t: number }) {
  const x = lerp(cxDegrau(a), cxDegrau(b), p);
  const y = lerp(-ALTURAS[a], -ALTURAS[b], p) - 34 - Math.sin(Math.PI * p) * 90;
  const resp = 1 + 0.06 * oscilar(t, 1.6);
  return (
    <div style={{ position: "absolute", left: x - 26, top: y - 26, width: 52, height: 52, opacity: opacidade, transform: `scale(${resp.toFixed(4)})` }}>
      <div style={{ position: "absolute", inset: -26, borderRadius: "50%", background: `radial-gradient(circle, ${rgba("verde", 0.35)} 0%, transparent 65%)` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--cor-verde)", boxShadow: `0 0 0 6px ${rgba("verde", 0.18)}` }} />
    </div>
  );
}

/** Linha tracejada verde da taxa: desce do Entrada ao Ouro (coordenadas locais). */
function LinhaTaxa({ em, t, saida }: { em: number; t: number; saida: number }) {
  const pts = niveis.map((n, i) => [cxDegrau(i), yTaxa(n.taxaSemanal.valor) - 95] as const);
  const p = ease.inOutCubic(prog(t, em, em + 1.0));
  const q = 1 - ease.inOutSine(prog(t, saida - 0.1, saida + 0.35));
  if (p <= 0.001 || q <= 0.001) return null;
  const d = `M${pts[0][0] - 90} ${pts[0][1] - 40} ` + pts.map(([x, y]) => `L${x} ${y}`).join(" ") + ` L${pts[3][0] + 110} ${pts[3][1] + 22}`;
  const [xf, yf] = [pts[3][0] + 110, pts[3][1] + 22];
  return (
    <svg width={10} height={10} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: q }}>
      <path d={d} fill="none" stroke={rgba("verde", 0.18)} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      <path d={d} fill="none" stroke="var(--cor-verde)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      {p > 0.97 ? <path d={`M${xf - 26} ${yf - 18} L${xf} ${yf} L${xf - 30} ${yf + 12}`} fill="none" stroke="var(--cor-verde)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={prog(p, 0.97, 1)} /> : null}
    </svg>
  );
}

/** Rótulo de um degrau em F035: taxa por semana (grande) + efetiva ao mês + juros de R$ 400. */
function RotuloTaxa({ i, em, saida, destaque, principal }: { i: number; em: number; saida: number; destaque: boolean; principal: boolean }) {
  const n = niveis[i];
  const y = yTaxa(n.taxaSemanal.valor);
  const corGrande = destaque ? "var(--cor-verde)" : principal ? "var(--cor-texto)" : "var(--cor-texto-2)";
  return (
    <>
      {/* guia pontilhada até o degrau */}
      <Surge em={em + 0.2} saida={saida} dy={0} style={{ position: "absolute", left: cxDegrau(i) - 1, top: y + 150, width: 2, height: -ALTURAS[i] - y - 150 - 70, background: `repeating-linear-gradient(180deg, rgb(242 244 247 / 0.25) 0 6px, transparent 6px 14px)` }} />
      <Surge em={em} saida={saida} dy={30} mola style={{ position: "absolute", left: cxDegrau(i) - 150, top: y - 46, width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <span style={{ ...ESTILO_MONO, fontSize: destaque ? 92 : 76, lineHeight: 1, color: corGrande, textShadow: destaque ? `0 0 30px ${rgba("verde", 0.45)}` : undefined }}>{n.taxaSemanal.rotulo}</span>
        <span style={{ ...ESTILO_MONO, fontSize: 40, fontWeight: 600, color: destaque ? "var(--cor-texto)" : "var(--cor-texto-2)" }}>{n.efetivaMes.rotulo}</span>
        <span style={{ ...ESTILO_MONO, fontSize: 40, fontWeight: 600, color: destaque ? "var(--cor-texto)" : "var(--cor-texto-2)" }}>{n.jurosExemplo.rotulo}</span>
      </Surge>
    </>
  );
}

/** Legenda das três linhas de F035, à esquerda do Entrada (coordenadas locais). */
function Legenda35({ em, saida, y }: { em: number; saida: number; y: number }) {
  const linha = { ...ESTILO_ROTULO, fontSize: 38, textAlign: "right" as const, color: "var(--cor-texto-2)" };
  return (
    <Surge em={em} saida={saida} dx={-20} dy={0} style={{ position: "absolute", left: -360, top: y - 46, width: 300, display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ ...linha, height: 92, lineHeight: "92px", color: "var(--cor-texto)" }}>por semana</span>
      <span style={{ ...linha, height: 46, lineHeight: "46px" }}>ao mês</span>
      <span style={{ ...linha, height: 46, lineHeight: "46px" }}>
        juros · <span style={{ ...ESTILO_MONO, fontWeight: 600 }}>{projeto.saqueMedio.rotulo}</span>
      </span>
    </Surge>
  );
}

/** Coluna esquerda do L2: eyebrow com pontos de nível + título. */
function EsquerdaL2({ t, eyebrow, pontos, emEyebrow, saida, children }: { t: number; eyebrow: string; pontos: string[]; emEyebrow: number; saida: number; children: ReactNode }) {
  const o = 1 - ease.inOutSine(prog(t, saida, saida + 0.4));
  return (
    <div style={{ position: "absolute", left: 120, top: 300, width: 580, opacity: o }}>
      <Surge em={emEyebrow - 0.05} dy={14} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
        {pontos.map((p) => (
          <span key={p} style={{ width: 22, height: 22, borderRadius: "50%", background: COR_NIVEL[p], boxShadow: `0 0 16px rgb(${RGB_NIVEL[p]} / 0.6)` }} />
        ))}
        <span style={{ ...ESTILO_EYEBROW, fontSize: 30, color: COR_NIVEL[pontos[pontos.length - 1]] }}>{eyebrow}</span>
      </Surge>
      {children}
    </div>
  );
}

/** F036: barra do limite em 4 pedaços; cada parcela paga devolve um pedaço. */
function BarraLimite({ t, em, pagos, tE, saida }: { t: number; em: number; pagos: number[]; tE: number; saida: number }) {
  const W = 196;
  const G = 16;
  return (
    <Cartao em={em} x={780} y={330} largura={980} altura={400} padding="70px 66px" tom="verde" brilho={0.12} saida={saida}>
      <div style={{ position: "relative", display: "flex", gap: G }}>
        {pagos.map((tp, i) => {
          const s = spring(t - tp, { k: 180, d: 20 });
          const pulso = t >= tE ? 0.5 * Math.exp(-(t - tE) * 2.2) : 0;
          return (
            <div key={i} style={{ position: "relative", width: W, height: 92, borderRadius: 14, border: "2px dashed rgb(242 244 247 / 0.22)" }}>
              <div
                style={{
                  position: "absolute",
                  inset: -2,
                  borderRadius: 14,
                  background: "linear-gradient(90deg, rgb(182 242 58 / 0.75), rgb(182 242 58 / 1))",
                  boxShadow: `0 0 ${(30 + 40 * pulso).toFixed(0)}px ${rgba("verde", 0.3 + pulso)}`,
                  transform: `scaleX(${Math.min(1, Math.max(0, s)).toFixed(4)})`,
                  transformOrigin: "left center",
                  opacity: t >= tp ? 1 : 0,
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: G, marginTop: 34 }}>
        {pagos.map((tp, i) => (
          <div key={i} style={{ width: W, display: "flex", justifyContent: "center", alignItems: "center", height: 72 }}>
            {t >= tp ? (
              <Check em={tp} tamanho={68} />
            ) : (
              <span style={{ ...ESTILO_MONO, width: 68, height: 68, borderRadius: "50%", border: "2px solid rgb(242 244 247 / 0.25)", display: "grid", placeItems: "center", fontSize: 32, color: "var(--cor-texto-2)" }}>{i + 1}</span>
            )}
          </div>
        ))}
      </div>
    </Cartao>
  );
}

/** F037: cartão dourado da reserva, com cronômetro que fecha em segundos. */
function CartaoReserva({ t, em, varrer, saida }: { t: number; em: number; varrer: [number, number]; saida: number }) {
  const s = spring(t - em, { k: 170, d: 20 });
  const o = ease.outCubic(prog(t, em - 0.05, em + 0.3));
  const q = ease.inOutSine(prog(t, saida, saida + 0.4));
  if (o <= 0.001 || q >= 0.999) return null;
  const pv = ease.inOutCubic(prog(t, varrer[0], varrer[1]));
  const R = 96;
  const C = 2 * Math.PI * R;
  const ouro = COR_NIVEL.ouro;
  return (
    <div
      style={{
        position: "absolute",
        left: 940,
        top: 270,
        width: 680,
        height: 500,
        borderRadius: 28,
        padding: "48px 56px",
        background: "linear-gradient(160deg, rgb(64 54 30) 0%, rgb(34 33 28) 45%, rgb(24 26 30) 100%)",
        border: `2px solid rgb(${RGB_NIVEL.ouro} / 0.7)`,
        boxShadow: `0 0 70px rgb(${RGB_NIVEL.ouro} / 0.22), 0 40px 90px -30px rgb(0 0 0 / 0.85)`,
        opacity: o * (1 - q),
        transform: `translate(0, ${((1 - s) * 70).toFixed(1)}px) rotate(${((1 - s) * -5 - 1.5).toFixed(3)}deg)`,
        transformOrigin: "50% 100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Umbrella size={54} color={ouro} strokeWidth={2} />
        <span style={{ ...ESTILO_TITULO, fontSize: 46, color: ouro }}>Pré-aprovada</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 44, marginTop: 40 }}>
        <svg width={230} height={230} viewBox="-115 -115 230 230" style={{ overflow: "visible" }}>
          <circle r={R} fill="none" stroke="rgb(242 244 247 / 0.12)" strokeWidth={12} />
          <circle r={R} fill="none" stroke={ouro} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${(C * pv).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90)" style={{ filter: `drop-shadow(0 0 10px rgb(${RGB_NIVEL.ouro} / 0.6))` }} />
          <line x1={0} y1={0} x2={Math.sin(pv * Math.PI * 2) * 70} y2={-Math.cos(pv * Math.PI * 2) * 70} stroke="var(--cor-texto)" strokeWidth={6} strokeLinecap="round" opacity={1 - prog(t, varrer[1], varrer[1] + 0.25)} />
          <rect x={-14} y={-R - 34} width={28} height={16} rx={4} fill={ouro} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {t >= varrer[1] ? <Check em={varrer[1]} tamanho={84} cheio /> : <div style={{ height: 84 }} />}
          <span style={{ ...ESTILO_ROTULO, fontSize: 40, color: "var(--cor-texto)" }}>em segundos</span>
        </div>
      </div>
    </div>
  );
}

/** F038: avatar de quem indica (sobe na escada) e do indicado (paga ✓); nenhuma dívida muda de dono. */
function Indicacao({ t, marc, vis, f38 }: { t: number; marc: { a: number; b: number; p: number }; vis: number; f38: { t0: number; tE: number; indica: number; sobe: number } }) {
  const TAM = 110;
  const ax = lerp(cxDegrau(marc.a), cxDegrau(marc.b), marc.p);
  const ay = lerp(-ALTURAS[marc.a], -ALTURAS[marc.b], marc.p) - Math.sin(Math.PI * marc.p) * 90;
  // indicado: no chão, à esquerda da escada (coordenadas locais)
  const bx = -330;
  const by = 0;
  const pl = ease.inOutCubic(prog(t, f38.indica, f38.indica + 0.8));
  const ctrl = [(-330 + cxDegrau(1)) / 2, -560];
  const linha = `M${bx} ${by - TAM - 10} Q ${ctrl[0]} ${ctrl[1]}, ${cxDegrau(1)} ${-ALTURAS[1] - TAM - 10}`;
  // pulso viaja do indicado para quem indicou
  const pp = ease.inOutCubic(prog(t, f38.tE + 0.45, f38.sobe - 0.05));
  const bez = (u: number) => {
    const x0 = bx;
    const y0 = by - TAM - 10;
    const x2 = cxDegrau(1);
    const y2 = -ALTURAS[1] - TAM - 10;
    return [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * ctrl[0] + u * u * x2, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * ctrl[1] + u * u * y2];
  };
  const [px, py] = bez(pp);
  const k = 1 / 0.62; // compensa a escala da escada para manter os textos ≥ 28 px
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: vis }}>
      <svg width={10} height={10} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={linha} fill="none" stroke="rgb(242 244 247 / 0.4)" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pl} />
      </svg>
      {pp > 0 && pp < 1 ? <div style={{ position: "absolute", left: px - 16, top: py - 16, width: 32, height: 32, borderRadius: "50%", background: "var(--cor-verde)", boxShadow: `0 0 26px ${rgba("verde", 0.8)}` }} /> : null}
      {/* quem indica */}
      <div style={{ position: "absolute", left: ax - TAM / 2, top: ay - TAM - 6 }}>
        <Avatar tamanho={TAM} tom="verde" />
      </div>
      {t >= f38.sobe ? <Onda em={f38.sobe + 0.42} x={cxDegrau(2)} y={-ALTURAS[2] - TAM / 2} tom="verde" raio={190} intensidade={0.6} /> : null}
      {/* indicado */}
      <div style={{ position: "absolute", left: bx - TAM / 2, top: by - TAM - 6 }}>
        <Avatar tamanho={TAM} tom="azul" />
        <div style={{ position: "absolute", right: -30, top: -30 }}>{t >= f38.tE ? <Check em={f38.tE} tamanho={70} cheio /> : null}</div>
      </div>
      {/* nenhuma dívida muda de dono */}
      <Surge em={f38.sobe + 0.55} dy={12} style={{ position: "absolute", left: bx - 120, top: 40, display: "flex", alignItems: "center", gap: 16 * k }}>
        <Unlink size={34 * k} color="var(--cor-texto-2)" strokeWidth={2} />
        <span style={{ ...ESTILO_ROTULO, fontSize: 32 * k }}>sem transferir dívida</span>
      </Surge>
    </div>
  );
}

/** F040: ✓ "premia quem paga bem" × ✕ "nunca quem se endivida mais" (riscado em coral). */
function Premia({ t, f40, saida }: { t: number; f40: { t0: number; tE: number; bem: number; endivida: number; mais: number }; saida: number }) {
  const q = ease.inOutSine(prog(t, saida, saida + 0.5));
  const risco = ease.inOutCubic(prog(t, f40.mais + 0.1, f40.mais + 0.5));
  const nunca = spring(t - f40.tE, { k: 260, d: 16 });
  const apagar = 1 - 0.45 * risco;
  return (
    <div style={{ position: "absolute", left: 250, top: 330, opacity: 1 - q, transform: `translate(0, ${(-50 * q).toFixed(1)}px) scale(${(1 - 0.08 * q).toFixed(4)})`, transformOrigin: "50% 0%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 36, ...ESTILO_TITULO, fontSize: 96 }}>
        <Check em={f40.bem + 0.05} tamanho={96} />
        <Palavra texto="Premia quem paga bem" frase="F040" destaque="paga bem" brilho={0.7} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 36, marginTop: 40, ...ESTILO_TITULO, fontSize: 96 }}>
        <Xis em={f40.endivida + 0.25} tamanho={96} />
        <span style={{ display: "inline-block", transform: `scale(${(t >= f40.tE ? 0.86 + 0.14 * nunca : 1).toFixed(4)})`, transformOrigin: "0% 70%" }}>
          <Palavra texto="Nunca" frase="F040" tomDestaque="coral" brilho={0.9} />
        </span>
        <span style={{ position: "relative", display: "inline-block", opacity: apagar }}>
          <Palavra texto="quem endivida mais" frase="F040" destaque={false} cor="var(--cor-texto-2)" />
          <span style={{ position: "absolute", left: -8, right: -8, top: "54%", height: 9, borderRadius: 5, background: "var(--cor-coral)", boxShadow: `0 0 18px ${rgba("coral", 0.5)}`, transform: `scaleX(${risco.toFixed(4)})`, transformOrigin: "left center" }} />
        </span>
      </div>
    </div>
  );
}

/** F041: selo "Jogo justo" que assenta; na ênfase, "o que um investidor quer ver". */
function SeloJogoJusto({ t, em, tE, emFrase }: { t: number; em: number; tE: number; emFrase: number }) {
  const s = spring(t - em, { k: 240, d: 17 });
  const o = ease.outCubic(prog(t, em, em + 0.2));
  if (o <= 0.001) return null;
  const esc = 1.55 - 0.55 * s;
  const rot = -14 + 10 * Math.min(1.1, s);
  return (
    <>
      <Respiracao tom="verde" x={960} y={470} raio={420} intensidade={0.2 * o} periodo={5} />
      <Onda em={em + 0.16} x={960} y={470} tom="verde" raio={360} intensidade={0.55} />
      <div style={{ position: "absolute", left: 960 - 190, top: 470 - 190, width: 380, height: 380, opacity: o, transform: `scale(${esc.toFixed(4)}) rotate(${rot.toFixed(3)}deg)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid var(--cor-verde)", boxShadow: `0 0 50px ${rgba("verde", 0.3)}, inset 0 0 40px ${rgba("verde", 0.12)}`, background: "radial-gradient(circle, rgb(30 38 26 / 0.95) 0%, rgb(18 22 20 / 0.95) 70%)" }} />
        <div style={{ position: "absolute", inset: 18, borderRadius: "50%", border: `2px dashed ${rgba("verde", 0.5)}` }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <Scale size={86} color="var(--cor-verde)" strokeWidth={1.8} />
          <span style={{ ...ESTILO_TITULO, fontSize: 58, color: "var(--cor-texto)", whiteSpace: "nowrap" }}>Jogo justo</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 742, display: "flex", justifyContent: "center", ...ESTILO_TITULO, fontSize: 60, fontWeight: 700 }}>
        <Palavra texto="O que um investidor quer ver" em={Math.min(emFrase, tE - 0.4)} passo={0.09} destaque="investidor" modo="subir" />
      </div>
    </>
  );
}
