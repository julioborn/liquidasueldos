/**
 * Conceptos concretos del CCT 345/2002 y armado de la liquidación mensual —
 * port de motor/cct345.py.
 *
 * Reglas aplicadas (confirmadas contra el texto del convenio):
 * - Jornada: régimen de 200 hs mensuales (art. 11) -> valor hora = básico / 200
 * - Antigüedad: 2% por año (art. 25). Base configurable (básico o bruto).
 * - Horas extra: 50% y 100%. Base de horas extra: básico + antigüedad.
 * - Adicionales de convenio: asistencia perfecta (art. 25) y manejo de
 *   fondos (art. 26), montos fijos de escala.
 * - Cuota solidaria: 2% (art. 31) a todo el personal.
 * - Aportes de ley: jubilación 11%, PAMI 3%, obra social 3%.
 *
 * `construirConceptos` recibe las tablas resueltas en vez de leer globales:
 * así el motor no sabe de dónde vienen los datos (Supabase, fixtures de test,
 * etc.) y queda testeable de forma aislada.
 */

import {
  ACUMULADOR,
  Concepto,
  Liquidacion,
  TipoConcepto,
  redondear,
} from "../../core/conceptos";
import type { FechaISO, TablaParametrica } from "../../core/tabla-parametrica";
import type { AportesTrabajador } from "../../legal/aportes";
import type { Categoria, EscalaConvenio, ReglasConvenio } from "./parametros";

export interface ContextoCct345 {
  categoria: Categoria;
  antiguedadAnios?: number;
  /** Días trabajados en el período, sobre base 30. Default: 30 (mes completo). */
  diasTrabajados?: number;
  he50?: number;
  he100?: number;
  asistenciaPerfecta?: boolean;
  manejoFondos?: boolean;
}

export interface TablasCct345 {
  escala: TablaParametrica<EscalaConvenio>;
  reglas: TablaParametrica<ReglasConvenio>;
  aportes: TablaParametrica<AportesTrabajador>;
}

