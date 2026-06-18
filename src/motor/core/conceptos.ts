/**
 * Modelo de conceptos de liquidación y acumuladores — port de motor/conceptos.py.
 *
 * Un CONCEPTO es una línea del recibo. Cada concepto sabe:
 * - su tipo (remunerativo, no remunerativo, deducción, informativo)
 * - cómo se calcula (función de cálculo)
 * - a qué ACUMULADORES aporta su resultado
 *
 * Los acumuladores son los totales sobre los que después operan otros
 * conceptos (ej: los aportes se calculan sobre el acumulador REMUNERATIVO).
 * Agregar un concepto nuevo no requiere tocar la lógica de los demás.
 */

export enum TipoConcepto {
  REMUNERATIVO = "Remunerativo",
  NO_REMUNERATIVO = "No remunerativo",
  DEDUCCION = "Deducción",
  INFORMATIVO = "Informativo",
}

/** Acumuladores estándar. Un convenio puede aportar a otros nombres sin tocar el motor. */
export const ACUMULADOR = {
  REMUNERATIVO: "REMUNERATIVO",
  NO_REMUNERATIVO: "NO_REMUNERATIVO",
  BASE_ANTIGUEDAD: "BASE_ANTIGUEDAD",
  BASE_HORAS_EXTRA: "BASE_HORAS_EXTRA",
  DESCUENTOS: "DESCUENTOS",
  NETO: "NETO",
} as const;

export type Acumuladores = Record<string, number>;

export interface LineaRecibo {
  codigo: string;
  descripcion: string;
  tipo: TipoConcepto;
  cantidad: number;
  valorUnitario: number;
  importe: number;
}

/** calcular(contexto, acumuladores) -> [cantidad, valorUnitario, importe] */
export type FuncionCalculo<Ctx> = (
  contexto: Ctx,
  acumuladores: Readonly<Acumuladores>
) => readonly [cantidad: number, valorUnitario: number, importe: number];

export interface Concepto<Ctx> {
  codigo: string;
  descripcion: string;
  tipo: TipoConcepto;
  calcular: FuncionCalculo<Ctx>;
  /** A qué acumuladores aporta el importe resultante. */
  aportaA?: readonly string[];
  /** Si el concepto aplica este período. Por defecto, siempre aplica. */
  condicion?: (contexto: Ctx) => boolean;
}

export function redondear(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export class Liquidacion {
  private readonly acumuladores: Acumuladores = {};
  readonly lineas: LineaRecibo[] = [];

  private acumular(nombre: string, monto: number): void {
    this.acumuladores[nombre] = (this.acumuladores[nombre] ?? 0) + monto;
  }

  get(nombre: string): number {
    return this.acumuladores[nombre] ?? 0;
  }

  /** Fija un acumulador derivado (ej. NETO) después de ejecutar los conceptos. */
  fijar(nombre: string, valor: number): void {
    this.acumuladores[nombre] = valor;
  }

  ejecutar<Ctx>(conceptos: readonly Concepto<Ctx>[], contexto: Ctx): this {
    for (const c of conceptos) {
      if (c.condicion && !c.condicion(contexto)) continue;
      const [cantidad, valorUnitario, importe] = c.calcular(contexto, this.acumuladores);
      if (importe === 0 && cantidad === 0) continue;
      this.lineas.push({
        codigo: c.codigo,
        descripcion: c.descripcion,
        tipo: c.tipo,
        cantidad: redondear(cantidad),
        valorUnitario: redondear(valorUnitario),
        importe: redondear(importe),
      });
      for (const acum of c.aportaA ?? []) {
        this.acumular(acum, importe);
      }
    }
    return this;
  }
}
