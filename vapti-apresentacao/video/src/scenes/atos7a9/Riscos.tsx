/**
 * Ato 7, segunda metade (F070–F074) — V19 Riscos e mitigação.
 * F070: a luz vira coral discreto; "Riscos" e quatro cartas viradas em profundidade.
 * F071–F074: cada carta vem para a frente, mostra o risco (coral) e VIRA a mitigação (verde)
 * no verbo da frase; resolvida, encolhe até o marcador 1–4 à esquerda. Mesmo cuidado visual
 * e o mesmo brilho para risco e mitigação: franco, sem drama e sem minimizar.
 */
import type { CSSProperties, ReactNode } from "react";
import { Lock, LockOpen, PenLine, ShieldCheck, TriangleAlert, Flag, Check } from "lucide-react";
import { estrutura, niveis, preco, projeto, riscos } from "../../../../src/data/vapti";
import {
  Barra,
  brilhoCaixa,
  Camada,
  Camera,
  clamp01,
  COR,
  ease,
  envelope,
  Halo,
  MarcaVapti,
  Palavra,
  prog,
  Respiracao,
  rgba,
  SOMBRA_PROFUNDA,
  spring,
  Titulo,
  Tracado,
  useFilme,
  useFrase,
  type EstadoFrase,
} from "../../kit";
import { mix, tPalavra } from "./base";

const IDS = ["F071", "F072", "F073", "F074"] as const;
const CW = 1040;
const CH = 640;

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** "Risco: parceira → cotar 3" → ["Parceira", "Cotar 3"]. */
function parTela(tela: string): [string, string] {
  const [a, b] = tela.replace(/^Risco:\s*/, "").split("→");
  return [capital((a ?? "").trim()), capital((b ?? "").trim())];
}

const PRAZO = riscos.find((r) => /meses/.test(r.risco))?.risco.match(/\d+ a \d+ meses/)?.[0] ?? "";
const VEZES = `≈ ${preco.vezesZippiBase.valor}x`;
const VAPTI_BASE = preco.exemplo.efetivaMes;

interface Tempos {
  f: EstadoFrase;
  tIn: number;
  tFlip: number;
  tE: number;
  tOut: number;
}

/* ------------------------------------------------------------------ */
/* Faces das cartas (coordenadas locais 1040×640)                       */
/* ------------------------------------------------------------------ */

function Face({ tom, children, icone }: { tom: "coral" | "verde"; children: ReactNode; icone: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 26,
        background: "linear-gradient(180deg, rgb(33 41 52 / 0.97) 0%, rgb(22 27 34 / 0.98) 100%)",
        border: `1.5px solid ${rgba(tom, 0.55)}`,
        boxShadow: [SOMBRA_PROFUNDA, brilhoCaixa(tom, 0.42)].join(", "),
        overflow: "hidden",
      }}
    >
      <span style={{ position: "absolute", left: -1, top: 28, bottom: 28, width: 6, borderRadius: "0 4px 4px 0", background: COR[tom], boxShadow: `0 0 18px ${rgba(tom, 0.45)}` }} />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 40,
          width: 64,
          height: 64,
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background: rgba(tom, 0.14),
          border: `1.5px solid ${rgba(tom, 0.6)}`,
          color: COR[tom],
        }}
      >
        {icone}
      </div>
      {children}
    </div>
  );
}

const textoP = (extra: CSSProperties = {}): CSSProperties => ({ position: "absolute", margin: 0, ...extra });

/** Costas da carta (no baralho, antes de vir para a frente). */
function Costas({ n }: { n: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 26,
        background: "linear-gradient(160deg, rgb(37 30 30 / 0.98) 0%, rgb(22 27 34 / 0.98) 70%)",
        border: `1.5px solid ${rgba("coral", 0.45)}`,
        boxShadow: SOMBRA_PROFUNDA,
      }}
    >
      <div style={{ position: "absolute", inset: 26, borderRadius: 16, border: `1px dashed ${rgba("coral", 0.28)}` }} />
      <p className="font-mono" style={textoP({ right: 60, bottom: 40, fontSize: 120, fontWeight: 700, color: rgba("coral", 0.5), lineHeight: 1 })}>
        {n}
      </p>
      <div style={{ position: "absolute", left: 56, top: 52, color: rgba("coral", 0.7) }}>
        <TriangleAlert size={64} strokeWidth={1.6} />
      </div>
    </div>
  );
}

