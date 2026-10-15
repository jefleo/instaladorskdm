/**
 * Camadas fixas de orientação: <Capitulo> (etiqueta do ato, canto superior esquerdo, 2 s)
 * e <MarcaCanto> (Vapti discreta no canto superior direito, a partir da F009).
 * O Film já desenha as duas; as cenas só precisam deixar esses cantos livres.
 */
import { frasePorId, type Timeline } from "../timeline";
import { useFilme } from "./contexto";
import { rgba } from "./cores";
import { MarcaVapti } from "./MarcaVapti";
import { ease, envelope, prog } from "./tempo";

/** Caixa do capítulo: canto superior esquerdo. */
export const CAPITULO = { esquerda: 120, topo: 64, duracao: 2 } as const;

/**
 * Caixa da marca no canto: borda direita a 120 px, topo a 58 px, letra de 40 px.
 * A cena da F009 pode levar a marca grande até aqui; a <MarcaCanto> assume em `tMarcaCanto`.
 */
export const MARCA_CANTO = { direita: 120, topo: 58, tamanho: 40, opacidade: 0.92 } as const;

/** Instante em que a marca do canto termina de assentar: fim da fala da F009 (ou da frase dada). */
export function tMarcaCanto(tl: Timeline, desde = "F009"): number {
  try {
    return frasePorId(tl, desde).fim;
  } catch {
    return Infinity;
  }
}

export interface CapituloProps {
  /** Texto do capítulo, ex.: "02 · A prova" (campo `capitulo` do ato). */
  texto: string;
  /** Instante em que entra; fica `CAPITULO.duracao` segundos. */
  em: number;
  dur?: number;
}

/** Etiqueta discreta de capítulo: traço vupt + número em mono verde + título em caixa-alta. */
export function Capitulo({ texto, em, dur = CAPITULO.duracao }: CapituloProps) {
  const { t } = useFilme();
  const vida = envelope(t, em, em + dur + 0.4, 0.3, 0.45);
  if (vida <= 0.001) return null;
  const [num, ...resto] = texto.split("·").map((s) => s.trim());
  const titulo = resto.join(" · ");
  const pTraco = ease.saida(prog(t, em, em + 0.5));
  const pNum = ease.saida(prog(t, em + 0.12, em + 0.62));
  const pTit = ease.saida(prog(t, em + 0.22, em + 0.8));
  const sobe = (1 - ease.inOutSine(prog(t, em + dur, em + dur + 0.4))) * 0 + ease.inOutSine(prog(t, em + dur, em + dur + 0.4)) * -8;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute flex items-center"
      style={{
        left: CAPITULO.esquerda,
        top: CAPITULO.topo,
        gap: 16,
        opacity: vida,
        transform: `translate3d(0, ${sobe.toFixed(2)}px, 0)`,
        fontSize: 22,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 34,
          height: 7,
          background: "var(--cor-verde)",
          borderRadius: 2,
          transform: `skewX(-24deg) scaleX(${pTraco.toFixed(4)})`,
          transformOrigin: "left center",
          boxShadow: `0 0 16px ${rgba("verde", 0.4)}`,
        }}
      />
      <span
        style={{
          fontFamily: "var(--fonte-mono)",
          fontWeight: 700,
          color: "var(--cor-verde)",
          letterSpacing: "0.04em",
          opacity: pNum,
          transform: `translate3d(${((1 - pNum) * -10).toFixed(2)}px, 0, 0)`,
        }}
      >
        {num}
      </span>
      {titulo ? (
        <span style={{ width: 1, height: 20, background: "var(--cor-borda-forte)", opacity: pTit }} />
      ) : null}
      {titulo ? (
        <span
          style={{
            fontFamily: "var(--fonte-texto)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--cor-texto-2)",
            opacity: pTit,
            transform: `translate3d(${((1 - pTit) * -12).toFixed(2)}px, 0, 0)`,
          }}
        >
          {titulo}
        </span>
      ) : null}
    </div>
  );
}

export interface MarcaCantoProps {
  /** Instante em que já está assentada (padrão: `tMarcaCanto(tl)`). */
  em?: number;
  /** Instante em que sai (ex.: início do card final). */
  ate?: number;
}

/** Vapti discreta no canto superior direito, a partir da F009, até o card final. */
export function MarcaCanto({ em, ate = Infinity }: MarcaCantoProps) {
  const { t, tl } = useFilme();
  const t0 = em ?? tMarcaCanto(tl);
  const vida = envelope(t, t0 - 0.35, ate, 0.35, 0.4);
  if (vida <= 0.001) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ right: MARCA_CANTO.direita, top: MARCA_CANTO.topo, opacity: vida * MARCA_CANTO.opacidade }}
    >
      <MarcaVapti tamanho={MARCA_CANTO.tamanho} brilho={0.35} />
    </div>
  );
}
