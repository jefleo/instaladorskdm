/**
 * Peças comuns dos gráficos: medida do contêiner (SVG 1:1 em px, fonte lida dos tokens),
 * entrada animada (desligada em semAnimacao), figura com selo/legenda e tabela acessível.
 */
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useInView } from "motion/react";
import { EqualApproximately } from "lucide-react";
import { secoes } from "../../content/secoes";
import type { VisualId } from "../../content/tipos";
import { modos, viz } from "../../content/ui";
import { semAnimacao } from "../../lib/modo";
import { Icone, Selo, type TipoSelo } from "../base";

export interface VizProps {
  /** Versão reduzida (resumo A4, colunas estreitas). */
  compacto?: boolean;
  /** Mostra a legenda/fonte de secoes.ts embaixo. Padrão true. */
  legenda?: boolean;
  className?: string;
}

export interface Tipografia {
  apoio: number;
  corpo: number;
  corpoG: number;
  subtitulo: number;
  h3: number;
  kpiP: number;
}

/** Escala do palco (tokens.css :root) — só até a primeira medida. */
const TIPO_PALCO: Tipografia = { apoio: 22, corpo: 26, corpoG: 32, subtitulo: 36, h3: 44, kpiP: 72 };

function lerTipografia(el: Element): Tipografia {
  const cs = getComputedStyle(el);
  const v = (nome: string, padrao: number) => {
    const n = parseFloat(cs.getPropertyValue(nome));
    return Number.isFinite(n) && n > 0 ? n : padrao;
  };
  return {
    apoio: v("--fs-apoio", TIPO_PALCO.apoio),
    corpo: v("--fs-corpo", TIPO_PALCO.corpo),
    corpoG: v("--fs-corpo-g", TIPO_PALCO.corpoG),
    subtitulo: v("--fs-subtitulo", TIPO_PALCO.subtitulo),
    h3: v("--fs-h3", TIPO_PALCO.h3),
    kpiP: v("--fs-kpi-p", TIPO_PALCO.kpiP),
  };
}

const mesmaTipo = (a: Tipografia, b: Tipografia) =>
  a.apoio === b.apoio && a.corpo === b.corpo && a.corpoG === b.corpoG && a.h3 === b.h3 && a.kpiP === b.kpiP && a.subtitulo === b.subtitulo;

/**
 * Mede a largura de layout (sem o scale do palco) e lê a escala tipográfica dos tokens
 * (que muda por container query). Também informa se o gráfico já entrou na tela.
 */
export function useViz<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [medida, setMedida] = useState<{ largura: number; fs: Tipografia }>({ largura: 0, fs: TIPO_PALCO });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ler = () => {
      const largura = el.clientWidth;
      const fs = lerTipografia(el);
      setMedida((m) => (m.largura === largura && mesmaTipo(m.fs, fs) ? m : { largura, fs }));
    };
    ler();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(ler);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [estatico] = useState(semAnimacao);
  const visto = useInView(ref, { once: true, amount: 0.15 });
  return { ref, largura: medida.largura, fs: medida.fs, ativo: estatico || visto, animar: !estatico };
}

export type ModoEntrada = "x" | "x-dir" | "y" | "fade" | "subir" | "traco";

/** Estilo de entrada (200–400 ms). Sem animação: estilo vazio, valor final direto. */
export function entrada(ativo: boolean, animar: boolean, modo: ModoEntrada, atraso = 0, duracao = 400): CSSProperties {
  if (!animar) return {};
  const ease = "var(--ease-saida)";
  const t = (prop: string) => `${prop} ${duracao}ms ${ease} ${atraso}ms`;
  switch (modo) {
    case "x":
    case "x-dir":
      return {
        transformBox: "fill-box",
        transformOrigin: modo === "x" ? "left center" : "right center",
        transform: ativo ? "none" : "scaleX(0)",
        transition: t("transform"),
      };
    case "y":
      return { transformBox: "fill-box", transformOrigin: "center bottom", transform: ativo ? "none" : "scaleY(0)", transition: t("transform") };
    case "fade":
      return { opacity: ativo ? 1 : 0, transition: t("opacity") };
    case "subir":
      return {
        opacity: ativo ? 1 : 0,
        transform: ativo ? "none" : "translateY(var(--deslocamento-entrada))",
        transition: `${t("opacity")}, ${t("transform")}`,
      };
    case "traco":
      return { strokeDasharray: 1, strokeDashoffset: ativo ? 0 : 1, transition: t("stroke-dashoffset") };
  }
}

