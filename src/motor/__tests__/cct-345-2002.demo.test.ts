/**
 * Replica el caso de prueba de reference/demo.py: operario de playa, 5 años de
 * antigüedad, 10 hs extra al 50% y 4 al 100%, con asistencia perfecta.
 *
 * Los básicos y adicionales usados acá son los mismos valores de DEMOSTRACIÓN
 * del prototipo (no oficiales) — solo para verificar que el motor portado a
 * TypeScript calcula exactamente lo mismo que el prototipo en Python.
 */
import { describe, expect, it } from "vitest";
import { ACUMULADOR } from "../core/conceptos";
import { TablaParametrica } from "../core/tabla-parametrica";
import { crearTablaAportesTrabajador } from "../legal/aportes";
import { crearTablaReglasConvenio, type EscalaConvenio } from "../convenios/cct-345-2002/parametros";
import { liquidarMensual, type TablasCct345 } from "../convenios/cct-345-2002/conceptos";

function tablasDemo(): TablasCct345 {
  const escala = new TablaParametrica<EscalaConvenio>("escala_cct_345").agregar("2026-03-01", null, {
    basicos: {
      ENCARGADO: 1_450_000.0, // DEMO — no oficial
      ADMINISTRATIVO: 1_370_000.0, // DEMO — no oficial
      OPERARIO: 1_360_000.0, // DEMO — no oficial
    },
    adicionalesFijos: {
      asistenciaPerfecta: 110_000.0, // DEMO
      manejoDeFondos: 110_000.0, // DEMO
    },
  });

  return {
    escala,
    reglas: crearTablaReglasConvenio(),
    aportes: crearTablaAportesTrabajador(),
  };
}

describe("CCT 345/2002 — caso demo.py (operario, 5 años, HE 50%/100%, asistencia perfecta)", () => {
  const contexto = {
    categoria: "OPERARIO" as const,
    antiguedadAnios: 5,
    diasTrabajados: 30,
    he50: 10,
    he100: 4,
    asistenciaPerfecta: true,
    manejoFondos: false,
  };
  const fecha = "2026-05-01";

  const liq = liquidarMensual(contexto, fecha, tablasDemo());

  it("calcula el sueldo básico proporcional (200 hs) sin proporcionalidad porque trabajó el mes completo", () => {
    const linea = liq.lineas.find((l) => l.codigo === "100");
    expect(linea).toMatchObject({ cantidad: 30, valorUnitario: 1_360_000, importe: 1_360_000 });
  });

  it("calcula antigüedad 2% por año (5 años) sobre la base BASICO", () => {
    const linea = liq.lineas.find((l) => l.codigo === "110");
    // base = básico (1.360.000) * 2% = 27.200 por año; 5 años => 136.000
    expect(linea).toMatchObject({ cantidad: 5, valorUnitario: 27_200, importe: 136_000 });
  });

  it("calcula horas extra al 50% sobre la base básico+antigüedad / 200 hs", () => {
    const linea = liq.lineas.find((l) => l.codigo === "120");
    // base HE = 1.360.000 + 136.000 = 1.496.000; valor hora = 7.480; *1.5 = 11.220
    expect(linea).toMatchObject({ cantidad: 10, valorUnitario: 11_220, importe: 112_200 });
  });

  it("calcula horas extra al 100% sobre la misma base de horas extra", () => {
    const linea = liq.lineas.find((l) => l.codigo === "121");
    // valor hora 7.480 * 2.0 = 14.960
    expect(linea).toMatchObject({ cantidad: 4, valorUnitario: 14_960, importe: 59_840 });
  });

  it("incluye la asistencia perfecta y omite manejo de fondos (no aplica)", () => {
    const asistencia = liq.lineas.find((l) => l.codigo === "130");
    const fondos = liq.lineas.find((l) => l.codigo === "131");
    expect(asistencia).toMatchObject({ importe: 110_000 });
    expect(fondos).toBeUndefined();
  });

  it("acumula el total remunerativo esperado", () => {
    // 1.360.000 + 136.000 + 112.200 + 59.840 + 110.000 = 1.778.040
    expect(liq.get(ACUMULADOR.REMUNERATIVO)).toBe(1_778_040);
  });

  it("calcula las cuatro deducciones de ley sobre el remunerativo (11% + 3% + 3% + 2% = 19%)", () => {
    const jubilacion = liq.lineas.find((l) => l.codigo === "200");
    const pami = liq.lineas.find((l) => l.codigo === "201");
    const obraSocial = liq.lineas.find((l) => l.codigo === "202");
    const solidaria = liq.lineas.find((l) => l.codigo === "210");

    expect(jubilacion?.importe).toBe(-195_584.4);
    expect(pami?.importe).toBe(-53_341.2);
    expect(obraSocial?.importe).toBe(-53_341.2);
    expect(solidaria?.importe).toBe(-35_560.8);
    expect(liq.get(ACUMULADOR.DESCUENTOS)).toBe(-337_827.6);
  });

  it("calcula el neto a cobrar: remunerativo + no remunerativo + descuentos", () => {
    expect(liq.get(ACUMULADOR.NETO)).toBe(1_440_212.4);
  });
});
