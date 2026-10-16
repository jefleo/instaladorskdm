#!/usr/bin/env node
// Gera video/build/timeline.json (contrato: video/SPEC.md §2), video/build/falas.json e entregas/vapti-video.srt.
//
// Uso:
//   node video/scripts/timeline.mjs              usa video/build/audio/Fxxx.wav quando todos existirem (fonte "voz"),
//                                                senão cai nas durações estimadas do roteiro (fonte "estimado")
//   node video/scripts/timeline.mjs --estimado   força as durações estimadas do roteiro
//   node video/scripts/timeline.mjs --rascunho   igual ao padrão (o formato do arquivo não muda)
//
// Regras de montagem (SPEC §2): 0,8 s de preto no início; respiro de 0,3 s entre frases mais pausaAntes/pausaDepois
// do roteiro; fronteira de ato +0,9 s; card final de 5 s depois da F091.
// Clipes editados (voz.json com `editado`, vindos de video/edicao-voz.json): o silêncio entre a frase e a seguinte é o
// `silencioDepois` do plano (já inclui respiro, pausaAntes e fronteira de ato), palavras e tEnfase são os tempos reais do
// plano (tEnfase = início da palavra de ênfase) e o clipe não é aparado de novo (as bordas e os fades já vêm da edição).
import path from "node:path";
import fs from "node:fs";
import {
  BUILD, AUDIO, ENTREGAS, args, ffmpeg, rodar, FFMPEG, duracaoArquivo, emParalelo, garantir, gravarJson, lerJson, existe,
} from "./lib/comum.mjs";
import { carregarRoteiro } from "./lib/roteiro.mjs";
import { tokenizar, pesoPalavra, fracaoTonica, acharEnfase } from "./lib/texto.mjs";

const FPS = 30;
const PRETO_INICIAL = 0.8;
const RESPIRO = 0.3;
const FRONTEIRA_ATO = 0.9;
const CARD_FINAL = 5;
const FOLGA_ANTES = 0.06;
const FOLGA_DEPOIS = 0.1;
const LIMIAR_DB = -42; // silêncio de borda
const LIMIAR_INTERNO_DB = -36; // pausas internas (vírgulas)
const PAUSA_INTERNA_MIN = 0.12;

const arg = args();
const r3 = (x) => Math.round(x * 1000) / 1000;

// ---------------------------------------------------------------- áudio real
async function silencios(arquivo, db, minimo) {
  const r = await rodar(FFMPEG, ["-hide_banner", "-nostats", "-i", arquivo, "-af", `silencedetect=noise=${db}dB:d=${minimo}`, "-f", "null", "-"]);
  const lista = [];
  let atual = null;
  for (const linha of r.stderr.split("\n")) {
    let m = linha.match(/silence_start:\s*(-?[\d.]+)/);
    if (m) {
      atual = { ini: Math.max(0, parseFloat(m[1])), fim: null };
      lista.push(atual);
    }
    m = linha.match(/silence_end:\s*(-?[\d.]+)/);
    if (m && atual) atual.fim = parseFloat(m[1]);
  }
  return lista;
}

/**
 * Mede e apara um clipe: devolve {dur, segmentos[[ini,fim]] relativos ao clipe aparado, arquivo aparado}.
 * `semAparo` (clipe editado): as bordas já foram cortadas a ~30 ms da fala, com a cauda de 35 ms e os fades da edição;
 * o aparo a -42 dB não cortaria nada, mas somaria outro fade de 30 ms sobre a cauda. O arquivo vai como está.
 */
