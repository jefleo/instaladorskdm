/**
 * Ato 1 — O problema (F001–F009).
 * F001: "R$ 400" gigante em traço verde que se desenha no ritmo da fala e se preenche no "reais".
 * F002: o 400 recua e desfoca; "dia de trabalho × dia perdido" (o segundo se apaga).
 * F003–F007: V02 caixa irregular (motorista e barbeiro), bloco mensal que não encaixa, o buraco.
 * F008: V03 contador até 24.000.000 com o Brasil em pontos acendendo de baixo para cima.
 * F009: o buraco é preenchido por um bloco verde com a marca, que viaja até o canto (MARCA_CANTO).
 */
import { projeto } from "../../../src/data/vapti";
import { formatInt } from "../../../src/lib/formato";
import {
  Camada,
  Camera,
  COR,
  ease,
  envelope,
  Halo,
  MARCA_CANTO,
  MarcaVapti,
  Nota,
  Numero,
  Palavra,
  Poeira,
  prog,
  Respiracao,
  rgba,
  spring,
  tMarcaCanto,
  useFilme,
  useFrase,
} from "../kit";
import { BrasilPontos } from "./atos1a3/brasil";
import { CaixaIrregular, RET_BURACO } from "./atos1a3/caixa";
import { ChaveL2, mix, Plano, surge, tPal } from "./atos1a3/comum";

export const frases: string[] = ["F001", "F002", "F003", "F004", "F005", "F006", "F007", "F008", "F009"];

/* ------------------------------------------------------------------ */
/* F001 — R$ 400 em traço                                              */
/* ------------------------------------------------------------------ */

/** Um glifo cujo contorno se desenha (dash) e depois se preenche. */
function GlifoTracado({ ch, x, y, tamanho, t0, dur, tFill }: { ch: string; x: number; y: number; tamanho: number; t0: number; dur: number; tFill: number }) {
  const { t } = useFilme();
  const p = ease.inOutCubic(prog(t, t0, t0 + dur));
  if (p <= 0) return null;
  const L = tamanho * 6;
  const f = ease.outCubic(prog(t, tFill, tFill + 0.55));
  return (
    <text
      x={x}
      y={y}
      fontSize={tamanho}
      style={{ fontFamily: "var(--fonte-mono)", fontWeight: 700 }}
      fill={COR.verde}
      fillOpacity={f}
      stroke={COR.verde}
      strokeWidth={tamanho * 0.012 + 2}
      strokeLinejoin="round"
      strokeDasharray={`${L} ${L}`}
      strokeDashoffset={(L * (1 - p)).toFixed(1)}
    >
      {ch}
    </text>
  );
}