/* Risco 1 — parceira → cotar 3 */
function Parceira({ t, verso, tp }: { t: number; verso: boolean; tp: Tempos }) {
  const no = (x: number, y: number, w: number, hh: number, tom: "coral" | "verde" | "texto", filho: ReactNode, o = 1, s = 1) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: hh,
        borderRadius: 22,
        display: "grid",
        placeItems: "center",
        background: tom === "texto" ? "rgb(255 255 255 / 0.04)" : rgba(tom, 0.1),
        border: `2px solid ${tom === "texto" ? "rgb(242 244 247 / 0.25)" : rgba(tom, 0.8)}`,
        opacity: o,
        transform: `scale(${s.toFixed(4)})`,
      }}
    >
      {filho}
    </div>
  );
  const vapti = no(110, 255, 250, 130, "texto", <MarcaVapti tamanho={58} brilho={0.4} />);
  if (!verso) {
    const pulso = ((t - tp.tIn) * 0.8) % 1;
    return (
      <>
        {vapti}
        <svg width={CW} height={CH} style={{ position: "absolute", inset: 0 }} aria-hidden="true">
          <line x1={360} y1={320} x2={680} y2={320} stroke={COR.coral} strokeWidth={6} strokeLinecap="round" />
          <circle cx={mix(370, 670, pulso < 0 ? 0 : pulso)} cy={320} r={9} fill={COR.coral} opacity={0.9} />
        </svg>
        <div style={{ position: "absolute", left: 495, top: 232, color: COR.coral, opacity: 0.6 + 0.4 * Math.abs(Math.sin((t - tp.tIn) * 2.2)) }}>
          <TriangleAlert size={50} strokeWidth={2} />
        </div>
        {no(680, 250, 270, 140, "coral", <span style={{ fontFamily: "var(--fonte-titulo)", fontWeight: 700, fontSize: 42 }}>Parceira</span>)}
      </>
    );
  }
  const tempos = [tp.tFlip + 0.35, mix(tp.tFlip + 0.35, tp.tE, 0.5), tp.tE];
  const ys = [118, 262, 406];
  return (
    <>
      {vapti}
      <p style={textoP({ left: 690, top: 58, fontSize: 30, fontWeight: 600, color: "var(--cor-texto-2)", opacity: ease.outCubic(prog(t, tempos[0] - 0.1, tempos[0] + 0.3)) })}>Parceiras</p>
      <svg width={CW} height={CH} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
        {ys.map((y, i) => (
          <Tracado key={i} d={`M360 320 C 520 320, 540 ${y + 58}, 690 ${y + 58}`} em={tempos[i] - 0.25} dur={0.4} tom="verde" espessura={4} />
        ))}
      </svg>
      {ys.map((y, i) => {
        const s = spring(t - tempos[i], { k: 260, d: 18 });
        const o = clamp01((t - tempos[i]) * 6);
        return (
          <div key={i}>
            {no(690, y, 250, 116, "verde", <span className="font-mono" style={{ fontSize: 52, fontWeight: 700, color: COR.verde }}>{i + 1}</span>, o, 0.7 + 0.3 * s)}
          </div>
        );
      })}
    </>
  );
}

