/**
 * Rótulos dos gráficos e do simulador.
 * Toda conta vem de src/lib/modelo.ts e todo número de src/data/vapti.ts;
 * aqui só se escolhe o formato (padrão do briefing) de cada valor.
 * Sem React: os testes (viz.test.ts) usam exatamente estas funções.
 */
import { preco, premissas, projeto } from "../../data/vapti";
import { formatBRL, formatInt, formatMi, formatPct } from "../../lib/formato";
import {
  efetivaPlanoDiario,
  efetivaSemanalSobreSacado,
  efetivaSobreSaldo,
  planoDiario,
  receitaMes,
  simular,
  simularFase,
  type NumeroFase,
  type ResultadoSimulacao,
} from "../../lib/modelo";

const cacheFmt = new Map<string, Intl.NumberFormat>();
function nf(min: number, max: number): Intl.NumberFormat {
  const k = `${min}-${max}`;
  let f = cacheFmt.get(k);
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: min, maximumFractionDigits: max });
    cacheFmt.set(k, f);
  }
  return f;
}

/** Sempre em milhões, até 2 casas: 850.000 → "R$ 0,85 mi"; 3.400.000 → "R$ 3,4 mi" (estilo da Tabela B). */
export function emMi(v: number): string {
  const s = v < 0 ? "-" : "";
  return `${s}R$ ${nf(0, 2).format(Math.abs(v) / 1e6)} mi`;
}

/** Capital redondo: 150.000 → "R$ 150 mil"; 1.000.000 → "R$ 1 mi" (estilo da Tabela A). */
export function formatCapital(v: number): string {
  return Math.round(v / 1e3) >= 1e3 ? formatMi(v) : `R$ ${formatInt(v / 1e3)} mil`;
}

/**
 * Carteira no simulador: a partir de meio milhão, em milhões ("R$ 0,85 mi", como na Tabela B);
 * abaixo disso, em mil ("R$ 127,5 mil", como na Tabela A).
 */
const CARTEIRA_EM_MI_A_PARTIR_DE = 500_000;
export function formatCarteira(v: number): string {
  return Math.abs(v) >= CARTEIRA_EM_MI_A_PARTIR_DE ? emMi(v) : formatMi(v);
}

/** Percentual sem ",0" à toa: 0,08 → "8%"; 0,085 → "8,5%". */
export function pctCurto(v: number): string {
  return `${nf(0, 1).format(v * 100)}%`;
}

/** Taxa semanal no formato da tabela de preço: 0,05 → "5,0%". */
export function formatTaxa(v: number): string {
  return formatPct(v, 1);
}

/**
 * Perda de equilíbrio: 2 casas quando a conta é exata em centésimos de ponto
 * (fase 1: 16,75%), senão 1 casa (fases 2 e 3: 15,9% e 15,8%).
 */
export function formatEquilibrio(v: number): string {
  const p = v * 100;
  const exata = (casas: number) => Math.abs(p * 10 ** casas - Math.round(p * 10 ** casas)) < 1e-6;
  if (exata(1)) return formatPct(v, 1);
  if (exata(2)) return formatPct(v, 2);
  return formatPct(v, 1);
}

/** Tira o "R$ " do começo (quando a unidade já está no título da coluna). */
export function semMoeda(s: string): string {
  return s.replace(/^(-?)R\$\s/, "$1");
}

/** Sinal de menos tipográfico. */
export function comMenos(s: string): string {
  return s.replace(/^-/, "−");
}

/* ------------------------------------------------------------------ */
/* Preço                                                               */
/* ------------------------------------------------------------------ */

const R400 = preco.base.valor;

/** Juros em reais de um saque de R$ 400 em 4 semanas, sobre o sacado: 5% → "R$ 80". */
export function jurosEm400(taxa: number): string {
  return formatBRL(receitaMes(R400, taxa), 0);
}

/** Taxa efetiva ao mês (TIR, 30 dias) do plano semanal sobre o sacado: 5% → "37,5%". */
export function efetivaMes(taxa: number): string {
  return formatPct(efetivaSemanalSobreSacado(taxa, R400));
}

