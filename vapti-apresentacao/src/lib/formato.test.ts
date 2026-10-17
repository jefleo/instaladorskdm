import { describe, expect, it } from "vitest";
import { formatBRL, formatInt, formatMi, formatPct } from "./formato";

describe("formatBRL", () => {
  it("formata com 2 casas por padrão", () => {
    expect(formatBRL(1234.56)).toBe("R$ 1.234,56");
    expect(formatBRL(31.428)).toBe("R$ 31,43");
  });
  it("aceita casas", () => {
    expect(formatBRL(400, 0)).toBe("R$ 400");
    expect(formatBRL(1000, 0)).toBe("R$ 1.000");
  });
  it("negativo", () => {
    expect(formatBRL(-59, 0)).toBe("-R$ 59");
  });
});

describe("formatPct", () => {
  it("1 casa por padrão", () => {
    expect(formatPct(0.375)).toBe("37,5%");
    expect(formatPct(0.183)).toBe("18,3%");
  });
  it("2 casas", () => {
    expect(formatPct(0.1675, 2)).toBe("16,75%");
  });
});

describe("formatInt", () => {
  it("milhar com ponto", () => {
    expect(formatInt(3683)).toBe("3.683");
    expect(formatInt(3683.33)).toBe("3.683");
    expect(formatInt(510)).toBe("510");
  });
});

describe("formatMi", () => {
  it("milhões no estilo do briefing", () => {
    expect(formatMi(1_470_000)).toBe("R$ 1,47 mi");
    expect(formatMi(1_473_333)).toBe("R$ 1,47 mi");
    expect(formatMi(3_540_000)).toBe("R$ 3,54 mi");
    expect(formatMi(12_750_000)).toBe("R$ 12,75 mi");
    expect(formatMi(3_400_000)).toBe("R$ 3,4 mi");
    expect(formatMi(53_040_000)).toBe("R$ 53,04 mi");
    expect(formatMi(1_000_000)).toBe("R$ 1 mi");
  });
  it("milhares com 1 casa", () => {
    expect(formatMi(850_000)).toBe("R$ 850,0 mil");
    expect(formatMi(294_667)).toBe("R$ 294,7 mil");
    expect(formatMi(51_000)).toBe("R$ 51,0 mil");
  });
  it("fronteira arredonda para a escala maior", () => {
    expect(formatMi(999_996)).toBe("R$ 1 mi");
  });
  it("abaixo de mil e negativo", () => {
    expect(formatMi(400)).toBe("R$ 400");
    expect(formatMi(-59_000)).toBe("-R$ 59,0 mil");
  });
});
