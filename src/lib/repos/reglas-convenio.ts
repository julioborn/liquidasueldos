import { createClient } from "@/lib/supabase/server";
import { TablaParametrica, type FechaISO, type Cct345_2002 } from "@/motor";

export type AntiguedadBase = "BASICO" | "BRUTO";

export interface ReglaConvenio {
  id: string;
  convenioId: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  horasMensuales: number;
  antiguedadPctAnio: number;
  antiguedadBase: AntiguedadBase;
  he50Factor: number;
  he100Factor: number;
  cuotaSolidariaPct: number;
}

export interface ReglaConvenioInput {
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  horasMensuales: number;
  antiguedadPctAnio: number;
  antiguedadBase: AntiguedadBase;
  he50Factor: number;
  he100Factor: number;
  cuotaSolidariaPct: number;
}

interface ReglaConvenioRow {
  id: string;
  convenio_id: string;
  vigencia_desde: string;
  vigencia_hasta: string | null;
  horas_mensuales: number;
  antiguedad_pct_anio: number;
  antiguedad_base: AntiguedadBase;
  he_50_factor: number;
  he_100_factor: number;
  cuota_solidaria_pct: number;
}

const SELECT =
  "id, convenio_id, vigencia_desde, vigencia_hasta, horas_mensuales, antiguedad_pct_anio, " +
  "antiguedad_base, he_50_factor, he_100_factor, cuota_solidaria_pct";

function mapRow(row: ReglaConvenioRow): ReglaConvenio {
  return {
    id: row.id,
    convenioId: row.convenio_id,
    vigenciaDesde: row.vigencia_desde,
    vigenciaHasta: row.vigencia_hasta,
    horasMensuales: row.horas_mensuales,
    antiguedadPctAnio: row.antiguedad_pct_anio,
    antiguedadBase: row.antiguedad_base,
    he50Factor: row.he_50_factor,
    he100Factor: row.he_100_factor,
    cuotaSolidariaPct: row.cuota_solidaria_pct,
  };
}

function toRow(input: ReglaConvenioInput) {
  return {
    vigencia_desde: input.vigenciaDesde,
    vigencia_hasta: input.vigenciaHasta,
    horas_mensuales: input.horasMensuales,
    antiguedad_pct_anio: input.antiguedadPctAnio,
    antiguedad_base: input.antiguedadBase,
    he_50_factor: input.he50Factor,
    he_100_factor: input.he100Factor,
    cuota_solidaria_pct: input.cuotaSolidariaPct,
  };
}

export async function listarReglasConvenio(convenioId: string): Promise<ReglaConvenio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reglas_convenio")
    .select(SELECT)
    .eq("convenio_id", convenioId)
    .order("vigencia_desde", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as unknown as ReglaConvenioRow[]).map(mapRow);
}

export async function obtenerReglaConvenio(id: string): Promise<ReglaConvenio | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("reglas_convenio").select(SELECT).eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as unknown as ReglaConvenioRow) : null;
}

export async function crearReglaConvenio(
  convenioId: string,
  input: ReglaConvenioInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reglas_convenio")
    .insert({ convenio_id: convenioId, ...toRow(input) })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function actualizarReglaConvenio(
  id: string,
  input: ReglaConvenioInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("reglas_convenio").update(toRow(input)).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function eliminarReglaConvenio(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("reglas_convenio").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

/** Reglas estructurales vigentes a una fecha, en el formato que espera el motor. */
export async function resolverReglasConvenio(
  convenioId: string,
  fecha: FechaISO
): Promise<Cct345_2002.ReglasConvenio> {
  const filas = await listarReglasConvenio(convenioId);
  const tabla = new TablaParametrica<Cct345_2002.ReglasConvenio>("reglas_convenio");
  for (const fila of filas) {
    tabla.agregar(fila.vigenciaDesde, fila.vigenciaHasta, {
      horasMensuales: fila.horasMensuales,
      antiguedadPctPorAnio: fila.antiguedadPctAnio,
      antiguedadBase: fila.antiguedadBase,
      he50Factor: fila.he50Factor,
      he100Factor: fila.he100Factor,
      cuotaSolidariaPct: fila.cuotaSolidariaPct,
    });
  }
  return tabla.enFecha(fecha);
}
