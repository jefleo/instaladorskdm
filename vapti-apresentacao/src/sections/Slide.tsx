import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Selo, TituloSecao } from "../components/base";
import type { Bloco as BlocoConteudo, Secao, VisualId } from "../content/tipos";
import { semAnimacao } from "../lib/modo";
import { useExibicao } from "./contexto";
import { semMarcaProjecao } from "./numero";
import { secoes } from "../content/secoes";

/** Seção pelo id ("00" a "13"). */
export function secaoPorId(id: string): Secao {
  const s = secoes.find((x) => x.id === id);
  if (!s) throw new Error(`Seção ${id} não encontrada`);
  return s;
}

export interface PropsSecao {
  parte: number;
}

/* -------------------------------------------------------------------------- */
/* Moldura de uma tela                                                         */
/* -------------------------------------------------------------------------- */

export interface SlideProps {
  secao: Secao;
  /** 0 = primeira tela da seção; 1 = "b"; 2 = "c"... */
  parte: number;
  /** "topo": título e subtítulo no alto; "linha": só número e nome (telas com visual alto); "nenhum": a seção desenha o próprio cabeçalho. */
  cabecalho?: "topo" | "linha" | "nenhum";
  /** Mostra o subtítulo (padrão: só na primeira tela). */
  subtitulo?: boolean;
  className?: string;
  corpoClassName?: string;
  estilo?: CSSProperties;
  /** Frase de destaque no lugar do subtítulo (telas de continuação). */
  destaque?: ReactNode;
  children?: ReactNode;
}

export function Slide({ secao, parte, cabecalho = "topo", subtitulo, className, corpoClassName, estilo, destaque, children }: SlideProps) {
  const exibicao = useExibicao();
  const leitura = exibicao === "leitura";
  const animar = exibicao === "palco" && !semAnimacao();
  const continua = leitura && parte > 0;
  const comSub = (subtitulo ?? parte === 0) && Boolean(secao.subtitulo);
  const lateral = comSub ? secao.subtitulo : destaque;
  return (
    <article
      className={`slide ${leitura ? "slide--leitura" : "slide--fixo"} ${continua ? "slide--continua" : ""} ${className ?? ""}`}
      data-slide={idDaParte(secao.id, parte)}
      data-exibicao={exibicao}
      style={estilo}
    >
      {cabecalho === "topo" && !continua ? (
        <div className={`slide-cab ${lateral ? "" : "slide-cab--so-titulo"} ${animar ? "entrar" : ""}`}>
          <TituloSecao numero={secao.id} nome={secao.nome} titulo={secao.titulo} como={secao.id === "00" ? "h1" : "h2"} />
          {lateral ? <div className="slide-cab__sub">{lateral}</div> : null}
        </div>
      ) : null}
      {cabecalho === "linha" && !continua ? (
        <div className={`mb-[var(--esp-6)] flex flex-wrap items-baseline gap-x-[0.9em] gap-y-[0.2em] ${animar ? "entrar" : ""}`}>
          <p className="flex items-center gap-[0.6em] font-mono text-eyebrow font-medium uppercase text-texto-2" style={{ letterSpacing: "var(--tracking-eyebrow)" }}>
            <span className="text-verde">{secao.id}</span>
            <span className="traco-vupt" aria-hidden="true" style={{ width: "1.1em", height: "0.22em" }} />
            <span>{secao.nome}</span>
          </p>
          <h2 className="font-titulo text-corpo-g font-bold text-texto-2" style={{ letterSpacing: "-0.015em" }}>
            {secao.titulo}
          </h2>
        </div>
      ) : null}
      <div className={`slide-corpo ${animar ? "entrar" : ""} ${corpoClassName ?? ""}`} style={animar ? { animationDelay: "90ms" } : undefined}>
        {children}
      </div>
    </article>
  );
}