function Quatrocentos() {
  const { t } = useFilme();
  const f1 = useFrase("F001");
  const f2 = useFrase("F002");
  const tQ = tPal(f1.f, "Quatrocentos");
  const tR = tPal(f1.f, "reais");
  const tFim = tPal(f1.f, "Quatrocentos", 0, true);
  // geometria: "R$" menor + "400" (JetBrains Mono, avanço 0,6 em)
  const T = 430;
  const tr = T * 0.46;
  const av = T * 0.6 * 0.97;
  const larg = tr * 0.6 * 2 + 36 + av * 3;
  const x0 = 960 - larg / 2;
  const yb = 690;
  const span = Math.max(0.6, tFim - tQ);
  // recuo na F002
  const recuo = ease.inOutCubic(prog(t, f2.t0 - 0.3, f2.t0 + 1.1));
  const fill = ease.outCubic(prog(t, tR, tR + 0.55));
  const brilho = fill * (0.5 + 0.5 * Math.exp(-Math.max(0, t - tR) * 1.6));
  return (
    <Camada z={mix(0.15, 1.6, recuo)} desfoque={mix(0, 6, recuo)} opacidade={mix(1, 0.16, recuo)}>
      <Halo tom="verde" x={960} y={540} w={1500} h={760} intensidade={0.1 + 0.16 * brilho} />
      <svg width={1920} height={1080} className="absolute inset-0" style={{ overflow: "visible" }}>
        <GlifoTracado ch="R" x={x0} y={yb} tamanho={tr} t0={tQ - 0.1} dur={0.7} tFill={tR} />
        <GlifoTracado ch="$" x={x0 + tr * 0.6} y={yb} tamanho={tr} t0={tQ} dur={0.7} tFill={tR + 0.04} />
        {["4", "0", "0"].map((c, i) => (
          <GlifoTracado key={i} ch={c} x={x0 + tr * 1.2 + 36 + i * av} y={yb} tamanho={T} t0={tQ + 0.05 + (i * span) / 3.2} dur={0.85} tFill={tR + 0.08 + i * 0.05} />
        ))}
      </svg>
      {/* traço vupt que sublinha quando preenche */}
      <div style={{ position: "absolute", left: x0 + tr * 1.2 + 36, top: yb + 46, width: av * 3, height: 10, borderRadius: 3, background: COR.verde, transform: `skewX(-24deg) scaleX(${ease.saida(prog(t, tR + 0.1, tR + 0.6)).toFixed(4)})`, transformOrigin: "left center", boxShadow: `0 0 26px ${rgba("verde", 0.5)}` }} />
    </Camada>
  );
}

function DiaTrabalho() {
  const { t } = useFilme();
  const f2 = useFrase("F002");
  const f3 = useFrase("F003");
  const tD1 = tPal(f2.f, "dia", 0);
  const tD2 = tPal(f2.f, "dia", 1);
  const apagar = 1 - 0.68 * ease.inOutSine(prog(t, tD2 + 0.8, f3.t0 + 0.2));
  const sai = f3.t0 - 0.15;
  const estilo = { fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 120, lineHeight: 1, letterSpacing: "-0.035em" } as const;
  return (
    <Camada z={0}>
      <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: 300, gap: 34 }}>
        <Palavra texto="dia de trabalho" em={tD1 - 0.04} passo={0.17} destaque={false} cor={COR.verde} saida={sai} style={{ ...estilo, textShadow: `0 0 30px ${rgba("verde", 0.25)}` }} />
        <Palavra texto="×" em={tD2 - 0.25} modo="foco" destaque={false} cor="var(--cor-texto-3)" saida={sai} style={{ ...estilo, fontSize: 64, fontWeight: 600 }} />
        <div style={{ opacity: apagar }}>
          <Palavra texto="dia perdido" em={tD2 - 0.04} passo={0.3} destaque={false} cor={COR.coral} saida={sai} style={estilo} />
        </div>
      </div>
    </Camada>
  );
}

/* ------------------------------------------------------------------ */
/* F008 — 24 milhões                                                    */
/* ------------------------------------------------------------------ */

