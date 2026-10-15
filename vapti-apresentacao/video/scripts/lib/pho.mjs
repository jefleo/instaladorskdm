// Camada de prosódia sobre o fluxo de fonemas do espeak-ng + MBROLA.
//
// Fluxo: texto → `espeak-ng --pho` (fonemas, durações, contorno de pitch) → ESTE módulo (pausas, ritmo, pitch, ênfase,
// reparo de difones ausentes na base de voz) → `mbrola` → WAV 22,05 kHz. O módulo também devolve o tempo exato de cada
// palavra e da sílaba tônica da palavra de ênfase, que a timeline usa no lugar da estimativa por caracteres.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { rodar, garantir } from "./comum.mjs";
import { silabas, indiceTonica } from "./texto.mjs";

export const VOGAIS_PHO = new Set(["a", "e", "i", "o", "u", "ee", "oo", "@", "am", "em", "im", "om", "um"]);
export const DESLIZANTES = new Set(["y", "w"]);

export function mbrolaBase(voz) {
  return `/usr/share/mbrola/${voz}/${voz}`;
}

// ---------------------------------------------------------------- parse / format
export function parsePho(txt) {
  const ev = [];
  for (const linha of txt.split("\n")) {
    const k = linha.trim().split(/\s+/).filter(Boolean);
    if (k.length < 2 || !/^[\d.]+$/.test(k[1])) continue;
    const pts = [];
    for (let i = 2; i + 1 < k.length; i += 2) pts.push([parseFloat(k[i]), parseFloat(k[i + 1])]);
    const e = { f: k[0], d: parseFloat(k[1]), pts, w: -1 };
    if (e.f === "_" && ev.length && ev[ev.length - 1].f === "_") ev[ev.length - 1].d += e.d;
    else ev.push(e);
  }
  return ev;
}

export function formatPho(ev) {
  return (
    ev
      .map((e) => {
        const pts = e.pts.map(([p, h]) => `${Math.round(p)} ${Math.round(h * 10) / 10}`).join(" ");
        return `${e.f}\t${Math.max(1, Math.round(e.d))}${pts ? "\t" + pts : ""}`;
      })
      .join("\n") + "\n"
  );
}

export const ehPausa = (e) => e.f === "_";
export const ehVogal = (e) => VOGAIS_PHO.has(e.f);

// ---------------------------------------------------------------- espeak
export async function espeakPho(textoVoz, { voz = "br3", s = 150, p = 50, g = 0 } = {}) {
  const r = await rodar("espeak-ng", ["-v", `mb-${voz}`, "-s", String(s), "-p", String(p), "-g", String(g), "-q", "--pho", textoVoz]);
  if (r.code !== 0) throw new Error(`espeak-ng falhou: ${r.stderr.slice(0, 300)}`);
  return parsePho(r.stdout);
}

/**
 * Atribui a cada fonema o índice da palavra. Método: conta os fonemas de prefixos crescentes da frase, sempre
 * terminados por uma palavra-sentinela (evita que o espeak soletre palavras curtas como "é" quando estão no fim).
 */
const SENTINELA = "tatu";
export async function alinharPalavras(tokensVoz, opc) {
  const completo = await espeakPho(tokensVoz.join(" "), opc);
  const contar = (ev) => ev.filter((e) => !ehPausa(e)).length;
  const base = contar(await espeakPho(SENTINELA, opc));
  const fins = [];
  for (let k = 0; k < tokensVoz.length; k++) {
    const pre = await espeakPho(tokensVoz.slice(0, k + 1).join(" ") + " " + SENTINELA, opc);
    fins.push(contar(pre) - base);
  }
  const total = contar(completo);
  let ok = Math.abs(fins[fins.length - 1] - total) <= 1;
  for (let k = 1; k < fins.length; k++) if (fins[k] < fins[k - 1]) ok = false;
  if (ok) {
    // pequenas diferenças no fim (ex.: sentinela mudando a última vogal): o fim da última palavra é o fim da frase
    fins[fins.length - 1] = total;
  }
  let n = 0;
  let w = 0;
  for (const e of completo) {
    if (ehPausa(e)) {
      e.w = -1;
      continue;
    }
    while (w < fins.length - 1 && n >= fins[w]) w++;
    e.w = ok ? w : -1;
    n++;
  }
  return { eventos: completo, ok, fins };
}

