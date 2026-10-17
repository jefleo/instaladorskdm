/**
 * Os rótulos que os gráficos e o simulador mostram (rotulos.ts) têm de ser
 * exatamente os do briefing (Tabelas A e B, preço 4.5) no cenário-base. Sem DOM.
 */
import { describe, expect, it } from "vitest";
import { equilibrioPorTaxa, fase1, fases, niveis, preco, premissas, projeto, tabelaA } from "../../data/vapti";
import { formatMi } from "../../lib/formato";
import { simularFase } from "../../lib/modelo";
import {
  cenarioBase,
  efetivaMes,
  efetivaSaldoMes,
  emMi,
  formatCapital,
  formatEquilibrio,
  jurosEm400,
  linhaTabelaCapital,
  pctCurto,
  rotulosPlanoDiario,
  rotulosResultado,
  simularCenario,
} from "./rotulos";

describe("simulador no cenário-base (R$ 1 mi, 5%, 8%, fase 1) = Tabela B", () => {
  const rot = rotulosResultado(simularCenario(cenarioBase));
  const f1 = fases[0];
  it("parâmetros do cenário-base vêm de vapti.ts", () => {
    expect(cenarioBase).toEqual({ capital: projeto.capitalInicial.valor, taxa: premissas.taxaBase.valor, perda: premissas.perdaBase.valor, fase: 1 });
  });
  it("rótulos", () => {
    expect(rot.carteira).toBe(f1.carteira.rotulo); // R$ 0,85 mi
    expect(rot.sacadoMes).toBe(f1.sacadoMes.rotulo); // R$ 1,47 mi
    expect(rot.receitaMes).toBe(tabelaA[3].receitaMes5.rotulo); // R$ 294,7 mil
    expect(rot.receitaAno).toBe(f1.receitaAno.rotulo); // R$ 3,54 mi
    expect(rot.perdaMes).toBe(f1.perdaMes8.rotulo); // R$ 117,9 mil
    expect(rot.custoMes).toBe(f1.custoMes.rotulo); // R$ 47,9 mil
    expect(rot.fundingMes).toBe(f1.fundingMes.rotulo); // —
    expect(rot.margemMes).toBe(f1.margem8.rotulo); // R$ 128,9 mil
    expect(rot.clientesComSaldo).toBe(tabelaA[3].clientesComSaldo.rotulo); // 3.400
    expect(rot.saquesMes).toBe(tabelaA[3].saquesMes.rotulo); // 3.683
    expect(rot.perdaEquilibrio).toBe(f1.perdaEquilibrio.rotulo); // 16,75%
  });
  it("margem com perda de 12%", () => {
    expect(rotulosResultado(simularCenario({ ...cenarioBase, perda: premissas.perdaEstresse.valor })).margemMes).toBe(f1.margem12.rotulo);
  });
});

describe("as três fases (V17 e simulador nas fases 2 e 3)", () => {
  for (const f of fases) {
    it(`fase ${f.fase}`, () => {
      const r8 = rotulosResultado(simularCenario({ ...cenarioBase, fase: f.fase }));
      const r12 = rotulosResultado(simularCenario({ ...cenarioBase, fase: f.fase, perda: premissas.perdaEstresse.valor }));
      expect(emMi(simularFase(f.fase, cenarioBase.taxa, cenarioBase.perda).carteira)).toBe(f.carteira.rotulo);
      expect(r8.sacadoMes).toBe(f.sacadoMes.rotulo);
      expect(r8.receitaAno).toBe(f.receitaAno.rotulo);
      expect(r8.perdaMes).toBe(f.perdaMes8.rotulo);
      expect(r8.custoMes).toBe(f.custoMes.rotulo);
      expect(r8.fundingMes).toBe(f.fundingMes.rotulo);
      expect(r8.margemMes).toBe(f.margem8.rotulo);
      expect(r12.margemMes).toBe(f.margem12.rotulo);
      expect(r8.perdaEquilibrio).toBe(f.perdaEquilibrio.rotulo);
    });
  }
});

