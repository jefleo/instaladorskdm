// Pós-processamento de voz (ffmpeg) e nivelamento: deixa a voz sintética mais quente e cinematográfica
// e entrega WAV 48 kHz, mono, 16 bits, com nível consistente entre as frases.
import path from "node:path";
import fs from "node:fs";
import { SR, ffmpeg, garantir, gravarWav, lerWav } from "./comum.mjs";
import { convolver } from "./dsp.mjs";

// Resposta ao impulso de uma sala pequena e amortecida: sinal direto + primeiras reflexões + cauda curta e escura.
// Determinista (semente fixa). `nivelDb` é a energia da cauda relativa à do som direto (-16 dB ≈ sala seca, "presença").
export function gerarRespostaSala(arquivo, { rt60 = 0.26, nivelDb = -16, semente = 7 } = {}) {
  if (fs.existsSync(arquivo)) return arquivo;
  const n = Math.round(SR * Math.max(0.3, rt60 * 1.3));
  const ir = new Float32Array(n);
  let s = semente >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // primeiras reflexões
  for (const [ms, g] of [[6.5, 0.12], [11.3, 0.09], [17.9, 0.07], [26.4, 0.05], [38.2, 0.035]]) ir[Math.round((ms / 1000) * SR)] += g * (rnd() > 0.5 ? 1 : -1);
  // cauda difusa: ruído com decaimento exponencial; passa-baixa de 1 polo que escurece com o tempo
  const cauda = new Float32Array(n);
  let lp = 0;
  const inicio = Math.round(0.012 * SR);
  for (let i = inicio; i < n; i++) {
    const t = (i - inicio) / SR;
    const env = Math.pow(10, (-60 * t) / rt60 / 20);
    const a = 0.5 - 0.35 * Math.min(1, t / rt60);
    lp = lp * a + (rnd() * 2 - 1) * (1 - a);
    cauda[i] = lp * env * Math.min(1, (i - inicio) / (0.008 * SR));
  }
  let e = 0;
  for (let i = 0; i < n; i++) e += cauda[i] * cauda[i];
  const k = Math.sqrt(Math.pow(10, nivelDb / 10) / e);
  ir[0] = 1;
  for (let i = 0; i < n; i++) ir[i] += cauda[i] * k;
  gravarWav(arquivo, [ir], SR);
  return arquivo;
}

export const CADEIA_VOZ_SINTETICA = [
  "highpass=f=75:poles=2",
  "lowshelf=g=3.2:f=150:width_type=s:w=0.8", // calor
  "equalizer=f=320:t=q:w=1.1:g=0.8", // corpo
  "equalizer=f=2900:t=q:w=1.3:g=-2.2", // tira a aspereza de "robô" na presença
  "equalizer=f=5600:t=q:w=1.2:g=-2.8", // suaviza chiado e sibilantes
  "lowpass=f=9200:poles=2",
  "deesser=i=0.35:m=0.6:f=0.5",
  "acompressor=threshold=0.09:ratio=2.4:attack=14:release=220:makeup=2.2:knee=3",
];

export const CADEIA_VOZ_GRAVADA = [
  // A gravação (Lark M2S) já chega limpa, com piso perto de -80 dB: redução de ruído leve, só para não criar artefato.
  // adeclip reconstrói os poucos picos que encostaram em 0 dBFS (no máximo 6 amostras seguidas).
  "adeclip=w=55:o=75:a=8:t=10:n=1000",
  "highpass=f=70:poles=2",
  "afftdn=nr=6:nf=-62:tn=1",
  "lowshelf=g=1.5:f=160:width_type=s:w=0.8",
  "equalizer=f=3200:t=q:w=1.4:g=-1.0",
  "deesser=i=0.25:m=0.5:f=0.5",
  "acompressor=threshold=0.1:ratio=2.2:attack=12:release=200:makeup=2:knee=3",
];

/**
 * Atraso (em amostras) que uma cadeia ffmpeg introduz sem aumentar o arquivo. O afftdn atrasa a saída em 25 ms a 48 kHz
 * e mantém o tamanho: sem compensar, a voz sai deslocada e os últimos 25 ms (a cauda da última sílaba) somem.
 * Medido uma vez por cadeia com um impulso sobre ruído de -80 dB.
 */
const atrasos = new Map();
export function medirAtraso(cadeia, dirTmp) {
  const chave = cadeia.join(",");
  if (!atrasos.has(chave)) atrasos.set(chave, medirAtrasoAgora(cadeia, dirTmp, atrasos.size)); // promessa: chamadas em paralelo esperam a mesma medição
  return atrasos.get(chave);
}

