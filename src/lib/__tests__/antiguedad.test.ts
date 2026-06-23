import { describe, expect, it } from "vitest";
import { calcularAntiguedadAnios } from "../antiguedad";

describe("calcularAntiguedadAnios", () => {
  it("cuenta años completos ya cumplidos (aniversario pasado este año)", () => {
    expect(calcularAntiguedadAnios("2021-01-15", "2026-05-01")).toBe(5);
  });

  it("no cuenta el año en curso si el aniversario todavía no llegó", () => {
    expect(calcularAntiguedadAnios("2021-06-15", "2026-05-01")).toBe(4);
  });

  it("cuenta exactamente el día del aniversario", () => {
    expect(calcularAntiguedadAnios("2021-05-01", "2026-05-01")).toBe(5);
  });

  it("devuelve 0 para un ingreso dentro del mismo año de referencia", () => {
    expect(calcularAntiguedadAnios("2026-01-01", "2026-05-01")).toBe(0);
  });

  it("nunca devuelve un valor negativo (ingreso posterior a la referencia)", () => {
    expect(calcularAntiguedadAnios("2027-01-01", "2026-05-01")).toBe(0);
  });
});
