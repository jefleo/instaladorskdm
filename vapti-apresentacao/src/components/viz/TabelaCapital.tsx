import type { CSSProperties, ReactNode } from "react";
import { preco, premissas, projeto, tabelaA } from "../../data/vapti";
import { viz } from "../../content/ui";
import { TabelaComparativa, type ColunaTabela, Selo } from "../base";
import { TabelaSr, useViz, type VizProps } from "./comum";
import { linhaTabelaCapital, pctCurto, semMoeda, type LinhaCapital } from "./rotulos";

const tc = viz.tabelaCapital;
/** "Sacado/mês" → "Sacado/" + "mês" (cabeçalho em duas linhas). */
const quebra = (s: string): ReactNode => {
  const i = s.indexOf("/");
  return i < 0 ? s : duas(s.slice(0, i + 1), s.slice(i + 1));
};
const duas = (a: string, b: string): ReactNode => (
  <>
    {a}
    <br />
    {b}
  </>
);

/** Tabela A — variação de capital na fase 1, calculada pelo modelo (não copiada). Projeção. */
export function TabelaCapital({ compacto = false, className }: VizProps = {}) {
  const { ref, largura } = useViz();
  const linhas = tabelaA.map((l) => linhaTabelaCapital(l.capital.valor));
  const destaque = linhas.findIndex((l) => l.capitalValor === projeto.capitalInicial.valor);
  const t4 = pctCurto(preco.tabela[0].taxaSemanal.valor);
  const t5 = pctCurto(premissas.taxaBase.valor);
  const t6 = pctCurto(preco.tabela[3].taxaSemanal.valor);
  const p8 = pctCurto(premissas.perdaBase.valor);
  const p12 = pctCurto(premissas.perdaEstresse.valor);

  const num = (chave: keyof LinhaCapital, titulo: ReactNode, tom?: "verde"): ColunaTabela<LinhaCapital> => ({
    chave,
    titulo,
    numerica: true,
    tom,
    celula: (l) => semMoeda(String(l[chave])),
  });
  const todas: Record<string, ColunaTabela<LinhaCapital>> = {
    capital: { chave: "capital", titulo: tc.capital },
    carteira: num("carteira", tc.carteira),
    sacado: num("sacadoMes", quebra(tc.sacado)),
    r4: num("receitaMes4", duas(tc.receita, tc.a(t4))),
    r5: num("receitaMes5", duas(tc.receita, tc.a(t5))),
    r6: num("receitaMes6", duas(tc.receita, tc.a(t6))),
    ra: num("receitaAno5", duas(tc.receitaAno, tc.a(t5))),
    m8: num("margem8", duas(tc.margem, tc.perda(p8)), "verde"),
    m12: num("margem12", duas(tc.margem, tc.perda(p12))),
    cli: num("clientesComSaldo", duas(tc.clientes.split(" ")[0], tc.clientes.split(" ").slice(1).join(" "))),
    saq: num("saquesMes", quebra(tc.saques)),
  };
  const modo = compacto || largura < 760 ? "estreito" : largura < 1400 ? "medio" : "largo";
  const chaves =
    modo === "largo"
      ? Object.keys(todas)
      : modo === "medio"
        ? ["capital", "carteira", "sacado", "r5", "ra", "m8", "m12"]
        : ["capital", "r5", "m8"];
  const colunas = chaves.map((k) => todas[k]);
  const subconjunto = chaves.length < Object.keys(todas).length;

  const estilo: CSSProperties = modo === "largo" ? ({ ["--fs-corpo" as string]: "var(--fs-apoio)" } as CSSProperties) : {};
  const aperto = modo === "largo" ? "[&_td]:!px-[0.5em] [&_th]:!px-[0.5em]" : modo === "estreito" ? "[&_td]:!px-[0.4em] [&_th]:!px-[0.4em]" : "";

  return (
    <div ref={ref} className={`w-full font-texto ${className ?? ""}`}>
      <div className="mb-[0.7em] flex flex-wrap items-center justify-between gap-[0.6em]">
        <p className="text-corpo font-semibold text-texto-2">{tc.legenda}</p>
        <span className="text-apoio">
          <Selo tipo="projecao" tamanho="sm" />
        </span>
      </div>
      <div style={estilo} aria-hidden={subconjunto ? true : undefined}>
        <TabelaComparativa<LinhaCapital>
          legenda={tc.legenda}
          colunas={colunas}
          linhas={linhas}
          destaque={destaque}
          chaveLinha={(l) => l.capitalValor}
          className={`${aperto} [&_th]:leading-tight [&_thead_th]:normal-case [&_thead_th]:tracking-normal [&_tbody_th]:whitespace-nowrap`}
        />
      </div>
      <p className="mt-[0.7em] text-apoio text-texto-3">{tc.unidade}</p>
      {subconjunto ? (
        <TabelaSr
          legenda={tc.legenda}
          cabecalho={[tc.capital, tc.carteira, tc.sacado, `${tc.receita} ${tc.a(t4)}`, `${tc.receita} ${tc.a(t5)}`, `${tc.receita} ${tc.a(t6)}`, `${tc.receitaAno} ${tc.a(t5)}`, `${tc.margem} ${tc.perda(p8)}`, `${tc.margem} ${tc.perda(p12)}`, tc.clientes, tc.saques]}
          linhas={linhas.map((l) => [l.capital, l.carteira, l.sacadoMes, l.receitaMes4, l.receitaMes5, l.receitaMes6, l.receitaAno5, l.margem8, l.margem12, l.clientesComSaldo, l.saquesMes])}
        />
      ) : null}
    </div>
  );
}
