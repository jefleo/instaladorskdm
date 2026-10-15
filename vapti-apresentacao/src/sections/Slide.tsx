import type { CSSProperties, ReactNode } from "react";
import { Selo, TituloSecao } from "../components/base";
import type { Bloco as BlocoConteudo, Secao, VisualId } from "../content/tipos";
import { semAnimacao } from "../lib/modo";
import { useExibicao } from "./contexto";
import { semMarcaProjecao } from "./numero";

/* -------------------------------------------------------------------------- */
/* Moldura de uma tela                                                         */
/* -------------------------------------------------------------------------- */

export interface SlideProps {
  secao: Secao;
  /** 0 = primeira tela da seção; 1 = "b"; 2 = "c"... */
  parte: number;
  /** "topo": título e subtítulo no alto; "nenhum": a seção desenha o próprio cabeçalho. */
  cabecalho?: "topo" | "nenhum";
  /** Mostra o subtítulo (padrão: só na primeira tela). */
  subtitulo?: boolean;
  className?: string;
  corpoClassName?: string;
  estilo?: CSSProperties;
  children?: ReactNode;
}

export function Slide({ secao, parte, cabecalho = "topo", subtitulo, className, corpoClassName, estilo, children }: SlideProps) {
  const exibicao = useExibicao();
  const leitura = exibicao === "leitura";
  const animar = exibicao === "palco" && !semAnimacao();
  const continua = leitura && parte > 0;
  const comSub = (subtitulo ?? parte === 0) && Boolean(secao.subtitulo);
  return (
    <article
      className={`slide ${leitura ? "slide--leitura" : "slide--fixo"} ${continua ? "slide--continua" : ""} ${className ?? ""}`}
      data-slide={idDaParte(secao.id, parte)}
      data-exibicao={exibicao}
      style={estilo}
    >
      {cabecalho === "topo" && !continua ? (
        <div className={`slide-cab ${comSub ? "" : "slide-cab--so-titulo"} ${animar ? "entrar" : ""}`}>
          <TituloSecao numero={secao.id} nome={secao.nome} titulo={secao.titulo} como={secao.id === "00" ? "h1" : "h2"} />
          {comSub ? <p className="slide-cab__sub">{secao.subtitulo}</p> : null}
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
        <h3 className="flex flex-wrap items-center gap-x-[0.6em] gap-y-[0.3em] font-titulo text-corpo-g font-bold text-texto" style={{ lineHeight: 1.15, letterSpacing: "-0.015em" }}>
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
  className?: string;
  estilo?: CSSProperties;
  children: ReactNode;
}

export function Figura({ secao, visual, selo, semLegenda, className, estilo, children }: FiguraProps) {
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