describe("Tabela A calculada (TabelaCapital)", () => {
  for (const l of tabelaA) {
    it(`capital ${l.capital.rotulo}`, () => {
      const c = linhaTabelaCapital(l.capital.valor);
      expect(c.capital).toBe(l.capital.rotulo);
      expect(c.carteira).toBe(l.carteira.rotulo);
      expect(c.sacadoMes).toBe(l.sacadoMes.rotulo);
      expect(c.receitaMes4).toBe(l.receitaMes4.rotulo);
      expect(c.receitaMes5).toBe(l.receitaMes5.rotulo);
      expect(c.receitaMes6).toBe(l.receitaMes6.rotulo);
      expect(c.receitaAno5).toBe(l.receitaAno5.rotulo);
      expect(c.margem8).toBe(l.margem8.rotulo);
      expect(c.margem12).toBe(l.margem12.rotulo);
      expect(c.clientesComSaldo).toBe(l.clientesComSaldo.rotulo);
      expect(c.saquesMes).toBe(l.saquesMes.rotulo);
    });
  }
});

describe("V15 — cascata da fase 1", () => {
  it("rótulos", () => {
    const r = simularFase(1, premissas.taxaBase.valor, premissas.perdaBase.valor, projeto.capitalInicial.valor);
    expect(formatCapital(projeto.capitalInicial.valor)).toBe(fase1.capital.rotulo);
    expect(emMi(r.carteira)).toBe(fase1.carteira.rotulo);
    expect(formatMi(r.sacadoMes)).toBe(fase1.sacadoMes.rotulo);
    expect(formatMi(r.receitaMes)).toBe(fase1.receitaMes.rotulo);
    expect(formatMi(r.receitaAno)).toBe(fase1.receitaAno.rotulo);
    expect(formatMi(r.perdaMes)).toBe(fase1.perdaMes.rotulo);
    expect(formatMi(r.custoMes)).toBe(fase1.custoMes.rotulo);
    expect(formatMi(r.margemMes)).toBe(fase1.margemMes.rotulo);
  });
});

describe("V16 — curva margem × perda", () => {
  it("equilíbrio por taxa", () => {
    for (const e of equilibrioPorTaxa) {
      expect(formatEquilibrio(simularFase(1, e.taxa.valor, premissas.perdaBase.valor).perdaEquilibrio)).toBe(e.perda.rotulo);
    }
  });
  it("perdas marcadas", () => {
    expect(pctCurto(premissas.perdaBase.valor)).toBe(premissas.perdaBase.rotulo);
    expect(pctCurto(premissas.perdaEstresse.valor)).toBe(premissas.perdaEstresse.rotulo);
  });
});

describe("V08 e V14 — preço", () => {
  it("efetiva e juros de cada nível", () => {
    for (const nv of niveis) {
      expect(efetivaMes(nv.taxaSemanal.valor)).toBe(nv.efetivaMes.rotulo);
      expect(jurosEm400(nv.taxaSemanal.valor)).toBe(nv.jurosExemplo.rotulo);
    }
  });
  it("Zippi: 18,3% ao mês (sobre o saldo)", () => {
    expect(efetivaSaldoMes(preco.zippiTaxaSemanal.valor)).toBe(preco.zippiEfetivaMes.rotulo);
  });
  it("exemplo do cenário-base", () => {
    expect(efetivaMes(preco.exemplo.taxa.valor)).toBe(preco.exemplo.efetivaMes.rotulo);
    expect(jurosEm400(preco.exemplo.taxa.valor)).toBe(preco.exemplo.juros.rotulo);
  });
  it("plano diário", () => {
    for (const p of preco.planoDiario) {
      const r = rotulosPlanoDiario(p.dias);
      expect(r.parcela).toBe(p.parcela.rotulo);
      expect(r.juros).toBe(p.juros.rotulo);
      expect(r.efetiva).toBe(p.efetivaMes.rotulo);
    }
  });
});
