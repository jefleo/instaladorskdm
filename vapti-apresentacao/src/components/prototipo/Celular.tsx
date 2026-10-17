/**
 * V07 — Protótipo de celular clicável, com dados fictícios e selo "Protótipo".
 * Telas: conversa → contratação em 7 etapas → painel → níveis → atraso.
 * Barra de telas fora do celular (para o apresentador) e botão Reiniciar.
 * Na impressão mostra a tela inicial, estática; respeita prefers-reduced-motion.
 */
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, LayoutDashboard, ListChecks, MessageSquareText, RotateCcw, TrendingUp } from "lucide-react";
import { Icone, MolduraCelular, Selo } from "../base";
import { prototipo } from "../../content/ui";
import { isPrint, semAnimacao } from "../../lib/modo";
import { CelularCtx, trans, type ContextoCelular } from "./pecas";
import { TelaConversa } from "./TelaConversa";
import { TelaJornada } from "./TelaJornada";
import { TelaPainel } from "./TelaPainel";
import { TelaNiveis } from "./TelaNiveis";
import { TelaAtraso } from "./TelaAtraso";

export type TelaInicial = "conversa" | "jornada" | "painel" | "niveis" | "atraso";

export interface CelularProps {
  /** Tela em que o protótipo começa (e para onde "Reiniciar" volta). Padrão: conversa. */
  inicio?: TelaInicial;
  /** Escala o aparelho para caber em ~620 px de altura. */
  compacto?: boolean;
  /** Etapa inicial da contratação (0 a 6), quando inicio = "jornada". Padrão 0. */
  etapa?: number;
  className?: string;
}

/* Geometria da moldura (MolduraCelular na largura padrão de 390 px). */
const TELA_L = 390;
const TELA_A = 844;
const BORDA = 12;
const APARELHO_L = TELA_L + BORDA * 2;
const APARELHO_A = TELA_A + BORDA * 2;
const ALTURA_COMPACTO = 604; // + 14 px do selo = ~620 px no total
const TRILHO_L = 268;
const VAO = 32;

const nav = prototipo.navegacao;
const TELAS: { id: TelaInicial; icone: LucideIcon }[] = [
  { id: "conversa", icone: MessageSquareText },
  { id: "jornada", icone: ListChecks },
  { id: "painel", icone: LayoutDashboard },
  { id: "niveis", icone: TrendingUp },
  { id: "atraso", icone: CalendarClock },
];

function useLargura() {
  const ref = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setLargura(el.clientWidth);
    medir();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, largura] as const;
}

