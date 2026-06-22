import { describe, expect, it } from "vitest";
import { fraccionAPorcentaje, porcentajeAFraccion } from "../porcentaje";

describe("fraccionAPorcentaje", () => {
  it("convierte una fracción simple a porcentaje", () => {
    expect(fraccionAPorcentaje(0.11)).toBe(11);
    expect(fraccionAPorcentaje(0.03)).toBe(3);
  });

  it("conserva hasta 2 decimales de porcentaje sin ruido de floating point", () => {
    expect(fraccionAPorcentaje(0.115)).toBe(11.5);
  });
});

describe("porcentajeAFraccion", () => {
  it("convierte un porcentaje entero a fracción", () => {
    expect(porcentajeAFraccion(11)).toBe(0.11);
  });

  it("convierte un porcentaje con decimales a fracción de hasta 4 decimales", () => {
    expect(porcentajeAFraccion(11.5)).toBe(0.115);
  });

  it("es el inverso de fraccionAPorcentaje para valores típicos de alícuotas", () => {
    for (const pct of [11, 3, 6, 2.5, 17, 0.5]) {
      expect(fraccionAPorcentaje(porcentajeAFraccion(pct))).toBe(pct);
    }
  });
});
