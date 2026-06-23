import { createClient } from "@/lib/supabase/server";
import {
  ACUMULADOR,
  TablaParametrica,
  TipoConcepto,
  Cct345_2002,
  type AportesTrabajador,
  type FechaISO,
} from "@/motor";
import { calcularAntiguedadAnios } from "@/lib/antiguedad";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { obtenerCategoria } from "@/lib/repos/categorias-convenio";
import { resolverBasicosConvenio } from "@/lib/repos/escalas-convenio";
import { resolverAdicionalesConvenio } from "@/lib/repos/adicionales-convenio";
import { resolverReglasConvenio } from "@/lib/repos/reglas-convenio";
import { resolverAportesTrabajador } from "@/lib/repos/aportes-trabajador";
import { listarNovedadesPorPeriodo, type Novedad } from "@/lib/repos/novedades";
import { cambiarEstadoPeriodo, obtenerPeriodo } from "@/lib/repos/periodos";
import { obtenerEmpleado, type Empleado } from "@/lib/repos/empleados";

const TIPO_DB: Record<TipoConcepto, string> = {
  [TipoConcepto.REMUNERATIVO]: "REMUNERATIVO",
  [TipoConcepto.NO_REMUNERATIVO]: "NO_REMUNERATIVO",
  [TipoConcepto.DEDUCCION]: "DEDUCCION",
  [TipoConcepto.INFORMATIVO]: "INFORMATIVO",
};

function esCategoriaValidaCct345(codigo: string): codigo is Cct345_2002.Categoria {
  return codigo === "ENCARGADO" || codigo === "ADMINISTRATIVO" || codigo === "OPERARIO";
}

interface ResultadoEmpleado {
  empleadoId: string;
  liquidacionId?: string;
  error?: string;
}

/**
 * Resuelve las tablas vigentes a `fecha`, llama al motor de CCT 345/2002 y
 * persiste el resultado (liquidaciones + lineas_recibo). Hoy solo soporta
 * convenio "345/2002"; otros convenios devuelven un error explícito en vez
 * de calcular cualquier cosa.
 */