export function Celular({ inicio = "conversa", compacto = false, etapa: etapaInicial = 0, className }: CelularProps = {}) {
  const [estatico] = useState(semAnimacao);
  const [tela, setTela] = useState<TelaInicial>(inicio);
  const [etapa, setEtapa] = useState(etapaInicial);
  const [rodada, setRodada] = useState(0);
  const focoPendente = useRef(false);
  const aparelho = useRef<HTMLDivElement>(null);
  const [raiz, largura] = useLargura();

  const ctx = useMemo<ContextoCelular>(() => ({ estatico, focoPendente }), [estatico]);

  /** Troca de tela por ação dentro do app: o foco vai para o título da nova tela se veio do teclado. */
  const marcarFoco = () => {
    const ativo = document.activeElement;
    focoPendente.current = !!(ativo && aparelho.current?.contains(ativo) && ativo.matches(":focus-visible"));
  };
  const irPara = useCallback((t: TelaInicial, n = 0) => {
    marcarFoco();
    setTela(t);
    setEtapa(n);
  }, []);
  const irParaEtapa = useCallback((n: number) => {
    marcarFoco();
    setEtapa(n);
  }, []);
  const reiniciar = () => {
    setTela(inicio);
    setEtapa(etapaInicial);
    setRodada((r) => r + 1);
  };

  // Layout: trilho ao lado quando cabe; senão, acima. Escala ajustada à largura disponível.
  const mostrarTrilho = !isPrint;
  const alvo = compacto ? ALTURA_COMPACTO / APARELHO_A : 1;
  const W = largura ?? Number.POSITIVE_INFINITY;
  const lado = mostrarTrilho && W >= APARELHO_L * alvo + VAO + TRILHO_L;
  const disponivel = lado ? W - VAO - TRILHO_L : W;
  const escala = Math.max(0.35, Math.min(alvo, disponivel / APARELHO_L));

  let conteudo;
  if (tela === "conversa") conteudo = <TelaConversa aoAbrirLink={() => irPara("jornada", 0)} />;
  else if (tela === "jornada") conteudo = <TelaJornada etapa={etapa} irParaEtapa={irParaEtapa} aoConcluir={() => irPara("painel")} />;
  else if (tela === "painel") conteudo = <TelaPainel aoVerNiveis={() => irPara("niveis")} />;
  else if (tela === "niveis") conteudo = <TelaNiveis aoVoltar={() => irPara("painel")} />;
  else conteudo = <TelaAtraso aoVoltar={() => irPara("painel")} />;

  const chave = `${tela}-${rodada}`;
  const app = estatico ? (
    <div key={chave} className="h-full">
      {conteudo}
    </div>
  ) : (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={chave}
        className="h-full"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={trans(false, 0.22)}
      >
        {conteudo}
      </motion.div>
    </AnimatePresence>
  );

  const trilho = mostrarTrilho ? (
    <nav aria-label={nav.rotulo} className={lado ? "w-[268px] flex-none" : "w-full"} data-trilho-celular>
      <p
        className={`mb-[0.7em] flex items-center gap-[0.6em] font-mono text-apoio uppercase text-texto-3 ${lado ? "" : "justify-center"}`}
        style={{ letterSpacing: "0.12em" }}
      >
        <span className="traco-vupt" aria-hidden="true" style={{ width: "1em", height: "0.22em" }} />
        {nav.rotulo}
      </p>
      <ul className={lado ? "flex flex-col gap-[6px]" : "flex flex-wrap justify-center gap-[6px]"}>
        {TELAS.map((t, i) => {
          const ativa = tela === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-current={ativa ? "page" : undefined}
                onClick={() => irPara(t.id, 0)}
                className={`group relative flex items-center gap-[0.6em] rounded-[12px] border font-texto text-apoio font-semibold transition-colors duration-200 ${
                  lado ? "w-full px-[0.8em] py-[0.5em]" : "px-[0.75em] py-[0.4em]"
                } ${
                  ativa
                    ? "border-verde-borda bg-verde-suave text-texto"
                    : "border-transparent text-texto-2 hover:border-borda hover:bg-superficie hover:text-texto"
                }`}
              >
                <span className={`font-mono text-[0.8em] ${ativa ? "text-verde" : "text-texto-3"}`}>{String(i + 1).padStart(2, "0")}</span>
                <Icone icone={t.icone} tamanho="1em" className={ativa ? "text-verde" : ""} />
                <span>{nav.telas[t.id]}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className={`mt-[0.9em] flex ${lado ? "" : "justify-center"}`}>
        <button
          type="button"
          onClick={reiniciar}
          className="inline-flex items-center gap-[0.5em] rounded-full border border-borda-forte px-[0.9em] py-[0.4em] font-texto text-apoio font-semibold text-texto-2 transition-colors duration-200 hover:bg-superficie hover:text-texto"
        >
          <Icone icone={RotateCcw} tamanho="0.95em" />
          {nav.reiniciar}
        </button>
      </div>
      {lado ? <p className="mt-[1em] font-texto text-apoio leading-snug text-texto-3">{prototipo.aviso}</p> : null}
    </nav>
  ) : null;

  const telefone = (
    <div className="relative mt-[14px] flex-none" style={{ width: APARELHO_L * escala, height: APARELHO_A * escala }}>
      <div ref={aparelho} className="absolute left-0 top-0" style={{ width: APARELHO_L, transform: `scale(${escala})`, transformOrigin: "top left" }}>
        <CelularCtx.Provider value={ctx}>
          <MolduraCelular rotulo={nav.regiao}>
            <div className="h-full font-texto text-[16px] leading-[1.4] text-texto" style={{ textWrap: "pretty" } as CSSProperties}>
              {app}
            </div>
          </MolduraCelular>
        </CelularCtx.Provider>
      </div>
      {/* Selo sempre visível, preso à borda superior do aparelho, em tamanho real */}
      <span className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2 rounded-[5px] bg-tinta shadow-2">
        <Selo tipo="prototipo" rotulo={prototipo.selo} tamanho="sm" />
      </span>
    </div>
  );

  return (
    <div ref={raiz} data-celular={inicio} className={`w-full ${className ?? ""}`}>
      <div className={lado ? "flex items-center justify-center" : "flex flex-col items-center gap-[20px]"} style={lado ? { gap: VAO } : undefined}>
        {lado ? (
          <>
            {telefone}
            {trilho}
          </>
        ) : (
          <>
            {trilho}
            {telefone}
            <p className="text-center font-texto text-apoio text-texto-3">{prototipo.aviso}</p>
          </>
        )}
      </div>
    </div>
  );
}