/* Risco 2 — taxa ≈ 2x a Zippi → custo em reais na tela e taxa que cai por nível */
function Taxa({ t, verso, tp }: { t: number; verso: boolean; tp: Tempos }) {
  if (!verso) {
    const tDobro = tPalavra(tp.f.f, "dobro", tp.f.t0, tp.f.t0 + 0.8);
    const comp = 700;
    const lz = (preco.zippiEfetivaMes.valor / 0.5) * comp;
    return (
      <>
        <p style={textoP({ left: 140, top: 58, fontSize: 30, fontWeight: 600, color: "var(--cor-texto-2)" })}>ao mês</p>
        <p style={textoP({ left: 60, top: 196, fontFamily: "var(--fonte-titulo)", fontWeight: 700, fontSize: 40, color: COR.cinza })}>Zippi</p>
        <p style={textoP({ left: 60, top: 336, fontFamily: "var(--fonte-titulo)", fontWeight: 700, fontSize: 40, color: "var(--cor-texto)" })}>Vapti</p>
        <div style={{ position: "absolute", left: 230, top: 190 }}>
          <Barra valor={preco.zippiEfetivaMes.valor} max={0.5} comprimento={comp} espessura={70} orientacao="h" em={tp.f.t0 + 0.25} tom="cinza">
            <span className="font-mono" style={{ fontSize: 44, fontWeight: 700, color: COR.cinza }}>{preco.zippiEfetivaMes.rotulo}</span>
          </Barra>
        </div>
        <div style={{ position: "absolute", left: 230, top: 330 }}>
          <Barra valor={VAPTI_BASE.valor} max={0.5} comprimento={comp} espessura={70} orientacao="h" em={tp.f.t0 + 0.5} tom="coral">
            <span className="font-mono" style={{ fontSize: 44, fontWeight: 700, color: COR.coral }}>{VAPTI_BASE.rotulo}</span>
          </Barra>
        </div>
        {[0, 1].map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 230 + k * lz,
              top: 430,
              width: lz - 4,
              height: 26,
              borderRadius: 6,
              border: `2px dashed ${rgba("cinza", 0.85)}`,
              opacity: ease.outCubic(prog(t, tDobro - 0.1 + k * 0.25, tDobro + 0.2 + k * 0.25)),
            }}
          />
        ))}
        <p className="font-mono" style={textoP({ left: 230 + 2 * lz + 30, top: 408, fontSize: 64, fontWeight: 700, color: COR.coral, opacity: ease.outCubic(prog(t, tDobro + 0.4, tDobro + 0.7)), lineHeight: 1 })}>
          {VEZES}
        </p>
      </>
    );
  }
  const base = 520;
  const escala = 3.4;
  const tempos = niveis.map((_, i) => tp.tFlip + 0.25 + i * ((tp.tE - tp.tFlip - 0.25) / 3));
  return (
    <>
      <p style={textoP({ left: 140, top: 58, fontSize: 30, fontWeight: 600, color: "var(--cor-texto-2)" })}>Juros de {projeto.saqueMedio.rotulo}, por nível</p>
      <div style={{ position: "absolute", left: 120, top: base, width: 860, height: 2, background: "var(--cor-borda-forte)" }} />
      {niveis.map((n, i) => (
        <div key={n.id} style={{ position: "absolute", left: 150 + i * 215, top: base - 100 * escala }}>
          <Barra valor={n.jurosExemplo.valor} max={100} comprimento={100 * escala} espessura={130} em={tempos[i]} tom="verde">
            <span className="font-mono" style={{ fontSize: 50, fontWeight: 700, color: COR.verde, letterSpacing: "-0.03em" }}>
              {n.jurosExemplo.rotulo}
            </span>
          </Barra>
        </div>
      ))}
      <svg width={CW} height={CH} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
        <Tracado d={`M215 ${base + 52} L 860 ${base + 52}`} em={tp.tE} dur={0.6} tom="verde" espessura={3} tracejado />
        <Tracado d={`M846 ${base + 40} L 862 ${base + 52} L 846 ${base + 64}`} em={tp.tE + 0.5} dur={0.2} tom="verde" espessura={3} />
      </svg>
    </>
  );
}

