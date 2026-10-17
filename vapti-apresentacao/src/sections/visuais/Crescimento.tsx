import { AlertTriangle, Cog, Layers } from "lucide-react";
import { Icone } from "../../components/base";
import { captacao } from "../../data/vapti";
import { rotulos } from "../../content/ui";
import { Rotulo } from "../Slide";

/** V21 — o que se vende: a carteira (valor de face) × o motor de originação (múltiplo) e a janela de venda. */
export function OQueSeVende() {
  const r = rotulos.crescimento;
  const { janela } = captacao;
  return (
    <div className="flex flex-col gap-[var(--esp-6)]">
      <div className="grade-2" style={{ ["--vao" as string]: "var(--esp-6)" }}>
        <Bloco2 tom="azul" icone={Layers} titulo={r.carteira} texto={captacao.oQueSeVende.carteira} />
        <Bloco2 tom="verde" icone={Cog} titulo={r.motor} texto={captacao.oQueSeVende.motor} destaque />
      </div>

      <section
        aria-label={r.janela}
        className="janela rounded-3 border border-borda bg-superficie p-[1em_1.2em]"
      >
        <div>
          <Rotulo>{r.janela}</Rotulo>
          <p className="mt-[0.15em] font-mono font-bold text-texto" style={{ fontSize: "var(--fs-kpi-p)", lineHeight: 1, letterSpacing: "-0.04em" }}>
            {janela.anos}
          </p>
        </div>
        <div className="min-w-0">
          <ul className="flex flex-wrap gap-[var(--esp-3)]" aria-label={r.condicoes}>
            {janela.condicoes.map((c) => (
              <li key={c} className="rounded-full border border-verde-borda bg-verde-suave px-[0.8em] py-[0.3em] text-corpo font-semibold text-texto">
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-[0.6em] text-corpo text-texto-2" style={{ lineHeight: 1.4 }}>
            {janela.nota}
          </p>
        </div>
      </section>

      <p className="flex items-start gap-[0.6em] border-l-[3px] border-coral pl-[0.85em] text-corpo text-texto-2" style={{ lineHeight: 1.4 }}>
        <span className="mt-[0.15em] flex-none text-coral">
          <Icone icone={AlertTriangle} tamanho="1em" />
        </span>
        <span>{captacao.alertaMultiplo}</span>
      </p>
    </div>
  );
}

function Bloco2({
  tom,
  icone,
  titulo,
  texto,
  destaque,
}: {
  tom: "azul" | "verde";
  icone: typeof Cog;
  titulo: string;
  texto: string;
  destaque?: boolean;
}) {
  const cls = tom === "verde" ? "border-verde-borda bg-verde-suave" : "border-azul-borda bg-azul-suave";
  return (
    <div className={`relative overflow-hidden rounded-3 border p-[1.1em_1.2em] ${cls} ${destaque ? "shadow-2" : ""}`}>
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[4px] ${tom === "verde" ? "bg-verde" : "bg-azul"}`} />
      <p className={`flex items-center gap-[0.5em] font-titulo text-h3 font-bold ${tom === "verde" ? "text-verde" : "text-azul"}`} style={{ lineHeight: 1.1 }}>
        <Icone icone={icone} tamanho="0.9em" />
        {titulo}
      </p>
      <p className="mt-[0.5em] text-corpo-g font-medium text-texto" style={{ lineHeight: 1.32 }}>
        {texto}
      </p>
    </div>
  );
}

/** O que uma gestora de FIDC olha antes de comprar a carteira. */
export function GestoraOlha({ titulo }: { titulo: string }) {
  return (
    <section aria-label={titulo} className="relative overflow-hidden rounded-3 border border-borda bg-superficie p-[1em_1.2em]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[4px] bg-azul" />
      <h3 className="font-titulo text-corpo-g font-bold text-texto" style={{ lineHeight: 1.15 }}>
        {titulo}
      </h3>
      <ol className="mt-[0.6em] space-y-[0.55em] text-corpo text-texto-2" style={{ lineHeight: 1.38 }}>
        {captacao.gestoraOlha.map((g, i) => (
          <li key={g} className="flex gap-[0.7em] border-t border-borda pt-[0.5em]">
            <span className="font-mono text-azul">{String(i + 1).padStart(2, "0")}</span>
            <span>{g}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Múltiplos de referência para uma operação de crédito (não é promessa). */
export function Valuation() {
  const r = rotulos.crescimento;
  return (
    <section aria-label={r.valuation}>
      <Rotulo>{r.valuation}</Rotulo>
      <ul className="mt-[var(--esp-3)]">
        {captacao.valuation.map((v) => (
          <li key={v.base} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] items-baseline gap-x-[var(--esp-5)] border-t border-borda py-[0.45em]">
            <span className="font-mono text-corpo-g font-bold text-texto" style={{ letterSpacing: "-0.02em" }}>
              {v.multiplo}
              <span className="ml-[0.4em] font-texto text-corpo font-medium text-texto-2">
                {r.base.toLowerCase()} {v.base.toLowerCase()}
              </span>
            </span>
            <span className="text-corpo text-texto-3">{v.quando}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

