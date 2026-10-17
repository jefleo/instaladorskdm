#!/usr/bin/env node
// Gera video/build/audio/Fxxx.wav (48 kHz, mono, 16 bits), um arquivo por frase, e registra tudo em video/build/voz.json.
//
// Motores (--motor):
//   mbrola   (padrão) voz sintética local: espeak-ng (fonemas) → camada de prosódia própria (pausas, ritmo, pitch,
//            ênfase, reparo de difones) → mbrola (voz mb-br3 por padrão) → cadeia de ffmpeg (calor, de-esser,
//            compressão, sala curta) → nivelamento. Não baixa nada; funciona offline.
//   arquivos usa video/entrada/editado/Fxxx.wav (clipe editado por editar-voz.mjs conforme video/edicao-voz.json) ou,
//            se não houver, video/entrada/Fxxx.(wav|mp3|m4a|mp4|mov|...) (extrai o áudio, remove ruído com afftdn,
//            normaliza). Com o clipe editado, grava em voz.json as palavras, o tEnfase e o silêncio depois da frase que
//            vêm do plano, relativos ao início do WAV. Frases sem arquivo caem no motor mbrola.
//   neural   esqueleto para Piper / Kokoro pt-BR (modelos locais em video/modelos/). Falha com mensagem clara se
//            os modelos ainda não estiverem lá (ver video/scripts/LEIA-ME.md).
//
// Opções: --voz br3|br1|br2|br4 (mbrola)  --so F001,F007 (só estas)  --forcar (ignora o cache)  --jobs 4  --calibrar
//   --perfil usuario|ia  (padrão usuario) pasta dos clipes, plano de edição, cadeia de tratamento e ajustes de fala:
//            usuario = video/entrada (+ editado/), video/edicao-voz.json, cadeia da voz gravada, só ajustes-fala.json
//            ia      = video/entrada-ia (+ editado/), video/edicao-voz-ia.json, cadeia leve da IA, + ajustes-fala-ia.json
//   --entrada DIR  --plano ARQ  --ajustes ARQ  sobrepõem o perfil campo a campo (caminhos relativos à raiz do projeto).
//   O perfil usado fica registrado em video/build/voz.json; a timeline lê de lá os ajustes de fala (texto da legenda).
// Cache: hash do texto + ênfase + parâmetros + motor (+ tamanho/data do arquivo de entrada). Só o que mudou é refeito.
import path from "node:path";
import fs from "node:fs";
import {
  VIDEO, BUILD, AUDIO, args, barra, duracaoArquivo, emParalelo, existe, ffmpeg, garantir, gravarJson, hash, lerJson, rodar,
} from "./lib/comum.mjs";
import { carregarRoteiro } from "./lib/roteiro.mjs";
import { tokenizar, textoParaVoz, textoParaKokoro, acharEnfase } from "./lib/texto.mjs";
import { alinharPalavras, aplicarProsodia, sintetizar } from "./lib/pho.mjs";
import { CADEIA_VOZ_SINTETICA, PERFIS_VOZ, gerarRespostaSala, medirNivel, nivelar, processar } from "./lib/voz-processamento.mjs";

const VERSAO = 5; // some quando a prosódia ou a cadeia de áudio mudar (invalida o cache)
const S_REF = 110; // velocidade de referência do espeak; o ritmo final vem do fator `tempo` da camada de prosódia
const EXT_ENTRADA = ["wav", "mp3", "m4a", "mp4", "mov", "aac", "flac", "ogg", "webm", "mkv"];

// Perfil de voz por energia do ato (roteiro: A5 sério e mais devagar; A4 leve; A9 firme e caloroso).
const PERFIL = {
  2: { f0: -1.5, faixa: 0.62, fatorPausa: 1.2, kdur: 1.05, realce: 2.0 },
  3: { f0: -0.8, faixa: 0.72, fatorPausa: 1.0, kdur: 1.0, realce: 2.4 },
  4: { f0: -0.3, faixa: 0.82, fatorPausa: 0.92, kdur: 0.97, realce: 2.8 },
  5: { f0: 0.2, faixa: 0.9, fatorPausa: 0.9, kdur: 0.95, realce: 3.0 },
};
// Fator de tempo base (1 = espeak a 110): calibrado para que a fala fique perto das durações do roteiro (150 palavras/min).
const TEMPO_BASE = 1.0;
const LIMITE_TEMPO = [0.8, 1.75];

