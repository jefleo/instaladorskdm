import { useId, useState, type KeyboardEvent } from "react";
import { CalendarDays, RotateCcw } from "lucide-react";
import { niveis, preco, produto, simuladorCliente as cfg, type Nivel } from "../../data/vapti";
import { rotuloTaxa, simuladorClienteTxt as txt } from "../../content/ui";
import { simularSaqueCliente } from "../../lib/modelo";
import { formatBRL } from "../../lib/formato";
import { Icone } from "../base";
import { CSS_RANGE } from "./Simulador";
import { TabelaSr, useViz, type VizProps } from "./comum";
import { rotulosSaqueCliente } from "./rotulos";

/** Setas e Home/End mexem no controle; PageUp/PageDown (passador) seguem para a apresentação. */
const naoPropagar = (e: KeyboardEvent) => {
  if (e.key !== "PageDown" && e.key !== "PageUp") e.stopPropagation();
};
const naoPropagarAtivacao = (e: KeyboardEvent) => {
  if (e.key === " " || e.key === "Enter") e.stopPropagation();
};

type IdPlano = (typeof cfg.planos)[number]["id"];

/** Dias do mini calendário: 4 semanas (o maior prazo cabe em 28 dias corridos). */
const DIAS_CALENDARIO = produto.parcelasSemanais.valor * 7;

