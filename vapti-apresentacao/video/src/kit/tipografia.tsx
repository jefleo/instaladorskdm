/**
 * Tipografia em movimento: <Palavra>, <Titulo>, <Rotulo> e <Numero>.
 *
 * Princípios (SPEC §6): no máximo 8 palavras na tela; a palavra de ênfase entra na sílaba
 * em que é dita e ganha o verde; números contam e PARAM exatamente quando são ditos.
 */
import type { CSSProperties, ElementType, ReactNode } from "react";
import { formatBRL, formatInt, formatMi, formatPct } from "../../../src/lib/formato";
import { useFilme } from "./contexto";
import { brilhoTexto, COR, rgba, type Tom } from "./cores";
import { frasePorId, type Frase } from "../timeline";
import { ease, prog, type Easing } from "./tempo";
import { texturaRadial } from "./texturas";

/* ------------------------------------------------------------------ */
/* Utilidades de texto                                                 */
/* ------------------------------------------------------------------ */

/** Normaliza para comparar palavras escritas e faladas ("Perdido," → "perdido"). */
export const normalizar = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Conta palavras "de texto" (números e símbolos não contam, SPEC §6.4). */
export function contarPalavras(texto: string): number {
  return texto.split(/\s+/).filter((w) => /[A-Za-zÀ-ÿ]/.test(w) && !/^[\d.,%$R×x→+−-]+$/.test(w)).length;
}

const avisados = new Set<string>();
/** Em desenvolvimento, avisa (uma vez) quando um texto passa de 8 palavras. */
function conferirLimite(texto: string, quem: string) {
  if (!import.meta.env.DEV || avisados.has(texto)) return;
  if (contarPalavras(texto) > 8) {
    avisados.add(texto);
    console.warn(`[kit] ${quem}: "${texto}" tem mais de 8 palavras na tela (SPEC §6.4).`);
  }
}

/** Posição [i, j) de uma sequência de palavras-alvo dentro de `palavras` (normalizadas). */
function acharSequencia(palavras: string[], alvo: string[]): [number, number] | null {
  if (!alvo.length) return null;
  for (let i = 0; i + alvo.length <= palavras.length; i++) {
    if (alvo.every((a, k) => palavras[i + k] === a)) return [i, i + alvo.length];
  }
  return null;
}

/**
 * Instante de entrada de cada palavra exibida, casando-a com a fala (em ordem, numa janela
 * de 8 palavras à frente). Palavras sem par (números, símbolos) entram `passo` depois da anterior.
 */
export function temposDasPalavras(exibidas: string[], frase: Frase | null, em: number | undefined, passo: number, adiantar: number): number[] {
  const out: number[] = [];
  let ponteiro = 0;
  const faladas = frase ? frase.palavras.map((p) => normalizar(p.w)) : [];
  let anterior = em ?? (frase ? frase.inicio : 0);
  exibidas.forEach((w, i) => {
    const n = normalizar(w);
    let achou = -1;
    if (frase && n) {
      for (let j = ponteiro; j < Math.min(faladas.length, ponteiro + 8); j++) {
        if (faladas[j] === n) {
          achou = j;
          break;
        }
      }
    }
    let te: number;
    if (achou >= 0) {
      te = Math.max(frase!.palavras[achou].t0 - adiantar, i === 0 ? -Infinity : anterior);
      if (em !== undefined) te = Math.max(te, em);
      ponteiro = achou + 1;
    } else te = i === 0 ? anterior : anterior + passo;
    out.push(te);
    anterior = te;
  });
  return out;
}