function VinteQuatroMilhoes() {
  const { t } = useFilme();
  const f8 = useFrase("F008");
  const tV = tPal(f8.f, "vinte");
  const tM = tPal(f8.f, "milhões");
  const tParada = tM + 0.12;
  const pMapa = ease.inOutSine(prog(t, tV - 0.25, tParada + 0.25));
  const a = autonomos();
  return (
    <Camera de={{ zoom: 1 }} para={{ zoom: 1.05, x: 16 }} t0={f8.t0 - 0.3} t1={f8.t1 + 0.5} deriva={4} seed={8}>
      {/* fundo: 24 fantasma gigante, em contorno */}
      <Camada z={2.2} opacidade={0.5 * surge(t, f8.t0 - 0.2, 0.8)}>
        <svg width={1920} height={1080} className="absolute inset-0">
          <text x={1010} y={930} textAnchor="middle" fontSize={980} style={{ fontFamily: "var(--fonte-mono)", fontWeight: 700, letterSpacing: "-0.05em" }} fill="none" stroke="rgb(242 244 247 / 0.07)" strokeWidth={3}>
            24
          </text>
        </svg>
        <Respiracao tom="verde" x={1480} y={560} raio={560} intensidade={0.12} />
      </Camada>
      <Camada z={0.35}>
        <div style={{ position: "absolute", left: 130, top: 330 }}>
          <div style={{ fontFamily: "var(--fonte-texto)", fontWeight: 700, fontSize: 30, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cor-texto-2)", opacity: surge(t, f8.t0 + 0.15, 0.4), marginBottom: 18 }}>{a.prefixo}</div>
          <Numero valor={projeto.autonomosBrasil.valor} formato="int" final={formatInt(projeto.autonomosBrasil.valor)} tParada={tParada} dur={tParada - tV + 0.05} tamanho={190} tom="verde" em={tV - 0.2} />
          <div style={{ marginTop: 30, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 76, letterSpacing: "-0.03em", lineHeight: 1 }}>
            <Palavra texto="autônomos" frase="F008" destaque={false} em={tParada - 0.3} />
          </div>
          <Nota style={{ marginTop: 26, fontSize: 24, opacity: surge(t, tParada + 0.3, 0.5) }}>Fonte: {projeto.autonomosBrasil.fonte}</Nota>
        </div>
      </Camada>
      <Camada z={-0.08}>
        <div style={{ position: "absolute", left: 1250, top: 230, opacity: surge(t, f8.t0 - 0.1, 0.6) }}>
          <BrasilPontos largura={560} altura={556} progresso={pMapa} ponto={9} />
        </div>
      </Camada>
    </Camera>
  );
}

/** "mais de" a partir do rótulo do dado ("mais de 24 milhões"). */
function autonomos() {
  const pre = projeto.autonomosBrasil.rotulo.replace(/\s*\d.*$/, "");
  return { prefixo: pre };
}

/* ------------------------------------------------------------------ */
/* F009 — a marca que preenche o buraco e vai para o canto              */
/* ------------------------------------------------------------------ */

/** Largura da marca (wordmark) em "em" — medida no navegador (Bricolage 800). */
const LARGURA_MARCA_EM = 2.41;
const ALTURA_MARCA_EM = 1.0;

function MarcaViajante({ cx, cy }: { cx: number; cy: number }) {
  const { t, tl } = useFilme();
  const f9 = useFrase("F009");
  const tE = f9.tE;
  const tCanto = tMarcaCanto(tl);
  const tSobe = Math.max(tE + 1.6, tCanto - 1.25);
  if (t < tE + 0.15 || t > tCanto + 0.5) return null;
  const S0 = 64;
  const s0 = S0 / MARCA_CANTO.tamanho;
  // posição do canto superior direito da marca na partida (centrada no bloco)
  const wCanto = LARGURA_MARCA_EM * MARCA_CANTO.tamanho;
  const xDir0 = cx + (LARGURA_MARCA_EM * S0) / 2;
  const yTop0 = cy - (ALTURA_MARCA_EM * S0) / 2;
  const xDir1 = 1920 - MARCA_CANTO.direita;
  const yTop1 = MARCA_CANTO.topo;
  const p = ease.inOutCubic(prog(t, tSobe, tCanto));
  // arco: sobe um pouco antes de ir para o canto
  const arco = Math.sin(Math.PI * p) * -60;
  const dx = mix(xDir0, xDir1, p) - xDir1;
  const dy = mix(yTop0, yTop1, p) + arco - yTop1;
  const s = mix(s0, 1, p);
  const entrada = surge(t, tE + 0.15, 0.35);
  const saida = 1 - ease.inOutSine(prog(t, tCanto - 0.05, tCanto + 0.25));
  const cor = ease.inOutSine(prog(t, tSobe - 0.1, tSobe + 0.35));
  void wCanto;
  return (
    <div style={{ position: "absolute", right: MARCA_CANTO.direita, top: MARCA_CANTO.topo, transformOrigin: "100% 0", transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${s.toFixed(4)})`, opacity: entrada * saida }}>
      <MarcaVapti tamanho={MARCA_CANTO.tamanho} brilho={0.3 + 0.4 * cor} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ato                                                                  */
/* ------------------------------------------------------------------ */

const PAINEL = { x: 760, y: 190 };

export default function Ato1() {
  const { t, tl } = useFilme();
  const f2 = useFrase("F002");
  const f3 = useFrase("F003");
  const f4 = useFrase("F004");
  const f5 = useFrase("F005");
  const f6 = useFrase("F006");
  const f7 = useFrase("F007");
  const f8 = useFrase("F008");
  const f9 = useFrase("F009");
  const tCanto = tMarcaCanto(tl);

  // caixa: recua na F008 e volta centrada na F009
  const recua = ease.inOutCubic(prog(t, f8.t0 - 0.2, f8.t0 + 0.5));
  const volta = ease.inOutCubic(prog(t, f8.t1 - 0.15, f9.t0 + 0.2));
  const vidaCaixa = Math.max(1 - recua, volta);
  const desloca = volta > 0 ? -275 : 0; // centraliza o painel na F009 (L1)
  const escCaixa = volta > 0 ? mix(0.94, 1, volta) : mix(1, 0.86, recua);
  const tempos = {
    linha1: tPal(f3.f, "motorista"),
    icone1: f3.tE - 0.05,
    icone2: tPal(f4.f, "barbeiro"),
    semana: tPal(f4.f, "repor") - 0.1,
    sexta: tPal(f4.f, "fim"),
    barras: f5.tE - 0.1,
    selo: f5.tE + 0.4,
    bloco: f6.tE - 0.1,
    holerite: tPal(f6.f, "holerite"),
    blocoSai: f7.t0 - 0.05,
    buraco: f7.tE - 0.05,
    preenche: f9.tE - 0.02,
    completo: f9.tE + 0.5,
  };
  const cxBloco = PAINEL.x + desloca + RET_BURACO.x + RET_BURACO.w / 2;
  const cyBloco = PAINEL.y + RET_BURACO.y + RET_BURACO.h / 2;

  return (
    <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }}>
      {/* F001–F002 */}
      <Plano de={-1} ate={f3.t0 + 0.35} saida={0.6}>
        <Camera chaves={[{ t: 0.8, zoom: 1 }, { t: f2.t0, zoom: 1.04 }, { t: f3.t0 + 0.5, zoom: 1.075, y: -6 }]} deriva={3} seed={2}>
          <Camada z={3}>
            <Respiracao tom="verde" x={960} y={560} raio={760} intensidade={0.07} periodo={7} />
          </Camada>
          <Quatrocentos />
          <DiaTrabalho />
          <Camada z={-0.2}>
            <Poeira n={22} bokeh={3} seed={11} opacidade={0.55} velocidade={7} />
          </Camada>
        </Camera>
      </Plano>

      {/* F003–F007 e F009: caixa irregular */}
      <Plano de={f3.t0 - 0.2} ate={Infinity} entrada={0.5}>
        <Camera chaves={[{ t: f3.t0, zoom: 1.0 }, { t: f7.tProxima, zoom: 1.04, x: 14 }, { t: f8.t1, zoom: 1.0, x: 0 }]} deriva={3} seed={5}>
          <Camada z={2.5}>
            <Respiracao tom="verde" x={1260} y={560} raio={640} intensidade={0.06 * (1 - recua)} periodo={8} />
            <Halo tom="coral" x={PAINEL.x + RET_BURACO.x + RET_BURACO.w / 2} y={560} w={700} h={760} intensidade={0.12 * ease.outCubic(prog(t, f7.tE, f7.tE + 0.6)) * (1 - recua)} />
          </Camada>
          <Camada z={0}>
            {vidaCaixa > 0.005 ? (
              <div style={{ position: "absolute", left: PAINEL.x + desloca, top: PAINEL.y, width: 1000, height: 720, opacity: vidaCaixa, transform: `scale(${escCaixa.toFixed(4)})`, transformOrigin: "50% 50%" }}>
                <CaixaIrregular tempos={tempos} />
              </div>
            ) : null}
            {/* chaves do L2 */}
            <ChaveL2 eyebrow="Motorista" titulo="combustível" em={tempos.linha1} emTitulo={f3.tE} saida={f4.t0 - 0.1} destaque="combustível" />
            <ChaveL2 eyebrow="Barbeiro" titulo="material" em={tempos.icone2} emTitulo={tPal(f4.f, "material")} saida={f5.t0 - 0.1} destaque="material" />
            <ChaveL2 eyebrow="Recebe" titulo="por dia ou por semana" em={tPal(f5.f, "recebem")} emTitulo={f5.tE} passo={0.16} saida={f6.t0 - 0.1} destaque={["dia", "semana"]} />
            <ChaveL2 eyebrow="Crédito tradicional" titulo="renda mensal + holerite" em={tPal(f6.f, "crédito")} emTitulo={f6.tE - 0.2} passo={0.22} saida={f7.t0 - 0.1} destaque={["mensal", "holerite"]} tomDestaque="coral" tamanho={88} />
            <ChaveL2 titulo="O buraco no caixa" em={f7.tE - 0.3} emTitulo={f7.tE - 0.3} passo={0.12} saida={f8.t0 - 0.2} destaque="buraco" tomDestaque="coral" tamanho={104} />
          </Camada>
        </Camera>
      </Plano>

      {/* F008 — 24 milhões */}
      <Plano de={f8.t0 - 0.25} ate={f8.t1 + 0.05} entrada={0.5} saida={0.45}>
        <VinteQuatroMilhoes />
      </Plano>

      {/* F009 — luz verde atrás do bloco e a marca que viaja até o canto */}
      {t > f9.t0 - 0.4 ? <Halo tom="verde" x={cxBloco} y={cyBloco} w={900} h={900} intensidade={0.2 * envelope(t, f9.tE, tCanto + 0.8, 0.5, 0.8)} /> : null}
      <PlacaMarca cx={cxBloco} cy={cyBloco} />
      <MarcaViajante cx={cxBloco} cy={cyBloco} />
      {t > f9.tE ? <BrilhoVupt t0={f9.tE} x={cxBloco} y={cyBloco} /> : null}
    </div>
  );
}

/** Placa escura dentro do bloco verde, onde a marca nasce (contraste). */
function PlacaMarca({ cx, cy }: { cx: number; cy: number }) {
  const { t } = useFilme();
  const f9 = useFrase("F009");
  const s = spring(t - f9.tE - 0.1, { k: 220, d: 20 });
  if (s <= 0.001) return null;
  const w = LARGURA_MARCA_EM * 64 + 34;
  const h = 64 * 1.25 + 10;
  return <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: 14, background: "var(--cor-tinta)", boxShadow: "0 10px 30px -8px rgb(0 0 0 / 0.6)", transform: `scale(${(0.7 + 0.3 * s).toFixed(4)})`, opacity: Math.min(1, s * 2) }} />;
}

/** Rastro curto do bloco quando cai no buraco. */
function BrilhoVupt({ t0, x, y }: { t0: number; x: number; y: number }) {
  const { t } = useFilme();
  const s = spring(t - t0, { k: 200, d: 20 });
  const a = Math.max(0, 1 - (t - t0) * 1.6);
  if (a <= 0) return null;
  return <div style={{ position: "absolute", left: x - 260, top: y - 6, width: 520, height: 12, borderRadius: 4, background: COR.verde, opacity: a * 0.6, transform: `scaleX(${(0.4 + 1.4 * s).toFixed(3)}) skewX(-24deg)`, boxShadow: `0 0 30px ${rgba("verde", 0.6)}` }} />;
}
