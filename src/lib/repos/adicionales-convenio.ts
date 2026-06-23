import { createClient } from "@/lib/supabase/server";
import { TablaParametrica, type FechaISO, type Cct345_2002 } from "@/motor";

export interface AdicionalConvenio {
  id: string;
  convenioId: string;
  codigo: string;
  descripcion: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  importe: number;
}

export interface AdicionalConvenioInput {
  codigo: string;
  descripcion: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  importe: number;
}

interface AdicionalConvenioRow {
  id: string;
  convenio_id: string;
  codigo: string;
  descripcion: string;
  vigencia_desde: string;
  vigencia_hasta: string | null;
  importe: number;
}

const SELECT = "id, convenio_id, codigo, descripcion, vigencia_desde, vigencia_hasta, importe";

function mapRow(row: AdicionalConvenioRow): AdicionalConvenio {
  return {
    id: row.id,
    convenioId: row.convenio_id,
    codigo: row.codigo,
    descripcion: row.descripcion,
    vigenciaDesde: row.vigencia_desde,
    vigenciaHasta: row.vigencia_hasta,
    importe: row.importe,
  };
}

function toRow(input: AdicionalConvenioInput) {
  return {
    codigo: input.codigo,
    descripcion: input.descripcion,
    vigencia_desde: input.vigenciaDesde,
    vigencia_hasta: input.vigenciaHasta,
    importe: input.importe,
  };
}

export async function listarAdicionalesConvenio(convenioId: string): Promise<AdicionalConvenio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("adicionales_convenio")
    .select(SELECT)
    .eq("convenio_id", convenioId)
    .order("codigo")
    .order("vigencia_desde", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as AdicionalConvenioRow[]).map(mapRow);
}

export async function obtenerAdicionalConvenio(id: string): Promise<AdicionalConvenio | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("adicionales_convenio").select(SELECT).eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as AdicionalConvenioRow) : null;
}

export async function crearAdicionalConvenio(
  convenioId: string,
  input: AdicionalConvenioInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("adicionales_convenio")
    .insert({ convenio_id: convenioId, ...toRow(input) })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function actualizarAdicionalConvenio(
  id: string,
  input: AdicionalConvenioInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("adicionales_convenio").update(toRow(input)).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function eliminarAdicionalConvenio(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("adicionales_convenio").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

/**
 * Asistencia perfecta y manejo de fondos vigentes a una fecha, en el formato
 * que espera el motor. Cada código se resuelve de forma independiente
 * (mismo criterio "más reciente desde gana"); si un código no tiene ninguna
 * fila vigente, se resuelve en 0 en vez de romper el cálculo.
 */
export async function resolverAdicionalesConvenio(
  convenioId: string,
  fecha: FechaISO
): Promise<Cct345_2002.EscalaConvenio["adicionalesFijos"]> {
  const filas = await listarAdicionalesConvenio(convenioId);

  function resolverCodigo(codigo: string): number {
    const tabla = new TablaParametrica<number>(`adicional_${codigo}`);
    for (const fila of filas.filter((f) => f.codigo === codigo)) {
      tabla.agregar(fila.vigenciaDesde, fila.vigenciaHasta, fila.importe);
    }
    try {
      return tabla.enFecha(fecha);
    } catch {
      return 0;
    }
  }

  return {
    asistenciaPerfecta: resolverCodigo("ASISTENCIA_PERFECTA"),
    manejoDeFondos: resolverCodigo("MANEJO_DE_FONDOS"),
  };
}
