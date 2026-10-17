/**
 * Peças compartilhadas pelas telas do protótipo (coordenadas de uma tela de 390×844).
 * Nada aqui coleta dado: campos são exibição somente leitura, com dados fictícios.
 */
import { createContext, useContext, useEffect, useRef, type ReactNode, type Ref } from "react";
import type { LucideIcon } from "lucide-react";
import { BatteryFull, ChevronLeft, Lock, SignalHigh, Wifi } from "lucide-react";
import { Icone } from "../base";
import { prototipo } from "../../content/ui";

/* ------------------------------------------------------------------ */
/* Contexto: animação ligada/desligada e foco ao trocar de tela        */
/* ------------------------------------------------------------------ */

export interface ContextoCelular {
  /** true = sem animação (impressão ou prefers-reduced-motion). */
  estatico: boolean;
  /** Quando true, o próximo título de tela recebe o foco (navegação por teclado). */
  focoPendente: { current: boolean };
}

export const CelularCtx = createContext<ContextoCelular>({ estatico: true, focoPendente: { current: false } });
export const useCelular = () => useContext(CelularCtx);

/** Transição padrão das peças internas (200–400 ms, saída suave). */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const trans = (estatico: boolean, duracao = 0.3, atraso = 0) =>
  estatico ? { duration: 0 } : { duration: duracao, ease: EASE, delay: atraso };

/* ------------------------------------------------------------------ */
/* Moldura interna da tela                                             */
/* ------------------------------------------------------------------ */

/** Barra de status genérica (hora fictícia). Decorativa. */
export function BarraStatus() {
  return (
    <div aria-hidden="true" className="flex h-[54px] flex-none items-center justify-between px-[32px] pt-[6px] text-texto">
      <span className="w-[64px] font-mono text-[15px] font-bold tracking-[-0.02em]">{prototipo.ficticio.hora}</span>
      <span className="flex w-[64px] items-center justify-end gap-[5px]">
        <Icone icone={SignalHigh} tamanho={16} />
        <Icone icone={Wifi} tamanho={16} />
        <Icone icone={BatteryFull} tamanho={20} />
      </span>
    </div>
  );
}

export interface TelaProps {
  /** Conteúdo do topo, abaixo da barra de status. */
  topo?: ReactNode;
  /** Classe do fundo do topo (inclui a barra de status). */
  fundoTopo?: string;
  /** Rodapé fixo (botões). */
  rodape?: ReactNode;
  children: ReactNode;
  /** Classe extra da área rolável. */
  className?: string;
  rolagemRef?: Ref<HTMLDivElement>;
}

