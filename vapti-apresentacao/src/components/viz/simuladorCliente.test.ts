/**
 * Simulador do cliente final (tela 06c): reproduz o preço do briefing (4.5 e 4.6)
 * e as regras do Adendo 15/10 (diário não varia por nível; taxa equivalente de 5% por semana).
 */
import { describe, expect, it } from "vitest";
import { niveis, preco, produto, simuladorCliente as cfg } from "../../data/vapti";
import { simularSaqueCliente } from "../../lib/modelo";
import { formatReaisSaque, rotulosSaqueCliente } from "./rotulos";

const semanal = (valor: number, taxa: number) => simularSaqueCliente({ valor, tipo: "semanal", parcelas: produto.parcelasSemanais.valor, taxaSemanal: taxa });
const diario = (valor: number, dias: number) => simularSaqueCliente({ valor, tipo: "diario", parcelas: dias, taxaSemanal: cfg.taxaDiario.valor });

describe("exemplo do briefing: R$ 400, 4 semanas, Bronze", () => {
  const bronze = niveis.find((n) => n.id === "bronze")!;
  const r = semanal(400, bronze.taxaSemanal.valor);
  const rot = rotulosSaqueCliente(r, "semanal");
  it("4 × R$ 120, R$ 80 de juros, R$ 480 no total, 37,5% ao mês", () => {
    expect(rot.parcelas).toBe(`${produto.parcelasSemanais.rotulo} × ${preco.exemplo.parcela.rotulo}`);
    expect(rot.parcelas).toBe("4 × R$ 120");
    expect(rot.juros).toBe("R$ 80");
    expect(rot.total).toBe("R$ 480");
    expect(rot.efetiva).toBe("37,5%");
    expect(rot.efetiva).toBe(preco.exemplo.efetivaMes.rotulo);
  });
  it("parcelas nos dias 7, 14, 21 e 28", () => {
    expect(r.dias).toEqual([7, 14, 21, 28]);
  });
  it("é o estado inicial do simulador", () => {
    expect(cfg.valorInicial.valor).toBe(400);
    expect(cfg.planos[0].tipo).toBe("semanal");
    expect(cfg.nivelInicial).toBe("bronze");
  });
});

describe("o mesmo saque de R$ 400 em cada nível = tabela 4.6", () => {
  for (const nv of niveis) {
    it(nv.nome, () => {
      const rot = rotulosSaqueCliente(semanal(400, nv.taxaSemanal.valor), "semanal");
      expect(rot.juros).toBe(nv.jurosExemplo.rotulo);
      expect(rot.efetiva).toBe(nv.efetivaMes.rotulo);
    });
  }
  it("juros caem de Entrada para Ouro", () => {
    const juros = niveis.map((nv) => semanal(400, nv.taxaSemanal.valor).juros);
    expect([...juros].sort((a, b) => b - a)).toEqual(juros);
  });
});

describe("plano diário de R$ 400 = tabela do plano diário (4.5), igual em todo nível", () => {
  for (const linha of preco.planoDiario) {
    it(`${linha.dias} dias`, () => {
      const r = diario(400, linha.dias);
      const rot = rotulosSaqueCliente(r, "diario");
      expect(rot.juros).toBe(linha.juros.rotulo);
      expect(rot.parcela).toBe(linha.parcela.rotulo);
      expect(rot.efetiva).toBe(linha.efetivaMes.rotulo);
      expect(r.dias).toEqual(Array.from({ length: linha.dias }, (_, i) => i + 1));
    });
  }
  it("taxa do diário é a equivalente de 5% por semana", () => {
    expect(cfg.taxaDiario.valor).toBe(0.05);
  });
});

describe("faixa do simulador: R$ 100 a R$ 1.000, passo de R$ 50", () => {
  it("faixa e passo", () => {
    expect(cfg.valorMin.valor).toBe(100);
    expect(cfg.valorMax.valor).toBe(1000);
    expect(cfg.passo.valor).toBe(50);
  });
  it("nenhum valor gera NaN, e a efetiva não depende do valor", () => {
    for (let v = cfg.valorMin.valor; v <= cfg.valorMax.valor; v += cfg.passo.valor) {
      for (const p of cfg.planos) {
        for (const nv of niveis) {
          const taxa = p.tipo === "diario" ? cfg.taxaDiario.valor : nv.taxaSemanal.valor;
          const r = simularSaqueCliente({ valor: v, tipo: p.tipo, parcelas: p.parcelas, taxaSemanal: taxa });
          const rot = rotulosSaqueCliente(r, p.tipo);
          expect(Object.values(rot).join(" ")).not.toMatch(/NaN|Infinity|undefined/);
          expect(r.total).toBeCloseTo(v + r.juros, 9);
          expect(r.parcela * r.parcelas).toBeCloseTo(r.total, 9);
          const r400 = simularSaqueCliente({ valor: 400, tipo: p.tipo, parcelas: p.parcelas, taxaSemanal: taxa });
          expect(r.efetivaMes).toBeCloseTo(r400.efetivaMes, 9);
        }
      }
    }
  });
  it("R$ 1.000, 4 semanas, Ouro: 4 × R$ 290, R$ 160 de juros", () => {
    const ouro = niveis.find((n) => n.id === "ouro")!;
    const rot = rotulosSaqueCliente(semanal(1000, ouro.taxaSemanal.valor), "semanal");
    expect(rot.parcelas).toBe("4 × R$ 290");
    expect(rot.juros).toBe("R$ 160");
  });
});

describe("formato de reais", () => {
  it("sem centavos quando exato; com centavos quando não, e sempre no diário", () => {
    expect(formatReaisSaque(120)).toBe("R$ 120");
    expect(formatReaisSaque(44.25)).toBe("R$ 44,25");
    expect(formatReaisSaque(40, true)).toBe("R$ 40,00");
    expect(formatReaisSaque(1000)).toBe("R$ 1.000");
  });
});
