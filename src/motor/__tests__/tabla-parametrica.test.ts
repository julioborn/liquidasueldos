import { describe, expect, it } from "vitest";
import { TablaParametrica } from "../core/tabla-parametrica";

describe("TablaParametrica", () => {
  it("devuelve los valores vigentes a una fecha dentro del rango desde/hasta", () => {
    const tabla = new TablaParametrica<{ pct: number }>("test").agregar("2024-01-01", "2024-12-31", {
      pct: 0.1,
    });

    expect(tabla.enFecha("2024-06-15")).toEqual({ pct: 0.1 });
  });

  it("trata hasta=null como vigencia abierta hacia adelante", () => {
    const tabla = new TablaParametrica<{ pct: number }>("test").agregar("2024-01-01", null, { pct: 0.1 });

    expect(tabla.enFecha("2030-01-01")).toEqual({ pct: 0.1 });
  });

  it("excluye fechas anteriores a 'desde' o posteriores a 'hasta'", () => {
    const tabla = new TablaParametrica<{ pct: number }>("test").agregar("2024-01-01", "2024-12-31", {
      pct: 0.1,
    });

    expect(() => tabla.enFecha("2023-12-31")).toThrow();
    expect(() => tabla.enFecha("2025-01-01")).toThrow();
  });

  it("lanza un error con el nombre de la tabla cuando no hay fila vigente", () => {
    const tabla = new TablaParametrica<{ pct: number }>("aportes_trabajador");

    expect(() => tabla.enFecha("2024-01-01")).toThrow(/aportes_trabajador/);
  });

  it("ante filas solapadas, gana la de inicio (desde) más reciente", () => {
    const tabla = new TablaParametrica<{ pct: number }>("test")
      .agregar("2024-01-01", null, { pct: 0.1 })
      .agregar("2024-06-01", null, { pct: 0.2 });

    expect(tabla.enFecha("2024-08-01")).toEqual({ pct: 0.2 });
    expect(tabla.enFecha("2024-03-01")).toEqual({ pct: 0.1 });
  });
});