async function prepararClipe(id, info, { semAparo = false } = {}) {
  const bruto = path.join(AUDIO, `${id}.wav`);
  const aparado = path.join(BUILD, "audio-aparado", `${id}.wav`);
  const st = fs.statSync(bruto);
  const chave = `${st.size}-${Math.round(st.mtimeMs)}-${semAparo ? "sem-aparo" : `${FOLGA_ANTES}-${FOLGA_DEPOIS}-${LIMIAR_DB}`}`;
  const anterior = info[id];
  if (anterior && anterior.chave === chave && existe(aparado)) return anterior;

  const total = await duracaoArquivo(bruto);
  if (semAparo) {
    garantir(path.dirname(aparado));
    fs.copyFileSync(bruto, aparado);
    const novo = { chave, arquivo: path.relative(path.dirname(BUILD), aparado), durBruta: r3(total), aparaIni: 0, aparaFim: r3(total), dur: r3(total), segmentos: [[0, r3(total)]] };
    info[id] = novo;
    return novo;
  }
  const bordas = await silencios(bruto, LIMIAR_DB, 0.03);
  let ini = 0;
  let fim = total;
  if (bordas.length) {
    const primeiro = bordas[0];
    if (primeiro.ini < 0.03 && primeiro.fim != null) ini = primeiro.fim;
    const ultimo = bordas[bordas.length - 1];
    if (ultimo.fim == null || ultimo.fim >= total - 0.03) fim = Math.max(ini + 0.1, ultimo.ini);
  }
  const de = Math.max(0, ini - FOLGA_ANTES);
  const ate = Math.min(total, fim + FOLGA_DEPOIS);
  garantir(path.dirname(aparado));
  await ffmpeg([
    "-i", bruto, "-ss", de.toFixed(4), "-t", (ate - de).toFixed(4),
    "-af", `afade=t=in:d=0.006,afade=t=out:st=${Math.max(0, ate - de - 0.03).toFixed(4)}:d=0.03`,
    "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", aparado,
  ]);
  const dur = await duracaoArquivo(aparado);
  // segmentos de fala (entre pausas internas) no clipe aparado
  const internos = (await silencios(aparado, LIMIAR_INTERNO_DB, PAUSA_INTERNA_MIN)).filter((s) => s.ini > 0.15 && (s.fim ?? dur) < dur - 0.15 && s.fim != null);
  const segmentos = [];
  let cursor = 0;
  for (const s of internos) {
    segmentos.push([r3(cursor), r3(s.ini)]);
    cursor = s.fim;
  }
  segmentos.push([r3(cursor), r3(dur)]);
  const novo = { chave, arquivo: path.relative(path.dirname(BUILD), aparado), durBruta: r3(total), aparaIni: r3(de), aparaFim: r3(ate), dur: r3(dur), segmentos };
  info[id] = novo;
  return novo;
}

// ---------------------------------------------------------------- palavras
const PAUSA_VIRGULA = 1.0; // em "pesos" de palavra
const PAUSA_PONTO = 1.6;

function pausaDepoisDe(token) {
  if (/[,;:]$/.test(token)) return PAUSA_VIRGULA;
  if (/[.?!…]$/.test(token)) return PAUSA_PONTO;
  return 0;
}

/** Distribui as palavras no intervalo [t0, t1]; com `segmentos` (fala real entre pausas) alinha os blocos de pontuação. */
function temporizarPalavras(tokens, inicio, dur, segmentos) {
  const pesos = tokens.map(pesoPalavra);
  const pausas = tokens.map((t, i) => (i < tokens.length - 1 ? pausaDepoisDe(t) : 0));
  // blocos separados por pontuação interna
  const blocos = [];
  let atual = [];
  tokens.forEach((t, i) => {
    atual.push(i);
    if (pausas[i] > 0) {
      blocos.push(atual);
      atual = [];
    }
  });
  if (atual.length) blocos.push(atual);

  const out = new Array(tokens.length);
  const colocar = (idxs, a, b) => {
    const soma = idxs.reduce((s, i) => s + pesos[i], 0);
    let c = a;
    for (const i of idxs) {
      const d = ((b - a) * pesos[i]) / soma;
      out[i] = { w: tokens[i], t0: r3(inicio + c), t1: r3(inicio + c + d) };
      c += d;
    }
  };

  if (segmentos && segmentos.length === blocos.length && blocos.length > 1) {
    blocos.forEach((idxs, k) => colocar(idxs, segmentos[k][0], segmentos[k][1]));
  } else {
    const total = pesos.reduce((s, x) => s + x, 0) + pausas.reduce((s, x) => s + x, 0);
    const unidade = dur / total;
    let c = 0;
    tokens.forEach((t, i) => {
      const d = pesos[i] * unidade;
      out[i] = { w: t, t0: r3(inicio + c), t1: r3(inicio + c + d) };
      c += d + pausas[i] * unidade;
    });
  }
  out[out.length - 1].t1 = r3(inicio + dur);
  return out;
}

