/**
 * O modelo deve reproduzir as Tabelas A e B e as taxas efetivas do briefing (seções 4.5 e 4.8).
 * Tolerância relativa de ±0,5%: os valores do briefing são arredondados (ex.: R$ 1,47 mi = 1.473.333).
 */
import { describe, expect, it } from "vitest";
import { equilibrioPorTaxa, fase1, fases, preco, premissas, produto, projeto, tabelaA, type Num } from "../data/vapti";
import {
  carteira,
  curvaMargemPerda,
  efetivaPlanoDiario,
  efetivaSemanalSobreSacado,
  efetivaSobreSaldo,
  estruturaFase,
  perdaEquilibrio,
  planoDiario,
  simular,
  simularFase,
  taxaEfetivaMensal,
} from "./modelo";

const TOL = 0.005;

/** Compara com tolerância relativa; valor esperado zero exige zero absoluto. */
function bate(calculado: number, esperado: Num | number) {
  const e = typeof esperado === "number" ? esperado : esperado.valor;
  if (e === 0) {
    expect(Math.abs(calculado)).toBeLessThan(1e-9);
    return;
  }
  const erro = Math.abs(calculado - e) / Math.abs(e);
  expect(erro, `calculado ${calculado}, briefing ${e}`).toBeLessThanOrEqual(TOL);
}

const T4 = preco.tabela[0].taxaSemanal.valor;
const T5 = premissas.taxaBase.valor;
const T6 = preco.tabela[3].taxaSemanal.valor;
const P8 = premissas.perdaBase.valor;
const P12 = premissas.perdaEstresse.valor;

describe("Tabela A — variação de capital, fase 1", () => {
  for (const l of tabelaA) {
    describe(`capital ${l.capital.rotulo}`, () => {
      const cap = l.capital.valor;
      const base = simular({ capital: cap, taxaSemanal: T5, perda: P8 });

      it("carteira", () => bate(base.carteira, l.carteira));
      it("sacado/mês", () => bate(base.sacadoMes, l.sacadoMes));
      it("receita/mês a 4%", () => bate(simular({ capital: cap, taxaSemanal: T4, perda: P8 }).receitaMes, l.receitaMes4));
      it("receita/mês a 5%", () => bate(base.receitaMes, l.receitaMes5));
      it("receita/mês a 6%", () => bate(simular({ capital: cap, taxaSemanal: T6, perda: P8 }).receitaMes, l.receitaMes6));
      it("receita/ano a 5%", () => bate(base.receitaAno, l.receitaAno5));
      it("margem/mês a 5%, perda 8%", () => bate(base.margemMes, l.margem8));
      it("margem/mês a 5%, perda 12%", () => bate(simular({ capital: cap, taxaSemanal: T5, perda: P12 }).margemMes, l.margem12));
      it("clientes com saldo", () => bate(base.clientesComSaldo, l.clientesComSaldo));
      it("saques/mês", () => bate(base.saquesMes, l.saquesMes));
    });
  }
});

describe("Tabela B — as três fases, a 5% por semana", () => {
  for (const f of fases) {
    describe(`fase ${f.fase}`, () => {
      const r8 = simularFase(f.fase, T5, P8);
      const r12 = simularFase(f.fase, T5, P12);
      const est = estruturaFase(f.fase);

      it("carteira", () => bate(r8.carteira, f.carteira));
      it("dívida sênior", () => bate(est.dividaSenior, f.dividaSenior));
      it("capital próprio (carteira − sênior)", () => bate(est.carteira - est.dividaSenior, f.capitalProprio));
      it("sacado/mês", () => bate(r8.sacadoMes, f.sacadoMes));
      it("receita/ano", () => bate(r8.receitaAno, f.receitaAno));
      it("perda/mês (8%)", () => bate(r8.perdaMes, f.perdaMes8));
      it("custo/mês", () => bate(r8.custoMes, f.custoMes));
      it("funding/mês", () => bate(r8.fundingMes, f.fundingMes));
      it("margem/mês, perda 8%", () => bate(r8.margemMes, f.margem8));
      it("margem/mês, perda 12%", () => bate(r12.margemMes, f.margem12));
      it("perda de equilíbrio", () => bate(r8.perdaEquilibrio, f.perdaEquilibrio));
    });
  }

  it("margem zera na perda de equilíbrio", () => {
    for (const f of fases) {
      const pe = simularFase(f.fase, T5, P8).perdaEquilibrio;
      expect(Math.abs(simularFase(f.fase, T5, pe).margemMes)).toBeLessThan(1e-6);
    }
  });
});

