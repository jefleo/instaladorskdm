/**
 * Formatação no padrão brasileiro (Intl pt-BR).
 * Usa espaço comum depois de "R$" para casar com o texto do briefing.
 */

const cache = new Map<string, Intl.NumberFormat>();

/** Formatador pt-BR com casas decimais mínimas e máximas, reaproveitado. */
function fmt(min: number, max: number): Intl.NumberFormat {
  const chave = `${min}-${max}`;
  let f = cache.get(chave);
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: min, maximumFractionDigits: max });
    cache.set(chave, f);
  }
  return f;
}

/** Sinal de menos para valores negativos (o número em si vai sem sinal). */
const sinal = (v: number): string => (v < 0 && Math.abs(v) > 0 ? "-" : "");

/** Moeda: formatBRL(1234.56) → "R$ 1.234,56"; formatBRL(400, 0) → "R$ 400". */
export function formatBRL(v: number, casas = 2): string {
  return `${sinal(v)}R$ ${fmt(casas, casas).format(Math.abs(v))}`;
}

/** Percentual: formatPct(0.375) → "37,5%"; formatPct(0.1675, 2) → "16,75%". */
export function formatPct(v: number, casas = 1): string {
  return `${fmt(casas, casas).format(v * 100)}%`;
}

/** Inteiro com separador de milhar: formatInt(3683.3) → "3.683". */
export function formatInt(v: number): string {
  return fmt(0, 0).format(v);
}

/**
 * Valor compacto no estilo do briefing:
 * - a partir de R$ 1 mi: até 2 casas → "R$ 1,47 mi", "R$ 3,4 mi", "R$ 12,75 mi", "R$ 1 mi";
 * - a partir de R$ 1 mil: 1 casa → "R$ 850,0 mil", "R$ 294,7 mil";
 * - abaixo disso: reais inteiros → "R$ 400".
 */
export function formatMi(v: number): string {
  const a = Math.abs(v);
  const s = sinal(v);
  // Arredonda antes de escolher a escala, para 999.960 virar "R$ 1 mi" e não "R$ 1.000,0 mil".
  if (Math.round(a / 1e4) >= 100) return `${s}R$ ${fmt(0, 2).format(a / 1e6)} mi`;
  if (Math.round(a / 100) >= 10) return `${s}R$ ${fmt(1, 1).format(a / 1e3)} mil`;
  return `${s}R$ ${fmt(0, 0).format(a)}`;
}
