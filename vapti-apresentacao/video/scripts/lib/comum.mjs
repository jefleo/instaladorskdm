// Utilidades comuns dos scripts do vídeo (caminhos, processos, WAV, progresso).
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const VIDEO = path.join(RAIZ, "video");
export const BUILD = path.join(VIDEO, "build");
export const AUDIO = path.join(BUILD, "audio");
export const ENTREGAS = path.join(RAIZ, "entregas");
export const FFMPEG = process.env.FFMPEG || "/usr/bin/ffmpeg";
export const FFPROBE = process.env.FFPROBE || "/usr/bin/ffprobe";

export const SR = 48000;

export function garantir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function lerJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function gravarJson(p, obj) {
  garantir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

export function hash(...partes) {
  const h = crypto.createHash("sha1");
  for (const p of partes) h.update(typeof p === "string" || Buffer.isBuffer(p) ? p : JSON.stringify(p));
  return h.digest("hex").slice(0, 16);
}

/** Argumentos de linha de comando: --chave valor | --flag */
export function args(argv = process.argv.slice(2)) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const eq = k.indexOf("=");
      if (eq >= 0) o[k.slice(0, eq)] = k.slice(eq + 1);
      else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) o[k] = argv[++i];
      else o[k] = true;
    } else o._.push(a);
  }
  return o;
}

/** Executa um comando e devolve {code, stdout, stderr}; não lança exceção. */
export function rodar(cmd, argumentos, opcoes = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, argumentos, { stdio: ["ignore", "pipe", "pipe"], ...opcoes });
    const out = [];
    const err = [];
    p.stdout.on("data", (d) => out.push(d));
    p.stderr.on("data", (d) => err.push(d));
    p.on("error", (e) => resolve({ code: -1, stdout: "", stderr: String(e) }));
    p.on("close", (code) => resolve({ code, stdout: Buffer.concat(out).toString("utf8"), stderr: Buffer.concat(err).toString("utf8") }));
  });
}

export async function ffmpeg(argumentos, opcoes = {}) {
  const r = await rodar(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", ...argumentos], opcoes);
  if (r.code !== 0) throw new Error(`ffmpeg falhou (${r.code}): ${r.stderr.trim().slice(-600)}\n  args: ${argumentos.join(" ").slice(0, 400)}`);
  return r;
}

export async function duracaoArquivo(p) {
  const r = await rodar(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", p]);
  const d = parseFloat(r.stdout);
  if (!Number.isFinite(d)) throw new Error(`ffprobe não leu a duração de ${p}: ${r.stderr}`);
  return d;
}

/** Pool simples de concorrência. */
export async function emParalelo(itens, n, fn) {
  const resultados = new Array(itens.length);
  let i = 0;
  const trabalhadores = Array.from({ length: Math.min(n, itens.length) }, async () => {
    while (true) {
      const k = i++;
      if (k >= itens.length) return;
      resultados[k] = await fn(itens[k], k);
    }
  });
  await Promise.all(trabalhadores);
  return resultados;
}

/** Lê WAV PCM 16 bits (mono ou estéreo) → {sr, canais, dados: Float32Array[]}. */
export function lerWav(p) {
  const b = fs.readFileSync(p);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") throw new Error(`não é WAV: ${p}`);
  let pos = 12;
  let fmt = null;
  let dados = null;
  while (pos + 8 <= b.length) {
    const id = b.toString("ascii", pos, pos + 4);
    let tam = b.readUInt32LE(pos + 4);
    const ini = pos + 8;
    if (id === "fmt ") {
      fmt = { formato: b.readUInt16LE(ini), canais: b.readUInt16LE(ini + 2), sr: b.readUInt32LE(ini + 4), bits: b.readUInt16LE(ini + 14) };
      // WAVE_FORMAT_EXTENSIBLE (0xFFFE): o formato real está nos 2 primeiros bytes do subformato (GUID em ini+24).
      // Sem isto, float32 do ffmpeg era lido como inteiro e a voz saía destruída.
      if (fmt.formato === 0xfffe && tam >= 26) fmt.formato = b.readUInt16LE(ini + 24);
    } else if (id === "data") {
      if (ini + tam > b.length) tam = b.length - ini;
      dados = b.subarray(ini, ini + tam);
      break;
    }
    pos = ini + tam + (tam & 1);
  }
  if (!fmt || !dados) throw new Error(`WAV incompleto: ${p}`);
  const { canais, bits, formato } = fmt;
  const bytes = bits / 8;
  const n = Math.floor(dados.length / (bytes * canais));
  const saida = Array.from({ length: canais }, () => new Float32Array(n));
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < canais; c++) {
      const o = (i * canais + c) * bytes;
      let v;
      if (formato === 3 && bits === 32) v = dados.readFloatLE(o);
      else if (bits === 16) v = dados.readInt16LE(o) / 32768;
      else if (bits === 24) v = dados.readIntLE(o, 3) / 8388608;
      else if (bits === 32) v = dados.readInt32LE(o) / 2147483648;
      else throw new Error(`WAV ${bits} bits não suportado`);
      saida[c][i] = v;
    }
  }
  return { sr: fmt.sr, canais, dados: saida };
}

