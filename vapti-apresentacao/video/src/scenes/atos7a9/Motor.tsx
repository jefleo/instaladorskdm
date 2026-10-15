/**
 * Ato 8, F083–F084 — V21 O que se vende.
 * F083: a pilha "carteira" (vale o valor de face) desbota; um motor de três engrenagens gira:
 *       canal, análise e clientes que voltam (vale múltiplo).
 * F084: o motor se duplica e uma segunda carteira nasce ao lado. O ritmo cresce até aqui.
 */
import { captacao } from "../../../../src/data/vapti";
import { Camada, Camera, ease, envelope, Halo, Palavra, prog, Respiracao, Rotulo, spring, Titulo, useFilme, useFrase } from "../../kit";
import { Engrenagem, mix, Pilha, tPalavra } from "./base";

/* Engrenagens relativas ao centro do motor (geometria). */
const ENG = [
  { dx: -210, dy: -55, r: 118, dentes: 12, sentido: -1 },
  { dx: 5, dy: 80, r: 150, dentes: 15, sentido: 1 },
  { dx: 215, dy: -50, r: 110, dentes: 11, sentido: -1 },
];
const ROTULOS = ["Canal", "Análise", "Clientes que voltam"];
const PALAVRA_ROT = ["canal", "analise", "clientes"];
const FACE = captacao.oQueSeVende.carteira.match(/valor de face/)?.[0] ?? "";

/** Motor: três engrenagens engrenadas; `fase` em graus da engrenagem do meio. */
function Motor({ x, y, s, fase, opacidade, entradas, t }: { x: number; y: number; s: number; fase: number; opacidade: number; entradas: number[]; t: number }) {
  if (opacidade <= 0.002) return null;
  return (
    <>
      {ENG.map((g, i) => {
        const e = Math.max(0, Math.min(1.1, spring(t - entradas[i], { k: 200, d: 18 })));
        const ang = g.sentido * fase * (ENG[1].dentes / g.dentes) + (i === 1 ? 0 : 180 / g.dentes);
        return <Engrenagem key={i} x={x + g.dx * s} y={y + g.dy * s} r={g.r * s} dentes={g.dentes} angulo={ang} opacidade={opacidade * Math.min(1, e * 1.6)} escala={0.6 + 0.4 * e} />;
      })}
    </>
  );
}

