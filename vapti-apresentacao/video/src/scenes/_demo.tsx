/**
 * Demonstração do kit (?demo=1) — NÃO entra no filme. ~8 s usando todas as primitivas,
 * mais um card final curto, sobre uma timeline sintética (frases D01–D03).
 * Serve de validação visual, de desempenho e de determinismo, e de exemplo para as cenas.
 */
import { prototipo } from "../../../src/content/ui";
import { fase1, projeto } from "../../../src/data/vapti";
import {
  Barra,
  Camada,
  Camera,
  Cartao,
  CelularMoldura,
  Curva,
  ease,
  envelope,
  Grade,
  lerp,
  MarcaVapti,
  mulberry32,
  Numero,
  Palavra,
  Poeira,
  prog,
  Respiracao,
  Rotulo,
  Selo,
  Seta,
  Tracado,
  useEnfase,
  useFilme,
  useFrase,
  ZONAS,
} from "../kit";
import type { Frase, Timeline } from "../timeline";
import type { Cena } from "./index";

/** Frase sintética com palavras distribuídas pela proporção de caracteres. */
function frase(id: string, texto: string, inicio: number, fim: number, enfase: string, layout: string, extra: Partial<Frase> = {}): Frase {
  const ws = texto.split(/\s+/);
  const soma = ws.reduce((a, w) => a + w.length + 1, 0);
  let acc = inicio;
  const palavras = ws.map((w) => {
    const d = ((fim - inicio) * (w.length + 1)) / soma;
    const p = { w, t0: acc, t1: acc + d * 0.92 };
    acc += d;
    return p;
  });
  const alvo = enfase.split(" ")[0].toLowerCase();
  const tEnfase = palavras.find((p) => p.w.toLowerCase().startsWith(alvo))?.t0 ?? inicio;
  return { id, ato: "D1", texto, inicio, duracao: fim - inicio, fim, pausaAntes: 0, pausaDepois: 0, enfase, tEnfase, palavras, layout, visuais: [], tela: "", selo: "", som: "", direcao: "", ...extra };
}

export const tlDemo: Timeline = {
  fps: 30,
  largura: 1920,
  altura: 1080,
  duracao: 10,
  fonte: "estimado",
  atos: [{ id: "D1", titulo: "Demonstração", capitulo: "00 · Demonstração", tom: "", energia: 3, musica: "", inicio: 0, fim: 10, primeira: "D01", ultima: "D03" }],
  frases: [
    frase("D01", "Quatrocentos reais.", 0.8, 2.5, "Quatrocentos", "L5"),
    frase("D02", "Um dia de trabalho ou um dia perdido.", 2.8, 5.0, "dia perdido", "L2", { tela: "dia de trabalho × dia perdido" }),
    frase("D03", "A margem aguenta até a perda chegar no limite.", 5.25, 7.7, "limite", "L3", { selo: "Projeção" }),
  ],
  marcas: { fimNarracao: 7.7, cardFinal: [8.1, 10] },
};

/* Barras ilustrativas da semana (geometria, não dado): alturas deterministas. */
const rng = mulberry32(5);
const SEMANA = Array.from({ length: 7 }, (_, i) => (i === 3 ? 0 : 0.38 + rng() * 0.62));
const DIAS = ["S", "T", "Q", "Q", "S", "S", "D"];

/* Curva ilustrativa da margem caindo conforme a perda sobe (geometria). */
const CURVA: [number, number][] = [
  [0, 40],
  [180, 92],
  [360, 150],
  [540, 214],
  [720, 286],
  [900, 366],
];
const ZERO_Y = 262;