/** Cabeçalho para layouts em que o título fica numa coluna (some nas telas de continuação da leitura). */
export function Cabecalho({ secao, parte, subtitulo, className }: { secao: Secao; parte: number; subtitulo?: boolean; className?: string }) {
  const exibicao = useExibicao();
  if (exibicao === "leitura" && parte > 0) return null;
  const comSub = (subtitulo ?? parte === 0) && Boolean(secao.subtitulo);
  return (
    <TituloSecao
      numero={secao.id}
      nome={secao.nome}
      titulo={secao.titulo}
      subtitulo={comSub ? secao.subtitulo : undefined}
      className={className}
    />
  );
}

/** "07" + 1 → "07b". */
export const idDaParte = (id: string, parte: number) => (parte === 0 ? id : `${id}${String.fromCharCode(97 + parte)}`);

/* -------------------------------------------------------------------------- */
/* Blocos de texto                                                             */
/* -------------------------------------------------------------------------- */

export interface BlocoProps {
  bloco: BlocoConteudo;
  /** Força o selo Projeção (além do marcador " · projeção" no título). */
  projecao?: boolean;
  /** Estilo: "traco" (barra lateral), "cartao" (superfície) ou "simples". */
  estilo?: "traco" | "cartao" | "simples";
  tom?: "verde" | "coral" | "azul" | "cinza" | "neutro";
  /** Texto maior (corpo-g). */
  grande?: boolean;
  className?: string;
  children?: ReactNode;
}

const BARRA = {
  verde: "var(--cor-verde)",
  coral: "var(--cor-coral)",
  azul: "var(--cor-azul)",
  cinza: "var(--cor-cinza)",
  neutro: "var(--cor-borda-forte)",
} as const;

