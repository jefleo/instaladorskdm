import { regua, trilhas } from "../../data/vapti";
import { viz } from "../../content/ui";
import { Selo } from "../base";
import { entrada, Figura, TabelaSr, useViz, type VizProps } from "./comum";

/* As colunas são os anos da régua da seção 4.11 ("0", "1", "2", "3", "4–5", "6+"). */
const faixaAno = (ano: string): [number, number] => {
  const n = ano.match(/\d+/g)?.map(Number) ?? [0];
  return [n[0], ano.includes("+") ? Infinity : (n[1] ?? n[0])];
};
const COLUNAS = regua.map((r) => faixaAno(r.ano));
const colunaDoAno = (a: number) => Math.max(0, COLUNAS.findIndex(([de, ate]) => a >= de && a <= ate));

/** Zippi: o marco ("2021") casa com o começo do texto da régua ("2019–2021: ..."). */
const colunaZippi = (marco: string) => Math.max(0, regua.findIndex((r) => new RegExp(`^(\\d{4}–)?${marco}:`).test(r.zippi)));
/** Vapti: "Ano 2" → coluna do ano 2; "Anos 4–6" → das colunas 4–5 até 6+. */
const colunasVapti = (marco: string): [number, number] => {
  const n = marco.match(/\d+/g)?.map(Number) ?? [0];
  return [colunaDoAno(n[0]), colunaDoAno(n[1] ?? n[0])];
};

const ZIPPI = trilhas.zippi.map((m) => ({ ...m, col: colunaZippi(m.marco) }));
const VAPTI = trilhas.vapti.map((m) => {
  const [de, ate] = colunasVapti(m.marco);
  return { ...m, de, ate };
});
const VAPTI_PONTO = VAPTI.filter((m) => m.de === m.ate);
const VAPTI_FAIXA = VAPTI.filter((m) => m.de !== m.ate);