export function construirConceptos(
  fecha: FechaISO,
  tablas: TablasCct345
): Concepto<ContextoCct345>[] {
  const escala = tablas.escala.enFecha(fecha);
  const reglas = tablas.reglas.enFecha(fecha);
  const aportes = tablas.aportes.enFecha(fecha);

  const { basicos, adicionalesFijos: adic } = escala;
  const horasMes = reglas.horasMensuales;
  const antigPct = reglas.antiguedadPctPorAnio;
  const antigBase = reglas.antiguedadBase;
  const f50 = reglas.he50Factor;
  const f100 = reglas.he100Factor;
  const solidariaPct = reglas.cuotaSolidariaPct;

  const conceptos: Concepto<ContextoCct345>[] = [];

  // 1) SUELDO BÁSICO (proporcional a días trabajados si corresponde)
  conceptos.push({
    codigo: "100",
    descripcion: "Sueldo básico",
    tipo: TipoConcepto.REMUNERATIVO,
    calcular: (ctx) => {
      const basico = basicos[ctx.categoria];
      const prop = (ctx.diasTrabajados ?? 30) / 30;
      const importe = basico * prop;
      return [prop * 30, basico, importe];
    },
    aportaA: [ACUMULADOR.REMUNERATIVO, ACUMULADOR.BASE_ANTIGUEDAD, ACUMULADOR.BASE_HORAS_EXTRA],
  });

  // 2) ANTIGÜEDAD: 2% por año sobre la base configurada
  conceptos.push({
    codigo: "110",
    descripcion: "Antigüedad",
    tipo: TipoConcepto.REMUNERATIVO,
    calcular: (ctx, acum) => {
      const anios = ctx.antiguedadAnios ?? 0;
      if (anios <= 0) return [0, 0, 0];
      const base =
        antigBase === "BASICO"
          ? acum[ACUMULADOR.BASE_ANTIGUEDAD] ?? 0
          : acum[ACUMULADOR.REMUNERATIVO] ?? 0;
      const importe = base * antigPct * anios;
      return [anios, base * antigPct, importe];
    },
    aportaA: [ACUMULADOR.REMUNERATIVO, ACUMULADOR.BASE_HORAS_EXTRA],
    condicion: (ctx) => (ctx.antiguedadAnios ?? 0) > 0,
  });

  // 3) HORAS EXTRA AL 50% (base: básico + antigüedad / 200)
  conceptos.push({
    codigo: "120",
    descripcion: "Horas extra 50%",
    tipo: TipoConcepto.REMUNERATIVO,
    calcular: (ctx, acum) => {
      const cant = ctx.he50 ?? 0;
      if (cant <= 0) return [0, 0, 0];
      const valorHora = (acum[ACUMULADOR.BASE_HORAS_EXTRA] ?? 0) / horasMes;
      const vu = valorHora * f50;
      return [cant, vu, cant * vu];
    },
    aportaA: [ACUMULADOR.REMUNERATIVO],
    condicion: (ctx) => (ctx.he50 ?? 0) > 0,
  });

  // 4) HORAS EXTRA AL 100%
  conceptos.push({
    codigo: "121",
    descripcion: "Horas extra 100%",
    tipo: TipoConcepto.REMUNERATIVO,
    calcular: (ctx, acum) => {
      const cant = ctx.he100 ?? 0;
      if (cant <= 0) return [0, 0, 0];
      const valorHora = (acum[ACUMULADOR.BASE_HORAS_EXTRA] ?? 0) / horasMes;
      const vu = valorHora * f100;
      return [cant, vu, cant * vu];
    },
    aportaA: [ACUMULADOR.REMUNERATIVO],
    condicion: (ctx) => (ctx.he100 ?? 0) > 0,
  });

  // 5) ASISTENCIA PERFECTA (art. 25) — monto fijo, si aplica
  conceptos.push({
    codigo: "130",
    descripcion: "Adic. asistencia perfecta",
    tipo: TipoConcepto.REMUNERATIVO,
    calcular: () => {
      const m = adic.asistenciaPerfecta;
      return [1, m, m];
    },
    aportaA: [ACUMULADOR.REMUNERATIVO],
    condicion: (ctx) => ctx.asistenciaPerfecta === true,
  });

  // 6) MANEJO DE FONDOS (art. 26) — monto fijo, si aplica
  conceptos.push({
    codigo: "131",
    descripcion: "Adic. manejo de fondos",
    tipo: TipoConcepto.REMUNERATIVO,
    calcular: () => {
      const m = adic.manejoDeFondos;
      return [1, m, m];
    },
    aportaA: [ACUMULADOR.REMUNERATIVO],
    condicion: (ctx) => ctx.manejoFondos === true,
  });

  // ---- DEDUCCIONES (sobre el acumulado REMUNERATIVO) ----
  const deduccion = (pct: number) =>
    (_ctx: ContextoCct345, acum: Readonly<Record<string, number>>): readonly [number, number, number] => {
      const base = acum[ACUMULADOR.REMUNERATIVO] ?? 0;
      const importe = -base * pct;
      return [pct * 100, base, importe];
    };

  conceptos.push({
    codigo: "200",
    descripcion: "Jubilación 11%",
    tipo: TipoConcepto.DEDUCCION,
    calcular: deduccion(aportes.jubilacion),
    aportaA: [ACUMULADOR.DESCUENTOS],
  });
  conceptos.push({
    codigo: "201",
    descripcion: "Ley 19.032 (PAMI) 3%",
    tipo: TipoConcepto.DEDUCCION,
    calcular: deduccion(aportes.ley19032),
    aportaA: [ACUMULADOR.DESCUENTOS],
  });
  conceptos.push({
    codigo: "202",
    descripcion: "Obra social 3%",
    tipo: TipoConcepto.DEDUCCION,
    calcular: deduccion(aportes.obraSocial),
    aportaA: [ACUMULADOR.DESCUENTOS],
  });
  conceptos.push({
    codigo: "210",
    descripcion: "Cuota solidaria 2% (art. 31)",
    tipo: TipoConcepto.DEDUCCION,
    calcular: deduccion(solidariaPct),
    aportaA: [ACUMULADOR.DESCUENTOS],
  });

  return conceptos;
}

export function liquidarMensual(
  contexto: ContextoCct345,
  fecha: FechaISO,
  tablas: TablasCct345
): Liquidacion {
  const conceptos = construirConceptos(fecha, tablas);
  const liq = new Liquidacion();
  liq.ejecutar(conceptos, contexto);
  const neto =
    liq.get(ACUMULADOR.REMUNERATIVO) + liq.get(ACUMULADOR.NO_REMUNERATIVO) + liq.get(ACUMULADOR.DESCUENTOS);
  liq.fijar(ACUMULADOR.NETO, redondear(neto));
  return liq;
}