export function Bloco({ bloco, projecao, estilo = "traco", tom = "neutro", grande, className, children }: BlocoProps) {
  const { titulo, projecao: marcado } = semMarcaProjecao(bloco.titulo ?? "");
  const comSelo = projecao || marcado;
  const caixa =
    estilo === "cartao"
      ? "rounded-3 border border-borda bg-superficie p-[0.95em_1.1em]"
      : estilo === "traco"
        ? "border-l-[3px] pl-[0.85em]"
        : "";
  return (
    <div className={`${caixa} ${className ?? ""}`} style={estilo === "traco" ? { borderColor: BARRA[tom] } : undefined}>
      {titulo ? (
        <h3 className={`flex flex-wrap items-center gap-x-[0.6em] gap-y-[0.3em] font-titulo ${grande ? "text-h3" : "text-corpo-g"} font-bold text-texto`} style={{ lineHeight: 1.15, letterSpacing: "-0.015em" }}>
          <span>{titulo}</span>
          {comSelo ? <Selo tipo="projecao" /> : null}
        </h3>
      ) : comSelo ? (
        <Selo tipo="projecao" />
      ) : null}
      <p className={`${titulo || comSelo ? "mt-[0.4em]" : ""} ${grande ? "text-corpo-g" : "text-corpo"} text-texto-2`} style={{ lineHeight: 1.42 }}>
        {bloco.texto}
      </p>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Figura com legenda (visuais dos outros agentes e os do site)                */
/* -------------------------------------------------------------------------- */

export interface FiguraProps {
  secao: Secao;
  visual: VisualId;
  /** Selo ao lado da legenda. */
  selo?: "projecao" | "ilustrativo" | "prototipo";
  /** Esconde a legenda (quando o próprio visual já mostra). */
  semLegenda?: boolean;
  /** O visual já desenha legenda, selo e texto alternativo (gráficos de src/components/viz). */
  proprio?: boolean;
  /** No palco, centraliza o visual na altura disponível quando ele cabe sem redução. */
  centro?: boolean;
  className?: string;
  estilo?: CSSProperties;
  children: ReactNode;
}

export function Figura({ secao, visual, selo, semLegenda, proprio, centro, className, estilo, children }: FiguraProps) {
  if (proprio) {
    return (
      <Encaixe className={`figura ${className ?? ""}`} estilo={estilo} visual={visual} centro={centro}>
        {children}
      </Encaixe>
    );
  }
  const legenda = secao.legendas[visual];
  const alt = secao.alts[visual];
  return (
    <figure className={`figura ${className ?? ""}`} style={estilo} data-visual={visual}>
      {children}
      {alt ? <p className="sr-only-vapti">{alt}</p> : null}
      {!semLegenda && (legenda || selo) ? (
        <figcaption className="mt-[var(--esp-4)] flex flex-wrap items-center gap-x-[0.8em] gap-y-[0.4em] text-apoio text-texto-3" style={{ lineHeight: 1.35 }}>
          {selo ? <Selo tipo={selo} /> : null}
          {legenda ? <span>{legenda}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Item de lista com marcador fino                                             */
/* -------------------------------------------------------------------------- */

export function Item({ children, tom = "neutro", className }: { children: ReactNode; tom?: keyof typeof BARRA; className?: string }) {
  return (
    <li className={`flex gap-[0.7em] ${className ?? ""}`}>
      <span aria-hidden="true" className="mt-[0.68em] h-[3px] w-[0.7em] flex-none rounded-full" style={{ background: BARRA[tom] }} />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Rótulo pequeno em mono (eyebrow de cartão). */
export function Rotulo({ children, tom = "texto-3", className }: { children: ReactNode; tom?: "texto-3" | "verde" | "coral" | "azul" | "cinza"; className?: string }) {
  const cor = { "texto-3": "text-texto-3", verde: "text-verde", coral: "text-coral", azul: "text-azul", cinza: "text-cinza" }[tom];
  return (
    <p className={`font-mono text-apoio font-medium uppercase ${cor} ${className ?? ""}`} style={{ letterSpacing: "0.1em", lineHeight: 1.2 }}>
      {children}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Encaixe: no palco, reduz o visual para caber na altura disponível           */
/* -------------------------------------------------------------------------- */

/**
 * Os gráficos definem a própria altura. No palco (1920×1080), se o gráfico for
 * mais alto que o espaço da tela, ele é reduzido por escala (centralizado), nunca cortado.
 * Na leitura, nada muda: rolagem livre.
 */
export function Encaixe({
  children,
  className,
  estilo,
  visual,
  centro,
}: {
  children: ReactNode;
  className?: string;
  estilo?: CSSProperties;
  visual?: string;
  /** Centraliza na vertical quando o conteúdo cabe sem redução (evita sobra só embaixo). */
  centro?: boolean;
}) {
  const exibicao = useExibicao();
  const fora = useRef<HTMLDivElement>(null);
  const dentro = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  const fixo = exibicao !== "leitura";

  useLayoutEffect(() => {
    if (!fixo) return;
    const f = fora.current;
    const d = dentro.current;
    if (!f || !d) return;
    const medir = () => {
      const disponivel = f.clientHeight;
      const natural = d.offsetHeight; // altura de layout: o transform não altera
      if (!disponivel || !natural) return;
      const nova = Math.min(1, Math.floor((disponivel / natural) * 1000) / 1000);
      setEscala((atual) => (Math.abs(nova - atual) > 0.004 ? nova : atual));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(f);
    ro.observe(d);
    return () => ro.disconnect();
  }, [fixo]);

  if (!fixo) {
    return (
      <div className={className} style={estilo} data-visual={visual}>
        {children}
      </div>
    );
  }
  return (
    <div
      ref={fora}
      className={`encaixe ${centro && escala >= 1 ? "encaixe--centro" : ""} ${className ?? ""}`}
      style={estilo}
      data-visual={visual}
      data-escala={escala.toFixed(3)}
    >
      <div ref={dentro} style={escala < 1 ? { transform: `scale(${escala})`, transformOrigin: "top center" } : undefined}>
        {children}
      </div>
    </div>
  );
}