describe("Perda de equilíbrio da fase 1 por taxa", () => {
  for (const e of equilibrioPorTaxa) {
    it(`${e.taxa.rotulo} → ${e.perda.rotulo}`, () => {
      const pe = perdaEquilibrio({ taxaSemanal: e.taxa.valor, carteira: carteira(projeto.capitalInicial.valor) });
      bate(pe, e.perda);
      // Forma fechada da fase 1: taxa × 4 − 13/400.
      expect(pe).toBeCloseTo(e.taxa.valor * 4 - premissas.custoPorSaque.valor / premissas.saqueMedio.valor, 12);
    });
  }
});

describe("Leitura obrigatória: entre 8% e 12% de perda a margem da fase 1 cai R$ 59 mil", () => {
  it("queda de margem", () => {
    bate(simularFase(1, T5, P8).margemMes - simularFase(1, T5, P12).margemMes, fase1.quedaMargem8a12);
  });
});

describe("4.5 — preço, a partir de R$ 400", () => {
  const valor = preco.base.valor;
  for (const l of preco.tabela) {
    describe(`taxa ${l.taxaSemanal.rotulo}`, () => {
      const t = l.taxaSemanal.valor;
      it("juros sobre o sacado", () => bate(valor * t * produto.parcelasSemanais.valor, l.juros));
      it("parcela semanal", () => bate(valor * produto.amortizacaoSemanal.valor + valor * t, l.parcela));
      it("efetiva ao mês sobre o sacado (TIR)", () => bate(efetivaSemanalSobreSacado(t, valor), l.efetivaSacado));
      it("efetiva ao mês sobre o saldo", () => bate(efetivaSobreSaldo(t), l.efetivaSaldo));
    });
  }

  it("Zippi: 4% por semana sobre o saldo = 18,3% ao mês", () => {
    bate(efetivaSobreSaldo(preco.zippiTaxaSemanal.valor), preco.zippiEfetivaMes);
  });

  it("exemplo do cenário-base", () => {
    const ex = preco.exemplo;
    bate(ex.sacado.valor * ex.taxa.valor * produto.parcelasSemanais.valor, ex.juros);
    bate(efetivaSemanalSobreSacado(ex.taxa.valor), ex.efetivaMes);
  });

  for (const p of preco.planoDiario) {
    describe(`plano diário de ${p.dias} dias`, () => {
      const r = planoDiario(p.dias);
      it("juros", () => bate(r.juros, p.juros));
      it("parcela por dia", () => bate(r.parcela, p.parcela));
      it("efetiva ao mês (TIR)", () => bate(efetivaPlanoDiario(p.dias), p.efetivaMes));
    });
  }
});

describe("TIR", () => {
  it("fluxo de 1 período a 10% em 30 dias dá 10% ao mês", () => {
    expect(taxaEfetivaMensal([{ dia: 0, valor: -100 }, { dia: 30, valor: 110 }])).toBeCloseTo(0.1, 10);
  });
});

describe("curvaMargemPerda", () => {
  it("vai de 4% a 20% e é decrescente", () => {
    const c = curvaMargemPerda(1, T5, 0.04, 0.2, 0.01);
    expect(c).toHaveLength(17);
    expect(c[0].perda).toBe(0.04);
    expect(c[c.length - 1].perda).toBe(0.2);
    for (let i = 1; i < c.length; i++) expect(c[i].margem).toBeLessThan(c[i - 1].margem);
  });
});