/** Legenda e texto alternativo do visual, de src/content/secoes.ts. */
export function textoVisual(id?: VisualId): { legenda?: string; alt?: string } {
  if (!id) return {};
  const s = secoes.find((x) => x.visuais.includes(id));
  return { legenda: s?.legendas[id], alt: s?.alts[id] };
}

/** Tabela escondida (só leitor de tela) atrás de cada gráfico. */
export function TabelaSr({ legenda, cabecalho, linhas }: { legenda: string; cabecalho: readonly string[]; linhas: readonly (readonly string[])[] }) {
  return (
    <div className="sr-only-vapti">
      <table>
        <caption>
          {modos.tabelaAcessivel}: {legenda}
        </caption>
        <thead>
          <tr>
            {cabecalho.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i}>
              {l.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {c}
                  </th>
                ) : (
                  <td key={j}>{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Etiqueta de estimativa (não é projeção da Vapti nem fato). */
export function EtiquetaEstimativa({ texto = viz.estimativa, className }: { texto?: string; className?: string }) {
  return (
    <span
      data-etiqueta="estimativa"
      className={`inline-flex items-center gap-[0.4em] whitespace-nowrap rounded-full border border-dashed border-borda-forte px-[0.6em] py-[0.32em] align-middle font-mono text-[max(12px,0.62em)] font-medium uppercase leading-none tracking-[0.08em] text-texto-2 ${className ?? ""}`}
    >
      <Icone icone={EqualApproximately} tamanho="1em" />
      {texto}
    </span>
  );
}

export interface FiguraProps {
  visual?: VisualId;
  titulo?: ReactNode;
  selo?: TipoSelo;
  premissas?: readonly string[];
  estimativa?: boolean;
  /** Elemento extra à direita do título (ex.: selo de norma). */
  extra?: ReactNode;
  legenda?: boolean;
  /** Legenda própria (sobrepõe a de secoes.ts). */
  textoLegenda?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Moldura padrão: título curto + selo, o gráfico, e a legenda/fonte embaixo. */
export function Figura({ visual, titulo, selo, premissas, estimativa, extra, legenda = true, textoLegenda, className, children }: FiguraProps) {
  const t = textoVisual(visual);
  const leg = textoLegenda ?? t.legenda;
  return (
    <figure className={`m-0 w-full min-w-0 font-texto text-texto ${className ?? ""}`} data-visual={visual}>
      {titulo || selo || estimativa || extra ? (
        <div className="mb-[0.7em] flex flex-wrap items-center justify-between gap-x-[1em] gap-y-[0.5em]">
          {titulo ? <p className="font-texto text-corpo font-semibold leading-tight text-texto-2">{titulo}</p> : <span />}
          <div className="flex flex-wrap items-center gap-[0.6em] text-apoio">
            {extra}
            {estimativa ? <EtiquetaEstimativa /> : null}
            {selo ? <Selo tipo={selo} premissas={premissas} tamanho="sm" /> : null}
          </div>
        </div>
      ) : null}
      {children}
      {legenda && leg ? <figcaption className="mt-[0.9em] font-texto text-apoio leading-snug text-texto-3">{leg}</figcaption> : null}
    </figure>
  );
}

/** Marcas "bonitas" de eixo entre min e max. */
export function ticks(min: number, max: number, alvo = 5): number[] {
  const span = max - min || Math.abs(max) || 1;
  const bruto = span / alvo;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const norm = bruto / mag;
  const passo = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const ini = Math.floor(min / passo) * passo;
  const fim = Math.ceil(max / passo) * passo;
  const out: number[] = [];
  for (let v = ini; v <= fim + passo / 2; v += passo) out.push(Math.round(v / passo) * passo);
  return out;
}

/** Barra vertical com topo arredondado (base reta). */
export function barraV(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0) return "";
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

/** Proporção 0–1 de um valor numa escala linear. */
export const escala = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
