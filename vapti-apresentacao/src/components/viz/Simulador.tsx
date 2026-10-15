import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { faixasSimulador as faixas, simulador as txt, viz } from "../../content/ui";
import type { NumeroFase } from "../../lib/modelo";
import { Icone, Selo } from "../base";
import { useViz, type VizProps } from "./comum";
import { cenarioBase, efetivaMes, formatCapital, formatEquilibrio, formatTaxa, jurosEm400, pctCurto, rotulosResultado, simularCenario } from "./rotulos";

/** Setas e Home/End mexem no controle — não trocam a tela. PageUp/PageDown (passador) seguem para a apresentação. */
const naoPropagar = (e: KeyboardEvent) => {
  if (e.key !== "PageDown" && e.key !== "PageUp") e.stopPropagation();
};
const naoPropagarAtivacao = (e: KeyboardEvent) => {
  if (e.key === " " || e.key === "Enter" || e.key.startsWith("Arrow")) e.stopPropagation();
};

const CSS_RANGE = `
.vz-range { -webkit-appearance: none; appearance: none; width: 100%; height: 2.2em; background: transparent; cursor: pointer; margin: 0; }
.vz-range:focus { outline: none; }
.vz-range::-webkit-slider-runnable-track { height: 0.42em; border-radius: 999px; background: linear-gradient(to right, var(--cor-verde) var(--vz-p), var(--cor-superficie-3) var(--vz-p)); }
.vz-range::-moz-range-track { height: 0.42em; border-radius: 999px; background: var(--cor-superficie-3); }
.vz-range::-moz-range-progress { height: 0.42em; border-radius: 999px; background: var(--cor-verde); }
.vz-range::-webkit-slider-thumb { -webkit-appearance: none; width: 1.35em; height: 1.35em; margin-top: -0.465em; border-radius: 50%; background: var(--cor-verde); border: 0.2em solid var(--cor-tinta); box-shadow: 0 0 0 1px var(--cor-verde); }
.vz-range::-moz-range-thumb { width: 1.1em; height: 1.1em; border-radius: 50%; background: var(--cor-verde); border: 0.2em solid var(--cor-tinta); }
.vz-range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 3px var(--cor-tinta), 0 0 0 6px var(--cor-foco); }
.vz-range:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 3px var(--cor-tinta), 0 0 0 6px var(--cor-foco); }
`;

