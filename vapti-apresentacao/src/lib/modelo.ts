/**
 * Modelo financeiro da Vapti — fórmulas da seção 4.8 do briefing.
 *
 * Todas as funções são puras. Taxas e perdas em fração (5% = 0.05).
 * Valores em reais. Toda constante vem de `premissas` em src/data/vapti.ts.
 */
import { premissas, produto, projeto } from "../data/vapti";

/* ------------------------------------------------------------------ */
/* Constantes (lidas das premissas)                                    */
/* ------------------------------------------------------------------ */

const PCT_NA_RUA = premissas.pctNaRua.valor; // 0,85
const SALDO_MEDIO = premissas.saldoMedio.valor; // 0,625
const SEMANAS_MES = premissas.semanasPorMes.valor; // 52/12
const SEMANAS_SAQUE = premissas.semanasPorSaque.valor; // 4
const SAQUE_MEDIO = premissas.saqueMedio.valor; // R$ 400
const CUSTO_SAQUE = premissas.custoPorSaque.valor; // R$ 13
const FUNDING = premissas.fundingMes.valor; // 2% ao mês
const MESES_ANO = premissas.mesesPorAno.valor; // 12
const DIAS_MES = premissas.diasPorMes.valor; // 30
const DIAS_SEMANA = premissas.diasPorSemana.valor; // 7
const AMORTIZACAO = produto.amortizacaoSemanal.valor; // 25% por semana
const PARCELAS = produto.parcelasSemanais.valor; // 4
/** Capital inicial padrão: R$ 1 mi (Briefing 4.1). */
const CAPITAL_PADRAO = projeto.capitalInicial.valor;

/* ------------------------------------------------------------------ */
/* Fórmulas básicas                                                    */
/* ------------------------------------------------------------------ */

/** Carteira na rua na fase 1: capital × 0,85. */
export function carteira(capital: number): number {
  return capital * PCT_NA_RUA;
}

/** Valor sacado por mês: carteira ÷ 0,625 × (52/12) ÷ 4. */
export function sacadoMes(carteira: number): number {
  return (carteira / SALDO_MEDIO) * SEMANAS_MES / SEMANAS_SAQUE;
}

/** Receita de juros por mês: sacado × taxa semanal × 4 semanas. */
export function receitaMes(sacado: number, taxaSemanal: number): number {
  return sacado * taxaSemanal * SEMANAS_SAQUE;
}

/** Perda por mês, medida sobre o valor sacado. */
export function perdaMes(sacado: number, perda: number): number {
  return sacado * perda;
}

/** Custo direto por mês: (sacado ÷ R$ 400) saques × R$ 13. */
export function custoMes(sacado: number): number {
  return (sacado / SAQUE_MEDIO) * CUSTO_SAQUE;
}

/** Custo do funding sênior por mês: dívida × 2%. */
export function fundingMes(dividaSenior: number): number {
  return dividaSenior * FUNDING;
}

/** Clientes com saldo ao mesmo tempo: carteira ÷ (0,625 × R$ 400). */
export function clientesComSaldo(carteira: number): number {
  return carteira / (SALDO_MEDIO * SAQUE_MEDIO);
}

/** Saques por mês: sacado ÷ R$ 400. */
export function saquesMes(sacado: number): number {
  return sacado / SAQUE_MEDIO;
}

/**
 * Perda de equilíbrio (margem zero), como fração do sacado:
 * (receita − custo − funding) ÷ sacado.
 * Na fase 1 (sem dívida) reduz a taxa × 4 − 13/400.
 */
export function perdaEquilibrio(p: { taxaSemanal: number; carteira: number; dividaSenior?: number }): number {
  const s = sacadoMes(p.carteira);
  if (s === 0) return p.taxaSemanal * SEMANAS_SAQUE - CUSTO_SAQUE / SAQUE_MEDIO;
  return (receitaMes(s, p.taxaSemanal) - custoMes(s) - fundingMes(p.dividaSenior ?? 0)) / s;
}

/* ------------------------------------------------------------------ */
/* Simulação completa                                                  */
/* ------------------------------------------------------------------ */

export interface EntradaSimulacao {
  /** Capital próprio da fase 1. Usado se `carteira` não vier. */
  capital?: number;
  /** Carteira na rua. Tem prioridade sobre `capital`. */
  carteira?: number;
  /** Dívida sênior (fases 2 e 3). Padrão: 0. */
  dividaSenior?: number;
  taxaSemanal: number;
  perda: number;
}

