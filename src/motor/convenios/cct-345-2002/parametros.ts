/**
 * Parámetros del CCT 345/2002 (SOESGPyLA / FAENI — estaciones de servicio,
 * Santa Fe) — port de la parte específica del convenio en motor/parametros.py.
 *
 * IMPORTANTE: los básicos y adicionales de `crearTablaEscalaPlaceholder` son
 * PLACEHOLDERS DE ESTRUCTURA en 0. Deben reemplazarse por la escala oficial
 * vigente del convenio antes de liquidar nada real. Las reglas estructurales
 * (antigüedad, horas extra, cuota solidaria) sí están confirmadas contra el
 * texto del convenio.
 *
 * Igual que en motor/legal/aportes.ts: son fábricas, no instancias globales.
 * En producción, lib/repos arma la tabla real con filas de Supabase.
 */

import { TablaParametrica } from "../../core/tabla-parametrica";

export type Categoria = "ENCARGADO" | "ADMINISTRATIVO" | "OPERARIO";

export interface EscalaConvenio {
  /** Sueldo básico mensual (régimen de 200 hs) por categoría. */
  basicos: Record<Categoria, number>;
  adicionalesFijos: {
    asistenciaPerfecta: number; // art. 25
    manejoDeFondos: number; // art. 26
  };
}

export function crearTablaEscalaPlaceholder(): TablaParametrica<EscalaConvenio> {
  return new TablaParametrica<EscalaConvenio>("escala_cct_345").agregar(
    "2026-03-01",
    null,
    {
      basicos: {
        ENCARGADO: 0, // <-- completar con escala oficial vigente
        ADMINISTRATIVO: 0, // <-- completar
        OPERARIO: 0, // <-- completar
      },
      adicionalesFijos: {
        asistenciaPerfecta: 0, // <-- completar
        manejoDeFondos: 0, // <-- completar
      },
    }
  );
}

export interface ReglasConvenio {
  horasMensuales: number;
  antiguedadPctPorAnio: number;
  /**
   * Base de cálculo de antigüedad: el texto del art. 25 dice "BRUTO", pero hay
   * práctica liquidatoria con "BASICO". Configurable a propósito, igual que
   * en el prototipo.
   */
  antiguedadBase: "BASICO" | "BRUTO";
  he50Factor: number;
  he100Factor: number;
  cuotaSolidariaPct: number;
}

export function crearTablaReglasConvenio(): TablaParametrica<ReglasConvenio> {
  return new TablaParametrica<ReglasConvenio>("reglas_cct_345").agregar(
    "2002-01-01",
    null,
    {
      horasMensuales: 200, // art. 11: régimen de 200 hs
      antiguedadPctPorAnio: 0.02, // art. 25: 2% por año
      antiguedadBase: "BASICO",
      he50Factor: 1.5,
      he100Factor: 2.0,
      cuotaSolidariaPct: 0.02, // art. 31: 2% s/ remuneraciones
    }
  );
}
