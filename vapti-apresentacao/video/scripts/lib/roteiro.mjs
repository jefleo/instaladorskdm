// Carrega o roteiro (docs/VAPTI_roteiro_video.json) e aplica video/ajustes-fala.json por id.
// `ajustesExtra` (opcional): outro arquivo de ajustes aplicado por cima, campo a campo. Serve para quando a fala de uma
// voz difere da outra, por exemplo video/ajustes-fala-ia.json com a voz da IA (F016 e F086 ditas como no roteiro).
import path from "node:path";
import { RAIZ, VIDEO, existe, lerJson } from "./comum.mjs";

export function carregarRoteiro({ ajustesExtra = null } = {}) {
  const roteiro = lerJson(path.join(RAIZ, "docs", "VAPTI_roteiro_video.json"));
  const ajustes = lerJson(path.join(VIDEO, "ajustes-fala.json"));
  let extra = {};
  if (ajustesExtra) {
    const arq = path.isAbsolute(ajustesExtra) ? ajustesExtra : path.join(RAIZ, ajustesExtra);
    if (!existe(arq)) throw new Error(`ajustes não encontrados: ${ajustesExtra}`);
    extra = lerJson(arq);
  }
  const frases = roteiro.frases.map((f) => {
    const a = { ...(ajustes[f.id] || {}), ...(extra[f.id] || {}) };
    return {
      id: f.id,
      ato: f.ato,
      texto: a.fala ?? f.fala,
      enfase: a.enfase ?? f.enfase,
      tela: a.tela ?? f.tela,
      selo: f.selo ?? "",
      layout: f.layout,
      visuais: f.visuais ?? [],
      som: f.som ?? "",
      direcao: f.visual ?? "",
      pausaAntes: f.pausa_antes ?? 0,
      pausaDepois: f.pausa_depois ?? 0,
      duracaoEstimada: f.duracao_s,
    };
  });
  return { meta: roteiro.meta, atos: roteiro.atos, frases };
}