export interface ResultadoSimulacao {
  carteira: number;
  sacadoMes: number;
  receitaMes: number;
  receitaAno: number;
  perdaMes: number;
  custoMes: number;
  fundingMes: number;
  /** Margem antes de equipe, tecnologia e impostos. */
  margemMes: number;
  clientesComSaldo: number;
  saquesMes: number;
  perdaEquilibrio: number;
}

/** Roda o modelo inteiro da seção 4.8. */
export function simular(e: EntradaSimulacao): ResultadoSimulacao {
  const cart = e.carteira ?? carteira(e.capital ?? CAPITAL_PADRAO);
  const divida = e.dividaSenior ?? 0;
  const s = sacadoMes(cart);
  const rec = receitaMes(s, e.taxaSemanal);
  const per = perdaMes(s, e.perda);
  const cus = custoMes(s);
  const fun = fundingMes(divida);
  return {
    carteira: cart,
    sacadoMes: s,
    receitaMes: rec,
    receitaAno: rec * MESES_ANO,
    perdaMes: per,
    custoMes: cus,
    fundingMes: fun,
    margemMes: rec - per - cus - fun,
    clientesComSaldo: clientesComSaldo(cart),
    saquesMes: saquesMes(s),
    perdaEquilibrio: perdaEquilibrio({ taxaSemanal: e.taxaSemanal, carteira: cart, dividaSenior: divida }),
  };
}

export type NumeroFase = 1 | 2 | 3;

/**
 * Estrutura de carteira e dívida de cada fase (Tabela B).
 *
 * Premissa derivada (não escrita no briefing, deduzida da Tabela B):
 * - fase 1: carteira = capital × 0,85, sem dívida;
 * - fase 2: carteira = 4 × carteira da fase 1; sênior = 75% da carteira;
 * - fase 3: carteira = 15 × carteira da fase 1; sênior = 80% da carteira.
 * Com R$ 1 mi: 0,85 mi; 3,4 mi (sênior 2,55 mi); 12,75 mi (sênior 10,2 mi).
 */
export function estruturaFase(
  fase: NumeroFase,
  capitalFase1: number = CAPITAL_PADRAO,
): { carteira: number; dividaSenior: number } {
  const c1 = carteira(capitalFase1);
  if (fase === 1) return { carteira: c1, dividaSenior: 0 };
  if (fase === 2) {
    const c2 = c1 * premissas.multCarteiraFase2.valor;
    return { carteira: c2, dividaSenior: c2 * premissas.seniorFase2.valor };
  }
  const c3 = c1 * premissas.multCarteiraFase3.valor;
  return { carteira: c3, dividaSenior: c3 * premissas.seniorFase3.valor };
}

/** Simula uma fase da Tabela B. `capitalFase1` padrão: R$ 1 mi. */
export function simularFase(
  fase: NumeroFase,
  taxaSemanal: number,
  perda: number,
  capitalFase1: number = CAPITAL_PADRAO,
): ResultadoSimulacao {
  const { carteira: c, dividaSenior } = estruturaFase(fase, capitalFase1);
  return simular({ carteira: c, dividaSenior, taxaSemanal, perda });
}

export interface PontoCurva {
  perda: number;
  margem: number;
}

/** Margem por mês de uma fase para perdas entre `de` e `ate` (gráfico margem × perda). */
export function curvaMargemPerda(
  fase: NumeroFase,
  taxa: number,
  de = 0.04,
  ate = 0.2,
  passo = 0.005,
  capitalFase1: number = CAPITAL_PADRAO,
): PontoCurva[] {
  const pontos: PontoCurva[] = [];
  const n = Math.round((ate - de) / passo);
  for (let i = 0; i <= n; i++) {
    const perda = Number((de + i * passo).toFixed(10));
    pontos.push({ perda, margem: simularFase(fase, taxa, perda, capitalFase1).margemMes });
  }
  return pontos;
}

/* ------------------------------------------------------------------ */
/* Taxa efetiva mensal (TIR)                                           */
/* ------------------------------------------------------------------ */

export interface FluxoCaixa {
  /** Dia corrido (0 = liberação). */
  dia: number;
  /** Valor: negativo sai do credor, positivo entra. */
  valor: number;
}

/** Valor presente do fluxo a uma taxa diária. */
function vpl(fluxo: FluxoCaixa[], iDia: number): number {
  return fluxo.reduce((acc, f) => acc + f.valor / Math.pow(1 + iDia, f.dia), 0);
}

/**
 * Taxa efetiva mensal: TIR diária do fluxo (por bisseção), convertida
 * para 30 dias: (1 + i_dia)^30 − 1.
 */
