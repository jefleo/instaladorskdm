#!/usr/bin/env node
// Trilha + efeitos + mistura final: video/build/music.wav, sfx.wav, mix.wav (-14 LUFS, pico < -1 dBTP).
// Etapas: (1) musica.py sintetiza trilha/efeitos e faz a pré-mistura com ducking determinista a partir da timeline;
// (2) loudnorm em 2 passes (medição + ajuste linear); (3) conferência final com loudnorm print_format=json.
// Uso: node video/scripts/audio.mjs   (requer video/build/timeline.json e, de preferência, o áudio da voz)
import path from "node:path";
import fs from "node:fs";
import { BUILD, VIDEO, FFMPEG, rodar, ffmpeg, existe, gravarJson, lerJson } from "./lib/comum.mjs";

const ALVO = { I: -14, TP: -1.5, LRA: 11 };

async function medir(arquivo, extra = "") {
  const r = await rodar(FFMPEG, ["-hide_banner", "-nostats", "-i", arquivo, "-af", `loudnorm=I=${ALVO.I}:TP=${ALVO.TP}:LRA=${ALVO.LRA}${extra}:print_format=json`, "-f", "null", "-"]);
  const m = r.stderr.match(/\{[\s\S]*?"target_offset"[\s\S]*?\}/);
  if (!m) throw new Error("loudnorm não devolveu medição: " + r.stderr.slice(-400));
  return JSON.parse(m[0]);
}

async function main() {
  const t0 = Date.now();
  if (!existe(path.join(BUILD, "timeline.json"))) throw new Error("falta video/build/timeline.json (rode video:timeline)");
  const tl = lerJson(path.join(BUILD, "timeline.json"));
  if (tl.fonte !== "voz") console.warn("aviso: timeline com fonte 'estimado' — a mistura terá só silêncio onde falta voz.");
  const py = existe(path.join(VIDEO, ".venv", "bin", "python")) ? path.join(VIDEO, ".venv", "bin", "python") : "python3";
  console.error("audio: sintetizando trilha e efeitos (cerca de 1 min)...");
  const r = await rodar(py, [path.join(VIDEO, "scripts", "musica.py")]);
  if (r.code !== 0) throw new Error("musica.py falhou:\n" + r.stderr.slice(-1500));
  process.stdout.write(r.stdout);

  const pre = path.join(BUILD, "mix-pre.wav");
  const a = await medir(pre);
  const af = `loudnorm=I=${ALVO.I}:TP=${ALVO.TP}:LRA=${ALVO.LRA}:measured_I=${a.input_i}:measured_TP=${a.input_tp}:measured_LRA=${a.input_lra}:measured_thresh=${a.input_thresh}:offset=${a.target_offset}:linear=true:print_format=summary`;
  await ffmpeg(["-i", pre, "-af", `${af},alimiter=limit=0.84:attack=3:release=50:level=disabled`, "-ar", "48000", "-c:a", "pcm_s16le", path.join(BUILD, "mix.wav")]);
  const b = await medir(path.join(BUILD, "mix.wav"));
  const rel = { lufs: parseFloat(b.input_i), picoVerdadeiroDbTP: parseFloat(b.input_tp), lra: parseFloat(b.input_lra), antes: { lufs: parseFloat(a.input_i), dbtp: parseFloat(a.input_tp) } };
  const info = lerJson(path.join(BUILD, "mix-info.json"));
  gravarJson(path.join(BUILD, "mix-info.json"), { ...info, final: rel });
  console.log(`audio: mix.wav ${rel.lufs} LUFS · pico ${rel.picoVerdadeiroDbTP} dBTP · LRA ${rel.lra} (pré-mistura ${rel.antes.lufs} LUFS) · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (rel.lufs < -14.6 || rel.lufs > -13.4 || rel.picoVerdadeiroDbTP > -1) console.warn("aviso: fora da meta (-14 LUFS, pico < -1 dBTP)");
}
main().catch((e) => { console.error("audio: " + (e.message || e)); process.exit(1); });