// ---------------------------------------------------------------- SRT
function tempoSrt(s) {
  const ms = Math.round(Math.max(0, s) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const ss = Math.floor((ms % 60000) / 1000);
  const mm = ms % 1000;
  const p = (n, k = 2) => String(n).padStart(k, "0");
  return `${p(h)}:${p(m)}:${p(ss)},${p(mm, 3)}`;
}

const MAX_LINHA = 42;
const MAX_CUE = 84;

/** Quebra um texto curto em até 2 linhas equilibradas (≤ 42 caracteres). */
function duasLinhas(texto) {
  if (texto.length <= MAX_LINHA) return texto;
  const palavras = texto.split(" ");
  let melhor = null;
  for (let k = 1; k < palavras.length; k++) {
    const a = palavras.slice(0, k).join(" ");
    const b = palavras.slice(k).join(" ");
    const pior = Math.max(a.length, b.length);
    // prefere quebrar depois de pontuação / antes de conjunção se o equilíbrio for parecido
    const bonus = /[,:;.?!]$/.test(a) ? -3 : 0;
    const nota = pior + bonus;
    if (!melhor || nota < melhor.nota) melhor = { a, b, nota };
  }
  return `${melhor.a}\n${melhor.b}`;
}

/** Divide uma frase longa em partes (≤ MAX_CUE) preferindo cortar em pontuação. Devolve intervalos de índices de palavras. */
function partirCue(palavras) {
  const txt = (a, b) => palavras.slice(a, b).map((p) => p.w).join(" ");
  const partes = [];
  const rec = (a, b) => {
    const t = txt(a, b);
    const cabe = t.length <= MAX_CUE && duasLinhas(t).split("\n").every((l) => l.length <= MAX_LINHA);
    if (cabe || b - a < 2) return partes.push([a, b]);
    let melhor = null;
    for (let k = a + 1; k < b; k++) {
      const x = txt(a, k).length;
      const y = txt(k, b).length;
      const pont = /[,:;.?!]$/.test(palavras[k - 1].w) ? 12 : 0;
      const nota = -Math.abs(x - y) + pont;
      if (!melhor || nota > melhor.nota) melhor = { k, nota };
    }
    rec(a, melhor.k);
    rec(melhor.k, b);
  };
  rec(0, palavras.length);
  return partes;
}

function gerarSrt(frases) {
  const cues = [];
  frases.forEach((f, idx) => {
    const proximo = frases[idx + 1];
    const limite = proximo ? proximo.inicio - 0.04 : f.fim + 0.6;
    const partes = partirCue(f.palavras);
    partes.forEach(([a, b], k) => {
      const ini = f.palavras[a].t0;
      let fim = k === partes.length - 1 ? f.fim + 0.12 : f.palavras[b].t0 - 0.02;
      fim = Math.min(Math.max(fim, ini + 0.9), limite);
      const texto = f.palavras.slice(a, b).map((p) => p.w).join(" ");
      cues.push({ ini: Math.max(0, ini - 0.04), fim: Math.max(fim, ini + 0.3), texto: duasLinhas(texto) });
    });
  });
  // garante ordem e ausência de sobreposição
  for (let i = 1; i < cues.length; i++) if (cues[i].ini < cues[i - 1].fim) cues[i - 1].fim = cues[i].ini - 0.01;
  return cues.map((c, i) => `${i + 1}\n${tempoSrt(c.ini)} --> ${tempoSrt(c.fim)}\n${c.texto}\n`).join("\n");
}

// ---------------------------------------------------------------- principal
async function main() {
  const t0 = Date.now();
  const roteiro = carregarRoteiro();
  const frasesBase = roteiro.frases;
  if (frasesBase.length !== 91) throw new Error(`esperava 91 frases, achei ${frasesBase.length}`);

  // durações
  const infoPath = path.join(BUILD, "audio-info.json");
  let info = {};
  try { info = lerJson(infoPath); } catch { info = {}; }
  const forcarEstimado = !!arg.estimado;
  const temAudio = frasesBase.filter((f) => existe(path.join(AUDIO, `${f.id}.wav`)));
  const usarVoz = !forcarEstimado && temAudio.length === frasesBase.length;
  if (!forcarEstimado && temAudio.length > 0 && !usarVoz) {
    console.warn(`aviso: só ${temAudio.length}/91 clipes em video/build/audio; usando durações estimadas (rode video:voz para gerar todos).`);
  }
  // registro da voz: tempos reais (palavras/tEnfase relativos ao WAV) e silêncio do plano de edição
  let voz = {};
  try { voz = lerJson(path.join(BUILD, "voz.json")).frases || {}; } catch { voz = {}; }
  const planoDe = (id) => (usarVoz && voz[id]?.editado ? voz[id] : null);
  let medidas = {};
  if (usarVoz) {
    const lista = await emParalelo(frasesBase, 4, (f) => prepararClipe(f.id, info, { semAparo: !!planoDe(f.id) }));
    frasesBase.forEach((f, i) => (medidas[f.id] = lista[i]));
    gravarJson(infoPath, info);
  }

  // montagem
  let cursor = PRETO_INICIAL;
  const frases = [];
  let anterior = null;
  const fontes = { gapPlano: 0, palavrasReais: 0, enfaseReal: 0 };
  for (const f of frasesBase) {
    const dur = usarVoz ? medidas[f.id].dur : f.duracaoEstimada;
    let inicio;
    if (!anterior) inicio = cursor + f.pausaAntes;
    else if (anterior.silencioDepois != null) {
      inicio = anterior.fim + anterior.silencioDepois; // silêncio total do plano (respiro, pausaAntes e fronteira já somados)
      fontes.gapPlano++;
    } else {
      const gap = anterior.pausaDepois + RESPIRO + f.pausaAntes + (f.ato !== anterior.ato ? FRONTEIRA_ATO : 0);
      inicio = anterior.fim + gap;
    }
    const tokens = tokenizar(f.texto);
    const pv = planoDe(f.id);
    const desloc = usarVoz ? medidas[f.id].aparaIni : 0; // tempos do WAV → tempos do clipe aparado (0 nos editados)
    const reais = pv?.palavras?.length === tokens.length ? pv.palavras : null;
    const palavras = reais
      ? reais.map((p) => ({ w: p.w, t0: r3(inicio + Math.max(0, p.t0 - desloc)), t1: r3(inicio + Math.min(dur, p.t1 - desloc)) }))
      : temporizarPalavras(tokens, inicio, dur, usarVoz ? medidas[f.id].segmentos : null);
    if (reais) fontes.palavrasReais++;
    const achou = acharEnfase(tokens, f.enfase);
    let tEnfase;
    if (pv?.tEnfase != null) {
      tEnfase = r3(inicio + pv.tEnfase - desloc); // início real da palavra de ênfase
      fontes.enfaseReal++;
    } else if (achou) {
      const p = palavras[achou.i];
      tEnfase = r3(p.t0 + fracaoTonica(p.w) * (p.t1 - p.t0));
    } else {
      console.warn(`aviso: ênfase "${f.enfase}" não encontrada em ${f.id}; usando o meio da fala`);
      tEnfase = r3(inicio + dur / 2);
    }
    const reg = {
      id: f.id, ato: f.ato, texto: f.texto,
      inicio: r3(inicio), duracao: r3(dur), fim: r3(inicio + dur),
      pausaAntes: f.pausaAntes, pausaDepois: f.pausaDepois,
      enfase: f.enfase, tEnfase, palavras,
      layout: f.layout, visuais: f.visuais, tela: f.tela, selo: f.selo, som: f.som, direcao: f.direcao,
    };
    frases.push(reg);
    anterior = { ...reg, fim: inicio + dur, silencioDepois: pv?.silencioDepois ?? null };
  }

  // atos: a fronteira fica no meio do vão entre a última fala de um ato e a primeira do seguinte
  const ultimaFrase = frases[frases.length - 1];
  const fimNarracao = ultimaFrase.fim;
  const cardIni = r3(fimNarracao + (planoDe(ultimaFrase.id)?.silencioDepois ?? ultimaFrase.pausaDepois));
  const cardFim = r3(cardIni + CARD_FINAL);
  const atos = roteiro.atos.map((a, i) => {
    const doAto = frases.filter((f) => f.ato === a.id);
    const primeira = doAto[0];
    const ultima = doAto[doAto.length - 1];
    let inicio = 0;
    if (i > 0) {
      const prevUlt = frases.filter((f) => f.ato === roteiro.atos[i - 1].id).at(-1);
      // com o silêncio do plano, a fronteira fica no meio do vão real entre as duas falas
      inicio = planoDe(prevUlt.id)?.silencioDepois != null
        ? r3((prevUlt.fim + primeira.inicio) / 2)
        : r3(((prevUlt.fim + prevUlt.pausaDepois) + (primeira.inicio - primeira.pausaAntes)) / 2);
    }
    return {
      id: a.id, titulo: a.titulo, capitulo: `${String(i + 1).padStart(2, "0")} · ${a.titulo}`,
      tom: a.tom, energia: a.energia, musica: a.musica,
      inicio, fim: 0, primeira: primeira.id, ultima: ultima.id,
    };
  });
  atos.forEach((a, i) => (a.fim = i < atos.length - 1 ? atos[i + 1].inicio : cardFim));

  const timeline = {
    fps: FPS, largura: 1920, altura: 1080, duracao: cardFim, fonte: usarVoz ? "voz" : "estimado",
    atos, frases,
    marcas: { fimNarracao: r3(fimNarracao), cardFinal: [cardIni, cardFim] },
  };

  garantir(BUILD);
  gravarJson(path.join(BUILD, "timeline.json"), timeline);
  gravarJson(path.join(BUILD, "falas.json"), frasesBase.map((f) => ({ id: f.id, ato: f.ato, texto: f.texto, enfase: f.enfase, tela: f.tela })));
  garantir(ENTREGAS);
  fs.writeFileSync(path.join(ENTREGAS, "vapti-video.srt"), gerarSrt(frases));

  const min = Math.floor(cardFim / 60);
  const seg = (cardFim - min * 60).toFixed(1);
  console.log(`timeline.json: fonte=${timeline.fonte} · ${frases.length} frases · ${atos.length} atos · duração ${cardFim.toFixed(1)} s (${min}:${seg.padStart(4, "0")})`);
  if (usarVoz) console.log(`  plano de edição: silêncio do plano em ${fontes.gapPlano}/90 vãos · palavras reais em ${fontes.palavrasReais}/91 · ênfase real em ${fontes.enfaseReal}/91`);
  console.log(`  fim da narração ${fimNarracao.toFixed(1)} s · card final ${cardIni.toFixed(1)}–${cardFim.toFixed(1)} s · ${((Date.now() - t0) / 1000).toFixed(1)} s de execução`);
  atos.forEach((a) => console.log(`  ${a.id} ${a.inicio.toFixed(1).padStart(6)} – ${a.fim.toFixed(1).padStart(6)}  ${a.capitulo}  (${a.primeira}–${a.ultima})`));
}

main().catch((e) => {
  console.error("timeline: " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