export function MotorCena() {
  const { t } = useFilme();
  const f83 = useFrase("F083");
  const f84 = useFrase("F084");
  const vida = ease.outCubic(prog(t, f83.t0 - 0.2, f83.t0 + 0.5));
  if (vida <= 0) return null;

  const tNao = tPalavra(f83.f, "nao", f83.t0, f83.t0 + 0.8);
  const tE = f83.tE;
  const desbota = ease.inOutSine(prog(t, tNao, tE + 0.1));
  const tRot = PALAVRA_ROT.map((w, i) => tPalavra(f83.f, w, tE, tE + 0.6 + 0.6 * i));
  const entradas = [tE + 0.0, tE + 0.1, tE + 0.2];
  // rotação que acelera (o ritmo cresce até a F084)
  const dt = Math.max(0, t - tE);
  const fase = 30 * dt + 4.5 * dt * dt;

  // F084: o motor recua para a esquerda e se duplica; a nova carteira nasce ao lado
  const vai = ease.inOutCubic(prog(t, f84.t0 - 0.15, f84.t0 + 0.9));
  const tLeva = tPalavra(f84.f, "leva", f84.t0, f84.tE - 1);
  const copia = ease.inOutCubic(prog(t, tLeva - 0.1, tLeva + 0.75));
  const tNova = f84.tE;
  const nova = Math.max(0, (t - tNova) * 9);
  const G = { x: 1415, y: 520 };
  const A = { x: mix(G.x, 680, vai), y: mix(G.y, 600, vai), s: mix(1, 0.56, vai) };
  const B = { x: mix(680, 1250, copia), y: 600, s: 0.56 };
  const pilhaA = { x: mix(700, 190, vai), y: mix(420, 540, vai) };
  const saiEsq = ease.inOutSine(prog(t, f84.t0 - 0.2, f84.t0 + 0.4));

  return (
    <div className="absolute inset-0" style={{ opacity: vida, transform: `scale(${(1.06 - 0.06 * vida).toFixed(4)})`, transformOrigin: "1500px 520px" }}>
      <Camera chaves={[{ t: f83.t0, zoom: 1.0 }, { t: f84.t0, zoom: 1.03 }, { t: f84.t0 + 0.9, zoom: 1.0, curva: ease.inOutCubic }, { t: f84.t1 + 1, zoom: 1.04 }]} deriva={4} seed={13}>
        <Camada z={2}>
          <Respiracao tom="verde" x={mix(1415, 960, vai)} y={560} raio={760} intensidade={0.07 + 0.06 * ease.outCubic(prog(t, tE, tE + 1))} periodo={5} />
        </Camada>
        <Camada z={0}>
          {/* a carteira: vale o valor de face */}
          <Pilha x={pilhaA.x} y={pilhaA.y} largura={mix(320, 250, vai)} total={8} visiveis={Math.min(8, Math.max(0, (t - f83.t0 - 0.3) * 14))} tom={desbota > 0.5 ? "cinza" : "azul"} opacidade={mix(1, 0.3, desbota)} />
          <div style={{ position: "absolute", left: 700, top: 640, opacity: (1 - desbota) * envelope(t, f83.t0 + 0.4, Infinity, 0.4) }}>
            <p style={{ margin: 0, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 44, letterSpacing: "-0.03em" }}>Carteira</p>
            <p style={{ margin: "6px 0 0", fontSize: 30, fontWeight: 600, color: "var(--cor-texto-2)" }}>{FACE}</p>
          </div>

          {/* o motor */}
          <Halo tom="verde" x={A.x} y={A.y} w={760 * A.s} h={560 * A.s} intensidade={0.22 * ease.outCubic(prog(t, tE, tE + 0.6))} />
          <Motor x={A.x} y={A.y} s={A.s} fase={fase} opacidade={1} entradas={entradas} t={t} />
          {ENG.map((g, i) => {
            const acima = i !== 1;
            const yy = G.y + g.dy + (acima ? -g.r - 62 : g.r + 22);
            return (
              <p
                key={i}
                style={{
                  position: "absolute",
                  left: G.x + g.dx - 170,
                  width: 340,
                  top: yy,
                  margin: 0,
                  textAlign: "center",
                  fontSize: 34,
                  fontWeight: 700,
                  color: "var(--cor-texto)",
                  opacity: ease.outCubic(prog(t, tRot[i] - 0.05, tRot[i] + 0.3)) * (1 - saiEsq),
                  transform: `translate(0, ${((1 - ease.saida(prog(t, tRot[i] - 0.05, tRot[i] + 0.4))) * 12).toFixed(2)}px)`,
                }}
              >
                {ROTULOS[i]}
              </p>
            );
          })}

          {/* F084: a cópia do motor e a próxima carteira */}
          {copia > 0 ? (
            <>
              <Halo tom="verde" x={B.x} y={B.y} w={430} h={320} intensidade={0.2 * copia} />
              <Motor x={B.x} y={B.y} s={B.s} fase={fase + 7} opacidade={0.3 + 0.7 * copia} entradas={[-9, -9, -9]} t={t} />
            </>
          ) : null}
          {t >= tNova ? <Pilha x={1500} y={500} largura={250} total={8} visiveis={Math.min(8, nova)} tom="verde" /> : null}
        </Camada>
      </Camera>

      {/* esquerda (L2) na F083 */}
      <div style={{ position: "absolute", left: 150, top: 330, opacity: 1 - saiEsq }}>
        <Rotulo texto="Vale múltiplo" em={tE - 0.25} tom="verde" tamanho={36} />
        <div style={{ marginTop: 18 }}>
          <Titulo texto="Motor" em={tE - 0.05} tamanho={150} destaque="motor" brilho={0.7} />
        </div>
      </div>

      {/* F084 (L1): título no alto */}
      <div className="absolute inset-x-0 flex justify-center" style={{ top: 176 }}>
        <Palavra
          texto="A próxima carteira"
          frase="F084"
          em={tPalavra(f84.f, "proxima", f84.t0, f84.tE) - 0.3}
          destaque="próxima carteira"
          brilho={0.7}
          style={{ fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 92, letterSpacing: "-0.035em", lineHeight: 1.02 }}
        />
      </div>
    </div>
  );
}
