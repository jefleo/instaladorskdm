#!/usr/bin/env node
// Renderiza o filme: abre video/dist/index.html (arquivo único do vite) no Chromium do Playwright, chama
// window.__vapti.setTime(t) quadro a quadro, tira PNG e entrega a um ffmpeg por faixa (chunk). Depois concatena,
// mixa o áudio (video/build/mix.wav) e gera a versão legendada.
//
// Uso:
//   node video/scripts/render.mjs                       filme completo → entregas/vapti-video-16x9.mp4 e -legendado.mp4
//   node video/scripts/render.mjs --workers 4           páginas/ffmpeg em paralelo (padrão 4)
//   node video/scripts/render.mjs --rascunho            960×540, 12 fps, 2 workers → video/build/rascunho.mp4
//   node video/scripts/render.mjs --de 0 --ate 6        só um trecho (segundos) → video/build/parcial.mp4 (ou rascunho.mp4)
//   node video/scripts/render.mjs --quadros 0,150,300   só PNGs de teste → video/build/previa/
//   --forcar  apaga os chunks e refaz  ·  --sem-legendado  pula a versão legendada  ·  --tamanho-chunk 150
// Retoma de onde parou: chunks prontos (e do mesmo build/timeline) não são refeitos.
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import { RAIZ, VIDEO, BUILD, ENTREGAS, FFMPEG, args, barra, duracaoArquivo, existe, ffmpeg, garantir, hash, lerJson, fmtTempo } from "./lib/comum.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(RAIZ, "node_modules", "playwright"));

const arg = args();
const rascunho = !!arg.rascunho;
const workers = parseInt(arg.workers || (rascunho ? "2" : "4"), 10);
const LARG = rascunho ? 960 : 1920;
const ALT = rascunho ? 540 : 1080;
const dist = path.join(VIDEO, "dist", "index.html");

function falhar(msg) { console.error("render: " + msg); process.exit(1); }
if (!existe(dist)) falhar("falta video/dist/index.html (rode npm run video:build).");
if (!existe(path.join(BUILD, "timeline.json"))) falhar("falta video/build/timeline.json (rode npm run video:timeline).");
const tl = lerJson(path.join(BUILD, "timeline.json"));
const FPS = rascunho ? 12 : tl.fps || 30;
const total = Math.ceil(tl.duracao * FPS);
const de = arg.de !== undefined ? parseFloat(arg.de) : 0;
const ate = arg.ate !== undefined ? Math.min(parseFloat(arg.ate), tl.duracao) : tl.duracao;
const q0 = Math.max(0, Math.floor(de * FPS));
const q1 = Math.min(total, Math.ceil(ate * FPS));
const parcial = q0 > 0 || q1 < total;
const TAM = parseInt(arg["tamanho-chunk"] || (rascunho ? "120" : "150"), 10);

