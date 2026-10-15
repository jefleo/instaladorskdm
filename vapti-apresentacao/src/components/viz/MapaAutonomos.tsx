import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { projeto } from "../../data/vapti";
import { viz } from "../../content/ui";
import { formatInt } from "../../lib/formato";
import { movimento } from "../base";
import { entrada, Figura, textoVisual, useViz, type VizProps } from "./comum";

/* ---- Geometria: silhueta aproximada do Brasil (longitude, latitude), em sentido anti-horário ---- */
const CONTORNO: readonly [number, number][] = [
  [-73.98, -7.53], [-72.5, -9.4], [-70.6, -11.0], [-68.6, -11.1], [-65.4, -10.4], [-65.0, -12.0], [-62.5, -13.5],
  [-60.5, -13.8], [-60.2, -16.3], [-58.4, -16.3], [-58.2, -19.8], [-57.7, -22.1], [-55.7, -22.6], [-54.6, -24.3],
  [-54.6, -25.6], [-53.8, -27.1], [-55.7, -28.0], [-57.6, -30.2], [-56.0, -31.0], [-53.4, -33.7], [-52.2, -32.2],
  [-50.6, -30.4], [-48.6, -28.2], [-48.5, -26.0], [-47.0, -24.5], [-44.6, -23.4], [-42.0, -22.9], [-41.0, -21.6],
  [-39.7, -19.5], [-39.2, -17.6], [-38.9, -13.0], [-37.0, -10.8], [-35.2, -8.9], [-34.8, -7.1], [-35.2, -5.4],
  [-37.2, -4.8], [-39.0, -3.4], [-41.5, -2.9], [-44.4, -2.4], [-47.5, -0.6], [-49.5, -0.2], [-50.4, 1.8],
  [-51.6, 4.4], [-52.9, 2.2], [-54.4, 2.3], [-56.0, 1.9], [-58.0, 1.5], [-59.6, 1.7], [-59.9, 3.0], [-60.1, 4.6],
  [-60.7, 5.2], [-62.8, 4.0], [-64.0, 3.8], [-64.8, 2.4], [-63.4, 2.2], [-64.1, 1.4], [-66.8, 1.2], [-67.3, 2.1],
  [-69.4, 1.1], [-69.8, -1.3], [-70.0, -4.2], [-72.9, -5.0],
];
const LON0 = -74.3;
const LON1 = -34.5;
const LAT0 = 5.6;
const LAT1 = -34.0;
const PASSO = 0.95;
/** Grande Natal (RN) — praça de partida sugerida. */
const NATAL: [number, number] = [-35.2, -5.8];

function dentro([x, y]: [number, number]): boolean {
  let d = false;
  for (let i = 0, j = CONTORNO.length - 1; i < CONTORNO.length; j = i++) {
    const [xi, yi] = CONTORNO[i];
    const [xj, yj] = CONTORNO[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}

const PONTOS: [number, number][] = (() => {
  const out: [number, number][] = [];
  let linha = 0;
  for (let lat = LAT0; lat >= LAT1; lat -= PASSO * 0.88, linha++) {
    for (let lon = LON0 + (linha % 2 ? PASSO / 2 : 0); lon <= LON1; lon += PASSO) {
      if (dentro([lon, lat])) out.push([lon - LON0, LAT0 - lat]);
    }
  }
  return out;
})();
const VW = LON1 - LON0;
const VH = LAT0 - LAT1;

/** V03 — Contador de autônomos sobre mapa do Brasil em pontos. Fonte: IBGE, citado por Startups.com.br. */
export function MapaAutonomos({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, fs, ativo, animar } = useViz();
  const t = textoVisual("V03");
  const alvo = projeto.autonomosBrasil.valor;
  const [atual, setAtual] = useState(animar ? 0 : alvo);
  useEffect(() => {
    if (!animar) return setAtual(alvo);
    if (!ativo) return;
    const c = animate(0, alvo, { duration: movimento.contagem, ease: movimento.ease, onUpdate: setAtual });
    return () => c.stop();
  }, [ativo, animar, alvo]);

  const pre = projeto.autonomosBrasil.rotulo.replace(/\s*\d.*$/, "");
  const prefixo = pre ? pre[0].toUpperCase() + pre.slice(1) : "";
  const lado = !compacto && largura >= 900;
  const final = formatInt(alvo);
  const natal = [NATAL[0] - LON0, LAT0 - NATAL[1]];

  return (
    <Figura visual="V03" legenda={legenda} className={className}>
      <div
        ref={ref}
        className="grid w-full items-center"
        style={{ gridTemplateColumns: lado ? "minmax(0, 1.25fr) minmax(0, 1fr)" : "1fr", gap: fs.apoio * 2 }}
      >
        <div className="min-w-0">
          <p className="font-texto text-corpo font-semibold text-texto-2">{viz.mapa.rotulo}</p>
          {prefixo ? <p className="mt-[0.2em] font-texto text-corpo-g font-semibold text-azul">{prefixo}</p> : null}
          <p
            className="grid font-mono text-kpi-m font-bold text-azul"
            style={{ lineHeight: "var(--lh-justo)", letterSpacing: "var(--tracking-kpi)" }}
          >
            <span className="invisible col-start-1 row-start-1" aria-hidden="true">{final}</span>
            <span className="col-start-1 row-start-1" aria-hidden="true">{formatInt(atual)}</span>
            <span className="sr-only-vapti">{projeto.autonomosBrasil.rotulo}</span>
          </p>
          <p className="mt-[0.8em] max-w-[36ch] font-texto text-apoio text-texto-3">{viz.mapa.fonte}</p>
        </div>
        <div className="relative mx-auto w-full" style={{ maxWidth: lado ? fs.apoio * 25 : fs.apoio * 22 }}>
          <svg role="img" aria-label={t.alt ?? viz.mapa.mapaAlt} viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full">
            {PONTOS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={PASSO * 0.3} style={{ fill: "var(--cor-azul)", fillOpacity: 0.55, ...entrada(ativo, animar, "fade", (x / VW) * 260, 240) }} />
            ))}
            <circle cx={natal[0]} cy={natal[1]} r={PASSO * 0.95} style={{ fill: "var(--cor-tinta)" }} />
            <circle cx={natal[0]} cy={natal[1]} r={PASSO * 0.62} style={{ fill: "var(--cor-verde)", ...entrada(ativo, animar, "fade", 320, 300) }} />
          </svg>
          <p
            className="absolute right-0 font-texto text-apoio font-semibold leading-tight text-texto"
            style={{ top: `${(natal[1] / VH) * 100 + 4}%`, maxWidth: "11em", textAlign: "right", ...entrada(ativo, animar, "fade", 340, 300) }}
          >
            <span className="mr-[0.4em] inline-block size-[0.6em] rounded-full bg-verde align-middle" aria-hidden="true" />
            {viz.mapa.praca}
          </p>
        </div>
      </div>
    </Figura>
  );
}