const arg = args();
const nomePerfil = String(arg.perfil || "usuario");
const perfilVoz = PERFIS_VOZ[nomePerfil];
if (!perfilVoz) {
  console.error(`voz: perfil desconhecido "${nomePerfil}". Use ${Object.keys(PERFIS_VOZ).join(" ou ")}.`);
  process.exit(2);
}
const RAIZ = path.dirname(VIDEO);
const resolver = (p) => (path.isAbsolute(p) ? p : path.join(RAIZ, p));
const DIR_ENTRADA = resolver(String(arg.entrada || perfilVoz.entrada));
const PLANO_VOZ = resolver(String(arg.plano || perfilVoz.plano));
const AJUSTES_EXTRA = arg.ajustes ? String(arg.ajustes) : perfilVoz.ajustesExtra;
const CADEIA_ARQUIVOS = perfilVoz.cadeia;
const planoVoz = existe(PLANO_VOZ) ? lerJson(PLANO_VOZ).frases : {};
const motor = String(arg.motor || "neural");
const vozMb = motor === "mbrola" ? String(arg.voz || "br3") : "br3";
const vozKokoro = motor === "neural" ? String(arg.voz || "pm_alex") : "pm_alex";
const VEL_ATO = { 2: 0.95, 3: 0.97, 4: 1.0, 5: 1.04 };
const jobs = parseInt(arg.jobs || "4", 10);
const so = arg.so ? String(arg.so).split(",") : null;
const forcar = !!arg.forcar;
const r3 = (x) => Math.round(x * 1000) / 1000;

if (!["mbrola", "arquivos", "neural"].includes(motor)) {
  console.error(`voz: motor desconhecido "${motor}". Use mbrola, arquivos ou neural.`);
  process.exit(2);
}

const DIR_RAW = garantir(path.join(BUILD, "voz", "raw"));
const DIR_PHO = garantir(path.join(BUILD, "voz", "pho"));
const DIR_REF = garantir(path.join(BUILD, "voz", "ref"));
garantir(AUDIO);
const SALA = gerarRespostaSala(path.join(BUILD, "voz", "sala.wav"));
const SALA_LEVE = gerarRespostaSala(path.join(BUILD, "voz", "sala-leve.wav"), { nivelDb: -24, rt60: 0.22 });
const CADEIA_VOZ_NEURAL = ["highpass=f=70:poles=2", "lowshelf=g=1.8:f=150:width_type=s:w=0.8", "equalizer=f=4500:t=q:w=1.2:g=-1", "deesser=i=0.2:m=0.5:f=0.5", "acompressor=threshold=0.1:ratio=2:attack=15:release=200:makeup=2:knee=3"];

// ---------------------------------------------------------------- motor mbrola
/** Fluxo de fonemas de referência (com palavras alinhadas), em cache por texto+voz. */
async function referencia(f) {
  const tokens = tokenizar(f.texto);
  const tv = tokens.map(textoParaVoz);
  const chave = hash("ref", VERSAO, vozMb, S_REF, tv);
  const arq = path.join(DIR_REF, `${f.id}.json`);
  if (existe(arq)) {
    const c = lerJson(arq);
    if (c.chave === chave) return { tokens, ...c };
  }
  const { eventos, ok } = await alinharPalavras(tv, { voz: vozMb, s: S_REF, p: 50 });
  const c = { chave, eventos, ok };
  gravarJson(arq, c);
  return { tokens, ...c };
}

/** Parâmetros de prosódia da frase (derivados do ato e do alvo de duração do roteiro). */
function parametrosFrase(f, ato, ref) {
  const perfil = PERFIL[ato.energia] || PERFIL[3];
  const ach = acharEnfase(ref.tokens, f.enfase);
  const base = {
    tokens: ref.tokens,
    enfaseIdx: ach ? ach.i : -1,
    enfaseN: ach ? ach.n : 1,
    fatorPausa: perfil.fatorPausa,
    f0: perfil.f0,
    faixa: perfil.faixa,
    realceEnfase: perfil.realce,
    semente: parseInt(f.id.slice(1), 10) * 7919,
  };
  // fator de tempo: parte do base do ato e corrige parcialmente na direção da duração que o roteiro previu
  const alvo = f.duracaoEstimada * perfil.kdur;
  const dBase = aplicarProsodia(ref.eventos, { ...base, tempo: TEMPO_BASE }).duracao;
  let tempo = TEMPO_BASE * Math.min(1.15, Math.max(0.88, Math.pow(alvo / dBase, 0.5)));
  tempo = Math.min(LIMITE_TEMPO[1], Math.max(LIMITE_TEMPO[0], tempo));
  return { ...base, tempo, alvo, dBase };
}

