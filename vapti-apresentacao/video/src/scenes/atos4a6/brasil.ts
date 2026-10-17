/**
 * Silhueta aproximada do Brasil (longitude, latitude) — geometria, não dado.
 * Mesmo contorno de src/components/viz/MapaAutonomos.tsx, convertido para um path SVG.
 */
export const CONTORNO: readonly [number, number][] = [
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

/** Projeta (lon, lat) numa caixa de `w` × `h` px. */
export function projetar([lon, lat]: readonly [number, number], w: number, h: number): [number, number] {
  return [((lon - LON0) / (LON1 - LON0)) * w, ((LAT0 - lat) / (LAT0 - LAT1)) * h];
}

/** Path SVG do contorno numa caixa de `w` × `h` px. */
export function caminhoBrasil(w: number, h: number): string {
  return CONTORNO.map((p, i) => {
    const [x, y] = projetar(p, w, h);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

/** Grande Natal (RN), praça de partida. */
export const NATAL: readonly [number, number] = [-35.2, -5.8];