function chromePath() {
  for (const p of ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", process.env.CHROME_PATH].filter(Boolean)) if (existe(p)) return p;
  return undefined; // deixa o playwright resolver
}

const erros = [];
const url = `file://${dist}?w=${LARG}&h=${ALT}${rascunho ? "&rascunho=1" : ""}`;

async function abrirPagina(browser) {
  const ctx = await browser.newContext({ viewport: { width: LARG, height: ALT }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") erros.push(`console.error: ${m.text().slice(0, 300)}`); });
  page.on("pageerror", (e) => erros.push(`erro de página: ${String(e.message || e).slice(0, 300)}`));
  page.on("requestfailed", (r) => erros.push(`requisição falhou: ${r.url().slice(0, 120)}`));
  await page.goto(url);
  await page.waitForFunction(() => window.__vapti && window.__vapti.pronto, null, { timeout: 60000 });
  await page.evaluate(() => window.__vapti.pronto);
  return page;
}

// -------------------------------------------------------------- só prévias
if (arg.quadros) {
  const lista = String(arg.quadros).split(",").map((x) => parseInt(x, 10)).filter((x) => Number.isFinite(x));
  const dir = garantir(path.join(BUILD, "previa"));
  const browser = await chromium.launch({ executablePath: chromePath(), args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const page = await abrirPagina(browser);
  for (const q of lista) {
    await page.evaluate((t) => window.__vapti.setTime(t), q / FPS);
    const p = path.join(dir, `q_${String(q).padStart(6, "0")}.png`);
    await page.screenshot({ path: p, type: "png" });
    console.log(`prévia: ${path.relative(RAIZ, p)} (t=${(q / FPS).toFixed(2)} s)`);
  }
  await browser.close();
  if (erros.length) falhar("erros na página:\n  " + [...new Set(erros)].slice(0, 10).join("\n  "));
  process.exit(0);
}

// -------------------------------------------------------------- chunks
const dirChunks = garantir(rascunho ? path.join(BUILD, "chunks-rascunho") : path.join(BUILD, "chunks"));
const meta = { build: hash(fs.readFileSync(dist), fs.readFileSync(path.join(BUILD, "timeline.json")), FPS, LARG, ALT, TAM) };
const metaPath = path.join(dirChunks, "meta.json");
if (arg.forcar || !existe(metaPath) || lerJson(metaPath).build !== meta.build) {
  for (const f of fs.readdirSync(dirChunks)) fs.rmSync(path.join(dirChunks, f), { force: true });
  fs.writeFileSync(metaPath, JSON.stringify(meta));
}
const nChunks = Math.ceil(total / TAM);
const chunkArq = (k) => path.join(dirChunks, `chunk_${String(k).padStart(4, "0")}.mp4`);
const faixa = (k) => [k * TAM, Math.min(total, (k + 1) * TAM)];
const necessarios = [];
for (let k = 0; k < nChunks; k++) { const [a, b] = faixa(k); if (b > q0 && a < q1) necessarios.push(k); }
const pendentes = necessarios.filter((k) => !existe(chunkArq(k)));
const framesPend = pendentes.reduce((s, k) => s + (faixa(k)[1] - faixa(k)[0]), 0);
console.error(`render: ${rascunho ? "rascunho" : "final"} ${LARG}×${ALT} @${FPS} fps · quadros ${q0}–${q1} de ${total} · ${necessarios.length} chunks (${pendentes.length} a gerar, ${framesPend} quadros) · ${workers} workers`);

let feitos = 0;
let msQuadro = 0;
const prog = barra("render", Math.max(1, framesPend));

async function renderChunk(page, k) {
  const [a, b] = faixa(k);
  const tmp = chunkArq(k) + ".tmp.mp4";
  const ff = spawn(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-crf", "14", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-g", String(FPS * 2), "-movflags", "+faststart", tmp], { stdio: ["pipe", "ignore", "pipe"] });
  let errFf = "";
  ff.stderr.on("data", (d) => (errFf += d));
  let morto = false;
  ff.on("close", (c) => { if (c !== 0) morto = true; });
  const cdp = await page.context().newCDPSession(page);
  ff.stdin.on("error", () => { morto = true; });
  for (let i = a; i < b; i++) {
    if (morto) throw new Error("ffmpeg do chunk encerrou: " + errFf.slice(-300));
    const t0 = Date.now();
    await page.evaluate((t) => window.__vapti.setTime(t), i / FPS);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });
    const png = Buffer.from(data, "base64");
    if (!ff.stdin.write(png)) await once(ff.stdin, "drain");
    msQuadro = msQuadro ? msQuadro * 0.98 + (Date.now() - t0) * 0.02 : Date.now() - t0;
    feitos++;
    prog.passo(feitos, `${msQuadro.toFixed(0)} ms/quadro`);
  }
  ff.stdin.end();
  const [code] = await once(ff, "close");
  if (code !== 0) throw new Error("ffmpeg falhou no chunk: " + errFf.slice(-300));
  fs.renameSync(tmp, chunkArq(k));
}

if (pendentes.length) {
  const browser = await chromium.launch({ executablePath: chromePath(), args: ["--no-sandbox", "--force-color-profile=srgb"] });
  const fila = [...pendentes];
  const trabalhadores = Array.from({ length: Math.min(workers, fila.length) }, async () => {
    let page = await abrirPagina(browser);
    while (fila.length) {
      const k = fila.shift();
      for (let tentativa = 1; ; tentativa++) {
        try { await renderChunk(page, k); break; }
        catch (e) {
          if (tentativa >= 3) throw e;
          console.error(`\nrender: chunk ${k} falhou (${e.message}); tentando de novo (${tentativa}/2)`);
          try { await page.close(); } catch {}
          page = await abrirPagina(browser);
        }
      }
      if (erros.length) break;
    }
  });
  try { await Promise.all(trabalhadores); } finally { await browser.close(); }
  prog.fim(`${msQuadro.toFixed(0)} ms/quadro (média móvel)`);
  if (erros.length) falhar("erros na página durante a renderização:\n  " + [...new Set(erros)].slice(0, 10).join("\n  "));
}

// -------------------------------------------------------------- concat + áudio
const lista = path.join(dirChunks, "lista.txt");
fs.writeFileSync(lista, necessarios.map((k) => `file '${chunkArq(k)}'`).join("\n") + "\n");
const mix = path.join(BUILD, "mix.wav");
const temAudio = existe(mix);
if (!temAudio) console.warn("aviso: video/build/mix.wav não existe (rode npm run video:audio); o vídeo sai sem áudio.");
const inicioChunks = faixa(necessarios[0])[0] / FPS; // início real do primeiro chunk usado
const saidaMp4 = rascunho ? path.join(BUILD, "rascunho.mp4") : parcial ? path.join(BUILD, "parcial.mp4") : path.join(ENTREGAS, "vapti-video-16x9.mp4");
garantir(path.dirname(saidaMp4));
const aud = temAudio ? ["-ss", String(inicioChunks), "-i", mix] : [];
const cortar = parcial ? ["-ss", String(Math.max(0, de - inicioChunks)), "-t", String(ate - de)] : [];
// com corte, os vídeos precisam ser recodificados; sem corte, cópia direta do vídeo
const codecV = parcial ? ["-c:v", "libx264", "-crf", "16", "-preset", "veryfast", "-pix_fmt", "yuv420p"] : ["-c:v", "copy"];
await ffmpeg(["-f", "concat", "-safe", "0", "-i", lista, ...aud, ...cortar, "-map", "0:v", ...(temAudio ? ["-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-shortest"] : []), ...codecV, "-movflags", "+faststart", saidaMp4]);
const dur = await duracaoArquivo(saidaMp4);
console.log(`render: ${path.relative(RAIZ, saidaMp4)} · ${dur.toFixed(2)} s${temAudio ? " com áudio" : ""}`);

// -------------------------------------------------------------- legendado
if (!rascunho && !parcial && !arg["sem-legendado"]) {
  const srt = path.join(ENTREGAS, "vapti-video.srt");
  if (!existe(srt)) { console.warn("aviso: falta entregas/vapti-video.srt (rode video:timeline); legendado ignorado."); process.exit(0); }
  // fontes: Manrope do @fontsource (woff) copiada para uma pasta própria; se o libass não carregar, cai na fonte do sistema
  const fdir = garantir(path.join(BUILD, "fontes"));
  const origemFonte = path.join(RAIZ, "node_modules", "@fontsource", "manrope", "files", "manrope-latin-700-normal.woff");
  if (existe(origemFonte)) fs.copyFileSync(origemFonte, path.join(fdir, "Manrope-Bold.woff"));
  const estilo = (fonte) => `FontName=${fonte},FontSize=31,Bold=1,PrimaryColour=&H00FFFFFF&,OutlineColour=&HE0101010&,BackColour=&H00000000&,BorderStyle=1,Outline=2.6,Shadow=0,Alignment=2,MarginV=46,MarginL=240,MarginR=240,Spacing=0.3`;
  const esc = (p) => p.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");
  const saidaLeg = path.join(ENTREGAS, "vapti-video-legendado.mp4");
  const tentar = (fonte) => ffmpeg(["-i", saidaMp4, "-vf", `subtitles='${esc(srt)}':original_size=1920x1080:fontsdir='${esc(fdir)}':force_style='${estilo(fonte)}'`, "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", saidaLeg]);
  try { await tentar("Manrope"); }
  catch (e) { console.warn("aviso: legendado com Manrope falhou (" + e.message.slice(0, 120) + "); usando DejaVu Sans."); await tentar("DejaVu Sans"); }
  console.log(`render: ${path.relative(RAIZ, saidaLeg)} · ${(await duracaoArquivo(saidaLeg)).toFixed(2)} s`);
}