async function gerarMbrola(f, ato, saida) {
  const ref = await referencia(f);
  const par = parametrosFrase(f, ato, ref);
  const pros = aplicarProsodia(ref.eventos, par);
  const raw = path.join(DIR_RAW, `${f.id}.wav`);
  const rep = await sintetizar(pros.eventos, vozMb, raw, { tmp: DIR_PHO });
  await processar(raw, saida, CADEIA_VOZ_SINTETICA, { sala: SALA });
  const niv = await nivelar(saida, { alvoDb: -21, tetoDb: -1.2 });
  const dur = await duracaoArquivo(saida);
  // tempos das palavras (relativos ao início do WAV); palavras sem fonema (ex.: crase) herdam o vizinho
  const pal = pros.palavras.map((p, i) => ({ w: ref.tokens[i], t0: p.t0, t1: p.t1 }));
  for (let i = 0; i < pal.length; i++) if (pal[i].t0 === null) { const ant = pal[i - 1]?.t1 ?? 0; pal[i].t0 = ant; pal[i].t1 = ant; }
  return {
    motor: "mbrola", voz: `mb-${vozMb}`, dur: r3(dur), tempo: r3(par.tempo), alvoRoteiro: r3(par.alvo),
    alinhado: ref.ok, reparos: rep.reparos, ganhoDb: r3(niv.ganhoDb),
    palavras: ref.ok ? pal.map((p) => ({ w: p.w, t0: r3(p.t0), t1: r3(p.t1) })) : null,
    tEnfase: ref.ok && pros.tEnfase != null ? r3(pros.tEnfase) : null,
    chaveParams: hash(par.tempo, par.f0, par.faixa, par.fatorPausa),
  };
}

// ---------------------------------------------------------------- motor arquivos
function arquivoDeEntrada(id) {
  const editado = path.join(DIR_ENTRADA, "editado", `${id}.wav`);
  if (existe(editado)) return editado;
  for (const ext of EXT_ENTRADA) {
    for (const nome of [`${id}.${ext}`, `${id}.${ext.toUpperCase()}`]) {
      const p = path.join(DIR_ENTRADA, nome);
      if (existe(p)) return p;
    }
  }
  return null;
}

const eEditado = (origem) => path.basename(path.dirname(origem)) === "editado";

/** Palavras do plano com o texto atual da fala (o plano guarda os tempos; o texto pode ter sido ajustado depois). */
function palavrasDoPlano(f, p) {
  if (!p?.palavras?.length) return null;
  const tokens = tokenizar(f.texto);
  if (tokens.length !== p.palavras.length) return null;
  return p.palavras.map((w, i) => ({ w: tokens[i], t0: r3(w.t0), t1: r3(w.t1) }));
}

async function gerarArquivo(f, origem, saida) {
  const tmp = path.join(DIR_RAW, `${f.id}.entrada.wav`);
  const p = eEditado(origem) ? planoVoz[f.id] : null;
  await ffmpeg(["-i", origem, "-vn", "-ac", "1", "-ar", "48000", "-c:a", "pcm_f32le", tmp]);
  // a cadeia e o nivelamento não mudam a duração nem deslocam a voz (atraso do afftdn e do alimiter compensados),
  // então os tempos do plano, relativos ao início do clipe editado, valem para o WAV final
  const { atraso } = await processar(tmp, saida, CADEIA_ARQUIVOS, { compensarAtraso: true });
  const ganhoPlano = p?.ganhoDb || 0; // ajuste do plano, aplicado depois do nivelamento em -21 dB (o limitador protege o pico)
  const niv = await nivelar(saida, { alvoDb: -21 + ganhoPlano, tetoDb: -1.2, semAtraso: true });
  fs.rmSync(tmp, { force: true });
  const dur = await duracaoArquivo(saida);
  const info = { motor: "arquivos", perfil: nomePerfil, cadeia: perfilVoz.nomeCadeia, origem: path.relative(VIDEO, origem), dur: r3(dur), ganhoDb: r3(niv.ganhoDb), atrasoCompensado: atraso, palavras: null, tEnfase: null };
  if (p) {
    info.editado = true;
    info.ganhoPlanoDb = ganhoPlano;
    info.palavras = palavrasDoPlano(f, p);
    info.tEnfase = p.tEnfaseRel != null ? r3(p.tEnfaseRel) : null;
    info.silencioDepois = p.pausaDepois ?? null; // silêncio total até a próxima frase (já inclui respiro, pausaAntes e fronteira de ato)
    if (!info.palavras) console.warn(`  aviso: ${f.id}: palavras do plano não batem com o texto (${p.palavras?.length} × ${tokenizar(f.texto).length}); a timeline estima`);
    if (info.palavras && info.palavras.at(-1).t1 > dur + 0.002) console.warn(`  aviso: ${f.id}: palavras passam do fim do WAV (${info.palavras.at(-1).t1} > ${r3(dur)})`);
  }
  return info;
}