/* Risco 3 — regra nova → parecer jurídico antes de assinar */
function Regra({ t, verso, tp }: { t: number; verso: boolean; tp: Tempos }) {
  const linhas = (n: number, w: number) =>
    Array.from({ length: n }, (_, i) => <span key={i} style={{ display: "block", height: 10, width: i % 3 === 2 ? w * 0.6 : w, borderRadius: 5, background: "rgb(242 244 247 / 0.12)", marginTop: 18 }} />);
  const sTimbre = spring(t - tp.tE, { k: 300, d: 20 });
  const abre = ease.outCubic(prog(t, tp.tE + 0.3, tp.tE + 0.6));
  return (
    <>
      {/* a norma */}
      <div style={{ position: "absolute", left: 96, top: 130, width: 380, height: 430, borderRadius: 14, background: "rgb(242 244 247 / 0.05)", border: "1.5px solid rgb(242 244 247 / 0.18)", padding: "30px 32px" }}>
        <p className="font-mono" style={{ margin: 0, fontSize: 28, lineHeight: 1.25, color: verso ? "var(--cor-texto-2)" : COR.coral, fontWeight: 500 }}>
          {estrutura.normaCurta}
        </p>
        {linhas(7, 300)}
      </div>
      {/* o contrato */}
      <div style={{ position: "absolute", left: 560, top: 110, width: 400, height: 470, borderRadius: 14, background: "rgb(242 244 247 / 0.07)", border: "1.5px solid rgb(242 244 247 / 0.22)", padding: "34px 34px" }}>
        {linhas(6, 320)}
        <div style={{ position: "absolute", left: 34, right: 90, top: 370, height: 0, borderTop: `2px dashed ${verso ? rgba("verde", 0.4 + 0.5 * abre) : rgba("coral", 0.8)}` }} />
        <div style={{ position: "absolute", right: 30, top: 340, color: verso && abre > 0.5 ? COR.verde : COR.coral }}>{verso && abre > 0.5 ? <LockOpen size={46} strokeWidth={2} /> : <Lock size={46} strokeWidth={2} />}</div>
        {!verso ? (
          <div style={{ position: "absolute", right: 120, top: 290, color: "var(--cor-texto-2)", transform: `translate(0, ${(Math.sin((t - tp.tIn) * 2.4) * 6).toFixed(2)}px)` }}>
            <PenLine size={48} strokeWidth={1.8} />
          </div>
        ) : (
          <svg width={400} height={470} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
            <Tracado d="M50 362 C 70 330, 90 380, 112 350 S 150 330, 165 360 S 205 345, 230 352" em={tp.tE + 0.55} dur={0.6} tom="verde" espessura={3.5} />
          </svg>
        )}
        {verso ? (
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 150,
              padding: "16px 26px",
              borderRadius: 16,
              border: `4px solid ${COR.verde}`,
              color: COR.verde,
              background: "rgb(14 17 22 / 0.65)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "var(--fonte-titulo)",
              fontWeight: 800,
              fontSize: 48,
              letterSpacing: "-0.02em",
              opacity: clamp01((t - tp.tE) * 8),
              transform: `rotate(-7deg) scale(${(t >= tp.tE ? 1.5 - 0.5 * sTimbre : 1.5).toFixed(4)})`,
              boxShadow: brilhoCaixa("verde", 0.5),
            }}
          >
            <Check size={44} strokeWidth={3} />
            Parecer
          </div>
        ) : null}
      </div>
    </>
  );
}

