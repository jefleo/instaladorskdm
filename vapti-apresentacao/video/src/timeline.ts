/**
 * Timeline do filme: tipos exatos de video/build/timeline.json (SPEC §2).
 *
 * O arquivo é gerado pelo agente PIPELINE (`npm run video:timeline`), fica fora do git
 * e tem todos os tempos em segundos ABSOLUTOS do filme.
 *
 * A importação usa `import.meta.glob` (eager) em vez de `import … from "../build/timeline.json"`
 * de propósito: assim `tsc -b` e o build do site continuam passando num clone limpo,
 * antes de a timeline existir. No navegador, sem o arquivo, o filme mostra o erro na tela.
 */

/** Uma palavra dita na fala, com início e fim absolutos (s). */
export interface PalavraDita {
  w: string;
  t0: number;
  t1: number;
}

/** Layouts do roteiro adaptados a um filme sem apresentador (SPEC §5). */
export type Layout = "L1" | "L2" | "L3" | "L4" | "L5";

/** Uma frase da narração (F001…F091). */
export interface Frase {
  id: string;
  /** Id do ato ("A1"…"A9"). */
  ato: string;
  /** Fala exata (com os ajustes de conformidade aplicados). */
  texto: string;
  inicio: number;
  duracao: number;
  fim: number;
  pausaAntes: number;
  pausaDepois: number;
  /** Palavra (ou trecho) de ênfase, como no roteiro. */
  enfase: string;
  /** Instante absoluto em que a ênfase começa a ser dita. */
  tEnfase: number;
  palavras: PalavraDita[];
  layout: Layout | string;
  /** Ids dos visuais (V01…V24) que a frase usa. */
  visuais: string[];
  /** Texto exato que vai na tela (≤ 8 palavras). */
  tela: string;
  /** "", "Projeção" ou "Ilustrativo". */
  selo: string;
  som: string;
  /** Direção visual do roteiro (campo "visual"). */
  direcao: string;
}

/** Um ato (capítulo) do filme. */
export interface Ato {
  id: string;
  titulo: string;
  /** Etiqueta pronta do capítulo, ex.: "01 · O problema". */
  capitulo: string;
  tom: string;
  /** Energia de 1 a 5 (ritmo). */
  energia: number;
  musica: string;
  inicio: number;
  fim: number;
  primeira: string;
  ultima: string;
}

export interface Marcas {
  /** Fim da última fala (F091). */
  fimNarracao: number;
  /** Janela [início, fim] do card final V24. */
  cardFinal: [number, number];
}

export interface Timeline {
  fps: number;
  largura: number;
  altura: number;
  duracao: number;
  fonte: "estimado" | "voz";
  atos: Ato[];
  frases: Frase[];
  marcas: Marcas;
}

const arquivos = import.meta.glob<Timeline>("../build/timeline.json", { eager: true, import: "default" });

/** Timeline carregada (ou `null` se ainda não foi gerada). */
export const timelineOuNada: Timeline | null = arquivos["../build/timeline.json"] ?? null;

/** Timeline do filme. Lança erro claro se o arquivo não existir. */
export function obterTimeline(): Timeline {
  if (!timelineOuNada) {
    throw new Error("video/build/timeline.json não existe: rode `npm run video:timeline` antes.");
  }
  return timelineOuNada;
}

/* ------------------------------------------------------------------ */
/* Consultas puras sobre a timeline (usadas pelo Film e pelo contexto)  */
/* ------------------------------------------------------------------ */

/** Índice de frases por id, memoizado por timeline. */
const indices = new WeakMap<Timeline, Map<string, number>>();

/** Posição da frase `id` em `tl.frases` (ou −1). */
export function indiceFrase(tl: Timeline, id: string): number {
  let mapa = indices.get(tl);
  if (!mapa) {
    mapa = new Map(tl.frases.map((f, i) => [f.id, i]));
    indices.set(tl, mapa);
  }
  return mapa.get(id) ?? -1;
}

/** Frase pelo id; lança erro se não existir (ids são fixos: F001…F091). */
export function frasePorId(tl: Timeline, id: string): Frase {
  const i = indiceFrase(tl, id);
  if (i < 0) throw new Error(`Frase ${id} não existe na timeline.`);
  return tl.frases[i];
}

/**
 * Índice da frase "corrente" em `t`: a última que já começou (inicio ≤ t).
 * Durante o respiro entre duas frases, continua sendo a anterior. Antes da primeira: −1.
 */
export function indiceFraseEm(tl: Timeline, t: number): number {
  const fs = tl.frases;
  let lo = 0;
  let hi = fs.length - 1;
  let r = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (fs[m].inicio <= t) {
      r = m;
      lo = m + 1;
    } else hi = m - 1;
  }
  return r;
}

/** Índice do ato ativo em `t`: o primeiro cuja fronteira de saída ainda não passou. */
export function indiceAtoEm(tl: Timeline, t: number): number {
  for (let i = 0; i < tl.atos.length - 1; i++) if (t < fronteira(tl, i)) return i;
  return tl.atos.length - 1;
}

/**
 * Fronteira entre o ato `i` e o `i + 1`: o meio entre o fim de um e o início do outro
 * (na timeline do PIPELINE eles coincidem). O crossfade é centrado nesse instante.
 */
export function fronteira(tl: Timeline, i: number): number {
  const a = tl.atos[i];
  const b = tl.atos[i + 1];
  return b ? (a.fim + b.inicio) / 2 : a.fim;
}
