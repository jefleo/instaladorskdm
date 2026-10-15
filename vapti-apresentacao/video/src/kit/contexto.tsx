/**
 * Contexto do filme: o instante `t` e a timeline, disponíveis para qualquer cena.
 *
 * O `Film` cria o contexto a cada quadro (função pura de `t`) e, para cada ato que
 * renderiza, sobrepõe `ato` com o ato DAQUELA cena (importa no crossfade, quando dois
 * atos aparecem juntos e o tempo global já pertence ao outro).
 */
import { createContext, useContext } from "react";
import { frasePorId, indiceFrase, indiceFraseEm, type Ato, type Frase, type Timeline } from "../timeline";
import { clamp01, prog } from "./tempo";

export interface Filme {
  /** Instante absoluto do quadro, em segundos. */
  t: number;
  fps: number;
  tl: Timeline;
  /** Ato da cena que está lendo o contexto. */
  ato: Ato;
  /** Índice de `ato` em `tl.atos`. */
  iAto: number;
  /** Frase corrente do filme (a última que já começou); `null` antes da primeira. */
  frase: Frase | null;
  /** Segundos desde o início da frase corrente (0 se não houver). */
  ltFrase: number;
  /** Próxima frase (ainda não começou). */
  proxima: Frase | null;
  /** Frase anterior à corrente. */
  anterior: Frase | null;
  /** `?rascunho=1`: sem grão, qualidade de prévia. */
  rascunho: boolean;
  /** `?legenda=1`: versão legendada (reserve a faixa inferior, ver `ZONA_LEGENDA`). */
  legenda: boolean;
}

export const FilmeContext = createContext<Filme | null>(null);

/** Opções de montagem do contexto. */
export interface OpcoesFilme {
  rascunho?: boolean;
  legenda?: boolean;
}

/** Monta o contexto do instante `t` (função pura). */
export function criarFilme(tl: Timeline, t: number, iAto: number, opcoes: OpcoesFilme = {}): Filme {
  const i = indiceFraseEm(tl, t);
  const frase = i >= 0 ? tl.frases[i] : null;
  return {
    t,
    fps: tl.fps,
    tl,
    ato: tl.atos[iAto],
    iAto,
    frase,
    ltFrase: frase ? t - frase.inicio : 0,
    proxima: tl.frases[i + 1] ?? null,
    anterior: i > 0 ? tl.frases[i - 1] : null,
    rascunho: !!opcoes.rascunho,
    legenda: !!opcoes.legenda,
  };
}

/** Contexto completo do filme. Só funciona dentro do `<Film>` (ou do demo). */
export function useFilme(): Filme {
  const f = useContext(FilmeContext);
  if (!f) throw new Error("useFilme: fora do <Film>.");
  return f;
}

/** Atalho: só o instante `t`. */
export function useT(): number {
  return useFilme().t;
}

export interface EstadoFrase {
  /** A frase da timeline. */
  f: Frase;
  /** Início e fim da FALA (absolutos). */
  t0: number;
  t1: number;
  /** Instante em que a próxima frase começa (fim da "janela" desta frase). */
  tProxima: number;
  /** Instante da ênfase (absoluto). */
  tE: number;
  /** true de t0 até a próxima frase começar (inclui o respiro depois da fala). */
  ativa: boolean;
  /** Segundos desde t0 (negativo antes). */
  lt: number;
  /** Progresso 0..1 da fala (t0 → t1). */
  p: number;
}

/** Estado de uma frase pelo id ("F008"): tempos, se está ativa e o progresso da fala. */
export function useFrase(id: string): EstadoFrase {
  const { t, tl } = useFilme();
  return estadoFrase(tl, id, t);
}

/** Versão pura de `useFrase` (para cálculos fora de componentes). */
export function estadoFrase(tl: Timeline, id: string, t: number): EstadoFrase {
  const f = frasePorId(tl, id);
  const prox = tl.frases[indiceFrase(tl, id) + 1];
  const tProxima = prox ? prox.inicio : Infinity;
  return {
    f,
    t0: f.inicio,
    t1: f.fim,
    tProxima,
    tE: f.tEnfase,
    ativa: t >= f.inicio && t < tProxima,
    lt: t - f.inicio,
    p: prog(t, f.inicio, f.fim),
  };
}

export interface EstadoEnfase {
  /** Instante absoluto da ênfase. */
  tE: number;
  /** A ênfase já foi dita (t ≥ tE). */
  passou: boolean;
  /** Segundos desde a ênfase (negativo antes). Use com `spring(lt)`. */
  lt: number;
}

/** Instante da palavra de ênfase da frase `id` — o momento em que o elemento principal entra. */
export function useEnfase(id: string): EstadoEnfase {
  const { t, tl } = useFilme();
  const tE = frasePorId(tl, id).tEnfase;
  return { tE, passou: t >= tE, lt: t - tE };
}

export interface EstadoAto {
  a: Ato;
  t0: number;
  t1: number;
  /** Segundos desde o início do ato. */
  lt: number;
  /** Progresso 0..1 do ato. */
  p: number;
}

/** Estado do ato da cena (ou de outro, pelo id). */
export function useAto(id?: string): EstadoAto {
  const { t, tl, ato } = useFilme();
  const a = id ? (tl.atos.find((x) => x.id === id) ?? ato) : ato;
  return { a, t0: a.inicio, t1: a.fim, lt: t - a.inicio, p: clamp01((t - a.inicio) / Math.max(1e-6, a.fim - a.inicio)) };
}

/**
 * Janela de uma sequência de frases: do início da primeira até o início da frase
 * seguinte à última (ou `Infinity`). Útil para "este bloco vive de F003 a F007".
 */
export function useJanela(primeira: string, ultima: string = primeira): { t0: number; t1: number; ativa: boolean; lt: number } {
  const { t, tl } = useFilme();
  const a = frasePorId(tl, primeira);
  const prox = tl.frases[indiceFrase(tl, ultima) + 1];
  const t1 = prox ? prox.inicio : Infinity;
  return { t0: a.inicio, t1, ativa: t >= a.inicio && t < t1, lt: t - a.inicio };
}