async function calcularYGuardarLiquidacionEmpleado(
  periodoId: string,
  fecha: FechaISO,
  empleado: Empleado,
  novedad: Novedad,
  calculadoPor: string | null
): Promise<ResultadoEmpleado> {
  if (!empleado.convenioId || !empleado.categoriaId) {
    return { empleadoId: empleado.id, error: "El empleado no tiene convenio/categoría asignados." };
  }

  const convenio = await obtenerConvenio(empleado.convenioId);
  if (!convenio) return { empleadoId: empleado.id, error: "Convenio no encontrado." };
  if (convenio.codigo !== "345/2002") {
    return {
      empleadoId: empleado.id,
      error: `El motor de cálculo todavía no soporta el convenio ${convenio.codigo}.`,
    };
  }

  const categoria = await obtenerCategoria(empleado.categoriaId);
  if (!categoria) return { empleadoId: empleado.id, error: "Categoría no encontrada." };
  if (!esCategoriaValidaCct345(categoria.codigo)) {
    return {
      empleadoId: empleado.id,
      error: `La categoría '${categoria.codigo}' no es reconocida por el motor de CCT 345/2002.`,
    };
  }

  let basicos: Cct345_2002.EscalaConvenio["basicos"];
  let adicionalesFijos: Cct345_2002.EscalaConvenio["adicionalesFijos"];
  let reglas: Cct345_2002.ReglasConvenio;
  let aportes: AportesTrabajador;
  try {
    basicos = await resolverBasicosConvenio(convenio.id, fecha);
    adicionalesFijos = await resolverAdicionalesConvenio(convenio.id, fecha);
    reglas = await resolverReglasConvenio(convenio.id, fecha);
    aportes = await resolverAportesTrabajador(fecha);
  } catch (e) {
    return { empleadoId: empleado.id, error: e instanceof Error ? e.message : "Error resolviendo parámetros." };
  }

  const tablaEscala = new TablaParametrica<Cct345_2002.EscalaConvenio>("escala").agregar(fecha, null, {
    basicos,
    adicionalesFijos,
  });
  const tablaReglas = new TablaParametrica<Cct345_2002.ReglasConvenio>("reglas").agregar(fecha, null, reglas);
  const tablaAportes = new TablaParametrica<AportesTrabajador>("aportes").agregar(fecha, null, aportes);

  const antiguedadAnios = calcularAntiguedadAnios(empleado.fechaIngreso, fecha);

  const contexto: Cct345_2002.ContextoCct345 = {
    categoria: categoria.codigo,
    antiguedadAnios,
    diasTrabajados: novedad.diasTrabajados,
    he50: novedad.horasExtra50,
    he100: novedad.horasExtra100,
    asistenciaPerfecta: novedad.asistenciaPerfecta,
    manejoFondos: novedad.manejoFondos,
  };

  const liq = Cct345_2002.liquidarMensual(contexto, fecha, {
    escala: tablaEscala,
    reglas: tablaReglas,
    aportes: tablaAportes,
  });

  const supabase = await createClient();
  const { data: liquidacionRow, error: liqError } = await supabase
    .from("liquidaciones")
    .upsert(
      {
        periodo_id: periodoId,
        empleado_id: empleado.id,
        convenio_id: convenio.id,
        categoria_id: categoria.id,
        total_remunerativo: liq.get(ACUMULADOR.REMUNERATIVO),
        total_no_remunerativo: liq.get(ACUMULADOR.NO_REMUNERATIVO),
        total_descuentos: liq.get(ACUMULADOR.DESCUENTOS),
        neto: liq.get(ACUMULADOR.NETO),
        estado: "BORRADOR",
        calculado_en: new Date().toISOString(),
        calculado_por: calculadoPor,
      },
      { onConflict: "periodo_id,empleado_id" }
    )
    .select("id")
    .single();

  if (liqError || !liquidacionRow) {
    return { empleadoId: empleado.id, error: liqError?.message ?? "No se pudo guardar la liquidación." };
  }

  await supabase.from("lineas_recibo").delete().eq("liquidacion_id", liquidacionRow.id);
  const filasLineas = liq.lineas.map((linea, index) => ({
    liquidacion_id: liquidacionRow.id,
    concepto_codigo: linea.codigo,
    descripcion: linea.descripcion,
    tipo: TIPO_DB[linea.tipo],
    cantidad: linea.cantidad,
    valor_unitario: linea.valorUnitario,
    importe: linea.importe,
    orden: index,
  }));
  if (filasLineas.length > 0) {
    const { error: lineasError } = await supabase.from("lineas_recibo").insert(filasLineas);
    if (lineasError) return { empleadoId: empleado.id, error: lineasError.message };
  }

  return { empleadoId: empleado.id, liquidacionId: liquidacionRow.id };
}

export interface ResumenEjecucion {
  calculados: number;
  errores: Array<{ empleadoId: string; nombre: string; error: string }>;
}

/** Liquida todos los empleados con novedad cargada en el período. No aborta si alguno falla. */
export async function ejecutarLiquidacionPeriodo(
  periodoId: string,
  calculadoPor: string | null
): Promise<ResumenEjecucion | { error: string }> {
  const periodo = await obtenerPeriodo(periodoId);
  if (!periodo) return { error: "Período no encontrado." };

  const novedades = await listarNovedadesPorPeriodo(periodoId);
  if (novedades.length === 0) {
    return { error: "Cargá las novedades de al menos un empleado antes de calcular." };
  }

  const fecha = `${periodo.anio}-${String(periodo.mes).padStart(2, "0")}-01`;
  const errores: Array<{ empleadoId: string; nombre: string; error: string }> = [];
  let calculados = 0;

  for (const novedad of novedades) {
    const empleado = await obtenerEmpleado(novedad.empleadoId);
    if (!empleado) {
      errores.push({ empleadoId: novedad.empleadoId, nombre: "(desconocido)", error: "Empleado no encontrado." });
      continue;
    }

    const resultado = await calcularYGuardarLiquidacionEmpleado(periodoId, fecha, empleado, novedad, calculadoPor);
    if (resultado.error) {
      errores.push({
        empleadoId: empleado.id,
        nombre: `${empleado.apellido}, ${empleado.nombre}`,
        error: resultado.error,
      });
    } else {
      calculados++;
    }
  }

  if (calculados > 0 && periodo.estado === "ABIERTO") {
    await cambiarEstadoPeriodo(periodoId, "CALCULADO");
  }

  return { calculados, errores };
}

