import { describe, expect, it } from "vitest";
import { ACUMULADOR, Concepto, Liquidacion, TipoConcepto } from "../core/conceptos";

interface CtxTest {
  activo?: boolean;
}

describe("Liquidacion", () => {
  it("ejecuta conceptos en orden y acumula sus importes", () => {
    const conceptos: Concepto<CtxTest>[] = [
      {
        codigo: "100",
        descripcion: "Haber fijo",
        tipo: TipoConcepto.REMUNERATIVO,
        calcular: () => [1, 1000, 1000],
        aportaA: [ACUMULADOR.REMUNERATIVO],
      },
      {
        codigo: "200",
        descripcion: "Deducción 10%",
        tipo: TipoConcepto.DEDUCCION,
        calcular: (_ctx, acum) => {
          const base = acum[ACUMULADOR.REMUNERATIVO] ?? 0;
          return [10, base, -base * 0.1];
        },
        aportaA: [ACUMULADOR.DESCUENTOS],
      },
    ];

    const liq = new Liquidacion().ejecutar(conceptos, {});

    expect(liq.get(ACUMULADOR.REMUNERATIVO)).toBe(1000);
    expect(liq.get(ACUMULADOR.DESCUENTOS)).toBe(-100);
    expect(liq.lineas).toHaveLength(2);
    expect(liq.lineas[1].importe).toBe(-100);
  });

  it("no ejecuta un concepto cuya condicion() es falsa, y no deja rastro en acumuladores", () => {
    const conceptos: Concepto<CtxTest>[] = [
      {
        codigo: "999",
        descripcion: "Solo si activo",
        tipo: TipoConcepto.REMUNERATIVO,
        calcular: () => [1, 500, 500],
        aportaA: [ACUMULADOR.REMUNERATIVO],
        condicion: (ctx) => ctx.activo === true,
      },
    ];

    const liq = new Liquidacion().ejecutar(conceptos, { activo: false });

    expect(liq.lineas).toHaveLength(0);
    expect(liq.get(ACUMULADOR.REMUNERATIVO)).toBe(0);
  });

  it("omite la línea cuando cantidad e importe son ambos cero", () => {
    const conceptos: Concepto<CtxTest>[] = [
      {
        codigo: "120",
        descripcion: "Horas extra (sin horas)",
        tipo: TipoConcepto.REMUNERATIVO,
        calcular: () => [0, 0, 0],
        aportaA: [ACUMULADOR.REMUNERATIVO],
      },
    ];

    const liq = new Liquidacion().ejecutar(conceptos, {});

    expect(liq.lineas).toHaveLength(0);
  });

  it("fijar() permite asentar un acumulador derivado (ej. NETO) después de ejecutar", () => {
    const liq = new Liquidacion();
    liq.fijar(ACUMULADOR.NETO, 1234.56);

    expect(liq.get(ACUMULADOR.NETO)).toBe(1234.56);
  });
});
