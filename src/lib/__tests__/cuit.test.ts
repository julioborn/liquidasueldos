import { describe, expect, it } from "vitest";
import { esCuitValido, formatearCuit, normalizarCuit } from "../cuit";

describe("normalizarCuit", () => {
  it("deja solo los dígitos", () => {
    expect(normalizarCuit("20-12345678-6")).toBe("20123456786");
    expect(normalizarCuit("20 12345678 6")).toBe("20123456786");
  });
});

describe("formatearCuit", () => {
  it("formatea 11 dígitos como XX-XXXXXXXX-X", () => {
    expect(formatearCuit("20123456786")).toBe("20-12345678-6");
  });

  it("devuelve el input sin tocar si no son 11 dígitos", () => {
    expect(formatearCuit("123")).toBe("123");
  });
});

describe("esCuitValido", () => {
  it("acepta un CUIT con dígito verificador correcto (con o sin guiones)", () => {
    expect(esCuitValido("20-12345678-6")).toBe(true);
    expect(esCuitValido("20123456786")).toBe(true);
  });

  it("rechaza un CUIT con el dígito verificador incorrecto", () => {
    expect(esCuitValido("20-12345678-7")).toBe(false);
  });

  it("rechaza entradas que no tienen 11 dígitos", () => {
    expect(esCuitValido("123")).toBe(false);
    expect(esCuitValido("")).toBe(false);
  });
});
