/**
 * Ato 9, F089–F091 — o fecho (pico-fim: firme e caloroso).
 * F089: as duas trilhas, desfocadas, ao fundo; a da Zippi acende no "existe".
 * F090: a marca Vapti entra no "Vapti" e cresce; a trilha verde ganha luz no "melhor".
 * F091: respiro de ~0,6 s, a marca assenta e "Vamos?" entra grande e calmo — exatamente na
 * posição e no tamanho do card final (V24), que o Film desenha por cima em seguida.
 */
import { Camada, Camera, COR, ease, envelope, MarcaVapti, Poeira, prog, Respiracao, rgba, Titulo, useFilme, useFrase } from "../../kit";
import { mix, tPalavra } from "./base";

const XS = [330, 594, 858, 1122, 1386, 1650];

export function Fecho() {
  const { t, tl } = useFilme();
  const f89 = useFrase("F089");
  const f90 = useFrase("F090");
  const f91 = useFrase("F091");
  const vida = ease.outCubic(prog(t, f89.t0 - 0.1, f89.t0 + 0.9));
  if (vida <= 0) return null;

  const tExiste = f89.tE;
  const varre = prog(t, tExiste - 0.15, tExiste + 1.1);
  const tVapti = tPalavra(f90.f, "vapti", f90.t0, f90.t0 + 0.15);
  const tMelhor = f90.tE;
  const trilhas = vida * (1 - ease.inOutSine(prog(t, f90.t1, f91.t0 - 0.05)));
  const luzVerde = ease.outCubic(prog(t, tMelhor - 0.1, tMelhor + 0.6));
  // a marca cresce durante a F090 e assenta no respiro antes do "Vamos?"
  const cresce = ease.inOutSine(prog(t, tVapti, f90.t1));
  const assenta = ease.inOutCubic(prog(t, f90.t1, f91.t0 - 0.05));
  const escala = mix(mix(0.9, 1.14, cresce), 1, assenta);
  const calor = envelope(t, tVapti - 0.2, Infinity, 1.2);
  // o card final (Film) redesenha marca e "Vamos?": a nossa versão expira um pouco antes
  const c0 = tl.marcas.cardFinal[0];
  const expira = 1 - ease.inOutSine(prog(t, c0 - 0.45, c0 + 0.05));

  return (
    <div className="absolute inset-0" style={{ opacity: vida }}>
      <Camera chaves={[{ t: f89.t0, zoom: 1.04 }, { t: f90.t1, zoom: 1.0, curva: ease.inOutSine }]} deriva={3} seed={41}>
        <Camada z={1.6} desfoque={4.5} opacidade={trilhas}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
            <line x1={XS[0]} x2={XS[5]} y1={470} y2={470} stroke={COR.cinza} strokeWidth={4} strokeDasharray="14 12" opacity={0.75} />
            <line x1={XS[0]} x2={XS[4]} y1={640} y2={640} stroke={COR.verde} strokeWidth={8} opacity={0.5 + 0.5 * luzVerde} strokeLinecap="round" />
            <line x1={XS[4]} x2={XS[5]} y1={640} y2={640} stroke={COR.verde} strokeWidth={5} strokeDasharray="14 12" opacity={0.5 + 0.4 * luzVerde} />
            {[0, 3, 4, 5].map((i) => (
              <circle key={`z${i}`} cx={XS[i]} cy={470} r={14} fill="var(--cor-tinta)" stroke={COR.cinza} strokeWidth={4} opacity={0.85} />
            ))}
            {[1, 2, 3, 4].map((i) => (
              <circle key={`v${i}`} cx={XS[i]} cy={640} r={15} fill={COR.verde} opacity={0.55 + 0.45 * luzVerde} />
            ))}
            {/* a luz que percorre a trilha da Zippi no "existe" */}
            {varre > 0 && varre < 1 ? <circle cx={mix(XS[0], XS[5], ease.inOutSine(varre))} cy={470} r={34} fill={rgba("texto", 0.5 * Math.sin(Math.PI * varre))} /> : null}
          </svg>
        </Camada>
        <Camada z={1}>
          <Respiracao tom="verde" x={960} y={430} raio={760} intensidade={0.13} periodo={5} opacidade={calor} />
          <Poeira n={28} bokeh={4} seed={91} opacidade={0.7 * vida} velocidade={8} />
        </Camada>
      </Camera>

      {/* mesma composição do card final (kit/CardFinal): marca 196 px e "Vamos?" 92 px, topo em 300 */}
      <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: 300, opacity: expira }}>
        <div style={{ transform: `scale(${escala.toFixed(4)})`, transformOrigin: "50% 55%", opacity: ease.outCubic(prog(t, tVapti - 0.1, tVapti + 0.2)) }}>
          <MarcaVapti tamanho={196} em={tVapti - 0.05} brilho={0.6 + 0.4 * luzVerde} alinhar="centro" />
        </div>
        <Titulo texto="Vamos?" em={f91.tE} tamanho={92} alinhar="centro" destaque={false} style={{ marginTop: 54 }} />
      </div>
    </div>
  );
}
