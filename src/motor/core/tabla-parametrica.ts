/**
 * Tablas paramétricas con vigencia por fecha — port de motor/parametros.py.
 *
 * PRINCIPIO CLAVE (igual que el prototipo): el motor no tiene valores fijos.
 * Todo importe, alícuota, tope o escala se consulta acá pasando una fecha, y
 * se devuelve el valor vigente a esa fecha. Un cambio de paritaria o de
 * alícuota se resuelve agregando una fila nueva, sin tocar el motor de cálculo.
 *
 * Las fechas se representan como strings ISO "YYYY-MM-DD" (no `Date`) para
 * comparar por orden lexicográfico y evitar corrimientos de día por huso
 * horario, algo crítico cuando se decide qué escala aplica a un período.
 */

export type FechaISO = string;

export interface FilaVigencia<T> {
  desde: FechaISO;
  hasta: FechaISO | null;
  valores: T;
}

function vigenteEn(fila: FilaVigencia<unknown>, fecha: FechaISO): boolean {
  if (fecha < fila.desde) return false;
  if (fila.hasta !== null && fecha > fila.hasta) return false;
  return true;
}

export class TablaParametrica<T> {
  private readonly filas: FilaVigencia<T>[] = [];

  constructor(private readonly nombre: string) {}

  agregar(desde: FechaISO, hasta: FechaISO | null, valores: T): this {
    this.filas.push({ desde, hasta, valores });
    return this;
  }

  enFecha(fecha: FechaISO): T {
    const candidatas = this.filas.filter((fila) => vigenteEn(fila, fecha));
    if (candidatas.length === 0) {
      throw new Error(`Tabla '${this.nombre}': no hay valores vigentes al ${fecha}`);
    }
    // la de inicio más reciente gana (por si hay solapamientos)
    candidatas.sort((a, b) => (a.desde < b.desde ? 1 : a.desde > b.desde ? -1 : 0));
    return candidatas[0].valores;
  }
}