// ---------------------------------------------------------------- reparo de difones
// A base de voz não tem alguns pares de consoantes (ex.: z+j, r2+w, k+s2). Trocamos por pares que existem.
const TROCAS = { z: ["s2", "s"], s: ["s2"], r2: ["r"], x: ["s2"], h: ["r"], k: [], s2: ["s"] };
const cacheDifone = new Map();

async function difoneExiste(voz, a, b, tmp) {
  const chave = `${voz}:${a}:${b}`;
  if (cacheDifone.has(chave)) return cacheDifone.get(chave);
  const ctxA = VOGAIS_PHO.has(a) ? "_" : "o";
  const arq = path.join(tmp, `difone-${voz}.pho`);
  fs.writeFileSync(arq, `_\t40\n${ctxA === "o" ? "o\t60\t0 100\n" : ""}${a}\t70\t0 100\n${b}\t70\t0 100\n${VOGAIS_PHO.has(b) ? "" : "a\t60\t0 100\n"}_\t40\n`);
  const r = await rodar("mbrola", [mbrolaBase(voz), arq, path.join(tmp, `difone-${voz}.wav`)]);
  const ok = r.code === 0 && !/Unknown recovery|Fatal/.test(r.stderr + r.stdout);
  cacheDifone.set(chave, ok);
  return ok;
}

/** Roda o mbrola; se faltar difone, corrige o fluxo (troca ou vogal epentética) e tenta de novo. */
export async function sintetizar(ev, voz, saida, { tempo = 1, freq = 1, vozFreq = 0, tmp }) {
  garantir(tmp);
  const pho = path.join(tmp, `${path.basename(saida, ".wav")}.pho`);
  const reparos = [];
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    fs.writeFileSync(pho, formatPho(ev));
    const arg = [];
    if (tempo !== 1) arg.push("-t", String(tempo));
    if (freq !== 1) arg.push("-f", String(freq));
    if (vozFreq) arg.push("-l", String(vozFreq));
    const r = await rodar("mbrola", [...arg, mbrolaBase(voz), pho, saida]);
    const m = (r.stderr + r.stdout).match(/Unknown recovery for (\S+)-(\S+) segment/);
    if (r.code === 0 && !m) return { reparos };
    if (!m) throw new Error(`mbrola falhou: ${(r.stderr + r.stdout).slice(0, 300)}`);
    const [, A, B] = m;
    // acha o par no fluxo
    let i = -1;
    for (let k = 0; k < ev.length - 1; k++) if (ev[k].f === A && ev[k + 1].f === B) { i = k; break; }
    if (i < 0) throw new Error(`mbrola: difone ${A}-${B} ausente e par não encontrado no fluxo`);
    let feito = false;
    for (const A2 of [A, ...(TROCAS[A] || [])]) {
      for (const B2 of [B, ...(TROCAS[B] || [])]) {
        if (A2 === A && B2 === B) continue;
        if (await difoneExiste(voz, A2, B2, tmp)) {
          ev[i].f = A2;
          ev[i + 1].f = B2;
          reparos.push(`${A}-${B}→${A2}-${B2}`);
          feito = true;
          break;
        }
      }
      if (feito) break;
    }
    if (!feito) {
      // vogal epentética curta entre as duas consoantes
      if ((await difoneExiste(voz, A, "i", tmp)) && (await difoneExiste(voz, "i", B, tmp))) {
        ev.splice(i + 1, 0, { f: "i", d: 38, pts: [[0, ev[i].pts.at(-1)?.[1] ?? 95]], w: ev[i].w });
        reparos.push(`${A}-${B}→${A}-i-${B}`);
        feito = true;
      }
    }
    if (!feito) {
      ev.splice(i + 1, 0, { f: "_", d: 20, pts: [], w: -1 });
      reparos.push(`${A}-${B}→pausa`);
    }
  }
  throw new Error("mbrola: reparos de difone não convergiram");
}