export interface LiquidacionResumen {
  id: string;
  periodoId: string;
  empleadoId: string;
  empleadoNombre: string;
  empleadoLegajo: string;
  totalRemunerativo: number;
  totalNoRemunerativo: number;
  totalDescuentos: number;
  neto: number;
  estado: "BORRADOR" | "CONFIRMADA";
}

interface LiquidacionRow {
  id: string;
  periodo_id: string;
  empleado_id: string;
  total_remunerativo: number;
  total_no_remunerativo: number;
  total_descuentos: number;
  neto: number;
  estado: "BORRADOR" | "CONFIRMADA";
  empleados: { apellido: string; nombre: string; legajo: string } | null;
}

function mapResumen(row: LiquidacionRow): LiquidacionResumen {
  return {
    id: row.id,
    periodoId: row.periodo_id,
    empleadoId: row.empleado_id,
    empleadoNombre: row.empleados ? `${row.empleados.apellido}, ${row.empleados.nombre}` : "—",
    empleadoLegajo: row.empleados?.legajo ?? "—",
    totalRemunerativo: row.total_remunerativo,
    totalNoRemunerativo: row.total_no_remunerativo,
    totalDescuentos: row.total_descuentos,
    neto: row.neto,
    estado: row.estado,
  };
}

export async function listarLiquidacionesPorPeriodo(periodoId: string): Promise<LiquidacionResumen[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("liquidaciones")
    .select(
      "id, periodo_id, empleado_id, total_remunerativo, total_no_remunerativo, total_descuentos, neto, estado, " +
        "empleados(apellido, nombre, legajo)"
    )
    .eq("periodo_id", periodoId);

  if (error) throw new Error(error.message);
  return (data as unknown as LiquidacionRow[]).map(mapResumen);
}

export interface LineaReciboDB {
  id: string;
  conceptoCodigo: string;
  descripcion: string;
  tipo: string;
  cantidad: number;
  valorUnitario: number;
  importe: number;
}

export interface LiquidacionDetalle extends LiquidacionResumen {
  empresaNombre: string;
  periodoAnio: number;
  periodoMes: number;
  lineas: LineaReciboDB[];
}

export async function obtenerLiquidacionDetalle(id: string): Promise<LiquidacionDetalle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("liquidaciones")
    .select(
      "id, periodo_id, empleado_id, total_remunerativo, total_no_remunerativo, total_descuentos, neto, estado, " +
        "empleados(apellido, nombre, legajo), periodos(anio, mes, empresas(razon_social))"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: lineasData, error: lineasError } = await supabase
    .from("lineas_recibo")
    .select("id, concepto_codigo, descripcion, tipo, cantidad, valor_unitario, importe")
    .eq("liquidacion_id", id)
    .order("orden");

  if (lineasError) throw new Error(lineasError.message);

  const row = data as unknown as LiquidacionRow & {
    periodos: { anio: number; mes: number; empresas: { razon_social: string } | null } | null;
  };

  return {
    ...mapResumen(row),
    empresaNombre: row.periodos?.empresas?.razon_social ?? "—",
    periodoAnio: row.periodos?.anio ?? 0,
    periodoMes: row.periodos?.mes ?? 0,
    lineas: (
      lineasData as unknown as Array<{
        id: string;
        concepto_codigo: string;
        descripcion: string;
        tipo: string;
        cantidad: number;
        valor_unitario: number;
        importe: number;
      }>
    ).map((l) => ({
      id: l.id,
      conceptoCodigo: l.concepto_codigo,
      descripcion: l.descripcion,
      tipo: l.tipo,
      cantidad: l.cantidad,
      valorUnitario: l.valor_unitario,
      importe: l.importe,
    })),
  };
}