/** V20 — Régua Vapti × Zippi em duas trilhas. Zippi (cinza, fatos) × Vapti (verde, projeção). Vertical em contêiner estreito. */
export function ReguaDuasTrilhas({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, ativo, animar } = useViz();
  const nCol = COLUNAS.length;
  const vertical = compacto || (largura > 0 && largura < 1000);
  const centro = (c: number) => `${((c + 0.5) / nCol) * 100}%`;

  const rotuloTrilha = (zippi: boolean, linha?: number) => (
    <div className="min-w-0" style={linha ? { gridRow: linha, gridColumn: 1 } : undefined}>
      <p className={`font-titulo text-corpo-g font-bold leading-tight ${zippi ? "text-texto-2" : "text-verde"}`}>{zippi ? viz.regua.zippi : viz.regua.vapti}</p>
      <p className="mt-[0.15em] text-apoio leading-tight text-texto-3">{zippi ? viz.regua.zippiTipo : viz.regua.vaptiTipo}</p>
      {!zippi ? (
        <span className="mt-[0.4em] inline-block text-apoio">
          <Selo tipo="projecao" tamanho="sm" />
        </span>
      ) : null}
    </div>
  );

  const corpo = vertical ? (
    <div className="grid font-texto" style={{ gridTemplateColumns: "4.6em minmax(0,1fr) minmax(0,1fr) 0.5em", columnGap: "0.8em" }}>
      <span />
      {rotuloTrilha(true)}
      {rotuloTrilha(false)}
      <span />
      {regua.map((r, c) => {
        const z = ZIPPI.filter((m) => m.col === c);
        const v = VAPTI_PONTO.filter((m) => m.de === c);
        const faixaAqui = VAPTI_FAIXA.filter((m) => m.ate === c);
        const linha = c + 2;
        return (
          <div key={r.ano} className="contents">
            <p className="border-t border-borda pt-[0.6em] font-mono text-apoio font-bold text-texto-3" style={{ gridRow: linha, gridColumn: 1 }}>
              {viz.regua.ano(r.ano)}
            </p>
            <div className="border-t border-borda pt-[0.6em] pb-[0.8em]" style={{ gridRow: linha, gridColumn: 2, ...entrada(ativo, animar, "subir", c * 50, 300) }}>
              {z.map((m) => (
                <p key={m.marco} className="text-apoio leading-snug text-texto-2">
                  <span className="mr-[0.4em] inline-block size-[0.65em] rounded-full border-2 border-cinza align-middle" aria-hidden="true" />
                  <span className="font-mono font-bold text-cinza">{m.marco}</span> {m.texto}
                </p>
              ))}
            </div>
            <div className="border-t border-borda pt-[0.6em] pb-[0.8em]" style={{ gridRow: linha, gridColumn: 3, ...entrada(ativo, animar, "subir", 60 + c * 50, 300) }}>
              {v.map((m) => (
                <p key={m.marco} className="text-apoio leading-snug text-texto">
                  <span className="mr-[0.4em] inline-block size-[0.65em] rounded-full bg-verde align-middle" aria-hidden="true" />
                  <span className="font-mono font-bold text-verde">{m.marco}</span> {m.texto}
                </p>
              ))}
              {faixaAqui.map((m) => (
                <p key={m.marco} className="mt-[0.3em] rounded-2 border border-verde-borda bg-verde-suave px-[0.45em] py-[0.2em] text-apoio leading-snug text-texto">
                  <span className="font-mono font-bold text-verde">{m.marco}</span> {m.texto}
                </p>
              ))}
            </div>
          </div>
        );
      })}
      {VAPTI_FAIXA.map((m) => (
        <span key={m.marco} aria-hidden="true" className="my-[0.6em] rounded-full bg-verde" style={{ gridColumn: 4, gridRow: `${m.de + 2} / ${m.ate + 3}`, width: 4, justifySelf: "center" }} />
      ))}
    </div>
  ) : (
    <div className="grid font-texto" style={{ gridTemplateColumns: `minmax(0, 12em) repeat(${nCol}, minmax(0, 1fr))`, columnGap: "0", rowGap: "1.4em" }}>
      <p className="self-end text-apoio text-texto-3">{viz.regua.eixo}</p>
      {regua.map((r) => (
        <p key={r.ano} className="border-b border-borda-forte pb-[0.3em] text-center font-mono text-apoio font-bold text-texto-2">
          {viz.regua.ano(r.ano)}
        </p>
      ))}
      {/* trilha Zippi */}
      {rotuloTrilha(true, 2)}
      <div className="relative" style={{ gridColumn: `2 / ${nCol + 2}`, gridRow: 2 }} aria-hidden="true">
        <span
          className="absolute top-[0.55em] border-t-[3px] border-dashed border-cinza"
          style={{ left: centro(ZIPPI[0].col), right: `calc(100% - ${centro(ZIPPI[ZIPPI.length - 1].col)})`, ...entrada(ativo, animar, "x", 0, 400) }}
        />
      </div>
      {ZIPPI.map((m, i) => (
        <div key={m.marco} className="relative z-10 flex min-w-0 flex-col items-center px-[0.4em] text-center" style={{ gridColumn: m.col + 2, gridRow: 2, ...entrada(ativo, animar, "fade", 150 + i * 60, 300) }}>
          <span className="block size-[1.1em] rounded-full border-[3px] border-cinza bg-tinta" aria-hidden="true" />
          <span className="mt-[0.35em] font-mono text-apoio font-bold text-cinza">{m.marco}</span>
          <span className="text-apoio leading-snug text-texto-2">{m.texto}</span>
        </div>
      ))}
      {/* trilha Vapti */}
      {rotuloTrilha(false, 3)}
      <div className="relative" style={{ gridColumn: `2 / ${nCol + 2}`, gridRow: 3 }} aria-hidden="true">
        <span
          className="absolute top-[0.35em] h-[0.45em] rounded-full bg-verde"
          style={{ left: centro(VAPTI_PONTO[0].de), right: `calc(100% - ${centro(VAPTI_PONTO[VAPTI_PONTO.length - 1].de)})`, ...entrada(ativo, animar, "x", 80, 400) }}
        />
      </div>
      {VAPTI_PONTO.map((m, i) => (
        <div key={m.marco} className="relative z-10 flex min-w-0 flex-col items-center px-[0.4em] text-center" style={{ gridColumn: m.de + 2, gridRow: 3, ...entrada(ativo, animar, "fade", 230 + i * 60, 300) }}>
          <span className="block size-[1.1em] rounded-full border-[3px] border-tinta bg-verde" aria-hidden="true" />
          <span className="mt-[0.35em] font-mono text-apoio font-bold text-verde">{m.marco}</span>
          <span className="text-apoio leading-snug text-texto">{m.texto}</span>
        </div>
      ))}
      {VAPTI_FAIXA.map((m) => (
        <div
          key={m.marco}
          className="mx-[0.4em] rounded-2 border-2 border-verde-borda bg-verde-suave px-[0.6em] py-[0.35em] text-center text-apoio leading-snug text-texto"
          style={{ gridColumn: `${m.de + 2} / ${m.ate + 3}`, gridRow: 4, ...entrada(ativo, animar, "fade", 520, 300) }}
        >
          <span className="font-mono font-bold text-verde">{m.marco}</span> · {m.texto}
        </div>
      ))}
    </div>
  );

  return (
    <Figura visual="V20" titulo={viz.regua.titulo} legenda={legenda} className={className}>
      <div ref={ref} className="w-full">
        {largura > 0 ? corpo : null}
      </div>
      <TabelaSr
        legenda={viz.regua.tabela}
        cabecalho={[viz.regua.quando, viz.regua.zippi, viz.regua.vapti]}
        linhas={regua.map((r, c) => [
          viz.regua.ano(r.ano),
          ZIPPI.filter((m) => m.col === c).map((m) => `${m.marco}: ${m.texto}`).join("; ") || "—",
          VAPTI.filter((m) => m.de === c || (m.de < c && m.ate >= c)).map((m) => `${m.marco}: ${m.texto}`).join("; ") || "—",
        ])}
      />
    </Figura>
  );
}
