/**
 * Texturas pré-desenhadas UMA vez em canvas na carga (deterministas), usadas como
 * background-image escalado. Motivo: gradientes radiais em CSS grandes custam caro no
 * rasterizador por software e o Skia os pontilha (dither), o que deixa o PNG do quadro
 * lento de codificar. Uma textura lisa escalada é quase de graça.
 *
 * Use pelos componentes do kit (<Respiracao>, <Vinheta>, <Halo>…); para algo novo:
 * `texturaRadial("verde")` devolve a URL de um brilho radial (alfa 1 no centro → 0 na borda),
 * e a intensidade vem da `opacity` do elemento.
 */
import { RGB, type Tom } from "./cores";
import { mulberry32 } from "./tempo";

const cache = new Map<string, string>();

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  return ctx ? [c, ctx] : null;
}

const rgbVirgula = (tom: keyof typeof RGB) => RGB[tom].split(" ").join(",");

/**
 * Brilho radial na cor do tom: alfa 1 no centro, cai suave (curva gaussiana) até 0 na borda.
 * Textura 256×256; desenhe-a num elemento quadrado (ou achatado) com `opacity` = intensidade.
 */
export function texturaRadial(tom: Tom | "preto"): string {
  const chave = `radial-${tom}`;
  const c0 = cache.get(chave);
  if (c0) return c0;
  const cv = canvas(256, 256);
  if (!cv) return "";
  const [c, ctx] = cv;
  const cor = tom === "preto" ? "4,6,9" : rgbVirgula(tom);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  // queda gaussiana em 9 paradas: centro denso, borda transparente
  for (let i = 0; i <= 8; i++) {
    const x = i / 8;
    const a = Math.exp(-x * x * 4.2) * (1 - x * x * x);
    g.addColorStop(x, `rgba(${cor},${a.toFixed(4)})`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const url = c.toDataURL("image/png");
  cache.set(chave, url);
  return url;
}

/** Vinheta: centro transparente, bordas escuras (512×288, esticada para 16:9). */
export function texturaVinheta(): string {
  const c0 = cache.get("vinheta");
  if (c0) return c0;
  const cv = canvas(512, 288);
  if (!cv) return "";
  const [c, ctx] = cv;
  const img = ctx.createImageData(512, 288);
  for (let y = 0; y < 288; y++) {
    for (let x = 0; x < 512; x++) {
      // distância elíptica normalizada ao centro (0,5; 0,48)
      const dx = (x / 511 - 0.5) / 0.75;
      const dy = (y / 287 - 0.48) / 0.8;
      const d = Math.sqrt(dx * dx + dy * dy) * 2;
      const u = Math.min(1, Math.max(0, (d - 0.52) / 0.62));
      const a = u * u * (3 - 2 * u);
      const i = (y * 512 + x) * 4;
      img.data[i] = 4;
      img.data[i + 1] = 6;
      img.data[i + 2] = 9;
      img.data[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = c.toDataURL("image/png");
  cache.set("vinheta", url);
  return url;
}

/** Lado do mosaico de grão (px, sem escala em tempo de execução). */
export const LADO_GRAO = 384;

/**
 * Grão de filme: células de 2×2 px (grão "16 mm", sobrevive ao H.264 e comprime melhor),
 * pontos claros e escuros de alfa baixo (média ≈ neutra: não clareia o preto).
 * Semente fixa: sempre o mesmo PNG.
 */
export function texturaGrao(): string {
  const c0 = cache.get("grao");
  if (c0) return c0;
  const cv = canvas(LADO_GRAO, LADO_GRAO);
  if (!cv) return "";
  const [c, ctx] = cv;
  const img = ctx.createImageData(LADO_GRAO, LADO_GRAO);
  const r = mulberry32(20261016);
  const celula = 2;
  const n = LADO_GRAO / celula;
  for (let cy = 0; cy < n; cy++) {
    for (let cx = 0; cx < n; cx++) {
      // soma de 3 uniformes ≈ gaussiana em −1..1, quantizada em 8 níveis
      const v = (r() + r() + r()) / 1.5 - 1;
      const q = Math.round(v * 4) / 4;
      const claro = q > 0;
      // alfa já final (≈ ±0,1 no máximo): a camada não precisa de `opacity`
      const a = Math.round(Math.abs(q) * (claro ? 21 : 26));
      for (let yy = 0; yy < celula; yy++) {
        for (let xx = 0; xx < celula; xx++) {
          const i = ((cy * celula + yy) * LADO_GRAO + cx * celula + xx) * 4;
          const cor = claro ? 255 : 0;
          img.data[i] = cor;
          img.data[i + 1] = cor;
          img.data[i + 2] = cor;
          img.data[i + 3] = a;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = c.toDataURL("image/png");
  cache.set("grao", url);
  return url;
}

/** Gera todas as texturas e espera a decodificação (chamado no `pronto`). */
export async function prepararTexturas(): Promise<void> {
  const urls = [texturaGrao(), texturaVinheta(), ...(["verde", "coral", "azul", "cinza", "texto", "preto"] as const).map((t) => texturaRadial(t))].filter(Boolean);
  await Promise.all(
    urls.map(async (u) => {
      const img = new Image();
      img.src = u;
      try {
        await img.decode();
      } catch {
        /* o navegador decodifica no primeiro uso */
      }
    }),
  );
}