/* Risco 4 — prazo de 2 a 4 meses → começar já */
function Prazo({ t, verso, tp }: { t: number; verso: boolean; tp: Tempos }) {
  const x0 = 110;
  const passo = 136;
  const y = 330;
  const xm = (m: number) => x0 + m * passo;
  const agora = verso ? ease.outCubic(prog(t, tp.tE, tp.tE + 0.4)) : 0;
  const cresce = verso ? ease.inOutCubic(prog(t, tp.tFlip + 0.2, tp.tE + 0.2)) : 0;
  return (
    <>
      <div style={{ position: "absolute", left: x0, top: y, width: 6 * passo, height: 3, background: "rgb(242 244 247 / 0.35)", borderRadius: 2 }} />
      {Array.from({ length: 7 }, (_, m) => (
        <div key={m} style={{ position: "absolute", left: xm(m) - 1.5, top: y - (m === 0 ? 22 : 12), width: 3, height: m === 0 ? 47 : 27, background: m === 0 ? "var(--cor-texto)" : "rgb(242 244 247 / 0.35)" }} />
      ))}
      <p
        style={textoP({
          left: x0 - 40,
          top: y - 86,
          fontFamily: "var(--fonte-titulo)",
          fontWeight: 800,
          fontSize: 40,
          color: agora > 0 ? COR.verde : "var(--cor-texto)",
          textShadow: agora > 0 ? `0 0 ${Math.round(18 + 20 * agora)}px ${rgba("verde", 0.5 * agora)}` : undefined,
        })}
      >
        Hoje
      </p>
      {/* espera de 2 a 4 meses */}
      <svg width={CW} height={CH} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
        <path d={`M${xm(2)} ${y + 70} L${xm(2)} ${y + 88} L${xm(4)} ${y + 88} L${xm(4)} ${y + 70}`} fill="none" stroke={verso ? rgba("cinza", 0.9) : COR.coral} strokeWidth={4} strokeLinejoin="round" />
        <rect x={xm(2)} y={y - 9} width={xm(4) - xm(2)} height={21} rx={6} fill={rgba(verso ? "cinza" : "coral", 0.22)} stroke={verso ? rgba("cinza", 0.7) : rgba("coral", 0.8)} strokeWidth={2} strokeDasharray="7 6" />
      </svg>
      <p className="font-mono" style={textoP({ left: xm(2), width: xm(4) - xm(2), top: y + 104, textAlign: "center", fontSize: 44, fontWeight: 700, color: verso ? COR.cinza : COR.coral })}>
        {PRAZO}
      </p>
      <div style={{ position: "absolute", left: xm(3) - 20, top: y - 92, color: verso ? COR.cinza : COR.coral }}>
        <Flag size={44} strokeWidth={2} />
      </div>
      {verso ? (
        <>
          <div
            style={{
              position: "absolute",
              left: x0,
              top: y - 10,
              width: Math.max(0, (xm(2) - x0) * cresce),
              height: 22,
              borderRadius: 11,
              background: `linear-gradient(90deg, ${rgba("verde", 0.6)}, ${COR.verde})`,
              boxShadow: brilhoCaixa("verde", 0.5),
            }}
          />
          <p style={textoP({ left: x0 + 6, top: y + 44, fontSize: 34, fontWeight: 700, color: COR.verde, opacity: ease.outCubic(prog(t, tp.tFlip + 0.3, tp.tFlip + 0.7)) })}>Conversas</p>
          {agora > 0 ? <Halo tom="verde" x={x0} y={y} w={220 * (0.6 + 0.6 * agora)} intensidade={0.5 * (1 - 0.5 * agora)} /> : null}
        </>
      ) : null}
    </>
  );
}

const FACES = [Parceira, Taxa, Regra, Prazo];

/* ------------------------------------------------------------------ */
/* Cena                                                                */
/* ------------------------------------------------------------------ */

const LEQUE = [
  { x: -330, y: 40, r: -10 },
  { x: -110, y: 8, r: -3.5 },
  { x: 110, y: 8, r: 3.5 },
  { x: 330, y: 40, r: 10 },
];
const poseLeque = (i: number) => ({ cx: 960 + LEQUE[i].x, cy: 690 + LEQUE[i].y, s: 0.46, r: LEQUE[i].r, o: 0.75 });
const poseBaralho = (k: number) => ({ cx: 1240 + 24 * k, cy: 530 - 16 * k, s: 1 - 0.035 * k, r: 0, o: Math.max(0, 1 - 0.3 * Math.min(k, 1) - 0.14 * Math.max(0, k - 1)) });
const MARCADOR = (i: number) => ({ cx: 173 + 62 * i, cy: 291 });
const misturaPose = (a: ReturnType<typeof poseLeque>, b: ReturnType<typeof poseLeque>, p: number) => ({ cx: mix(a.cx, b.cx, p), cy: mix(a.cy, b.cy, p), s: mix(a.s, b.s, p), r: mix(a.r, b.r, p), o: mix(a.o, b.o, p) });