/** Grava WAV PCM 16 bits (ou 24 com `bits = 24`) a partir de canais Float32Array. */
export function gravarWav(p, canais, sr = SR, bits = 16) {
  if (bits !== 16 && bits !== 24) throw new Error(`gravarWav: ${bits} bits não suportado`);
  const nc = canais.length;
  const n = canais[0].length;
  const by = bits / 8;
  const escala = bits === 16 ? 32767 : 8388607;
  const buf = Buffer.alloc(44 + n * nc * by);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(36 + n * nc * by, 4);
  buf.write("WAVE", 8, "ascii");
  buf.write("fmt ", 12, "ascii");
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(nc, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * nc * by, 28);
  buf.writeUInt16LE(nc * by, 32);
  buf.writeUInt16LE(bits, 34);
  buf.write("data", 36, "ascii");
  buf.writeUInt32LE(n * nc * by, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nc; c++) {
      let v = canais[c][i];
      v = v > 1 ? 1 : v < -1 ? -1 : v;
      buf.writeIntLE(Math.round(v * escala), o, by);
      o += by;
    }
  }
  garantir(path.dirname(p));
  fs.writeFileSync(p, buf);
}

export function fmtTempo(s) {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return (h ? `${h}h` : "") + (h || m ? `${String(m).padStart(h ? 2 : 1, "0")}m` : "") + `${String(ss).padStart(h || m ? 2 : 1, "0")}s`;
}

/** Barra de progresso de terminal com tempo restante estimado. */
export function barra(titulo, total) {
  const ini = Date.now();
  let ultimo = 0;
  const tty = process.stderr.isTTY;
  return {
    passo(feito, extra = "") {
      const agora = Date.now();
      if (agora - ultimo < (tty ? 200 : 5000) && feito < total) return;
      ultimo = agora;
      const f = Math.min(1, feito / Math.max(1, total));
      const dec = (agora - ini) / 1000;
      const resta = f > 0.01 ? (dec / f) * (1 - f) : NaN;
      const w = 28;
      const cheio = Math.round(f * w);
      const linha = `${titulo} [${"#".repeat(cheio)}${".".repeat(w - cheio)}] ${(f * 100).toFixed(1).padStart(5)}%  ${feito}/${total}  decorrido ${fmtTempo(dec)}  resta ~${Number.isFinite(resta) ? fmtTempo(resta) : "?"} ${extra}`;
      if (tty) process.stderr.write("\r" + linha.padEnd(120));
      else process.stderr.write(linha + "\n");
    },
    fim(msg = "") {
      if (tty) process.stderr.write("\r" + " ".repeat(120) + "\r");
      console.error(`${titulo}: concluído em ${fmtTempo((Date.now() - ini) / 1000)} ${msg}`);
    },
  };
}

export function existe(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function comandoExiste(cmd) {
  const r = spawnSync("sh", ["-c", `command -v ${cmd}`], { encoding: "utf8" });
  return r.status === 0;
}