// ---------------------------------------------------------------- motor neural (Kokoro pt-BR)
// Modelos em video/modelos/ (fora do git), venv em video/.venv. Um único processo Python carrega o modelo e gera as frases pendentes.
const KOKORO = { onnx: path.join(VIDEO, "modelos", "kokoro-v1.0.onnx"), vozes: path.join(VIDEO, "modelos", "voices-v1.0.bin"), py: path.join(VIDEO, ".venv", "bin", "python") };

function verificarNeural() {
  const faltam = [KOKORO.onnx, KOKORO.vozes, KOKORO.py].filter((p) => !existe(p)).map((p) => path.relative(VIDEO, p));
  if (faltam.length) {
    throw new Error(`voz neural indisponível: faltam ${faltam.join(", ")} em video/.\nVeja video/scripts/LEIA-ME.md (venv com kokoro-onnx e modelos kokoro-v1.0.onnx / voices-v1.0.bin). Alternativa: --motor mbrola.`);
  }
}

async function lotekokoro(itens) {
  if (!itens.length) return;
  const cfg = path.join(BUILD, "voz", "kokoro-trabalhos.json");
  gravarJson(cfg, { modelo: KOKORO.onnx, vozes: KOKORO.vozes, voz: vozKokoro, lang: "pt-br", itens });
  const r = await rodar(KOKORO.py, [path.join(VIDEO, "scripts", "kokoro_tts.py"), cfg]);
  if (r.code !== 0) throw new Error(`Kokoro falhou: ${r.stderr.slice(-600)}`);
}

async function gerarNeural(f, ato, saida) {
  const raw = path.join(DIR_RAW, `${f.id}.neural.wav`);
  if (!existe(raw)) throw new Error("WAV do Kokoro ausente");
  await processar(raw, saida, CADEIA_VOZ_NEURAL, { sala: SALA_LEVE });
  const niv = await nivelar(saida, { alvoDb: -21, tetoDb: -1.2 });
  return { motor: "neural", modelo: `kokoro/${vozKokoro}`, dur: r3(await duracaoArquivo(saida)), ganhoDb: r3(niv.ganhoDb), palavras: null, tEnfase: null };
}

