import { ChevronRight } from "lucide-react";
import { eficiencia as ef } from "../../data/vapti";
import { viz } from "../../content/ui";
import { formatBRL } from "../../lib/formato";
import { Icone } from "../base";
import { EtiquetaEstimativa, entrada, Figura, TabelaSr, ticks, useViz, type VizProps } from "./comum";

/** Faixa "4 a 6" do briefing → [4, 6] (o ponto médio 5 de vapti.ts é só para gráfico). */
function faixa(texto: string, padrao: number): [number, number] {
  const m = texto.match(/(\d+)\D+(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [padrao, padrao];
}

/** V18 — Eficiência: WhatsApp 30 → 4 a 6 mensagens por saque; bureau R$ 15,99 → R$ 8,33 → R$ 2 a 3. Estimativas marcadas. */
export function Eficiencia({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, ativo, animar } = useViz();
  const lado = !compacto && largura >= 1100;
  const [dMin, dMax] = faixa(ef.msgsDepoisFaixa, ef.msgsDepois.valor);

  const quadrados = (n: number, cheio: number, cor: string, atraso: number) => (
    <span className="flex flex-wrap gap-[0.22em]" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="block size-[0.8em] rounded-[3px]"
          style={{
            background: i < cheio ? cor : "transparent",
            border: i < cheio ? undefined : `2px dashed ${cor}`,
            ...entrada(ativo, animar, "fade", atraso + i * 8, 220),
          }}
        />
      ))}
    </span>
  );

  const barras = [
    { nome: viz.eficiencia.balcao, de: 0, ate: ef.serasaBalcaoMin.valor, valor: ef.serasaBalcaoMin.rotulo, cor: "var(--cor-cinza)", est: false },
    { nome: viz.eficiencia.aprovado, de: 0, ate: ef.custoAprovadoComFunil.valor, valor: ef.custoAprovadoComFunil.rotulo, cor: "var(--cor-verde)", est: true },
    {
      nome: viz.eficiencia.maduro,
      de: ef.bureauMaduroMin.valor,
      ate: ef.bureauMaduroMax.valor,
      valor: viz.eficiencia.faixaValor(ef.bureauMaduroMin.rotulo, ef.bureauMaduroMax.rotulo),
      cor: "var(--cor-verde)",
      est: true,
    },
  ];
  const marcas = ticks(0, ef.serasaBalcaoMin.valor, 4);
  const dom = marcas[marcas.length - 1];
  const pct = (v: number) => `${(v / dom) * 100}%`;

  return (
    <Figura visual="V18" legenda={legenda} className={className}>
      <div ref={ref} className="grid w-full font-texto" style={{ gridTemplateColumns: lado ? "minmax(0, 1fr) minmax(0, 1.25fr)" : "1fr", gap: "2.2em" }}>
        {/* WhatsApp */}
        <section className="min-w-0">
          <div className="mb-[0.8em] flex flex-wrap items-center justify-between gap-[0.6em]">
            <h3 className="font-texto text-corpo font-semibold text-texto-2" style={{ letterSpacing: 0 }}>
              {viz.eficiencia.whatsTitulo}
            </h3>
            <span className="text-apoio">
              <EtiquetaEstimativa />
            </span>
          </div>
          {[
            { nome: viz.eficiencia.comum, msgs: viz.eficiencia.mensagens(ef.msgsAntes.rotulo), custo: ef.custoMsgAntes.rotulo, n: ef.msgsAntes.valor, cheio: ef.msgsAntes.valor, cor: "var(--cor-texto-3)" },
            { nome: viz.eficiencia.redesenhada, msgs: viz.eficiencia.faixa(ef.msgsDepoisFaixa), custo: ef.custoMsgDepois.rotulo, n: dMax, cheio: dMin, cor: "var(--cor-verde)" },
          ].map((l, i) => (
            <div key={l.nome} className={`${i ? "mt-[1.2em]" : ""}`} style={entrada(ativo, animar, "subir", i * 120, 300)}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-[1em]">
                <p className="text-corpo font-semibold text-texto">{l.nome}</p>
                <p className={`font-mono text-corpo-g font-bold ${i ? "text-verde" : "text-texto"}`}>
                  {l.custo} <span className="font-texto text-apoio font-normal text-texto-3">{viz.eficiencia.porSaque}</span>
                </p>
              </div>
              <p className="mb-[0.4em] text-apoio text-texto-2">{l.msgs}</p>
              <span className="text-corpo-g">{quadrados(l.n, l.cheio, l.cor, i * 160)}</span>
            </div>
          ))}
          <p className="mt-[0.9em] text-apoio text-texto-3">{viz.eficiencia.cadaQuadrado}</p>
        </section>

        {/* Bureau */}
        <section className="min-w-0">
          <h3 className="mb-[0.8em] font-texto text-corpo font-semibold text-texto-2" style={{ letterSpacing: 0 }}>
            {viz.eficiencia.bureauTitulo}
          </h3>
          <p className="mb-[0.4em] text-apoio text-texto-3">{viz.eficiencia.funilTitulo}</p>
          <ol className="m-0 mb-[1.1em] flex list-none flex-wrap items-center gap-[0.35em] p-0">
            {ef.funil.map((etapa, i) => {
              const ultimo = i === ef.funil.length - 1;
              return (
                <li key={etapa} className="flex items-center gap-[0.35em]" style={entrada(ativo, animar, "fade", i * 60, 250)}>
                  <span
                    className={`rounded-2 border px-[0.55em] py-[0.25em] text-apoio leading-tight ${ultimo ? "border-cinza bg-cinza-suave text-texto" : "border-verde-borda bg-verde-suave text-texto"}`}
                    style={{ borderStyle: ultimo ? "dashed" : "solid" }}
                  >
                    {etapa}
                  </span>
                  {!ultimo ? <Icone icone={ChevronRight} tamanho="1em" className="text-texto-3" /> : null}
                </li>
              );
            })}
          </ol>
          <div className="grid items-center" style={{ gridTemplateColumns: "minmax(0, 1fr) auto", columnGap: "1em", rowGap: "0.25em" }}>
            {barras.map((b, i) => (
              <div key={b.nome} className="contents">
                <p className="flex flex-wrap items-center gap-[0.5em] text-apoio font-semibold leading-tight text-texto">
                  {b.nome}
                  {b.est ? <EtiquetaEstimativa /> : null}
                </p>
                <p className="text-right font-mono text-corpo font-bold whitespace-nowrap text-texto">{b.valor}</p>
                <div className="relative mb-[0.5em] h-[1.1em]" style={{ gridColumn: "1 / -1" }}>
                  {marcas.map((v) => (
                    <span key={v} aria-hidden="true" className={`absolute -top-[0.2em] -bottom-[0.2em] border-l ${v === 0 ? "border-borda-forte" : "border-borda"}`} style={{ left: pct(v) }} />
                  ))}
                  {b.de > 0 ? (
                    <div className="absolute inset-y-0 left-0 rounded-l-[3px] opacity-35" style={{ width: pct(b.de), background: b.cor, ...entrada(ativo, animar, "x", 200 + i * 80, 350) }} />
                  ) : null}
                  <div
                    className="absolute inset-y-0 rounded-[4px]"
                    style={{
                      left: pct(b.de),
                      width: pct(b.ate - b.de),
                      background: b.cor,
                      ...entrada(ativo, animar, "x", 200 + i * 80, 380),
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="relative h-[1.3em]" style={{ gridColumn: "1 / -1" }} aria-hidden="true">
              {marcas.map((v) => (
                <span key={v} className={`absolute font-mono text-apoio whitespace-nowrap text-texto-3 ${v === dom ? "-translate-x-full" : v === 0 ? "" : "-translate-x-1/2"}`} style={{ left: pct(v) }}>
                  {formatBRL(v, 0)}
                </span>
              ))}
            </div>
            <p className="mt-[0.5em] text-apoio text-texto-3" style={{ gridColumn: "1 / -1" }}>
              {viz.eficiencia.eixoX}
            </p>
          </div>
        </section>
      </div>
      <TabelaSr
        legenda={viz.eficiencia.tabela}
        cabecalho={[viz.eficiencia.item, viz.eficiencia.valor]}
        linhas={[
          [`${viz.eficiencia.whatsTitulo} · ${viz.eficiencia.comum}`, `${viz.eficiencia.mensagens(ef.msgsAntes.rotulo)} · ${ef.custoMsgAntes.rotulo}`],
          [`${viz.eficiencia.whatsTitulo} · ${viz.eficiencia.redesenhada} (${viz.estimativa})`, `${viz.eficiencia.faixa(ef.msgsDepoisFaixa)} · ${ef.custoMsgDepois.rotulo}`],
          ...barras.map((b) => [b.est ? `${b.nome} (${viz.estimativa})` : b.nome, b.valor]),
        ]}
      />
    </Figura>
  );
}