// ---------------------------------------------------------------- prosódia
const st = (hz) => 12 * Math.log2(hz / 100);
const hz = (s) => 100 * Math.pow(2, s / 12);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pontuação final de cada token → tipo de pausa. */
function tipoPausa(token) {
  if (/[,]$/.test(token)) return "virgula";
  if (/[;:]$/.test(token)) return "dois-pontos";
  if (/[?]$/.test(token)) return "interrogacao";
  if (/[.!…]$/.test(token)) return "ponto";
  return null;
}

/**
 * Reescreve pausas, ritmo e pitch.
 * opc: { tokens (da fala original), enfaseIdx (índice do 1º token da ênfase) e enfaseN, tempo, fatorPausa,
 *        f0 (semitons rel. 100 Hz), faixa (0..1+), pausas {virgula, ...} em ms, semente }
 * Devolve { eventos, palavras:[{t0,t1}] (segundos), tEnfase }.
 */
export function aplicarProsodia(ev0, opc) {
  const {
    tokens, enfaseIdx = -1, enfaseN = 1, tempo = 1, fatorPausa = 1, f0 = -0.8, faixa = 0.72,
    pausas = { virgula: 230, "dois-pontos": 320, ponto: 430, interrogacao: 380 },
    declinacao = 1.6, realceEnfase = 2.4, jitter = 0.012, semente = 1, formaTonica,
  } = opc;
  const rnd = mulberry32(semente);
  let ev = ev0.map((e) => ({ ...e, pts: e.pts.map((p) => [...p]) }));

  // 1) pausas: remove as do espeak e reinsere uma por pontuação interna
  const ultimoDaPalavra = new Map();
  ev.forEach((e, i) => { if (!ehPausa(e) && e.w >= 0) ultimoDaPalavra.set(e.w, i); });
  const saida = [];
  ev.forEach((e, i) => {
    if (ehPausa(e)) return;
    saida.push(e);
    if (e.w >= 0 && ultimoDaPalavra.get(e.w) === i && e.w < tokens.length - 1) {
      const tp = tipoPausa(tokens[e.w]);
      if (tp) saida.push({ f: "_", d: pausas[tp] * fatorPausa, pts: [], w: -1, pausaDe: e.w });
    }
  });
  ev = saida;

  // 2) ritmo: ao desacelerar, as vogais esticam mais que as consoantes (como na fala real)
  for (const e of ev) {
    if (ehPausa(e)) continue;
    e.d *= ehVogal(e) || DESLIZANTES.has(e.f) ? tempo : 1 + 0.55 * (tempo - 1);
  }

  // 3) pitch por oração (trecho entre pausas)
  const oracoes = [];
  let atual = [];
  ev.forEach((e, i) => {
    if (ehPausa(e)) {
      if (atual.length) oracoes.push(atual);
      atual = [];
    } else atual.push(i);
  });
  if (atual.length) oracoes.push(atual);

  // tempos de início de cada evento (ms) — recalculados depois do reparo de pausas
  const inicioDe = () => {
    let t = 0;
    return ev.map((e) => { const a = t; t += e.d; return a; });
  };
  let ini = inicioDe();

  oracoes.forEach((idxs, k) => {
    const ultima = k === oracoes.length - 1;
    const comPitch = idxs.filter((i) => ev[i].pts.length);
    if (!comPitch.length) return;
    let somaD = 0, somaS = 0;
    for (const i of comPitch) for (const [, h] of ev[i].pts) { somaS += st(h) * ev[i].d; somaD += ev[i].d; }
    const media = somaS / somaD;
    const t0 = ini[idxs[0]];
    const t1 = ini[idxs[idxs.length - 1]] + ev[idxs[idxs.length - 1]].d;
    const inicioBase = f0 + (k === 0 ? 0.7 : 0.25 - 0.45 * Math.min(k, 4));
    const queda = ultima ? declinacao * 1.25 : declinacao * 0.7;
    for (const i of comPitch) {
      const e = ev[i];
      e.pts = e.pts.map(([p, h]) => {
        const t = ini[i] + (p / 100) * e.d;
        const x = (t - t0) / Math.max(1, t1 - t0);
        return [p, hz(inicioBase - queda * x + faixa * (st(h) - media))];
      });
    }
  });

  // 4) ênfase: realça a vogal tônica da(s) palavra(s) de ênfase
  const tonicas = new Map(); // índice da palavra → índice do evento da vogal tônica
  const palavrasDoEv = new Map();
  ev.forEach((e, i) => { if (e.w >= 0) { if (!palavrasDoEv.has(e.w)) palavrasDoEv.set(e.w, []); palavrasDoEv.get(e.w).push(i); } });
  for (const [w, idxs] of palavrasDoEv) {
    const nucleos = idxs.filter((i) => ehVogal(ev[i]));
    if (!nucleos.length) continue;
    const sils = silabas(tokens[w]);
    let alvo = 0;
    if (sils.length > 1) {
      const it = indiceTonica(sils);
      alvo = nucleos.length === sils.length ? it : Math.round((it / (sils.length - 1)) * (nucleos.length - 1));
    }
    tonicas.set(w, nucleos[Math.min(alvo, nucleos.length - 1)]);
  }
  let tEnfaseMs = null;
  if (enfaseIdx >= 0) {
    for (let k = 0; k < enfaseN; k++) {
      const w = enfaseIdx + k;
      const i = tonicas.get(w);
      if (i === undefined) continue;
      const peso = k === 0 ? 1 : 0.55;
      const e = ev[i];
      if (e.pts.length >= 2) {
        // pico no meio da vogal: sobe até +realce e volta
        const base = e.pts.map(([p, h]) => [p, h]);
        const pico = Math.min(...base.map(([, h]) => h));
        const alvoSt = st(Math.max(...base.map(([, h]) => h))) + realceEnfase * peso;
        e.pts = [[0, base[0][1]], [45, hz(alvoSt)], [100, hz(st(base.at(-1)[1]) + realceEnfase * 0.35 * peso)]];
        void pico;
      } else if (e.pts.length === 1) {
        e.pts = [[0, e.pts[0][1]], [50, hz(st(e.pts[0][1]) + realceEnfase * peso)], [100, e.pts[0][1]]];
      }
      e.d *= 1 + 0.18 * peso;
    }
    ini = inicioDe();
  }

  // 5) microvariação determinista (tira a regularidade de máquina)
  for (const e of ev) {
    if (ehPausa(e)) continue;
    e.d *= 1 + (rnd() - 0.5) * 2 * jitter * 2;
    e.pts = e.pts.map(([p, h]) => [p, h * (1 + (rnd() - 0.5) * 2 * jitter)]);
  }
  ini = inicioDe();

  // 6) tempos das palavras (segundos, relativos ao início do WAV do mbrola)
  const palavras = tokens.map(() => ({ t0: null, t1: null }));
  ev.forEach((e, i) => {
    if (e.w < 0) return;
    const p = palavras[e.w];
    if (p.t0 === null) p.t0 = ini[i] / 1000;
    p.t1 = (ini[i] + e.d) / 1000;
  });
  // início da sílaba tônica da ênfase: começo da consoante inicial da sílaba até o começo da vogal
  let tEnfase = null;
  if (enfaseIdx >= 0 && tonicas.has(enfaseIdx)) {
    const i = tonicas.get(enfaseIdx);
    const iniVogal = ini[i];
    let j = i;
    while (j - 1 >= 0 && ev[j - 1].w === enfaseIdx && !ehVogal(ev[j - 1]) && !DESLIZANTES.has(ev[j - 1].f) && iniVogal - ini[j - 1] < 140) j--;
    tEnfaseMs = Math.max(ini[j], iniVogal - 55);
    tEnfase = tEnfaseMs / 1000;
  }
  return { eventos: ev, palavras, tEnfase, duracao: ev.reduce((s, e) => s + e.d, 0) / 1000 };
}
