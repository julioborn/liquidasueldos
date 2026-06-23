/**
 * Caso de validación con datos REALES (no demo): escala de mayo 2026 del
 * CCT 345/2002 según el documento oficial de SOESGPyLA, antigüedad sobre
 * BRUTO (confirmado por el estudio — ver feedback de la sesión que cargó
 * estos valores). Sirve como referencia cruzada del cálculo manual usado
 * para verificar el pipeline end-to-end (DB -> motor -> recibo).
 */
import { describe, expect, it } from "vitest";
import { ACUMULADOR } from "../core/conceptos";
import { TablaParametrica } from "../core/tabla-parametrica";
import { crearTablaAportesTrabajador } from "../legal/aportes";
import type { ReglasConvenio } from "../convenios/cct-345-2002/parametros";
import { liquidarMensual, type TablasCct345 } from "../convenios/cct-345-2002/conceptos";

function tablasMayo2026(): TablasCct345 {
  const escala = new TablaParametrica<import("../convenios/cct-345-2002/parametros").EscalaConvenio>(
    "escala_cct_345_mayo_2026"
  ).agregar("2026-05-01", null, {
    basicos: {
      ENCARGADO: 1_503_017.0,
      ADMINISTRATIVO: 1_448_206.0,
      OPERARIO: 1_430_904.0,
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

describe("CCT 345/2002 — escala real mayo 2026, OPERARIO, 5 años, BRUTO", () => {
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

  const liq = liquidarMensual(contexto, fecha, tablasMayo2026());

  it("antigüedad BRUTO coincide con BASICO en este caso (nada más aportó a REMUNERATIVO antes)", () => {
    const linea = liq.lineas.find((l) => l.codigo === "110");
    // 1.430.904 * 2% * 5 años = 143.090,40
    expect(linea).toMatchObject({ cantidad: 5, valorUnitario: 28_618.08, importe: 143_090.4 });
  });

  it("calcula el total remunerativo esperado", () => {
    // 1.430.904 + 143.090,40 + 118.049,58 + 62.959,776 + 90.842 = 1.845.845,756
    expect(liq.get(ACUMULADOR.REMUNERATIVO)).toBeCloseTo(1_845_845.756, 2);
  });

  it("calcula el total de descuentos esperado (19% sobre el remunerativo)", () => {
    expect(liq.get(ACUMULADOR.DESCUENTOS)).toBeCloseTo(-350_710.69364, 2);
  });

  it("calcula el neto esperado", () => {
    expect(liq.get(ACUMULADOR.NETO)).toBe(1_495_135.06);
  });
});