/** Efetiva ao mês se a taxa fosse sobre o saldo (referência Zippi): 4% → "18,3%". */
export function efetivaSaldoMes(taxa: number): string {
  return formatPct(efetivaSobreSaldo(taxa));
}

/** Plano diário: parcela, juros e efetiva ao mês, formatados como na tabela 4.5. */
export function rotulosPlanoDiario(dias: number) {
  const p = planoDiario(dias);
  return {
    parcela: formatBRL(p.parcela),
    juros: formatBRL(p.juros),
    efetiva: formatPct(efetivaPlanoDiario(dias)),
  };
}

/* ------------------------------------------------------------------ */
/* Modelo                                                              */
/* ------------------------------------------------------------------ */

export interface RotulosResultado {
  carteira: string;
  sacadoMes: string;
  receitaMes: string;
  receitaAno: string;
  perdaMes: string;
  custoMes: string;
  fundingMes: string;
  margemMes: string;
  clientesComSaldo: string;
  saquesMes: string;
  perdaEquilibrio: string;
}

/** Rótulos de uma simulação (simulador e V15/V17): no cenário-base, iguais aos da Tabela B. */
export function rotulosResultado(r: ResultadoSimulacao): RotulosResultado {
  return {
    carteira: formatCarteira(r.carteira),
    sacadoMes: formatMi(r.sacadoMes),
    receitaMes: formatMi(r.receitaMes),
    receitaAno: formatMi(r.receitaAno),
    perdaMes: formatMi(r.perdaMes),
    custoMes: formatMi(r.custoMes),
    fundingMes: r.fundingMes === 0 ? "—" : formatMi(r.fundingMes),
    margemMes: comMenos(formatMi(r.margemMes)),
    clientesComSaldo: formatInt(r.clientesComSaldo),
    saquesMes: formatInt(r.saquesMes),
    perdaEquilibrio: formatEquilibrio(r.perdaEquilibrio),
  };
}

/** Simulação do simulador: capital da fase 1 escalado para a fase escolhida. */
export function simularCenario(p: { capital: number; taxa: number; perda: number; fase: NumeroFase }): ResultadoSimulacao {
  return simularFase(p.fase, p.taxa, p.perda, p.capital);
}

export const cenarioBase = {
  capital: projeto.capitalInicial.valor,
  taxa: premissas.taxaBase.valor,
  perda: premissas.perdaBase.valor,
  fase: 1 as NumeroFase,
};

export interface LinhaCapital {
  capitalValor: number;
  capital: string;
  carteira: string;
  sacadoMes: string;
  receitaMes4: string;
  receitaMes5: string;
  receitaMes6: string;
  receitaAno5: string;
  margem8: string;
  margem12: string;
  clientesComSaldo: string;
  saquesMes: string;
}

/** Uma linha da Tabela A calculada pelo modelo (fase 1). */
export function linhaTabelaCapital(capital: number): LinhaCapital {
  const t4 = preco.tabela[0].taxaSemanal.valor;
  const t5 = premissas.taxaBase.valor;
  const t6 = preco.tabela[3].taxaSemanal.valor;
  const p8 = premissas.perdaBase.valor;
  const p12 = premissas.perdaEstresse.valor;
  const base = simular({ capital, taxaSemanal: t5, perda: p8 });
  return {
    capitalValor: capital,
    capital: formatCapital(capital),
    carteira: formatMi(base.carteira),
    sacadoMes: formatMi(base.sacadoMes),
    receitaMes4: formatMi(simular({ capital, taxaSemanal: t4, perda: p8 }).receitaMes),
    receitaMes5: formatMi(base.receitaMes),
    receitaMes6: formatMi(simular({ capital, taxaSemanal: t6, perda: p8 }).receitaMes),
    receitaAno5: formatMi(base.receitaAno),
    margem8: formatMi(base.margemMes),
    margem12: formatMi(simular({ capital, taxaSemanal: t5, perda: p12 }).margemMes),
    clientesComSaldo: formatInt(base.clientesComSaldo),
    saquesMes: formatInt(base.saquesMes),
  };
}