export function taxaEfetivaMensal(fluxo: FluxoCaixa[]): number {
  let lo = -0.99;
  let hi = 1;
  let fLo = vpl(fluxo, lo);
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    const fMid = vpl(fluxo, mid);
    if (Math.abs(fMid) < 1e-12) {
      lo = hi = mid;
      break;
    }
    if (Math.sign(fMid) === Math.sign(fLo)) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
    }
  }
  const iDia = (lo + hi) / 2;
  return Math.pow(1 + iDia, DIAS_MES) - 1;
}

/**
 * Efetiva ao mês do produto padrão: 4 parcelas semanais (dias 7, 14, 21, 28),
 * cada uma com 25% do valor + juros da semana sobre o sacado.
 */
export function efetivaSemanalSobreSacado(taxa: number, valor: number = SAQUE_MEDIO): number {
  const parcela = valor * AMORTIZACAO + valor * taxa;
  const fluxo: FluxoCaixa[] = [{ dia: 0, valor: -valor }];
  for (let k = 1; k <= PARCELAS; k++) fluxo.push({ dia: k * DIAS_SEMANA, valor: parcela });
  return taxaEfetivaMensal(fluxo);
}

/** Efetiva ao mês se a taxa semanal fosse sobre o saldo: (1 + taxa)^(30/7) − 1. */
export function efetivaSobreSaldo(taxa: number): number {
  return Math.pow(1 + taxa, DIAS_MES / DIAS_SEMANA) - 1;
}

/** Juros e parcela do plano diário. Juros = valor × taxa/7 × dias. */
export function planoDiario(
  dias: number,
  taxaSemanal: number = premissas.taxaBase.valor,
  valor: number = SAQUE_MEDIO,
): { juros: number; parcela: number } {
  const juros = (valor * taxaSemanal * dias) / DIAS_SEMANA;
  return { juros, parcela: (valor + juros) / dias };
}

/** Efetiva ao mês do plano diário: parcelas iguais nos dias 1..N. */
export function efetivaPlanoDiario(
  dias: number,
  taxaSemanal: number = premissas.taxaBase.valor,
  valor: number = SAQUE_MEDIO,
): number {
  const { parcela } = planoDiario(dias, taxaSemanal, valor);
  const fluxo: FluxoCaixa[] = [{ dia: 0, valor: -valor }];
  for (let d = 1; d <= dias; d++) fluxo.push({ dia: d, valor: parcela });
  return taxaEfetivaMensal(fluxo);
}

/* ------------------------------------------------------------------ */
/* Simulador do cliente final (um saque)                               */
/* ------------------------------------------------------------------ */

export interface SaqueCliente {
  /** Quantidade de parcelas. */
  parcelas: number;
  /** Valor de cada parcela (todas iguais). */
  parcela: number;
  /** Juros totais em reais. */
  juros: number;
  /** Total pago: valor + juros. */
  total: number;
  /** Taxa efetiva ao mês (TIR, 30 dias). */
  efetivaMes: number;
  /** Dias corridos de cada parcela, contados do saque. */
  dias: number[];
}

/**
 * Um saque do cliente, do jeito que ele paga:
 * - semanal: 4 parcelas nos dias 7, 14, 21 e 28, com 25% do valor + juros da semana sobre o sacado;
 * - diário: N parcelas iguais nos dias 1..N, juros = valor × taxa/7 × N (Briefing 4.5).
 */
export function simularSaqueCliente(p: { valor: number; tipo: "semanal" | "diario"; parcelas: number; taxaSemanal: number }): SaqueCliente {
  if (p.tipo === "semanal") {
    const parcela = p.valor * AMORTIZACAO + p.valor * p.taxaSemanal;
    const juros = p.valor * p.taxaSemanal * PARCELAS;
    return {
      parcelas: PARCELAS,
      parcela,
      juros,
      total: p.valor + juros,
      efetivaMes: efetivaSemanalSobreSacado(p.taxaSemanal, p.valor),
      dias: Array.from({ length: PARCELAS }, (_, k) => (k + 1) * DIAS_SEMANA),
    };
  }
  const { juros, parcela } = planoDiario(p.parcelas, p.taxaSemanal, p.valor);
  return {
    parcelas: p.parcelas,
    parcela,
    juros,
    total: p.valor + juros,
    efetivaMes: efetivaPlanoDiario(p.parcelas, p.taxaSemanal, p.valor),
    dias: Array.from({ length: p.parcelas }, (_, k) => k + 1),
  };
}
