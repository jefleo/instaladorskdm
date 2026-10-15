import type { Num } from "../data/vapti";

/**
 * Formatador para a contagem do <Kpi> a partir de um `Num` de src/data/vapti.ts.
 * Lê o padrão do próprio rótulo (prefixo, casas decimais, sufixo) e reproduz esse
 * padrão nos valores intermediários. No valor final devolve o rótulo exato.
 */
export function formatadorDe(num: Num): (v: number) => string {
  const m = /^(.*?)(\d[\d.]*(?:,\d+)?)(.*)$/.exec(num.rotulo);
  if (!m) return () => num.rotulo;
  const [, prefixo, numero, sufixo] = m;
  const casas = numero.includes(",") ? numero.split(",")[1].length : 0;
  const exibido = Number(numero.replace(/\./g, "").replace(",", "."));
  if (!exibido) return () => num.rotulo;
  const escala = num.valor / exibido;
  const f = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return (v: number) => {
    if (Math.abs(v - num.valor) < Math.abs(num.valor) * 1e-6) return num.rotulo;
    return `${prefixo}${f.format(v / escala)}${sufixo}`;
  };
}

/** Primeira letra em minúscula (para encaixar um item de lista no meio da frase). */
export const minusc = (s: string): string => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** Remove o marcador " · projeção" de um título quando o selo já diz isso. */
export function semMarcaProjecao(titulo: string): { titulo: string; projecao: boolean } {
  const m = /\s*·\s*projeção\s*$/i.exec(titulo);
  if (!m) return { titulo, projecao: false };
  return { titulo: titulo.slice(0, m.index), projecao: true };
}

/** Domínio de uma URL, sem "www.". */
export function dominio(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