/** Índices das palavras exibidas que recebem destaque. */
function indicesDestaque(exibidas: string[], destaque: string | string[] | boolean | undefined, frase: Frase | null): Set<number> {
  const norm = exibidas.map(normalizar);
  const alvos: string[] = destaque === true || destaque === undefined ? (frase ? [frase.enfase] : []) : destaque === false ? [] : Array.isArray(destaque) ? destaque : [destaque];
  const s = new Set<number>();
  for (const a of alvos) {
    const seq = a.split(/\s+/).map(normalizar).filter(Boolean);
    const r = acharSequencia(norm, seq);
    if (r) for (let i = r[0]; i < r[1]; i++) s.add(i);
    else if (destaque !== undefined && destaque !== true) norm.forEach((w, i) => seq.includes(w) && w && s.add(i));
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* <Palavra>                                                           */
/* ------------------------------------------------------------------ */

export type ModoEntrada = "mascara" | "subir" | "foco";

export interface PalavraProps {
  /** Texto exibido (≤ 8 palavras). Não é a transcrição: é a palavra-chave. */
  texto: string;
  /** Frase cuja fala sincroniza a entrada de cada palavra (ex.: "F002"). */
  frase?: string;
  /** Início absoluto (sem `frase`, ou piso de tempo com `frase`). */
  em?: number;
  /** Intervalo entre palavras sem par na fala (padrão 0,08 s). */
  passo?: number;
  /** Entra este tanto antes de a palavra ser dita (padrão 0,04 s). */
  adiantar?: number;
  /** Destaque: `true` (padrão) = ênfase da frase; texto(s) = essas palavras; `false` = nenhum. */
  destaque?: string | string[] | boolean;
  /** Cor do texto (padrão "texto") e do destaque (padrão "verde"). */
  tom?: Tom;
  tomDestaque?: Tom;
  /** Cor CSS livre para as palavras sem destaque (tem prioridade sobre `tom`). */
  cor?: string;
  /** Estilo de entrada (padrão "mascara": sobe de dentro de uma janela). */
  modo?: ModoEntrada;
  /** Duração da entrada de cada palavra (padrão 0,55 s). */
  dur?: number;
  /** Instante de saída (opcional) e duração (padrão 0,35 s). */
  saida?: number;
  durSaida?: number;
  /** Força do brilho do destaque, 0..1 (padrão 0,8). */
  brilho?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * Texto que entra palavra a palavra no tempo da fala; a ênfase fica verde e brilha.
 * ```tsx
 * <Palavra texto="dia de trabalho × dia perdido" frase="F002" destaque="dia perdido" tomDestaque="coral" />
 * ```
 */
export function Palavra({
  texto,
  frase,
  em,
  passo = 0.08,
  adiantar = 0.04,
  destaque,
  tom = "texto",
  tomDestaque = "verde",
  cor,
  modo = "mascara",
  dur = 0.55,
  saida,
  durSaida = 0.35,
  brilho = 0.8,
  as: Tag = "span",
  className,
  style,
}: PalavraProps) {
  const { t, tl } = useFilme();
  conferirLimite(texto, "Palavra");
  const f = frase ? frasePorId(tl, frase) : null;
  const ws = texto.split(/\s+/).filter(Boolean);
  const tempos = temposDasPalavras(ws, f, em, passo, adiantar);
  const dest = indicesDestaque(ws, destaque, f);
  const qSaida = saida !== undefined ? prog(t, saida, saida + durSaida) : 0;
  return (
    <Tag className={className} style={style}>
      {ws.map((w, i) => {
        const p = prog(t, tempos[i], tempos[i] + dur);
        const ehDestaque = dest.has(i);
        let transform = "none";
        let opacity = 1;
        if (modo === "mascara") {
          const e = ease.outExpo(p);
          transform = `translate3d(0, ${((1 - e) * 108).toFixed(2)}%, 0)`;
          opacity = Math.min(1, p * 2.4);
        } else if (modo === "subir") {
          const e = ease.saida(p);
          transform = `translate3d(0, ${((1 - e) * 0.42).toFixed(3)}em, 0)`;
          opacity = ease.outCubic(p);
        } else {
          const e = ease.outCubic(p);
          transform = `translate3d(0, ${((1 - e) * 0.12).toFixed(3)}em, 0) scale(${(1 + (1 - e) * 0.14).toFixed(4)})`;
          opacity = e;
        }
        if (qSaida > 0) {
          const qs = ease.inOutSine(Math.min(1, qSaida * 1.3 - (ws.length - 1 - i) * 0.04));
          opacity *= 1 - Math.max(0, qs);
          transform += ` translate3d(0, ${(-Math.max(0, qs) * 0.25).toFixed(3)}em, 0)`;
        }
        // Brilho do destaque: flash curto na entrada, depois assenta
        const lt = t - tempos[i];
        const forca = ehDestaque && p > 0 ? brilho * (0.75 + 0.5 * Math.exp(-Math.max(0, lt - dur * 0.3) * 2.2)) * Math.min(1, p * 2) : 0;
        const mascarar = modo === "mascara" && p < 1;
        return (
          <span key={i}>
            <span
              style={{
                display: "inline-block",
                overflow: mascarar ? "hidden" : "visible",
                verticalAlign: "top",
                padding: "0.06em 0.05em 0.16em",
                margin: "-0.06em -0.05em -0.16em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform,
                  opacity,
                  color: ehDestaque ? COR[tomDestaque] : (cor ?? COR[tom]),
                  textShadow: forca > 0 ? brilhoTexto(tomDestaque, forca) : undefined,
                  willChange: "transform",
                }}
              >
                {w}
              </span>
            </span>
            {i < ws.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* <Titulo>                                                            */
/* ------------------------------------------------------------------ */

/** Tamanhos do palco (tokens.css): display 96, título 76, h3 44; gigante 140; kpi 168. */
const TAMANHO_TITULO = { display: 96, titulo: 76, h3: 44, gigante: 140, kpi: 168 } as const;

export interface TituloProps extends Omit<PalavraProps, "as"> {
  /** "display" (96), "titulo" (76), "h3" (44), "gigante" (140), "kpi" (168) ou px. */
  tamanho?: keyof typeof TAMANHO_TITULO | number;
  alinhar?: "esquerda" | "centro" | "direita";
  /** Largura máxima em px (quebra equilibrada). */
  largura?: number;
  as?: ElementType;
}

/**
 * Título-conclusão em Bricolage Grotesque 800 (tracking −0,035em), entrada por máscara.
 * ```tsx
 * <Titulo texto="O dinheiro não chega na hora" em={tE} destaque="na hora" tamanho="display" />
 * ```
 */
export function Titulo({ tamanho = "display", alinhar = "esquerda", largura, style, as = "h2", ...resto }: TituloProps) {
  const px = typeof tamanho === "number" ? tamanho : TAMANHO_TITULO[tamanho];
  return (
    <Palavra
      as={as}
      {...resto}
      style={{
        margin: 0,
        fontFamily: "var(--fonte-titulo)",
        fontWeight: 800,
        fontSize: px,
        lineHeight: 1.02,
        letterSpacing: "-0.035em",
        textAlign: alinhar === "centro" ? "center" : alinhar === "direita" ? "right" : "left",
        textWrap: "balance",
        maxWidth: largura,
        ...style,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* <Rotulo>                                                            */
/* ------------------------------------------------------------------ */

export interface RotuloProps {
  /** Texto da tela (≤ 8 palavras), ex.: o campo `tela` da frase. */
  texto: string;
  /** Instante de entrada (absoluto). */
  em: number;
  saida?: number;
  /** Cor do traço e do destaque (padrão verde). */
  tom?: Tom;
  /** Palavra(s) a destacar na cor do tom. */
  destaque?: string | string[];
  /** Traço "vupt" antes do texto (padrão true). */
  traco?: boolean;
  /** "texto" (Manrope 600, 32 px) ou "eyebrow" (caixa-alta espaçada, 22 px). */
  variante?: "texto" | "eyebrow";
  /** Tamanho em px (padrão 32 no texto, 22 no eyebrow). */
  tamanho?: number;
  className?: string;
  style?: CSSProperties;
}

/** Rótulo curto com o traço "vupt" da marca. */
export function Rotulo({ texto, em, saida, tom = "verde", destaque, traco = true, variante = "texto", tamanho, className, style }: RotuloProps) {
  const { t } = useFilme();
  conferirLimite(texto, "Rotulo");
  const eyebrow = variante === "eyebrow";
  const px = tamanho ?? (eyebrow ? 22 : 32);
  const pTraco = ease.saida(prog(t, em, em + 0.45));
  const qSaida = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.35)) : 0;
  return (
    <div
      className={`flex items-center ${className ?? ""}`}
      style={{
        gap: "0.55em",
        fontFamily: "var(--fonte-texto)",
        fontWeight: eyebrow ? 700 : 600,
        fontSize: px,
        lineHeight: 1.2,
        letterSpacing: eyebrow ? "0.14em" : "-0.005em",
        textTransform: eyebrow ? "uppercase" : undefined,
        opacity: 1 - qSaida,
        ...style,
      }}
    >
      {traco ? (
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            flex: "none",
            width: eyebrow ? "1.6em" : "1.1em",
            height: eyebrow ? "0.32em" : "0.24em",
            background: COR[tom],
            borderRadius: 2,
            transform: `translate3d(${((1 - pTraco) * -0.6).toFixed(3)}em, 0, 0) skewX(-24deg) scaleX(${pTraco.toFixed(4)})`,
            transformOrigin: "left center",
            boxShadow: `0 0 18px ${rgba(tom === "texto" ? "texto" : tom, 0.35 * pTraco)}`,
          }}
        />
      ) : null}
      <Palavra texto={texto} em={em + (traco ? 0.12 : 0)} passo={0.06} modo="subir" dur={0.5} destaque={destaque ?? false} tomDestaque={tom} cor={eyebrow ? "var(--cor-texto-2)" : "var(--cor-texto)"} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* <Numero>                                                            */
/* ------------------------------------------------------------------ */

/** Formatos prontos (src/lib/formato.ts) ou função própria. */
export type FormatoNumero = "int" | "brl" | "brl0" | "pct" | "pct0" | "pct2" | "mi" | ((v: number) => string);

const FORMATOS: Record<Exclude<FormatoNumero, (v: number) => string>, (v: number) => string> = {
  int: formatInt,
  brl: (v) => formatBRL(v, 2),
  brl0: (v) => formatBRL(v, 0),
  pct: (v) => formatPct(v, 1),
  pct0: (v) => formatPct(v, 0),
  pct2: (v) => formatPct(v, 2),
  mi: formatMi,
};

/** Resolve o formatador de um `FormatoNumero`. */
export const formatador = (f: FormatoNumero): ((v: number) => string) => (typeof f === "function" ? f : FORMATOS[f]);

/** Separa moeda, miolo numérico e unidade para dar escala menor às unidades. */
function partes(s: string): { pre: string; miolo: string; suf: string } {
  const m = s.match(/^(≈\s?)?((?:R\$|US\$)\s?)?(.*?)(\s?(?:mi|mil|bi|%|x))?$/);
  if (!m) return { pre: "", miolo: s, suf: "" };
  return { pre: `${m[1] ?? ""}${m[2] ?? ""}`, miolo: m[3] ?? "", suf: m[4] ?? "" };
}

export interface NumeroProps {
  /** Valor final (importe de src/data/vapti.ts; nunca digite número em cena). */
  valor: number;
  /** Instante em que o número é DITO: a contagem para exatamente aqui. */
  tParada: number;
  /** Duração da contagem antes de `tParada` (padrão 1,2 s). */
  dur?: number;
  /** Valor inicial da contagem (padrão 0). */
  de?: number;
  /** Formato (padrão "int") — usa src/lib/formato.ts — ou função própria. */
  formato?: FormatoNumero;
  /** Texto final exato (ex.: `num.rotulo`), mostrado a partir de `tParada`. */
  final?: string;
  /** Curva da contagem (padrão outCubic: desacelera até parar). */
  curva?: Easing;
  /** Tamanho em px (padrão 168, o KPI-herói). */
  tamanho?: number;
  tom?: Tom;
  alinhar?: "esquerda" | "centro" | "direita";
  /** Escala de "R$", "mi", "mil", "%" em relação ao número (padrão 0,5; 1 = igual). */
  escalaUnidade?: number;
  /** Pulso de "trava" quando para (padrão true). */
  pulso?: boolean;
  /** Brilho base 0..1 (padrão 0,5 no verde, 0 nos outros). */
  brilho?: number;
  /** Traço que se desenha embaixo quando o número para (padrão false). */
  sublinhar?: boolean;
  /** Entrada (opcional): o número aparece em `em` (fade + subida curta). */
  em?: number;
  saida?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Contador em JetBrains Mono que PARA exatamente em `tParada` e fica lá.
 * Segure-o na tela por ≥ 1,5 s depois de `tParada` (responsabilidade da cena).
 * ```tsx
 * const { tE } = useEnfase("F008");
 * <Numero valor={projeto.autonomosBrasil.valor} tParada={tE + 0.9} formato="int" />
 * ```
 */
export function Numero({
  valor,
  tParada,
  dur = 1.2,
  de = 0,
  formato = "int",
  final,
  curva = ease.outCubic,
  tamanho = 168,
  tom = "verde",
  alinhar = "esquerda",
  escalaUnidade = 0.5,
  pulso = true,
  brilho,
  sublinhar = false,
  em,
  saida,
  className,
  style,
}: NumeroProps) {
  const { t } = useFilme();
  const fmt = formatador(formato);
  const textoFinal = final ?? fmt(valor);
  const parou = t >= tParada;
  const p = curva(prog(t, tParada - dur, tParada));
  const atual = parou ? textoFinal : fmt(de + (valor - de) * p);
  const s = t - tParada;
  const pop = pulso && parou ? 0.045 * Math.exp(-s * 7) * Math.min(1, s * 40) : 0;
  const brilhoBase = brilho ?? (tom === "verde" ? 0.5 : 0);
  const forca = brilhoBase + (parou ? 0.55 * Math.exp(-s * 3) : 0);
  const entrada = em !== undefined ? prog(t, em, em + 0.4) : 1;
  const qSaida = saida !== undefined ? ease.inOutSine(prog(t, saida, saida + 0.35)) : 0;
  const render = (txt: string) => {
    const { pre, miolo, suf } = partes(txt);
    const unidade: CSSProperties = { fontSize: `${escalaUnidade}em`, fontWeight: 600, letterSpacing: "-0.02em" };
    return (
      <>
        {pre ? <span style={{ ...unidade, marginRight: "0.18em" }}>{pre.trim()}</span> : null}
        <span>{miolo}</span>
        {suf ? <span style={{ ...unidade, fontSize: `${suf.trim() === "%" ? Math.min(1, escalaUnidade + 0.15) : escalaUnidade}em`, marginLeft: suf.startsWith(" ") ? "0.16em" : "0.02em" }}>{suf.trim()}</span> : null}
      </>
    );
  };
  const justificar = alinhar === "centro" ? "center" : alinhar === "direita" ? "end" : "start";
  const pSub = sublinhar ? ease.saida(prog(t, tParada, tParada + 0.5)) : 0;
  return (
    <div
      className={className}
      data-num
      style={{
        position: "relative",
        display: "inline-grid",
        justifyItems: justificar,
        fontFamily: "var(--fonte-mono)",
        fontWeight: 700,
        fontSize: tamanho,
        lineHeight: 0.92,
        letterSpacing: "-0.045em",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        color: COR[tom],
        opacity: ease.outCubic(entrada) * (1 - qSaida),
        transform: `translate3d(0, ${((1 - ease.saida(entrada)) * 0.12).toFixed(3)}em, 0) scale(${(1 + pop).toFixed(4)})`,
        transformOrigin: alinhar === "centro" ? "50% 60%" : alinhar === "direita" ? "100% 60%" : "0% 60%",
        textShadow: forca > 0.01 ? brilhoTexto(tom, forca) : undefined,
        ...style,
      }}
    >
      {/* brilho amplo atrás do número (textura, barato) */}
      {forca > 0.01 ? (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-18%",
            right: "-18%",
            top: "-45%",
            bottom: "-45%",
            backgroundImage: `url(${texturaRadial(tom)})`,
            backgroundSize: "100% 100%",
            opacity: Math.min(1, 0.16 * forca),
            pointerEvents: "none",
          }}
        />
      ) : null}
      {/* O texto final, invisível, reserva a largura e evita "pulos" durante a contagem */}
      <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>
        {render(textoFinal)}
      </span>
      <span style={{ gridArea: "1 / 1" }}>{render(atual)}</span>
      {sublinhar ? (
        <span
          aria-hidden="true"
          style={{
            gridArea: "2 / 1",
            justifySelf: "stretch",
            height: "0.045em",
            minHeight: 3,
            marginTop: "0.12em",
            background: COR[tom],
            borderRadius: 2,
            transform: `scaleX(${pSub.toFixed(4)})`,
            transformOrigin: "left center",
          }}
        />
      ) : null}
    </div>
  );
}

/** Texto miúdo de apoio (fonte, nota) — 22 px, o mínimo do palco. */
export function Nota({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <p className={className} style={{ margin: 0, fontFamily: "var(--fonte-texto)", fontSize: 22, fontWeight: 500, color: "var(--cor-texto-3)", lineHeight: 1.35, ...style }}>
      {children}
    </p>
  );
}
