/**
 * V10 — Escada de níveis interativa (fora do celular), para o slide de gamificação.
 * Cada degrau: taxa semanal + efetiva ao mês + juros de R$ 400. Clique (ou setas)
 * destaca um degrau e mostra como chega, quando o limite volta e a reserva no Ouro.
 * Abaixo, a barra de exemplo "faltam 2 ciclos para Prata".
 */
import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Footprints, Medal, RefreshCw, Umbrella } from "lucide-react";
import { Icone } from "../base";
import { prototipo } from "../../content/ui";
import { niveis, type Nivel } from "../../data/vapti";
import { semAnimacao } from "../../lib/modo";
import { EASE } from "./pecas";

const es = prototipo.escada;
const f = prototipo.ficticio;
const nOuro = niveis[niveis.length - 1];
const ATUAL: Nivel["id"] = "bronze";
/** Espaço inseparável dentro de valores ("R$ 400" não quebra). */
const nb = (t: string) => t.replace(/R\$ /g, "R$\u00a0");
const voltaConformePaga = (n: Nivel) => n.limiteVolta !== niveis[0].limiteVolta;

export function EscadaNiveis({ compacto = false }: { compacto?: boolean } = {}) {
  const [estatico] = useState(semAnimacao);
  const [sel, setSel] = useState<number>(niveis.findIndex((n) => n.id === ATUAL));
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const lista = useRef<(HTMLButtonElement | null)[]>([]);
  const t = (d = 0.3, atraso = 0) => (estatico ? { duration: 0 } : { duration: d, ease: EASE, delay: atraso });

  const aoTeclar = (ev: KeyboardEvent, refs: (HTMLButtonElement | null)[]) => {
    const mapa: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    let novo: number | null = null;
    if (ev.key in mapa) novo = Math.min(niveis.length - 1, Math.max(0, sel + mapa[ev.key]));
    if (ev.key === "Home") novo = 0;
    if (ev.key === "End") novo = niveis.length - 1;
    if (novo === null) return;
    ev.preventDefault();
    ev.stopPropagation();
    setSel(novo);
    refs[novo]?.focus();
  };

  const n = niveis[sel];
  const alturaDegrau = (i: number) => (compacto ? 52 + i * 40 : 60 + i * 46);

  return (
    <div className="@container w-full font-texto text-texto" data-escada-niveis>
      <p className="sr-only-vapti">{es.instrucao}</p>

      {/* ---------- Degraus (largura ≥ 560 px) ---------- */}
      <div className="hidden gap-[var(--esp-6)] @min-[560px]:grid @min-[860px]:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
        <div
          role="group"
          aria-label={es.rotulo}
          className="grid grid-cols-4 items-end gap-[clamp(6px,1cqi,16px)]"
          onKeyDown={(ev) => aoTeclar(ev, botoes.current)}
        >
          {niveis.map((nv, i) => {
            const ativo = i === sel;
            const aqui = nv.id === ATUAL;
            return (
              <button
                key={nv.id}
                ref={(el) => {
                  botoes.current[i] = el;
                }}
                type="button"
                aria-pressed={ativo}
                tabIndex={ativo ? 0 : -1}
                onClick={() => setSel(i)}
                className="group flex min-w-0 flex-col items-stretch text-left"
              >
                <span className="mb-[0.5em] block px-[0.15em]">
                  <span className="flex items-center gap-[0.4em]">
                    <span className={`font-titulo text-corpo-g font-extrabold tracking-[-0.03em] ${ativo ? "text-verde" : "text-texto"}`}>{nv.nome}</span>
                  </span>
                  <span
                    className={`block font-mono font-bold leading-[1] tracking-[-0.05em] ${ativo ? "text-texto" : "text-texto-2"}`}
                    style={{ fontSize: compacto ? "clamp(28px, 4.2cqi, 56px)" : "clamp(30px, 5cqi, 68px)" }}
                  >
                    {nv.taxaSemanal.rotulo}
                  </span>
                  <span className="mt-[0.15em] block text-apoio text-texto-3">{es.porSemana}</span>
                  <span className="mt-[0.35em] block font-mono text-corpo font-bold tracking-[-0.03em] text-texto">
                    {nv.efetivaMes.rotulo} <span className="font-texto text-apoio font-medium text-texto-3">{es.aoMes}</span>
                  </span>
                  <span className="block text-apoio text-texto-2">
                    <span className="whitespace-nowrap font-mono font-bold text-texto">{nb(nv.jurosExemplo.rotulo)}</span> {nb(es.jurosEm)}
                  </span>
                </span>
                <motion.span
                  layout={false}
                  className={`relative flex flex-col justify-end overflow-hidden rounded-t-[14px] border border-b-0 px-[0.6em] pb-[0.55em] transition-colors duration-200 ${
                    ativo ? "border-verde-borda bg-verde-suave" : "border-borda bg-superficie group-hover:bg-superficie-2"
                  }`}
                  initial={estatico ? false : { height: 0 }}
                  animate={{ height: alturaDegrau(i) }}
                  transition={t(0.5, 0.08 * i)}
                >
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[4px] ${ativo ? "bg-verde" : "bg-borda-forte"}`} />
                  {aqui ? (
                    <span className="absolute right-[0.5em] top-[0.6em] inline-flex items-center gap-[0.3em] rounded-full bg-verde px-[0.5em] py-[0.1em] font-mono text-[max(14px,0.6em)] font-bold uppercase tracking-[0.06em] text-[var(--cor-sobre-verde)]">
                      <Icone icone={Medal} tamanho="1em" />
                      <span className="sr-only-vapti">{es.voceEsta}</span>
                    </span>
                  ) : null}
                  <span className="flex items-center gap-[0.35em] text-apoio font-semibold leading-tight text-texto-2">
                    {voltaConformePaga(nv) ? <Icone icone={RefreshCw} tamanho="0.9em" className="flex-none text-verde" /> : null}
                    {nv.extra ? <Icone icone={Umbrella} tamanho="0.9em" className="flex-none text-verde" /> : null}
                    <span>{es.requisito(nv.ciclos)}</span>
                  </span>
                </motion.span>
              </button>
            );
          })}
        </div>

        {/* Detalhe do degrau selecionado */}
        <div className="relative min-h-[11em] rounded-3 border border-borda bg-superficie p-[1.1em] @min-[860px]:self-end" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={n.id} initial={estatico ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={t(0.22)}>
              <Detalhe nv={n} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ---------- Lista (largura < 560 px) ---------- */}
      <ol role="group" aria-label={es.rotulo} className="flex flex-col gap-[8px] @min-[560px]:hidden" onKeyDown={(ev) => aoTeclar(ev, lista.current)}>
        {niveis.map((nv, i) => {
          const ativo = i === sel;
          return (
            <li key={nv.id}>
              <button
                ref={(el) => {
                  lista.current[i] = el;
                }}
                type="button"
                aria-pressed={ativo}
                aria-expanded={ativo}
                tabIndex={ativo ? 0 : -1}
                onClick={() => setSel(i)}
                className={`w-full rounded-2 border p-[0.8em] text-left transition-colors duration-200 ${
                  ativo ? "border-verde-borda bg-verde-suave" : "border-borda bg-superficie"
                }`}
              >
                <span className="flex items-baseline justify-between gap-[0.6em]">
                  <span className={`font-titulo text-corpo-g font-extrabold ${ativo ? "text-verde" : "text-texto"}`}>{nv.nome}</span>
                  <span className="font-mono text-corpo-g font-bold tracking-[-0.04em]">
                    {nv.taxaSemanal.rotulo} <span className="font-texto text-apoio font-medium text-texto-3">{es.porSemana}</span>
                  </span>
                </span>
                <span className="mt-[0.2em] block text-apoio text-texto-2">
                  <span className="font-mono font-bold text-texto">{nv.efetivaMes.rotulo}</span> {es.aoMes} ·{" "}
                  <span className="font-mono font-bold text-texto">{nb(nv.jurosExemplo.rotulo)}</span> {nb(es.jurosEm)}
                </span>
                {ativo ? (
                  <span className="mt-[0.6em] block border-t border-borda pt-[0.6em]">
                    <Detalhe nv={nv} curto />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      {/* ---------- Barra de progresso de exemplo ---------- */}
      <Progresso estatico={estatico} compacto={compacto} />
    </div>
  );
}

function Detalhe({ nv, curto = false }: { nv: Nivel; curto?: boolean }) {
  const conforme = voltaConformePaga(nv);
  return (
    <div className="flex flex-col gap-[0.55em]">
      {!curto ? (
        <>
          <p className="flex flex-wrap items-center gap-[0.5em]">
            <span className="font-titulo text-h3 font-extrabold tracking-[-0.03em] text-texto">{nv.nome}</span>
            {nv.id === ATUAL ? (
              <span className="rounded-full border border-verde-borda bg-verde-suave px-[0.6em] py-[0.1em] text-apoio font-semibold text-verde">{es.voceEsta}</span>
            ) : null}
          </p>
          <p className="text-apoio text-texto-2">
            <span className="font-mono font-bold text-texto">{nv.taxaSemanal.rotulo}</span> {es.porSemana} ={" "}
            <span className="font-mono font-bold text-texto">{nv.efetivaMes.rotulo}</span> {es.aoMes} ={" "}
            <span className="font-mono font-bold text-texto">{nb(nv.jurosExemplo.rotulo)}</span> {nb(es.jurosEm)}
          </p>
        </>
      ) : null}
      <dl className="flex flex-col gap-[0.45em] text-apoio">
        <div className="flex flex-wrap gap-x-[0.6em]">
          <dt className="flex flex-none items-center gap-[0.4em] text-texto-3">
            <Icone icone={Footprints} tamanho="0.95em" />
            {es.comoChega}:
          </dt>
          <dd className="font-semibold text-texto">{nv.comoChega}</dd>
        </div>
        <div className="flex flex-wrap gap-x-[0.6em]">
          <dt className="flex flex-none items-center gap-[0.4em] text-texto-3">
            <Icone icone={RefreshCw} tamanho="0.95em" />
            {es.limiteVolta}:
          </dt>
          <dd className={`font-semibold ${conforme ? "text-verde" : "text-texto"}`}>{nv.limiteVolta.toLowerCase()}</dd>
        </div>
        {nv.extra ? (
          <div className="flex items-start gap-[0.6em] rounded-2 border border-verde-borda bg-verde-suave px-[0.6em] py-[0.35em]">
            <dt className="flex flex-none items-center pt-[0.2em] text-verde">
              <Icone icone={Umbrella} tamanho="0.95em" />
              <span className="sr-only-vapti">{es.reserva}</span>
            </dt>
            <dd className="font-semibold text-verde">{nv.extra}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function Progresso({ estatico, compacto }: { estatico: boolean; compacto: boolean }) {
  const total = nOuro.ciclos;
  const marcos = niveis.filter((nv) => nv.ciclos > 0);
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref} className={`rounded-3 border border-borda bg-superficie px-[1.1em] pb-[0.9em] pt-[0.8em] ${compacto ? "mt-[var(--esp-5)]" : "mt-[var(--esp-6)]"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-[1em] gap-y-[0.2em]">
        <p className="text-apoio text-texto-2">{es.exemplo}</p>
        <p className="font-titulo text-corpo-g font-extrabold tracking-[-0.02em] text-verde">{es.faltam}</p>
      </div>
      <div className="mt-[0.5em] flex gap-[4px]" role="img" aria-label={`${es.exemplo}. ${es.faltam}.`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="relative h-[14px] flex-1 overflow-hidden rounded-[4px] bg-superficie-3">
            <motion.span
              className="absolute inset-0 origin-left bg-verde"
              initial={estatico ? false : { scaleX: 0 }}
              animate={{ scaleX: (estatico || visivel) && i < f.ciclosQuitados ? 1 : 0 }}
              transition={estatico ? { duration: 0 } : { duration: 0.35, ease: EASE, delay: 0.2 + i * 0.08 }}
            />
          </span>
        ))}
      </div>
      <div className="relative mt-[0.35em] h-[1.4em] text-apoio" aria-hidden="true">
        <span className="absolute left-0 font-mono text-texto-3 @max-[560px]:hidden">0</span>
        {marcos.map((m) => (
          <span
            key={m.id}
            className={`absolute -translate-x-full whitespace-nowrap font-semibold ${m.id === ATUAL ? "text-verde" : "text-texto-2"}`}
            style={{ left: `${(m.ciclos / total) * 100}%` }}
          >
            {m.nome} <span className="font-mono text-texto-3">{m.ciclos}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