function Controle({
  rotulo,
  valor,
  detalhe,
  min,
  max,
  passo,
  atual,
  aoMudar,
  texto,
  rotMin,
  rotMax,
}: {
  rotulo: string;
  valor: string;
  detalhe?: ReactNode;
  min: number;
  max: number;
  passo: number;
  atual: number;
  aoMudar: (v: number) => void;
  texto: (v: number) => string;
  rotMin: string;
  rotMax: string;
}) {
  const id = useId();
  const p = ((atual - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-[1em]">
        <label htmlFor={id} className="text-corpo font-semibold text-texto-2">
          {rotulo}
        </label>
        <output htmlFor={id} className="font-mono text-corpo-g font-bold tracking-[-0.03em] text-texto">
          {valor}
        </output>
      </div>
      {detalhe ? <p className="text-apoio text-texto-2">{detalhe}</p> : null}
      <input
        id={id}
        type="range"
        className="vz-range text-corpo"
        min={min}
        max={max}
        step={passo}
        value={atual}
        aria-valuetext={texto(atual)}
        onChange={(e) => aoMudar(Number(e.target.value))}
        onKeyDown={naoPropagar}
        style={{ ["--vz-p" as string]: `${p}%` }}
      />
      <p className="flex justify-between font-mono text-apoio text-texto-3" aria-hidden="true">
        <span>{rotMin}</span>
        <span>{rotMax}</span>
      </p>
    </div>
  );
}

/** Simulador ao vivo — projeção. Todo número sai de simularFase (src/lib/modelo.ts). */
export function Simulador({ compacto = false, className }: VizProps = {}) {
  const { ref, largura } = useViz<HTMLElement>();
  const [capital, setCapital] = useState(cenarioBase.capital);
  const [taxa, setTaxa] = useState(cenarioBase.taxa);
  const [perda, setPerda] = useState(cenarioBase.perda);
  const [fase, setFase] = useState<NumeroFase>(cenarioBase.fase);
  const tituloId = useId();

  const r = simularCenario({ capital, taxa, perda, fase });
  const rot = rotulosResultado(r);
  const margemNegativa = r.margemMes <= 0;
  const quaseZero = Math.abs(r.margemMes) < 0.5;
  const estado = quaseZero ? "noEquilibrio" : margemNegativa ? "abaixoEquilibrio" : "acimaEquilibrio";
  const ehBase = capital === cenarioBase.capital && taxa === cenarioBase.taxa && perda === cenarioBase.perda && fase === cenarioBase.fase;
  const largo = !compacto && largura >= 1100;
  const faseAtual = txt.fases.find((f) => f.fase === fase);

  // Escala da barra perda × equilíbrio: até o maior entre a perda máxima e o equilíbrio.
  const escalaMax = Math.max(faixas.perda.max, r.perdaEquilibrio) * 1.06;
  const pctBarra = (v: number) => `${Math.min(Math.max(v / escalaMax, 0), 1) * 100}%`;
  const corEstado = margemNegativa ? "var(--cor-coral)" : "var(--cor-verde)";

  const saidas: { rotulo: string; valor: string }[] = [
    { rotulo: txt.resultados.carteira, valor: rot.carteira },
    { rotulo: txt.resultados.sacadoMes, valor: rot.sacadoMes },
    { rotulo: txt.resultados.receita, valor: rot.receitaMes },
    { rotulo: txt.resultados.receitaAno, valor: rot.receitaAno },
    { rotulo: txt.resultados.perda, valor: rot.perdaMes },
    { rotulo: txt.resultados.custo, valor: rot.custoMes },
    { rotulo: txt.resultados.funding, valor: rot.fundingMes },
    { rotulo: txt.resultados.clientes, valor: rot.clientesComSaldo },
    { rotulo: txt.resultados.saques, valor: rot.saquesMes },
  ];

  return (
    <section ref={ref} aria-labelledby={tituloId} className={`w-full font-texto text-texto ${className ?? ""}`}>
      <style>{CSS_RANGE}</style>
      <div className="mb-[0.8em] flex flex-wrap items-center justify-between gap-[0.8em]">
        <div>
          <h3 id={tituloId} className="font-titulo text-corpo-g font-bold text-texto">
            {txt.titulo}
          </h3>
          <p className="text-apoio text-texto-3">{txt.subtitulo}</p>
        </div>
        <span className="text-apoio">
          <Selo tipo="projecao" tamanho="sm" />
        </span>
      </div>

      <div className="grid items-start" style={{ gridTemplateColumns: largo ? "minmax(0, 1.2fr) minmax(0, 1fr)" : "1fr", gap: largo ? "2.6em" : "1.6em" }}>
        {/* Controles */}
        <div className="grid gap-x-[1.8em] gap-y-[1em]" style={{ gridTemplateColumns: largo ? "repeat(2, minmax(0, 1fr))" : "1fr" }}>
          <Controle
            rotulo={txt.controles.capital}
            valor={formatCapital(capital)}
            detalhe={fase !== 1 ? viz.simulador.capitalFase(formatCapital(capital)) : undefined}
            min={faixas.capital.min}
            max={faixas.capital.max}
            passo={faixas.capital.passo}
            atual={capital}
            aoMudar={setCapital}
            texto={formatCapital}
            rotMin={formatCapital(faixas.capital.min)}
            rotMax={formatCapital(faixas.capital.max)}
          />
          <Controle
            rotulo={txt.controles.taxaSemanal}
            valor={`${formatTaxa(taxa)}`}
            detalhe={
              <>
                {viz.simulador.porSemana} <span className="font-semibold text-texto">{viz.simulador.taxaDetalhe(efetivaMes(taxa), jurosEm400(taxa))}</span>
              </>
            }
            min={faixas.taxa.min}
            max={faixas.taxa.max}
            passo={faixas.taxa.passo}
            atual={taxa}
            aoMudar={(v) => setTaxa(Math.round(v * 1e4) / 1e4)}
            texto={(v) => `${formatTaxa(v)} ${viz.simulador.porSemana} ${viz.simulador.taxaDetalhe(efetivaMes(v), jurosEm400(v))}`}
            rotMin={formatTaxa(faixas.taxa.min)}
            rotMax={formatTaxa(faixas.taxa.max)}
          />
          <div style={{ gridColumn: "1 / -1" }}>
          <Controle
            rotulo={txt.controles.perda}
            valor={pctCurto(perda)}
            min={faixas.perda.min}
            max={faixas.perda.max}
            passo={faixas.perda.passo}
            atual={perda}
            aoMudar={(v) => setPerda(Math.round(v * 1e4) / 1e4)}
            texto={(v) => `${pctCurto(v)} ${viz.simulador.perdaDetalhe}`}
            rotMin={pctCurto(faixas.perda.min)}
            rotMax={pctCurto(faixas.perda.max)}
          />
          </div>
          <fieldset className="m-0 border-0 p-0" style={{ gridColumn: "1 / -1" }}>
            <legend className="mb-[0.4em] text-corpo font-semibold text-texto-2">{txt.controles.fase}</legend>
            <div className="grid grid-cols-3 gap-[0.5em]">
              {txt.fases.map((f) => {
                const ativo = f.fase === fase;
                return (
                  <button
                    key={f.fase}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setFase(f.fase)}
                    onKeyDown={naoPropagarAtivacao}
                    className={`min-w-0 rounded-2 border-2 px-[0.7em] py-[0.5em] text-left text-apoio leading-tight transition-colors ${
                      ativo ? "border-verde bg-verde-suave text-texto" : "border-borda bg-superficie text-texto-2 hover:border-borda-forte"
                    }`}
                  >
                    <span className="block whitespace-nowrap font-mono font-bold">{f.rotulo.split(" · ")[0]}</span>
                    <span className="block whitespace-nowrap text-texto-3">{f.rotulo.split(" · ")[1]}</span>
                  </button>
                );
              })}
            </div>
            {faseAtual ? <p className="mt-[0.45em] text-apoio leading-snug text-texto-3">{faseAtual.financiamento}</p> : null}
          </fieldset>
          <div className="flex flex-wrap items-center gap-[0.8em]" style={{ gridColumn: "1 / -1" }}>
            <button
              type="button"
              onClick={() => {
                setCapital(cenarioBase.capital);
                setTaxa(cenarioBase.taxa);
                setPerda(cenarioBase.perda);
                setFase(cenarioBase.fase);
              }}
              onKeyDown={naoPropagarAtivacao}
              disabled={ehBase}
              className="inline-flex items-center gap-[0.5em] rounded-full border border-borda-forte bg-superficie px-[0.9em] py-[0.45em] text-apoio font-semibold text-texto hover:bg-superficie-2 disabled:cursor-default disabled:opacity-45"
            >
              <Icone icone={RotateCcw} tamanho="1em" />
              {txt.restaurar}
            </button>
            <p className="text-apoio leading-snug text-texto-3">{txt.cenarioBase}</p>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex flex-col gap-[0.8em]">
          <div className={`rounded-3 border-2 px-[1em] py-[0.7em] ${margemNegativa ? "border-coral-borda bg-coral-suave" : "border-verde-borda bg-verde-suave"}`}>
            <div className="flex flex-wrap items-center justify-between gap-[0.6em]">
              <p className="text-corpo font-semibold text-texto-2">{txt.resultados.margem}</p>
              <span
                className={`rounded-full border px-[0.6em] py-[0.2em] font-mono text-apoio uppercase tracking-[0.06em] ${
                  margemNegativa ? "border-coral-borda text-coral" : "border-verde-borda text-verde"
                }`}
              >
                {txt.estados[estado]}
              </span>
            </div>
            <p aria-live="polite" className="mt-[0.1em] font-mono text-kpi-p font-bold" style={{ color: corEstado, letterSpacing: "var(--tracking-kpi)", lineHeight: 1.05 }}>
              {rot.margemMes}
            </p>
            <p className="text-apoio text-texto-3">{txt.margemNota}</p>
          </div>

          {/* perda escolhida × perda de equilíbrio */}
          <div>
            <div className="flex flex-wrap justify-between gap-x-[1em] text-apoio">
              <span className="text-texto-2">
                {viz.simulador.perdaEscolhida}: <strong className="font-mono text-texto">{pctCurto(perda)}</strong>
              </span>
              <span className="text-texto-2">
                {txt.resultados.equilibrio}: <strong className="font-mono text-texto">{formatEquilibrio(r.perdaEquilibrio)}</strong>
              </span>
            </div>
            <div className="relative mt-[0.4em] h-[0.9em] rounded-full bg-superficie-3" aria-hidden="true">
              <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-200" style={{ width: pctBarra(perda), background: corEstado }} />
              <span className="absolute -top-[0.35em] -bottom-[0.35em] w-[3px] -translate-x-1/2 rounded-full bg-texto" style={{ left: pctBarra(r.perdaEquilibrio) }} />
            </div>
          </div>

          {margemNegativa || quaseZero ? (
            <div role="alert" className="flex items-start gap-[0.6em] rounded-3 border-2 border-coral bg-coral-suave px-[0.9em] py-[0.7em]">
              <Icone icone={TriangleAlert} tamanho="1.3em" className="mt-[0.05em] flex-none text-coral" />
              <p className="text-corpo font-semibold leading-snug text-texto">
                {txt.estados[estado]}. <span className="font-normal text-texto-2">{txt.estadosAjuda[estado]}</span>
              </p>
            </div>
          ) : null}

          <dl className="m-0 grid gap-[0.5em]" style={{ gridTemplateColumns: `repeat(${largura >= 600 ? 3 : 2}, minmax(0, 1fr))` }}>
            {saidas.map((s) => (
              <div key={s.rotulo} className="rounded-2 border border-borda bg-superficie px-[0.7em] py-[0.5em]">
                <dt className="text-apoio leading-tight text-texto-3">{s.rotulo}</dt>
                <dd className="m-0 font-mono text-corpo font-bold tracking-[-0.03em] text-texto">{s.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