/** Estrutura de uma tela: topo fixo, corpo rolável, rodapé fixo. */
export function Tela({ topo, fundoTopo = "bg-tinta", rodape, children, className, rolagemRef }: TelaProps) {
  return (
    <div className="flex h-full flex-col bg-tinta">
      <div className={`relative z-10 flex-none ${fundoTopo}`}>
        <BarraStatus />
        {topo}
      </div>
      <div ref={rolagemRef} className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${className ?? ""}`}>
        {children}
      </div>
      {rodape ? <div className="flex-none border-t border-borda bg-tinta px-[20px] pb-[30px] pt-[14px]">{rodape}</div> : null}
    </div>
  );
}

/** Topo de app: botão voltar opcional, título central e conteúdo à direita. */
export function TopoApp({
  titulo,
  aoVoltar,
  rotuloVoltar,
  direita,
}: {
  titulo: ReactNode;
  aoVoltar?: () => void;
  rotuloVoltar?: string;
  direita?: ReactNode;
}) {
  return (
    <div className="grid h-[52px] grid-cols-[64px_1fr_64px] items-center px-[12px]">
      <div>
        {aoVoltar ? (
          <button
            type="button"
            onClick={aoVoltar}
            aria-label={rotuloVoltar}
            className="grid size-[40px] place-items-center rounded-full text-texto hover:bg-superficie-2"
          >
            <Icone icone={ChevronLeft} tamanho={24} />
          </button>
        ) : null}
      </div>
      <div className="flex justify-center">{titulo}</div>
      <div className="flex justify-end">{direita}</div>
    </div>
  );
}

/** Título de tela: recebe o foco quando a troca veio do teclado. */
export function TituloTela({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { focoPendente } = useCelular();
  useEffect(() => {
    if (focoPendente.current && ref.current) {
      focoPendente.current = false;
      ref.current.focus({ preventScroll: true });
    }
  }, [focoPendente]);
  return (
    <h3
      ref={ref}
      tabIndex={-1}
      className={`font-titulo text-[28px] font-extrabold leading-[1.05] tracking-[-0.03em] text-texto outline-offset-[6px] ${className ?? ""}`}
    >
      {children}
    </h3>
  );
}

/** Rótulo pequeno em mono, caixa alta. */
export function Rotulo({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-texto-3 ${className ?? ""}`}>{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Botões                                                              */
/* ------------------------------------------------------------------ */

type BotaoProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icone?: LucideIcon;
  className?: string;
};

export function BotaoPrimario({ children, onClick, disabled, icone, className }: BotaoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[56px] w-full items-center justify-center gap-[10px] rounded-[16px] bg-verde px-[18px] font-texto text-[17px] font-bold text-[var(--cor-sobre-verde)] transition-[opacity,transform] duration-200 enabled:hover:brightness-105 enabled:active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-35 ${className ?? ""}`}
    >
      <span>{children}</span>
      {icone ? <Icone icone={icone} tamanho={20} /> : null}
    </button>
  );
}

export function BotaoSecundario({ children, onClick, disabled, icone, className }: BotaoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[50px] w-full items-center justify-center gap-[10px] rounded-[16px] border border-borda-forte px-[18px] font-texto text-[16px] font-semibold text-texto transition-colors duration-200 hover:bg-superficie-2 disabled:opacity-40 ${className ?? ""}`}
    >
      {icone ? <Icone icone={icone} tamanho={19} /> : null}
      <span>{children}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Exibição de dados (somente leitura)                                 */
/* ------------------------------------------------------------------ */

/** Campo pré-preenchido, somente leitura. Não é <input>: nada é digitado. */
export function CampoLeitura({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-[12px] rounded-[14px] border border-borda bg-superficie px-[16px] py-[12px]">
      <div className="min-w-0">
        <dt className="font-mono text-[12px] uppercase tracking-[0.12em] text-texto-3">{rotulo}</dt>
        <dd className="mt-[3px] truncate font-texto text-[18px] font-semibold text-texto">{valor}</dd>
      </div>
      <Icone icone={Lock} tamanho={18} className="flex-none text-texto-3" />
    </div>
  );
}

/** Linha rótulo × valor (use dentro de <dl>). */
export function Linha({
  rotulo,
  valor,
  forte,
  tom,
}: {
  rotulo: ReactNode;
  valor: ReactNode;
  forte?: boolean;
  tom?: "verde";
}) {
  return (
    <div className="flex items-baseline justify-between gap-[14px] border-b border-borda py-[11px] last:border-b-0">
      <dt className={`font-texto text-[15px] ${forte ? "font-semibold text-texto" : "text-texto-2"}`}>{rotulo}</dt>
      <dd
        className={`text-right font-mono tracking-[-0.02em] ${forte ? "text-[19px] font-bold" : "text-[16px] font-bold"} ${
          tom === "verde" ? "text-verde" : "text-texto"
        }`}
      >
        {valor}
      </dd>
    </div>
  );
}

/** Cartão básico da tela. */
export function Cartao({ children, className, destaque }: { children: ReactNode; className?: string; destaque?: boolean }) {
  return (
    <div
      className={`rounded-[20px] border p-[16px] ${destaque ? "border-verde-borda bg-verde-suave" : "border-borda bg-superficie"} ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}

/** Pílula curta (nível, status). */
export function Pilula({ children, tom = "neutro", icone }: { children: ReactNode; tom?: "neutro" | "verde" | "coral" | "azul"; icone?: LucideIcon }) {
  const cls = {
    neutro: "border-borda-forte bg-superficie-2 text-texto-2",
    verde: "border-verde-borda bg-verde-suave text-verde",
    coral: "border-coral-borda bg-coral-suave text-coral",
    azul: "border-azul-borda bg-azul-suave text-azul",
  }[tom];
  return (
    <span className={`inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border px-[10px] py-[4px] font-texto text-[13px] font-semibold ${cls}`}>
      {icone ? <Icone icone={icone} tamanho={14} /> : null}
      {children}
    </span>
  );
}

/** Marca de pendência discreta: "[A CONFIRMAR]" em mono, tracejado. */
export function Pendente({ texto }: { texto: string }) {
  const marca = "[A CONFIRMAR]";
  const i = texto.indexOf(marca);
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <span className="whitespace-nowrap rounded-[4px] border border-dashed border-borda-forte px-[5px] py-[1px] font-mono text-[0.82em] tracking-[0.04em] text-texto-3">
        {marca}
      </span>
      {texto.slice(i + marca.length)}
    </>
  );
}
