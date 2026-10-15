/**
 * V24 — Card final (5 s): marca Vapti, "Vamos?" e o aviso curto de src/data/vapti.ts.
 * Fundo tinta com luz verde que respira e poeira leve: firme e caloroso (pico-fim).
 */
import { avisoCurto } from "../../../src/data/vapti";
import { Poeira, Respiracao } from "./acabamento";
import { useFilme } from "./contexto";
import { MarcaVapti } from "./MarcaVapti";
import { ease, envelope, prog } from "./tempo";
import { Titulo } from "./tipografia";

export interface CardFinalProps {
  /** Janela do card (marcas.cardFinal). */
  t0: number;
  t1: number;
}

/** Card final do filme. O Film o desenha por cima do Ato 9 em `marcas.cardFinal`. */
export function CardFinal({ t0, t1 }: CardFinalProps) {
  const { t } = useFilme();
  const vida = envelope(t, t0, Infinity, 0.6);
  if (vida <= 0.001) return null;
  const pAviso = ease.outCubic(prog(t, t0 + 0.5, t0 + 1.1));
  // push-in muito lento ao longo dos 5 s
  const z = 1 + 0.025 * ease.inOutSine(prog(t, t0, t1));
  return (
    <div className="absolute inset-0" style={{ background: "var(--cor-tinta)", opacity: vida }}>
      <Respiracao tom="verde" x={960} y={430} raio={760} intensidade={0.13} periodo={5} />
      <Poeira n={28} bokeh={4} seed={91} opacidade={0.7} velocidade={8} />
      <div className="absolute inset-0" style={{ transform: `scale(${z.toFixed(5)})`, transformOrigin: "50% 44%" }}>
        <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: 300 }}>
          <MarcaVapti tamanho={196} em={t0 + 0.15} brilho={0.9} alinhar="centro" />
          <Titulo texto="Vamos?" em={t0 + 0.95} tamanho={92} alinhar="centro" destaque={false} style={{ marginTop: 54 }} />
        </div>
      </div>
      <p
        style={{
          position: "absolute",
          left: "50%",
          bottom: 92,
          width: 1180,
          margin: 0,
          transform: `translate3d(-50%, ${((1 - pAviso) * 10).toFixed(2)}px, 0)`,
          textAlign: "center",
          fontFamily: "var(--fonte-texto)",
          fontWeight: 500,
          fontSize: 25,
          lineHeight: 1.45,
          color: "var(--cor-texto-2)",
          opacity: pAviso,
          textWrap: "balance",
        }}
      >
        {avisoCurto}
      </p>
    </div>
  );
}