/** Um saque do jeito que o cliente vê. Toda conta sai de simularSaqueCliente (src/lib/modelo.ts). */
export function SimuladorCliente({ compacto = false, className }: VizProps = {}) {
  const { ref, largura } = useViz<HTMLElement>();
  const [valor, setValor] = useState<number>(cfg.valorInicial.valor);
  const [idPlano, setIdPlano] = useState<IdPlano>(cfg.planos[0].id);
  const [idNivel, setIdNivel] = useState<Nivel["id"]>(cfg.nivelInicial);
  const tituloId = useId();
  const valorId = useId();

  const plano = cfg.planos.find((p) => p.id === idPlano) ?? cfg.planos[0];
  const nivel = niveis.find((n) => n.id === idNivel) ?? niveis[1];
  const diario = plano.tipo === "diario";
  const taxa = diario ? cfg.taxaDiario.valor : nivel.taxaSemanal.valor;
  const r = simularSaqueCliente({ valor, tipo: plano.tipo, parcelas: plano.parcelas, taxaSemanal: taxa });
  const rot = rotulosSaqueCliente(r, plano.tipo);
  const diasPagos = new Set(r.dias);
  const ehExemplo = valor === cfg.valorInicial.valor && idPlano === cfg.planos[0].id && idNivel === cfg.nivelInicial;
  const largo = !compacto && largura >= 1100;

  // O mesmo saque, plano de 4 semanas, em cada nível.
  const porNivel = niveis.map((nv) => {
    const s = simularSaqueCliente({ valor, tipo: "semanal", parcelas: produto.parcelasSemanais.valor, taxaSemanal: nv.taxaSemanal.valor });
    return { nivel: nv, juros: s.juros, rot: rotulosSaqueCliente(s, "semanal") };
  });
  const jurosMax = Math.max(...porNivel.map((p) => p.juros));
  const valorTexto = formatBRL(valor, 0);

  const botao = (ativo: boolean, desligado = false) =>
    `min-w-0 rounded-2 border-2 px-[0.6em] py-[0.45em] text-left text-apoio leading-tight transition-colors ${
      desligado
        ? "cursor-default border-dashed border-borda bg-transparent text-texto-3"
        : ativo
          ? "border-verde bg-verde-suave text-texto"
          : "border-borda bg-superficie text-texto-2 hover:border-borda-forte"
    }`;

  const p = ((valor - cfg.valorMin.valor) / (cfg.valorMax.valor - cfg.valorMin.valor)) * 100;

  return (
    <section ref={ref} aria-labelledby={tituloId} className={`w-full font-texto text-texto ${className ?? ""}`} data-simulador="cliente">
      <style>{CSS_RANGE}</style>
      <div className="mb-[0.8em]">
        <h3 id={tituloId} className="font-titulo text-corpo-g font-bold text-texto">
          {txt.titulo}
        </h3>
        <p className="text-apoio text-texto-3">{txt.subtitulo}</p>
      </div>

      <div className="grid items-start" style={{ gridTemplateColumns: largo ? "minmax(0, 1fr) minmax(0, 1.08fr)" : "1fr", gap: largo ? "2.6em" : "1.6em" }}>
        {/* Controles */}
        <div className="flex flex-col gap-[1.1em]">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-[1em]">
              <label htmlFor={valorId} className="text-corpo font-semibold text-texto-2">
                {txt.valor}
              </label>
              <output htmlFor={valorId} className="font-mono text-corpo-g font-bold tracking-[-0.03em] text-texto">
                {valorTexto}
              </output>
            </div>
            <input
              id={valorId}
              type="range"
              className="vz-range text-corpo"
              min={cfg.valorMin.valor}
              max={cfg.valorMax.valor}
              step={cfg.passo.valor}
              value={valor}
              aria-valuetext={valorTexto}
              onChange={(e) => setValor(Number(e.target.value))}
              onKeyDown={naoPropagar}
              style={{ ["--vz-p" as string]: `${p}%` }}
            />
            <p className="flex justify-between font-mono text-apoio text-texto-3" aria-hidden="true">
              <span>{cfg.valorMin.rotulo}</span>
              <span>{cfg.valorMax.rotulo}</span>
            </p>
          </div>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-[0.4em] text-corpo font-semibold text-texto-2">{txt.plano}</legend>
            <div className="grid gap-[0.5em]" style={{ gridTemplateColumns: `repeat(${largura > 0 && largura < 520 ? 2 : 4}, minmax(0, 1fr))` }}>
              {cfg.planos.map((pl) => {
                const ativo = pl.id === idPlano;
                return (
                  <button key={pl.id} type="button" aria-pressed={ativo} onClick={() => setIdPlano(pl.id)} onKeyDown={naoPropagarAtivacao} className={botao(ativo)}>
                    <span className="block whitespace-nowrap font-mono font-bold">{txt.planos[pl.id]}</span>
                    <span className="block text-texto-3">{txt.pagamento[pl.tipo]}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-[0.4em] text-corpo font-semibold text-texto-2">{txt.nivel}</legend>
            <div className="grid gap-[0.5em]" style={{ gridTemplateColumns: `repeat(${largura > 0 && largura < 520 ? 2 : 4}, minmax(0, 1fr))` }}>
              {niveis.map((nv) => {
                const ativo = nv.id === idNivel;
                return (
                  <button
                    key={nv.id}
                    type="button"
                    aria-pressed={ativo}
                    aria-disabled={diario || undefined}
                    onClick={() => (diario ? undefined : setIdNivel(nv.id))}
                    onKeyDown={naoPropagarAtivacao}
                    className={botao(ativo && !diario, diario)}
                  >
                    <span className="block whitespace-nowrap font-semibold">{nv.nome}</span>
                    <span className="block whitespace-nowrap font-mono">{txt.aoMes(nv.efetivaMes.rotulo)}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-[0.5em] text-apoio leading-snug text-texto-2" aria-live="polite">
              {diario ? txt.diarioNivel : `${nivel.nome}: ${rotuloTaxa(linhaDoNivel(nivel))}.`}
            </p>
          </fieldset>

          <div className="flex flex-wrap items-center gap-[0.8em]">
            {!ehExemplo ? (
              <button
                type="button"
                onClick={() => {
                  setValor(cfg.valorInicial.valor);
                  setIdPlano(cfg.planos[0].id);
                  setIdNivel(cfg.nivelInicial);
                }}
                onKeyDown={naoPropagarAtivacao}
                className="inline-flex items-center gap-[0.5em] rounded-full border border-borda-forte bg-superficie px-[0.9em] py-[0.45em] text-apoio font-semibold text-texto hover:bg-superficie-2"
              >
                <Icone icone={RotateCcw} tamanho="1em" />
                {txt.restaurar}
              </button>
            ) : null}
            <p className="text-apoio leading-snug text-texto-3">{txt.exemplo}</p>
          </div>
          {/* O mesmo saque em cada nível */}
          <div>
            <p className="text-corpo font-semibold text-texto-2">{txt.porNivel}</p>
            <p className="text-apoio text-texto-3">{txt.porNivelNota(valorTexto, produto.parcelasSemanais.rotulo)}</p>
            <ul className="mt-[0.4em] flex list-none flex-col gap-[0.35em] p-0" aria-hidden="true">
              {porNivel.map(({ nivel: nv, juros, rot: rn }) => {
                const ativo = !diario && nv.id === idNivel;
                return (
                  <li key={nv.id} className="grid items-center gap-x-[0.7em] text-apoio" style={{ gridTemplateColumns: "5.2em minmax(0, 1fr) 9.5em" }}>
                    <span className={ativo ? "font-semibold text-texto" : "text-texto-2"}>{nv.nome}</span>
                    <span className="relative h-[0.8em] rounded-full bg-superficie-3">
                      <span
                        className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-200 ${ativo ? "bg-verde" : "bg-verde-borda"}`}
                        style={{ width: `${(juros / jurosMax) * 100}%` }}
                      />
                    </span>
                    <span className={`whitespace-nowrap text-right font-mono ${ativo ? "font-bold text-texto" : "text-texto-2"}`}>
                      {rn.juros} · {rn.efetiva}
                    </span>
                  </li>
                );
              })}
            </ul>
            {diario ? <p className="mt-[0.3em] text-apoio text-texto-3">{txt.porNivelDiario}</p> : null}
          </div>
        </div>

        {/* Resultado */}
        <div className="flex flex-col gap-[1em]">
          <div className="rounded-3 border-2 border-verde-borda bg-verde-suave px-[1em] py-[0.7em]">
            <p className="text-corpo font-semibold text-texto-2">{txt.resultados.parcelas}</p>
            <p aria-live="polite" className="font-mono text-kpi-p font-bold text-verde" style={{ letterSpacing: "var(--tracking-kpi)", lineHeight: 1.05 }}>
              {rot.parcelas}
            </p>
            <dl className="mt-[0.4em] grid gap-[0.6em]" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              {[
                { rotulo: txt.resultados.juros, valor: rot.juros },
                { rotulo: txt.resultados.total, valor: rot.total },
                { rotulo: txt.resultados.efetiva, valor: rot.efetiva },
              ].map((s) => (
                <div key={s.rotulo} className="min-w-0">
                  <dt className="text-apoio leading-tight text-texto-3">{s.rotulo}</dt>
                  <dd className="m-0 font-mono text-corpo-g font-bold tracking-[-0.03em] text-texto">{s.valor}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-[0.4em] text-apoio text-texto-2">{txt.pagamentoLongo[plano.tipo]}</p>
          </div>

          {/* Mini calendário */}
          <div>
            <p className="flex items-center gap-[0.45em] text-corpo font-semibold text-texto-2">
              <Icone icone={CalendarDays} tamanho="1em" />
              {txt.calendario}
            </p>
            <ol className="mt-[0.4em] grid list-none gap-[0.3em] p-0" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }} aria-label={txt.calendario}>
              {Array.from({ length: DIAS_CALENDARIO }, (_, i) => {
                const dia = i + 1;
                const paga = diasPagos.has(dia);
                return (
                  <li
                    key={dia}
                    className={`rounded-1 border py-[0.15em] text-center font-mono text-apoio ${
                      paga ? "border-verde bg-verde-suave font-bold text-verde" : "border-borda text-texto-3"
                    }`}
                    aria-label={paga ? txt.diaParcela(dia, rot.parcela) : undefined}
                    aria-hidden={paga ? undefined : true}
                  >
                    {dia}
                  </li>
                );
              })}
            </ol>
            <p className="mt-[0.3em] text-apoio text-texto-3">{txt.calendarioNota}</p>
          </div>

        </div>
      </div>
      <TabelaSr
        legenda={txt.tabela}
        cabecalho={[txt.nivel, txt.resultados.parcelas, txt.resultados.juros, txt.resultados.efetiva]}
        linhas={porNivel.map(({ nivel: nv, rot: rn }) => [nv.nome, rn.parcelas, rn.juros, rn.efetiva])}
      />
    </section>
  );
}

/** Linha da tabela de preço do nível (taxa semanal = efetiva ao mês = juros em R$ 400). */
const linhaDoNivel = (nv: Nivel) => preco.tabela.find((l) => l.taxaSemanal === nv.taxaSemanal) ?? preco.tabela[2];