// ---------------------------------------------------------------- principal
async function main() {
  const t0 = Date.now();
  const roteiro = carregarRoteiro({ ajustesExtra: AJUSTES_EXTRA });
  const atos = Object.fromEntries(roteiro.atos.map((a) => [a.id, a]));
  const vozPath = path.join(BUILD, "voz.json");
  let reg = {};
  try { reg = lerJson(vozPath); } catch { reg = {}; }
  const antigas = reg.frases || {};

  if (motor === "neural") verificarNeural();
  if (motor === "mbrola" || motor === "arquivos") {
    const ok = await rodar("sh", ["-c", `command -v espeak-ng && command -v mbrola && test -f /usr/share/mbrola/${vozMb}/${vozMb}`]);
    if (ok.code !== 0 && motor === "mbrola") throw new Error(`voz: espeak-ng/mbrola/voz mb-${vozMb} não encontrados (apt install espeak-ng mbrola mbrola-br3).`);
  }

  const alvo = roteiro.frases.filter((f) => !so || so.includes(f.id));
  const novas = { ...antigas };
  const chaveDe = (f) => {
    const ato = atos[f.ato];
    const origem = motor !== "neural" ? arquivoDeEntrada(f.id) : arquivoDeEntrada(f.id);
    const motorFrase = origem ? "arquivos" : motor;
    const st = origem ? fs.statSync(origem) : null;
    const plano = origem && eEditado(origem) ? planoVoz[f.id] ?? null : null;
    return { origem, motorFrase, chave: hash(VERSAO, motorFrase, motorFrase === "arquivos" ? [perfilVoz.nomeCadeia, path.relative(VIDEO, origem)] : "", f.texto, f.enfase, f.duracaoEstimada, PERFIL[ato.energia] || PERFIL[3], motorFrase === "mbrola" ? vozMb : "", st ? [st.size, Math.round(st.mtimeMs)] : "", motorFrase === "neural" ? [vozKokoro, VEL_ATO[ato.energia]] : "", plano ? [plano.palavras, plano.tEnfaseRel, plano.pausaDepois, plano.ganhoDb] : "") };
  };
  if (motor === "neural") {
    const pend = alvo.filter((f) => {
      const c = chaveDe(f);
      return c.motorFrase === "neural" && (forcar || !(antigas[f.id]?.chave === c.chave && existe(path.join(AUDIO, `${f.id}.wav`))));
    });
    console.error(`voz: Kokoro (${vozKokoro}) gerando ${pend.length} frases...`);
    await lotekokoro(pend.map((f) => ({ id: f.id, texto: textoParaKokoro(f.texto), velocidade: VEL_ATO[atos[f.ato].energia] ?? 1, saida: path.join(DIR_RAW, `${f.id}.neural.wav`) })));
  }
  const barraProg = barra("voz", alvo.length);
  let feitos = 0, refeitos = 0, pulados = 0;
  const avisos = [];

  await emParalelo(alvo, jobs, async (f) => {
    const ato = atos[f.ato];
    const saida = path.join(AUDIO, `${f.id}.wav`);
    const { origem, motorFrase, chave } = chaveDe(f);
    const ant = antigas[f.id];
    if (!forcar && ant && ant.chave === chave && existe(saida)) {
      pulados++;
    } else {
      let info;
      try {
        if (motorFrase === "arquivos") info = await gerarArquivo(f, origem, saida);
        else if (motorFrase === "neural") info = await gerarNeural(f, ato, saida);
        else info = await gerarMbrola(f, ato, saida);
      } catch (e) {
        throw new Error(`${f.id}: ${e.message}`);
      }
      info.chave = chave;
      info.texto = f.texto;
      novas[f.id] = info;
      refeitos++;
      if (info.reparos?.length) avisos.push(`${f.id}: difones reparados ${info.reparos.join(", ")}`);
      if (info.alinhado === false) avisos.push(`${f.id}: alinhamento palavra-fonema falhou (timeline usará a estimativa por caracteres)`);
    }
    feitos++;
    barraProg.passo(feitos, f.id);
  });
  barraProg.fim(`(${refeitos} gerados, ${pulados} do cache)`);

  const motores = {};
  for (const f of roteiro.frases) { const m = novas[f.id]?.motor; if (m) motores[m] = (motores[m] || 0) + 1; }
  gravarJson(vozPath, {
    motor, vozMbrola: `mb-${vozMb}`, versao: VERSAO, motores,
    perfil: nomePerfil, entrada: path.relative(RAIZ, DIR_ENTRADA), plano: path.relative(RAIZ, PLANO_VOZ), ajustesExtra: AJUSTES_EXTRA,
    nota: "Registro do motor de voz por frase. palavras/tEnfase vêm dos tempos reais (fonemas no mbrola; plano de edição do perfil (campo plano) nos clipes editados), relativos ao início do WAV. silencioDepois (clipes editados) é o silêncio total até a próxima frase.",
    frases: novas,
  });

  const wavs = roteiro.frases.filter((f) => existe(path.join(AUDIO, `${f.id}.wav`))).length;
  console.log(`voz: perfil=${nomePerfil} (${path.relative(RAIZ, DIR_ENTRADA)}, ${path.relative(RAIZ, PLANO_VOZ)}${AJUSTES_EXTRA ? ", " + AJUSTES_EXTRA : ""}) motor=${motor} ${JSON.stringify(motores)} · ${wavs}/${roteiro.frases.length} arquivos em video/build/audio · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  for (const a of avisos.slice(0, 20)) console.warn("  aviso: " + a);
  if (arg.calibrar) {
    let soma = 0, somaAlvo = 0;
    for (const f of roteiro.frases) { soma += novas[f.id]?.dur || 0; somaAlvo += f.duracaoEstimada; }
    console.log(`calibragem: soma das falas ${soma.toFixed(1)} s · roteiro ${somaAlvo.toFixed(1)} s`);
  }
}

main().catch((e) => {
  console.error("voz: " + (e && e.message ? e.message : e));
  process.exit(1);
});