function Demo() {
  const { t } = useFilme();
  const d2 = useFrase("D02");
  const d3 = useFrase("D03");
  const e1 = useEnfase("D01");
  const e2 = useEnfase("D02");
  const e3 = useEnfase("D03");

  // F001 → F002: o número gigante recua e desfoca; some quando entra o L3
  const recuo = ease.inOutCubic(prog(t, d2.t0 - 0.2, d2.t0 + 0.9));
  const vidaNumero = envelope(t, 0.8, d3.t0 - 0.1, 0.3, 0.5);
  const vidaL2 = envelope(t, d2.t0 - 0.1, d3.t0 + 0.05, 0.3, 0.45);
  const L2 = ZONAS.L2;
  const apagar = 1 - 0.55 * ease.inOutSine(prog(t, e2.tE + 0.5, e2.tE + 2));

  return (
    <Camera
      chaves={[
        { t: 0.8, zoom: 1 },
        { t: 2.8, zoom: 1.035 },
        { t: 5.2, zoom: 1.06, x: 24 },
        { t: 8, zoom: 1.09, x: 40, y: -8 },
      ]}
      deriva={5}
    >
      {/* fundo: chão em perspectiva e luz que respira */}
      <Camada z={3}>
        <Grade tipo="chao" em={0.85} dur={1.6} horizonte={640} deriva={14} />
        <Respiracao tom="verde" x={960} y={520} raio={700} intensidade={0.12 * (1 - 0.5 * recuo)} />
        <Respiracao tom="azul" x={420} y={380} raio={520} intensidade={0.07} opacidade={ease.outCubic(prog(t, d3.t0 - 0.3, d3.t0 + 0.6))} periodo={7} />
      </Camada>

      {/* L5: número gigante com profundidade */}
      <Camada z={lerp(0.4, 1.8, recuo)} desfoque={lerp(0, 5, recuo)} opacidade={vidaNumero * lerp(1, 0.22, recuo)}>
        <div className="absolute inset-x-0 flex justify-center" style={{ top: 250 }}>
          <Numero valor={projeto.saqueMedio.valor} final={projeto.saqueMedio.rotulo} formato="brl0" tParada={e1.tE + 0.75} dur={0.75} tamanho={400} alinhar="centro" sublinhar />
        </div>
        <svg width={1920} height={1080} className="absolute inset-0" style={{ overflow: "visible" }}>
          <Tracado d="M520 800 C 760 760, 1160 860, 1400 770" em={e1.tE + 0.35} dur={0.9} espessura={6} />
        </svg>
      </Camada>

      {/* L2: palavra-chave à esquerda, caixa irregular à direita */}
      <Camada z={0} opacidade={vidaL2}>
        <div className="absolute flex flex-col" style={{ left: L2.esquerda.x, top: 300, width: L2.esquerda.w, gap: 6, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 84, lineHeight: 1.02, letterSpacing: "-0.035em" }}>
          <Palavra texto="dia de trabalho" frase="D02" destaque="dia de trabalho" tomDestaque="verde" brilho={0.5} />
          <Palavra texto="×" em={e2.tE - 0.25} tom="cinza" modo="foco" style={{ fontSize: 60 }} />
          <div style={{ opacity: apagar }}>
            <Palavra texto="dia perdido" frase="D02" tomDestaque="coral" />
          </div>
        </div>
        <div className="absolute" style={{ left: L2.direita.x + 80, top: L2.direita.y + 60, width: 940, height: 620 }}>
          <Grade tipo="pauta" passo={62} em={d2.t0} dur={1} area={{ x: 0, y: 0, w: 940, h: 560 }} />
          <div className="absolute flex items-end" style={{ left: 40, bottom: 60, gap: 44, height: 460 }}>
            {SEMANA.map((v, i) =>
              v > 0 ? (
                <Barra key={i} valor={v} max={1} comprimento={440} espessura={74} em={d2.t0 + 0.25 + i * 0.09} />
              ) : (
                <div
                  key={i}
                  style={{
                    width: 74,
                    height: 440 * 0.55,
                    borderRadius: 6,
                    border: "2px dashed var(--cor-coral)",
                    background: "var(--cor-coral-suave)",
                    opacity: envelope(t, e2.tE, Infinity, 0.3) * (0.7 + 0.3 * Math.cos((t - e2.tE) * Math.PI * 2)),
                  }}
                />
              ),
            )}
          </div>
          <div className="absolute flex font-mono" style={{ left: 40, bottom: 14, gap: 44, fontSize: 22, color: "var(--cor-texto-3)" }}>
            {DIAS.map((d, i) => (
              <span key={i} style={{ width: 74, textAlign: "center", opacity: ease.outCubic(prog(t, d2.t0 + 0.3 + i * 0.09, d2.t0 + 0.7 + i * 0.09)) }}>
                {d}
              </span>
            ))}
          </div>
          <div className="absolute" style={{ right: 20, top: 0 }}>
            <Selo tipo="ilustrativo" em={d2.t0 + 0.9} />
          </div>
        </div>
      </Camada>

      {/* L3: cartão com número, curva, seta; celular à direita */}
      <Camada z={0}>
        <Cartao em={d3.t0 - 0.05} x={120} y={160} largura={1080} altura={680} tom="verde" brilho={0.35} padding={44}>
          <Rotulo texto="Margem por mês" em={d3.t0 + 0.15} variante="eyebrow" />
          <div className="flex items-end" style={{ gap: 22, marginTop: 18 }}>
            <Numero valor={fase1.margemMes.valor} final={fase1.margemMes.rotulo} formato="mi" tParada={e3.tE} dur={1.6} de={0} tamanho={104} em={d3.t0 + 0.2} />
            <Selo tipo="projecao" em={d3.t0 + 0.5} style={{ marginBottom: 14 }} />
          </div>
          <Curva pontos={CURVA} largura={940} altura={400} em={d3.t0 + 0.4} dur={1.8} style={{ position: "absolute", left: 70, top: 250 }}>
            <line x1={0} x2={940} y1={ZERO_Y} y2={ZERO_Y} stroke="var(--cor-borda-forte)" strokeWidth={2} strokeDasharray="6 8" opacity={ease.outCubic(prog(t, d3.t0 + 0.3, d3.t0 + 0.8))} />
          </Curva>
          <div className="absolute" style={{ left: 700, top: 560 }}>
            <Numero valor={fase1.perdaEquilibrio.valor} final={fase1.perdaEquilibrio.rotulo} formato="pct2" tParada={e3.tE + 0.4} dur={0.6} tamanho={44} tom="coral" em={e3.tE - 0.2} escalaUnidade={0.7} />
          </div>
        </Cartao>
        <Seta de={[880, 760]} para={[756, 668]} curvatura={-0.25} em={e3.tE - 0.1} tom="coral" />
        <CelularMoldura em={d3.t0 + 0.35} x={1330} y={130} largura={330}>
          <div className="flex h-full flex-col" style={{ padding: "64px 26px 30px", gap: 18 }}>
            <MarcaVapti tamanho={34} />
            <p style={{ margin: "26px 0 0", fontSize: 22, color: "var(--cor-texto-3)" }}>Limite disponível</p>
            <p className="font-mono" style={{ margin: 0, fontSize: 52, fontWeight: 700, color: "var(--cor-verde)", letterSpacing: "-0.04em" }}>
              {prototipo.ficticio.limiteAtual}
            </p>
            <div style={{ height: 10, borderRadius: 99, background: "var(--cor-superficie-3)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(100 * ease.saida(prog(t, d3.t0 + 0.9, d3.t0 + 1.8))).toFixed(1)}%`, background: "var(--cor-verde)", borderRadius: 99 }} />
            </div>
          </div>
        </CelularMoldura>
        <div className="absolute" style={{ left: 1356, top: 900 }}>
          <Selo tipo="prototipo" em={d3.t0 + 0.8} />
        </div>
      </Camada>

      {/* primeiro plano: poeira (move mais com a câmera) */}
      <Camada z={-0.25}>
        <Poeira n={40} bokeh={6} seed={3} opacidade={0.9} />
      </Camada>
      {/* rodapé L3 — rótulo com o texto da tela */}
      <div className="absolute" style={{ left: ZONAS.L3.rotulo.x, top: ZONAS.L3.rotulo.y + 6 }}>
        <Rotulo texto="Quem decide é a perda" em={e3.tE + 0.1} destaque="perda" tom="coral" saida={d3.tProxima === Infinity ? 7.95 : d3.tProxima} />
      </div>
    </Camera>
  );
}

/** Registro do demo (um ato sintético "D1"). */
export const cenasDemo: Record<string, Cena> = { D1: { Componente: Demo, frases: ["D01", "D02", "D03"] } };
