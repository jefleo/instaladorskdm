import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChartLine, MousePointerClick, Shapes, X } from "lucide-react";
import { premissas as premissasPadrao } from "../../data/vapti";
import { isPrint } from "../../lib/modo";
import { Icone } from "./Icone";

export type TipoSelo = "projecao" | "ilustrativo" | "prototipo";

export interface SeloProps {
  tipo: TipoSelo;
  /** Premissas do popover (só "projecao"). Padrão: `premissas.lista` de src/data/vapti.ts. */
  premissas?: readonly string[];
  /** Título do popover. Padrão "Premissas". */
  tituloPremissas?: string;
  /** Texto do selo. Padrão: "Projeção", "Ilustrativo" ou "Protótipo". */
  rotulo?: string;
  /** "md" no palco (22px), "sm" em espaços apertados. */
  tamanho?: "sm" | "md";
  className?: string;
}

const ROTULO: Record<TipoSelo, string> = { projecao: "Projeção", ilustrativo: "Ilustrativo", prototipo: "Protótipo" };
const ICONE = { projecao: ChartLine, ilustrativo: Shapes, prototipo: MousePointerClick } as const;

/*
 * Três selos com linguagem visual distinta:
 *  - Projeção: pílula verde contornada, clicável (abre premissas).
 *  - Ilustrativo: contorno tracejado azul-gelo — "desenho, não dado".
 *  - Protótipo: etiqueta cinza preenchida, cantos retos — "tela de teste".
 */
const ESTILO: Record<TipoSelo, string> = {
  projecao: "rounded-full border border-verde-borda bg-verde-suave text-verde",
  ilustrativo: "rounded-full border border-dashed border-azul text-azul",
  prototipo: "rounded-[4px] bg-cinza-suave text-texto-2 border border-cinza-borda",
};

export function Selo({ tipo, premissas, tituloPremissas = "Premissas", rotulo, tamanho = "md", className }: SeloProps) {
  const texto = rotulo ?? ROTULO[tipo];
  const base = `inline-flex items-center gap-[0.45em] whitespace-nowrap font-mono font-medium uppercase leading-none ${
    tamanho === "md" ? "text-apoio px-[0.7em] py-[0.42em]" : "text-[max(13px,0.7em)] px-[0.6em] py-[0.38em]"
  } ${ESTILO[tipo]}`;
  const conteudo = (
    <>
      <Icone icone={ICONE[tipo]} tamanho="1em" />
      <span style={{ letterSpacing: "0.08em" }}>{texto}</span>
    </>
  );

  if (tipo !== "projecao" || isPrint) {
    return (
      <span className={`${base} ${className ?? ""}`} data-selo={tipo}>
        {conteudo}
      </span>
    );
  }
  return (
    <SeloProjecao base={base} className={className} lista={premissas ?? premissasPadrao.lista} titulo={tituloPremissas} rotulo={texto}>
      {conteudo}
    </SeloProjecao>
  );
}

function SeloProjecao({
  base,
  className,
  lista,
  titulo,
  rotulo,
  children,
}: {
  base: string;
  className?: string;
  lista: readonly string[];
  titulo: string;
  rotulo: string;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const raiz = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setAberto(false);
        botao.current?.focus();
      }
    };
    const aoClicar = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("keydown", aoTeclar, true);
    document.addEventListener("pointerdown", aoClicar);
    painel.current?.focus();
    return () => {
      document.removeEventListener("keydown", aoTeclar, true);
      document.removeEventListener("pointerdown", aoClicar);
    };
  }, [aberto]);

  return (
    <span ref={raiz} className={`relative inline-block ${className ?? ""}`}>
      <button
        ref={botao}
        type="button"
        data-selo="projecao"
        aria-expanded={aberto}
        aria-controls={id}
        aria-haspopup="dialog"
        title={`${rotulo}: ver ${titulo.toLowerCase()}`}
        onClick={() => setAberto((v) => !v)}
        className={`${base} cursor-pointer transition-colors duration-200 hover:bg-verde hover:text-[var(--cor-sobre-verde)] aria-expanded:bg-verde aria-expanded:text-[var(--cor-sobre-verde)]`}
      >
        {children}
        <span className="sr-only-vapti">({titulo.toLowerCase()})</span>
      </button>
      {aberto ? (
        <div
          ref={painel}
          id={id}
          role="dialog"
          aria-label={titulo}
          tabIndex={-1}
          className="entrar absolute left-0 top-[calc(100%+10px)] z-50 w-[min(680px,86vw)] rounded-3 border border-borda-forte bg-superficie-2 p-[24px] text-left normal-case shadow-3"
          style={{ animationDuration: "var(--dur-rapida)" }}
        >
          <div className="mb-[14px] flex items-center justify-between gap-4">
            <p className="flex items-center gap-[10px] font-mono text-[15px] font-medium uppercase tracking-[0.12em] text-verde">
              <span className="traco-vupt" aria-hidden="true" style={{ width: "22px", height: "5px" }} />
              {titulo}
            </p>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                botao.current?.focus();
              }}
              className="grid size-9 place-items-center rounded-full text-texto-2 hover:bg-superficie-3 hover:text-texto"
              aria-label="Fechar"
            >
              <Icone icone={X} tamanho={20} />
            </button>
          </div>
          <ul className="space-y-[10px]">
            {lista.map((item) => (
              <li key={item} className="flex gap-[12px] font-texto text-apoio leading-snug text-texto">
                <span aria-hidden="true" className="mt-[0.6em] h-[2px] w-[10px] flex-none bg-texto-3" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </span>
  );
}