export function Riscos() {
  const { t } = useFilme();
  const f70 = useFrase("F070");
  const fs = IDS.map((id) => useFrase(id));
  const vida = ease.outCubic(prog(t, f70.t0 - 0.1, f70.t0 + 0.6));
  if (vida <= 0) return null;

  const tps: Tempos[] = fs.map((f, i) => {
    const piv = ["por", "isso", "nada", "por"][i];
    const enf = ["tres", "transparencia", "parecer", "comecam"][i];
    const tFlip = tPalavra(f.f, piv, f.t0 + 0.6, f.tE - 1.2) - 0.08;
    return {
      f,
      tIn: i === 0 ? f.t0 - 0.25 : f.t0 - 0.12,
      tFlip,
      tE: tPalavra(f.f, enf, tFlip, f.tE),
      tOut: i < 3 ? fs[i + 1].t0 - 0.12 : Infinity,
    };
  });

  /* F070: título central → rótulo à esquerda na F071 */
  const vaiCanto = ease.inOutCubic(prog(t, tps[0].tIn, tps[0].tIn + 0.9));
  const sublinha = f70.tE + 0.1;

  return (
    <div className="absolute inset-0" style={{ opacity: vida }}>
      <Camera chaves={[{ t: f70.t0, zoom: 1.0 }, { t: tps[0].tIn, zoom: 1.03 }, { t: tps[0].tIn + 1.0, zoom: 1.0, curva: ease.inOutCubic }, { t: fs[3].t1 + 1, zoom: 1.025 }]} deriva={4} seed={21}>
        <Camada z={2}>
          <Respiracao tom="coral" x={960} y={560} raio={760} intensidade={0.075} periodo={7} opacidade={vida} />
        </Camada>

        {/* cartas: de trás para a frente */}
        <Camada z={0}>
          {[3, 2, 1, 0].map((i) => {
            const tp = tps[i];
            const entra = spring(t - (f70.t0 + 0.3 + 0.12 * i), { k: 150, d: 20 });
            if (t < f70.t0 + 0.3 + 0.12 * i) return null;
            // posição no baralho: sobe uma casa a cada carta resolvida antes desta
            let k = i;
            for (let j = 0; j < i; j++) k -= ease.inOutCubic(prog(t, tps[j].tOut, tps[j].tOut + 0.6));
            const pLeque = ease.inOutCubic(prog(t, tps[0].tIn + 0.06 * i, tps[0].tIn + 0.06 * i + 0.95));
            let pose = misturaPose(poseLeque(i), poseBaralho(k), pLeque);
            pose = { ...pose, cy: pose.cy + (1 - entra) * 140, o: pose.o * clamp01(entra * 1.5) };
            const pVoa = ease.inOutCubic(prog(t, tp.tOut, tp.tOut + 0.7));
            if (pVoa >= 1) return null;
            if (pVoa > 0) {
              const m = MARCADOR(i);
              const pS = ease.outCubic(pVoa);
              pose = { cx: mix(pose.cx, m.cx, pVoa), cy: mix(pose.cy, m.cy, pVoa), s: mix(pose.s, 0.045, pS), r: mix(0, -6, pVoa), o: 1 - ease.inOutSine(clamp01((pVoa - 0.2) / 0.6)) };
            }
            const frente = clamp01(1 - k * 1.25) * pLeque;
            const u = prog(t, tp.tFlip, tp.tFlip + 0.42);
            const flipX = Math.max(0.015, Math.abs(Math.cos(Math.PI * u)));
            const verso = u >= 0.5;
            const lift = 1 + 0.035 * Math.sin(Math.PI * u);
            const Conteudo = FACES[i];
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: CW,
                  height: CH,
                  opacity: pose.o,
                  transform: `translate(${(pose.cx - CW / 2).toFixed(2)}px, ${(pose.cy - CH / 2).toFixed(2)}px) rotate(${pose.r.toFixed(3)}deg) scale(${(pose.s * lift).toFixed(4)}) scaleX(${flipX.toFixed(4)})`,
                  transformOrigin: `${CW / 2}px ${CH / 2}px`,
                }}
              >
                {frente < 0.999 ? <div style={{ position: "absolute", inset: 0, opacity: 1 - frente }}><Costas n={i + 1} /></div> : null}
                {frente > 0.001 ? (
                  <div style={{ position: "absolute", inset: 0, opacity: frente }}>
                    <Face tom={verso ? "verde" : "coral"} icone={verso ? <ShieldCheck size={38} strokeWidth={2} /> : <TriangleAlert size={36} strokeWidth={2} />}>
                      <Conteudo t={t} verso={verso} tp={tp} />
                    </Face>
                  </div>
                ) : null}
              </div>
            );
          })}
        </Camada>

        {/* F070: "Riscos" no centro */}
        <Camada z={-0.05}>
          <div
            className="absolute inset-x-0 flex flex-col items-center"
            style={{
              top: 330,
              opacity: 1 - ease.inOutSine(prog(t, tps[0].tIn + 0.35, tps[0].tIn + 0.8)),
              transform: `translate(${(-760 * vaiCanto).toFixed(2)}px, ${(-150 * vaiCanto).toFixed(2)}px) scale(${(1 - 0.66 * vaiCanto).toFixed(4)})`,
              transformOrigin: "50% 50%",
            }}
          >
            <Halo tom="coral" x={960} y={90} w={900} h={360} intensidade={0.16 * envelope(t, f70.tE - 0.2, Infinity, 0.6)} />
            <Titulo texto="Riscos" em={f70.tE - 0.12} tamanho={168} alinhar="centro" destaque={false} />
            <svg width={420} height={20} style={{ marginTop: 18, overflow: "visible" }} aria-hidden="true">
              <Tracado d="M10 10 L410 10" em={sublinha} dur={0.6} tom="coral" espessura={6} />
            </svg>
          </div>
        </Camada>
      </Camera>

      {/* Coluna esquerda (L2): rótulo, marcadores 1–4, risco → mitigação */}
      <div style={{ position: "absolute", left: 150, top: 178, opacity: ease.inOutSine(prog(t, tps[0].tIn + 0.5, tps[0].tIn + 0.95)) }}>
        <p style={{ margin: 0, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 52, letterSpacing: "-0.03em", color: "var(--cor-texto)" }}>Riscos</p>
      </div>
      {tps.map((tp, i) => {
        const m = MARCADOR(i);
        const aparece = ease.outCubic(prog(t, tps[0].tIn + 0.6 + i * 0.08, tps[0].tIn + 1 + i * 0.08));
        const ativo = t >= tp.tIn && t < (i < 3 ? tp.tOut + 0.55 : Infinity);
        const tVerde = i < 3 ? tp.tOut + 0.55 : tp.tE + 0.35;
        const verde = clamp01((t - tVerde) * 5);
        const flash = t >= tVerde ? Math.exp(-(t - tVerde) * 4) : 0;
        return (
          <div
            key={i}
            className="font-mono"
            style={{
              position: "absolute",
              left: m.cx - 23,
              top: m.cy - 23,
              width: 46,
              height: 46,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              fontSize: 24,
              fontWeight: 700,
              opacity: aparece,
              color: verde > 0.5 ? "var(--cor-tinta)" : ativo ? COR.coral : "var(--cor-texto-3)",
              background: verde > 0 ? rgba("verde", verde) : ativo ? rgba("coral", 0.16) : "transparent",
              border: `2px solid ${verde > 0.5 ? COR.verde : ativo ? COR.coral : "rgb(242 244 247 / 0.25)"}`,
              boxShadow: verde > 0 ? `0 0 ${Math.round(16 + 24 * flash)}px ${rgba("verde", 0.35 + 0.4 * flash)}` : ativo ? `0 0 16px ${rgba("coral", 0.35)}` : undefined,
              transform: `scale(${(1 + 0.25 * flash).toFixed(4)})`,
            }}
          >
            {verde > 0.5 ? <Check size={26} strokeWidth={3.2} /> : i + 1}
          </div>
        );
      })}
      {tps.map((tp, i) => {
        const [risco, mitig] = parTela(tp.f.f.tela);
        const saida = i < 3 ? tp.tOut - 0.05 : undefined;
        const emRisco = tp.f.t0 + [0.35, 0.1, 0.15, 0.2][i];
        const emMitig = i === 3 ? tp.tE - 0.05 : tp.tFlip;
        if (t < emRisco - 0.1 || (saida !== undefined && t > saida + 0.5)) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 150, top: 352, width: 560, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 70, lineHeight: 1.04, letterSpacing: "-0.035em" }}>
            <Palavra texto={risco} em={emRisco} tom="coral" destaque={false} saida={saida} />
            <svg width={60} height={70} style={{ display: "block", margin: "22px 0 14px 10px", overflow: "visible" }} aria-hidden="true">
              <Tracado d="M20 4 L20 58 M6 44 L20 58 L34 44" em={tp.tFlip + 0.1} dur={0.35} tom="verde" espessura={5} saida={saida} />
            </svg>
            <Palavra texto={mitig} frase={i === 3 ? undefined : IDS[i]} em={emMitig} tom="verde" destaque={mitig} tomDestaque="verde" brilho={0.7} saida={saida} />
          </div>
        );
      })}
    </div>
  );
}
