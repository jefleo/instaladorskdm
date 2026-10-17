#!/usr/bin/env node
// Edição da voz gravada conforme o plano video/edicao-voz.json (convenções no campo `_convencao` do plano).
// Gera video/entrada/editado/Fxxx.wav (48 kHz, mono, PCM 24 bits) sem tocar nos clipes de video/entrada/.
//
// Por frase:
//   origem "clipe"    recorta [ini, fim] de video/entrada/Fxxx.wav
//   origem "gravacao" recorta [ini, fim] de video/entrada/bruto/gravacao.m4a (decodificada inteira, uma vez)
//   eq                cadeia ffmpeg aplicada antes de tudo (com 0,2 s de contexto, para o filtro não "acordar" na borda)
//   encurtarPausas    [de, ate, para]: remove [de+para/2, ate-para/2] com crossfade de 10 ms (de/ate relativos a ini)
//   fadeIn/fadeOut    rampas de meio cosseno nas bordas
// ganhoDb não entra aqui: é aplicado pelo voz.mjs depois do nivelamento.
//
// Uso: node video/scripts/editar-voz.mjs [--so F012,F066]
//      node video/scripts/editar-voz.mjs --perfil ia      (= --entrada video/entrada-ia --plano video/edicao-voz-ia.json)
// --entrada DIR e --plano ARQ trocam a pasta dos clipes e o plano; a saída vai para DIR/editado.
import path from "node:path";
import fs from "node:fs";
import { RAIZ, VIDEO, BUILD, SR, args, ffmpeg, garantir, gravarWav, lerJson, lerWav, existe } from "./lib/comum.mjs";
import { PERFIS_VOZ } from "./lib/voz-processamento.mjs";

const arg = args();
const perfil = PERFIS_VOZ[String(arg.perfil || "usuario")];
if (!perfil) throw new Error(`editar-voz: perfil desconhecido "${arg.perfil}" (${Object.keys(PERFIS_VOZ).join(", ")})`);
const resolver = (p) => (path.isAbsolute(p) ? p : path.join(RAIZ, p));
export const PLANO_VOZ = resolver(String(arg.plano || perfil.plano));
const ENTRADA = resolver(String(arg.entrada || perfil.entrada));
const SAIDA = garantir(path.join(ENTRADA, "editado"));
const TMP = garantir(path.join(BUILD, "voz", "edicao", path.basename(ENTRADA)));
const XFADE = 0.01;
const CONTEXTO_EQ = 0.2;

const so = arg.so ? String(arg.so).split(",") : null;
const plano = lerJson(PLANO_VOZ).frases;

const fontes = new Map();
async function fonte(rel) {
  if (fontes.has(rel)) return fontes.get(rel);
  const arq = path.join(ENTRADA, rel);
  let x;
  if (/\.wav$/i.test(rel)) x = lerWav(arq).dados[0];
  else {
    const tmp = path.join(TMP, rel.replace(/[\/.]/g, "_") + ".f32.wav");
    const st = fs.statSync(arq);
    const marca = tmp + ".chave";
    const chave = `${st.size}-${Math.round(st.mtimeMs)}`;
    if (!existe(tmp) || !existe(marca) || fs.readFileSync(marca, "utf8") !== chave) {
      await ffmpeg(["-i", arq, "-vn", "-ac", "1", "-ar", String(SR), "-c:a", "pcm_f32le", tmp]);
      fs.writeFileSync(marca, chave);
    }
    x = lerWav(tmp).dados[0];
  }
  fontes.set(rel, x);
  return x;
}

async function aplicarEq(x, cadeia, id) {
  const a = path.join(TMP, `${id}.eq-in.wav`);
  const b = path.join(TMP, `${id}.eq-out.wav`);
  gravarWav(a, [x], SR, 24);
  await ffmpeg(["-i", a, "-af", cadeia, "-ar", String(SR), "-ac", "1", "-c:a", "pcm_f32le", b]);
  const y = lerWav(b).dados[0];
  fs.rmSync(a, { force: true });
  fs.rmSync(b, { force: true });
  return y;
}

/** Remove x[a, b) e costura com crossfade de potência constante de n amostras centrado no corte. */
function removerTrecho(x, a, b, n) {
  const h = Math.floor(n / 2);
  const y = new Float32Array(x.length - (b - a));
  y.set(x.subarray(0, a - h), 0);
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n;
    y[a - h + k] = x[a - h + k] * Math.cos((t * Math.PI) / 2) + x[b - h + k] * Math.sin((t * Math.PI) / 2);
  }
  y.set(x.subarray(b - h + n), a - h + n);
  return y;
}

async function editar(id, p) {
  const rel = p.origem === "gravacao" ? "bruto/gravacao.m4a" : `${id}.wav`;
  const src = await fonte(rel);
  const i0 = Math.round(p.ini * SR);
  const i1 = Math.round(p.fim * SR);
  if (i0 < 0 || i1 > src.length || i1 <= i0) throw new Error(`${id}: corte [${p.ini}, ${p.fim}] fora de ${rel}`);
  let x;
  if (p.eq) {
    const c0 = Math.max(0, i0 - Math.round(CONTEXTO_EQ * SR));
    const c1 = Math.min(src.length, i1 + Math.round(CONTEXTO_EQ * SR));
    const y = await aplicarEq(src.slice(c0, c1), p.eq, id);
    x = y.slice(i0 - c0, i1 - c0);
  } else x = src.slice(i0, i1);

  const removido = [];
  const pausas = [...(p.encurtarPausas || [])].sort((u, v) => v[0] - u[0]); // de trás para frente: índices anteriores não mudam
  for (const [de, ate, para] of pausas) {
    const a = Math.round((de + para / 2) * SR);
    const b = Math.round((ate - para / 2) * SR);
    if (b <= a) continue;
    x = removerTrecho(x, a, b, Math.round(XFADE * SR));
    removido.push({ de, ate, para, removido: (b - a) / SR });
  }

  const nIn = Math.round((p.fadeIn ?? 0.01) * SR);
  const nOut = Math.round((p.fadeOut ?? 0.03) * SR);
  for (let k = 0; k < nIn && k < x.length; k++) x[k] *= 0.5 - 0.5 * Math.cos((Math.PI * (k + 0.5)) / nIn);
  for (let k = 0; k < nOut && k < x.length; k++) x[x.length - 1 - k] *= 0.5 - 0.5 * Math.cos((Math.PI * (k + 0.5)) / nOut);

  gravarWav(path.join(SAIDA, `${id}.wav`), [x], SR, 24);
  return { id, origem: rel, dur: x.length / SR, removido };
}

async function main() {
  const ids = Object.keys(plano).filter((id) => !so || so.includes(id));
  let total = 0;
  for (const id of ids) {
    const r = await editar(id, plano[id]);
    total += r.dur;
    const extra = r.removido.length ? ` · pausa encurtada (−${r.removido.map((q) => q.removido.toFixed(3)).join(", ")} s)` : "";
    console.log(`${id} ${r.dur.toFixed(3)} s de ${r.origem}${plano[id].eq ? " · EQ" : ""}${extra}`);
  }
  console.log(`editar-voz: ${ids.length} clipes em ${path.relative(RAIZ, SAIDA)} (plano ${path.relative(RAIZ, PLANO_VOZ)}) · ${total.toFixed(1)} s de fala`);
}

main().catch((e) => {
  console.error("editar-voz: " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
