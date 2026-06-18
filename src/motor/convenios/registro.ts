/**
 * Registro de convenios soportados: mapea un código de CCT a su fábrica de
 * conceptos, para que el resto de la app pueda pedir "el motor del convenio X"
 * sin un if/else por convenio. Hoy solo hay un convenio registrado
 * (345/2002); sumar uno nuevo es un archivo bajo motor/convenios/ + un
 * registrarConvenio(...), sin tocar este archivo ni el motor genérico.
 */

import type { Concepto } from "../core/conceptos";
import type { FechaISO } from "../core/tabla-parametrica";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FabricaConceptos<Tablas = any> = (fecha: FechaISO, tablas: Tablas) => Concepto<any>[];

const registro = new Map<string, FabricaConceptos>();

export function registrarConvenio<Tablas>(codigo: string, fabrica: FabricaConceptos<Tablas>): void {
  registro.set(codigo, fabrica as FabricaConceptos);
}

export function obtenerFabricaConvenio(codigo: string): FabricaConceptos {
  const fabrica = registro.get(codigo);
  if (!fabrica) {
    throw new Error(`No hay motor de conceptos registrado para el convenio '${codigo}'`);
  }
  return fabrica;
}

export function conveniosRegistrados(): string[] {
  return Array.from(registro.keys());
}
