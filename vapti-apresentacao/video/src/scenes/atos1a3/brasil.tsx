/**
 * V03 — Brasil em pontos (mesma silhueta aproximada de src/components/viz/MapaAutonomos.tsx),
 * desenhado em poucos <path> (um por faixa de latitude) para ficar barato por quadro:
 * cada ponto é um segmento de comprimento ~0 com ponta redonda.
 * As faixas acendem de baixo para cima conforme `progresso` (0..1).
 */
import { COR, ease, clamp01 } from "../../kit";

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
const PASSO = 1.1;

function dentro(x: number, y: number): boolean {
  let d = false;
  for (let i = 0, j = CONTORNO.length - 1; i < CONTORNO.length; j = i++) {
    const [xi, yi] = CONTORNO[i];
    const [xj, yj] = CONTORNO[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}

/** Faixas (de baixo para cima) com o `d` de cada uma, em coordenadas 0..1. */
const FAIXAS = 14;
const PONTOS: [number, number][] = (() => {
  const out: [number, number][] = [];
  let linha = 0;
  for (let lat = LAT0; lat >= LAT1; lat -= PASSO * 0.88, linha++) {
    for (let lon = LON0 + (linha % 2 ? PASSO / 2 : 0); lon <= LON1; lon += PASSO) {
      if (dentro(lon, lat)) out.push([(lon - LON0) / (LON1 - LON0), (LAT0 - lat) / (LAT0 - LAT1)]);
    }
  }
  return out;
})();

export const N_PONTOS = PONTOS.length;

function caminhos(w: number, h: number): string[] {
  const faixas: string[][] = Array.from({ length: FAIXAS }, () => []);
  for (const [x, y] of PONTOS) {
    const i = Math.min(FAIXAS - 1, Math.floor((1 - y) * FAIXAS));
    faixas[i].push(`M${(x * w).toFixed(1)} ${(y * h).toFixed(1)}h0.01`);
  }
  return faixas.map((f) => f.join(""));
}

const cache = new Map<string, { faixas: string[]; todos: string }>();
function geometria(w: number, h: number) {
  const k = `${w}x${h}`;
  let g = cache.get(k);
  if (!g) {
    const faixas = caminhos(w, h);
    g = { faixas, todos: faixas.join("") };
    cache.set(k, g);
  }
  return g;
}

/** Mapa do Brasil em pontos; `progresso` 0..1 acende as faixas de baixo para cima. */
export function BrasilPontos({ largura, altura, progresso, ponto = 8, opacidade = 1 }: { largura: number; altura: number; progresso: number; ponto?: number; opacidade?: number }) {
  const { faixas, todos } = geometria(largura, altura);
  return (
    <svg width={largura} height={altura} style={{ overflow: "visible", opacity: opacidade }} aria-hidden="true">
      <path d={todos} stroke="rgb(242 244 247 / 0.13)" strokeWidth={ponto} strokeLinecap="round" fill="none" />
      {faixas.map((d, i) => {
        const a = ease.outCubic(clamp01(progresso * (FAIXAS + 3) - i) / 1);
        if (a <= 0.01) return null;
        return <path key={i} d={d} stroke={COR.verde} strokeWidth={ponto} strokeLinecap="round" fill="none" opacity={a * 0.92} />;
      })}
    </svg>
  );
}
