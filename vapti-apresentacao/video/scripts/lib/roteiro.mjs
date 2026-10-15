// Carrega o roteiro (docs/VAPTI_roteiro_video.json) e aplica video/ajustes-fala.json por id.
import path from "node:path";
import { RAIZ, VIDEO, lerJson } from "./comum.mjs";

export function carregarRoteiro() {
  const roteiro = lerJson(path.join(RAIZ, "docs", "VAPTI_roteiro_video.json"));
  const ajustes = lerJson(path.join(VIDEO, "ajustes-fala.json"));
  const frases = roteiro.frases.map((f) => {
    const a = ajustes[f.id] || {};
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