async function medirAtrasoAgora(cadeia, dirTmp, k) {
  garantir(dirTmp);
  const n = SR;
  const pos = Math.round(0.4 * SR);
  const x = new Float32Array(n);
  let s = 12345;
  for (let i = 0; i < n; i++) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    x[i] = ((s / 4294967296) * 2 - 1) * 1e-4;
  }
  x[pos] = 0.5;
  const a = path.join(dirTmp, `atraso-${process.pid}-${k}-in.wav`);
  const b = path.join(dirTmp, `atraso-${process.pid}-${k}-out.wav`);
  gravarWav(a, [x], SR, 24);
  await ffmpeg(["-i", a, "-af", ["aresample=resampler=soxr:osr=48000", "aformat=channel_layouts=mono", ...cadeia].join(","), "-ar", "48000", "-ac", "1", "-c:a", "pcm_f32le", b]);
  const y = lerWav(b).dados[0];
  fs.rmSync(a, { force: true });
  fs.rmSync(b, { force: true });
  let im = pos;
  for (let i = pos; i < Math.min(y.length, pos + Math.round(0.2 * SR)); i++) if (Math.abs(y[i]) > Math.abs(y[im])) im = i;
  return im - pos;
}

/**
 * Roda a cadeia de filtros e (opcional) a sala; entrada qualquer, saída WAV 48 kHz mono 16 bits (pico em -6 dBFS).
 * `compensarAtraso`: completa o fim com silêncio antes da cadeia e descarta o atraso medido no início, de modo que a saída
 * tenha o mesmo tamanho e a mesma posição no tempo da entrada (os tempos de palavras da entrada continuam valendo).
 */
export async function processar(entrada, saida, cadeia, { sala = null, rodarAntes = [], compensarAtraso = false } = {}) {
  garantir(path.dirname(saida));
  let atraso = 0;
  let nEntrada = 0;
  const pad = [];
  if (compensarAtraso) {
    atraso = await medirAtraso([...rodarAntes, ...cadeia], path.dirname(saida));
    nEntrada = lerWav(entrada).dados[0].length;
    pad.push(`apad=pad_dur=${(atraso / SR + 0.1).toFixed(4)}`);
  }
  const filtros = [...rodarAntes, ...pad, "aresample=resampler=soxr:osr=48000", "aformat=channel_layouts=mono", ...cadeia];
  const tmp = saida + ".seco.wav";
  await ffmpeg(["-i", entrada, "-af", filtros.join(","), "-ar", "48000", "-ac", "1", "-c:a", "pcm_f32le", tmp]);
  let x = lerWav(tmp).dados[0];
  fs.rmSync(tmp, { force: true });
  if (compensarAtraso) x = x.slice(atraso, atraso + nEntrada);
  if (sala) {
    // a sala é convolvida em JS (o afir desta build do ffmpeg não soma o ramo seco de forma confiável)
    const ir = lerWav(sala).dados[0];
    x = convolver(x, ir).subarray(0, x.length + Math.round(0.2 * SR));
  }
  let pico = 0;
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pico) pico = a; }
  const k = pico > 0 ? 0.5 / pico : 1;
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) y[i] = x[i] * k;
  gravarWav(saida, [y], SR);
  return { saida, atraso };
}

/** Nível RMS (dBFS) só dos trechos ativos (acima de -50 dBFS por janela de 20 ms) e pico (dBFS). */
export function medirNivel(arquivo) {
  const { dados } = lerWav(arquivo);
  const x = dados[0];
  const janela = Math.round(SR * 0.02);
  let soma = 0, cont = 0, pico = 0;
  for (let i = 0; i + janela <= x.length; i += janela) {
    let e = 0;
    for (let j = 0; j < janela; j++) {
      const v = x[i + j];
      e += v * v;
      const a = Math.abs(v);
      if (a > pico) pico = a;
    }
    const rms = Math.sqrt(e / janela);
    if (20 * Math.log10(rms + 1e-12) > -50) { soma += e; cont += janela; }
  }
  const rmsAtivo = cont ? Math.sqrt(soma / cont) : 1e-6;
  return { rmsDb: 20 * Math.log10(rmsAtivo), picoDb: 20 * Math.log10(pico + 1e-12) };
}

/**
 * Aplica ganho para o RMS ativo ficar em `alvoDb`, com limitador suave para o pico não passar de `tetoDb`.
 * `semAtraso`: compensa o lookahead do alimiter (3 ms), que sem isso desloca a voz e corta o fim do arquivo.
 */
export async function nivelar(arquivo, { alvoDb = -21, tetoDb = -1.2, semAtraso = false } = {}) {
  const { rmsDb, picoDb } = medirNivel(arquivo);
  let ganho = alvoDb - rmsDb;
  ganho = Math.max(-20, Math.min(24, ganho));
  const tmp = arquivo + ".nivel.wav";
  const teto = Math.pow(10, tetoDb / 20).toFixed(4);
  await ffmpeg(["-i", arquivo, "-af", `volume=${ganho.toFixed(2)}dB,alimiter=limit=${teto}:attack=3:release=60:level=disabled${semAtraso ? ":latency=1" : ""}`, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", tmp]);
  fs.renameSync(tmp, arquivo);
  return { ganhoDb: ganho, antes: { rmsDb, picoDb } };
}
