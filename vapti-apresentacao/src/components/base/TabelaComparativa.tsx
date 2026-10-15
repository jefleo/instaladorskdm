import type { ReactNode } from "react";

export interface ColunaTabela<L> {
  /** Identificador único da coluna. */
  chave: string;
  titulo: ReactNode;
  /** Conteúdo da célula. Padrão: `linha[chave]`. */
  celula?: (linha: L, indice: number) => ReactNode;
  /** Numérica: alinhada à direita, mono tabular. */
  numerica?: boolean;
  /** Cor da coluna inteira (ex.: Zippi em cinza, Vapti em verde). */
  tom?: "verde" | "coral" | "azul" | "cinza";
  /** Largura CSS opcional (ex.: "30%"). */
  largura?: string;
}

export interface TabelaComparativaProps<L> {
  /** Legenda acessível (vai no <caption>). */
  legenda: string;
  /** Mostrar a legenda na tela (padrão: só para leitor de tela). */
  legendaVisivel?: boolean;
  colunas: ColunaTabela<L>[];
  linhas: L[];
  /** Índice da linha destacada. */
  destaque?: number;
  /** Cor do destaque. Padrão verde. */
  tomDestaque?: "verde" | "coral" | "azul";
  /** A primeira coluna é cabeçalho de linha (<th scope="row">). Padrão true. */
  cabecalhoDeLinha?: boolean;
  /** Altura máxima com rolagem e cabeçalho fixo (ex.: "60vh"). */
  alturaMax?: string;
  /** Chave estável de cada linha. Padrão: índice. */
  chaveLinha?: (linha: L, indice: number) => string | number;
  className?: string;
}

const COR_COL = { verde: "text-verde", coral: "text-coral", azul: "text-azul", cinza: "text-cinza" } as const;
const DESTAQUE = {
  verde: { fundo: "var(--cor-verde-suave)", barra: "var(--cor-verde)" },
  coral: { fundo: "var(--cor-coral-suave)", barra: "var(--cor-coral)" },
  azul: { fundo: "var(--cor-azul-suave)", barra: "var(--cor-azul)" },
} as const;

/** Tabela comparativa genérica: números à direita em mono tabular, linha de destaque, cabeçalho fixo. */
export function TabelaComparativa<L>({
  legenda,
  legendaVisivel = false,
  colunas,
  linhas,
  destaque,
  tomDestaque = "verde",
  cabecalhoDeLinha = true,
  alturaMax,
  chaveLinha,
  className,
}: TabelaComparativaProps<L>) {
  const d = DESTAQUE[tomDestaque];
  return (
    <div
      className={`relative overflow-auto rounded-3 border border-borda bg-superficie ${className ?? ""}`}
      style={alturaMax ? { maxHeight: alturaMax } : undefined}
      tabIndex={alturaMax ? 0 : undefined}
      role={alturaMax ? "region" : undefined}
      aria-label={alturaMax ? legenda : undefined}
    >
      <table className="w-full border-collapse font-texto text-corpo">
        <caption
          className={
            legendaVisivel
              ? "caption-top px-[1em] pt-[0.9em] pb-[0.3em] text-left font-mono text-apoio uppercase tracking-[0.1em] text-texto-3"
              : "sr-only-vapti"
          }
        >
          {legenda}
        </caption>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th
                key={c.chave}
                scope="col"
                style={{ width: c.largura }}
                className={`sticky top-0 z-10 border-b border-borda-forte bg-superficie px-[1em] py-[0.7em] font-mono text-apoio font-medium uppercase tracking-[0.06em] ${
                  c.numerica ? "text-right" : "text-left"
                } ${c.tom ? COR_COL[c.tom] : "text-texto-3"}`}
              >
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => {
            const ativa = i === destaque;
            return (
              <tr
                key={chaveLinha ? chaveLinha(linha, i) : i}
                aria-current={ativa ? "true" : undefined}
                className="border-b border-borda last:border-b-0"
                style={ativa ? { background: d.fundo, boxShadow: `inset 5px 0 0 ${d.barra}` } : undefined}
              >
                {colunas.map((c, j) => {
                  const conteudo = c.celula ? c.celula(linha, i) : ((linha as Record<string, unknown>)[c.chave] as ReactNode);
                  const cls = `px-[1em] py-[0.62em] align-middle ${
                    c.numerica ? "text-right font-mono tabular-nums tracking-[-0.02em]" : "text-left"
                  } ${c.tom ? COR_COL[c.tom] : j === 0 ? "text-texto" : "text-texto-2"} ${ativa ? "font-bold" : ""} ${
                    ativa && !c.tom && j > 0 ? "!text-texto" : ""
                  }`;
                  return j === 0 && cabecalhoDeLinha ? (
                    <th key={c.chave} scope="row" className={`${cls} font-semibold`}>
                      {conteudo}
                    </th>
                  ) : (
                    <td key={c.chave} className={cls}>
                      {conteudo}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
