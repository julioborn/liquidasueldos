/**
 * Caso de validación con datos REALES: escala de junio 2026 del CCT 345/2002
 * según SOESGPyLA. Sirve como referencia cruzada para verificar que el motor
 * resuelve correctamente la nueva escala paritaria.
 *
 * Misma composición que el caso mayo-2026 para facilitar la comparación.
 */
import { describe, expect, it } from "vitest";
import { ACUMULADOR } from "../core/conceptos";
import { TablaParametrica } from "../core/tabla-parametrica";
import { crearTablaAportesTrabajador } from "../legal/aportes";
import type { ReglasConvenio } from "../convenios/cct-345-2002/parametros";
import { liquidarMensual, type TablasCct345 } from "../convenios/cct-345-2002/conceptos";

function tablasJunio2026(): TablasCct345 {
  const escala = new TablaParametrica<import("../convenios/cct-345-2002/parametros").EscalaConvenio>(
    "escala_cct_345_junio_2026"
  ).agregar("2026-06-01", null, {
    basicos: {
      ENCARGADO: 1_540_592.0,
      ADMINISTRATIVO: 1_484_411.0,
      OPERARIO: 1_446_677.0,
    },
    adicionalesFijos: {
      asistenciaPerfecta: 90_842.0,
      manejoDeFondos: 90_842.0,
    },
  });

  const reglas = new TablaParametrica<ReglasConvenio>("reglas_cct_345_real").agregar("2002-01-01", null, {
    horasMensuales: 200,
    antiguedadPctPorAnio: 0.02,
    antiguedadBase: "BRUTO",
    he50Factor: 1.5,
    he100Factor: 2.0,
    cuotaSolidariaPct: 0.02,
  });

  return { escala, reglas, aportes: crearTablaAportesTrabajador() };
}

describe("CCT 345/2002 — escala real junio 2026, OPERARIO, 5 años, BRUTO", () => {
  const contexto = {
    categoria: "OPERARIO" as const,
    antiguedadAnios: 5,
    diasTrabajados: 30,
    he50: 10,
    he100: 4,
    asistenciaPerfecta: true,
    manejoFondos: false,
  };
  const fecha = "2026-06-01";

  const liq = liquidarMensual(contexto, fecha, tablasJunio2026());

  it("antigüedad BRUTO coincide con BASICO en este caso (nada más aportó a REMUNERATIVO antes)", () => {
    const linea = liq.lineas.find((l) => l.codigo === "110");
    // 1.446.677 * 2% * 5 años = 144.667,70
    expect(linea).toMatchObject({ cantidad: 5, valorUnitario: 28_933.54, importe: 144_667.7 });
  });

  it("calcula el total remunerativo esperado", () => {
    // 1.446.677 + 144.667,70 + 119.350,8525 + 63.653,788 + 90.842 = 1.865.191,3405
    expect(liq.get(ACUMULADOR.REMUNERATIVO)).toBeCloseTo(1_865_191.3405, 2);
  });

  it("calcula el total de descuentos esperado (19% sobre el remunerativo)", () => {
    // (11% + 3% + 3% + 2%) × 1.865.191,3405 = 354.386,354695
    expect(liq.get(ACUMULADOR.DESCUENTOS)).toBeCloseTo(-354_386.354695, 2);
  });

  it("calcula el neto esperado", () => {
    expect(liq.get(ACUMULADOR.NETO)).toBe(1_510_804.99);
  });
});
