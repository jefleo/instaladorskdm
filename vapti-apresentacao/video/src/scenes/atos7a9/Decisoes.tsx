/**
 * Ato 9, F085–F088 — V23 Cinco decisões (e o mini semáforo do V22).
 * F085: a lista aparece vazia (caixas numeradas); "Cinco decisões" à esquerda.
 * F086–F087: a lista ganha a tela; cada item se marca no VERBO da sua frase
 *            (Aprovar, Chamar, Cotar, Aprovar); no item 4, o semáforo do piloto.
 * F088: o item 5 se marca no "confirmar" e "R$ 1 mi" acende em verde no "um milhão".
 * Revelação progressiva: o título de cada item só aparece quando ele é marcado.
 */
import { decisoes, projeto } from "../../../../src/data/vapti";
import { Camada, Camera, COR, ease, Palavra, prog, Respiracao, rgba, spring, Titulo, useFilme, useFrase } from "../../kit";
import { Caixa, mix, Semaforo, tPalavra } from "./base";

const LINHA = 128;
const ESQUELETO = [380, 560, 440, 470, 500];
const APORTE = projeto.capitalInicial.rotulo;

export function Decisoes() {
  const { t } = useFilme();
  const f85 = useFrase("F085");
  const f86 = useFrase("F086");
  const f87 = useFrase("F087");
  const f88 = useFrase("F088");
  const f89 = useFrase("F089");
  const vida = ease.outCubic(prog(t, f85.t0 - 1.0, f85.t0 - 0.3));
  const sai = ease.inOutSine(prog(t, f89.t0 + 0.25, f89.t0 + 1.3));
  if (vida <= 0 || sai >= 1) return null;

  // marcas no verbo de cada frase curta
  const tA1 = tPalavra(f86.f, "aprovar", f86.t0, f86.t0);
  const tA2 = tPalavra(f86.f, "chamar", tA1, f86.t0 + 2.2);
  const tA3 = tPalavra(f86.f, "cotar", tA2, f86.t0 + 4.5);
  const tA4 = tPalavra(f87.f, "aprovar", f87.t0, f87.t0);
  const tA5 = tPalavra(f88.f, "confirmar", f88.t0, f88.t0 + 0.2);
  const marcas = [tA1, tA2, tA3, tA4, tA5].map((x) => x + 0.12);
  const tCrit = tPalavra(f87.f, "criterio", tA4, f87.tE - 1.4);
  const tPar = tPalavra(f87.f, "parada", tCrit, f87.tE - 0.6);
  const tMi = f88.tE;
  const acende = ease.outCubic(prog(t, tMi, tMi + 0.35));
  const flashMi = t >= tMi ? Math.exp(-(t - tMi) * 2.5) : 0;

  // poses da lista: L2 (direita) → L3 (centro, maior) → aproximação no item 5
  // a lista só ganha a tela depois do item 1 (o título "Cinco decisões" fica ≥ 2,5 s)
  const pL3 = ease.inOutCubic(prog(t, tA2 - 1.0, tA2 - 0.15));
  const x = mix(770, 540, pL3);
  const y = mix(232, 182, pL3);
  const s = mix(0.9, 1.15, pL3);
  const saiTitulo = ease.inOutSine(prog(t, tA2 - 1.05, tA2 - 0.45));

  return (
    <div className="absolute inset-0" style={{ opacity: vida * (1 - sai), transform: `scale(${(1 - 0.06 * sai).toFixed(4)})`, transformOrigin: "960px 540px" }}>
      <Camera
        chaves={[
          { t: f85.t0, zoom: 1.0 },
          { t: f87.t1, zoom: 1.02 },
          { t: f88.t0, zoom: 1.02 },
          { t: f88.tE + 0.2, zoom: 1.1, x: 90, y: 70, curva: ease.inOutCubic },
          { t: f89.t0 + 1.2, zoom: 1.12, x: 100, y: 80 },
        ]}
        deriva={4}
        seed={31}
      >
        <Camada z={2}>
          <Respiracao tom="verde" x={1100} y={560} raio={800} intensidade={0.06 + 0.08 * acende} periodo={6} />
        </Camada>
        <Camada z={0}>
          <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s.toFixed(4)})`, transformOrigin: "0 0" }}>
            {decisoes.lista.map((d, i) => {
              const em = f85.t0 - 0.8 + i * 0.14;
              const a = ease.outCubic(prog(t, em, em + 0.4));
              const tm = marcas[i];
              const pEsq = ease.outCubic(prog(t, tm - 0.25, tm + 0.05));
              const feito = t >= tm;
              const titulo = i === 4 ? d.titulo.replace(APORTE, "").trim() : d.titulo;
              return (
                <div key={i} style={{ position: "absolute", left: 0, top: i * LINHA, height: 112, display: "flex", alignItems: "center", gap: 34, opacity: a, transform: `translate(${((1 - a) * 30).toFixed(2)}px, 0)` }}>
                  <Caixa t={t} em={tm} numero={String(i + 1)} lado={80} />
                  <div style={{ position: "relative", height: 70, minWidth: 600, display: "flex", alignItems: "center" }}>
                    <span style={{ position: "absolute", left: 0, top: 26, width: ESQUELETO[i], height: 18, borderRadius: 9, background: "rgb(242 244 247 / 0.08)", opacity: 1 - pEsq }} />
                    {t >= tm - 0.3 ? (
                      <Palavra
                        texto={titulo}
                        em={tm - 0.25}
                        passo={0.06}
                        destaque={false}
                        style={{ fontFamily: "var(--fonte-titulo)", fontWeight: 700, fontSize: 54, letterSpacing: "-0.03em", lineHeight: 1.05, whiteSpace: "nowrap", color: feito ? "var(--cor-texto)" : "var(--cor-texto-2)" }}
                      />
                    ) : null}
                    {i === 4 && t >= tm - 0.1 ? (
                      <span
                        className="font-mono"
                        style={{
                          marginLeft: 18,
                          fontSize: 58,
                          fontWeight: 700,
                          letterSpacing: "-0.04em",
                          whiteSpace: "nowrap",
                          color: acende > 0.5 ? COR.verde : "var(--cor-texto)",
                          opacity: ease.outCubic(prog(t, tm - 0.1, tm + 0.25)),
                          textShadow: acende > 0 ? `0 0 ${Math.round(18 + 30 * flashMi)}px ${rgba("verde", 0.35 + 0.35 * flashMi)}` : undefined,
                          display: "inline-block",
                          transform: `scale(${(1 + 0.08 * flashMi * spring(t - tMi, { k: 300, d: 16 })).toFixed(4)})`,
                          transformOrigin: "0 60%",
                        }}
                      >
                        {APORTE}
                      </span>
                    ) : null}
                    {i === 3 ? (
                      <span style={{ marginLeft: 30, opacity: ease.outCubic(prog(t, tCrit - 0.25, tCrit + 0.1)) }}>
                        <Semaforo t={t} tempos={[tCrit, mix(tCrit, tPar, 0.5), tPar]} contorno={f87.tE} />
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Camada>
      </Camera>

      {/* F085 (L2): palavra-chave à esquerda */}
      <div style={{ position: "absolute", left: 150, top: 350, opacity: 1 - saiTitulo }}>
        <Titulo texto="Cinco decisões" frase="F085" tamanho={108} largura={560} brilho={0.7} />
      </div>
    </div>
  );
}
