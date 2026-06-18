/**
 * Aportes del trabajador y topes previsionales — port de la parte general de
 * motor/parametros.py (Ley 24.241, Ley 19.032/PAMI, Ley 23.660).
 *
 * Son nacionales: aplican a cualquier convenio, no solo a CCT 345/2002. Por
 * eso viven fuera de motor/convenios y no se duplican por convenio.
 *
 * Estas son funciones fábrica, no instancias globales: cada llamado devuelve
 * una TablaParametrica nueva. En producción, lib/repos construye la tabla real
 * con las filas vigentes que vengan de Supabase; estas fábricas son para tests
 * y como documentación ejecutable de la forma de cada tabla.
 */

import { TablaParametrica } from "../core/tabla-parametrica";

export interface AportesTrabajador {
  jubilacion: number; // Ley 24.241
  ley19032: number; // INSSJP / PAMI
  obraSocial: number; // Ley 23.660
}

export function crearTablaAportesTrabajador(): TablaParametrica<AportesTrabajador> {
  return new TablaParametrica<AportesTrabajador>("aportes_trabajador").agregar(
    "2024-01-01",
    null,
    {
      jubilacion: 0.11,
      ley19032: 0.03,
      obraSocial: 0.03,
    }
  );
}

export interface TopesSipa {
  baseMin: number;
  baseMax: number; // 0 = sin tope aplicado
}

/** Placeholder: base mínima/máxima en 0 — completar con los valores vigentes. */
export function crearTablaTopesSipa(): TablaParametrica<TopesSipa> {
  return new TablaParametrica<TopesSipa>("topes_sipa").agregar(
    "2026-03-01",
    null,
    {
      baseMin: 0,
      baseMax: 0,
    }
  );
}
