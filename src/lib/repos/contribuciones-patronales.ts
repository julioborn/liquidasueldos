import { createClient } from "@/lib/supabase/server";

export interface ContribucionPatronal {
  id: string;
  tipoEmpleador: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  alicuotaPct: number;
  detraccionMinimoNoImponible: number;
}

export interface ContribucionPatronalInput {
  tipoEmpleador: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  alicuotaPct: number;
  detraccionMinimoNoImponible: number;
}

interface ContribucionPatronalRow {
  id: string;
  tipo_empleador: string;
  vigencia_desde: string;
  vigencia_hasta: string | null;
  alicuota_pct: number;
  detraccion_minimo_no_imponible: number;
}

function mapRow(row: ContribucionPatronalRow): ContribucionPatronal {
  return {
    id: row.id,
    tipoEmpleador: row.tipo_empleador,
    vigenciaDesde: row.vigencia_desde,
    vigenciaHasta: row.vigencia_hasta,
    alicuotaPct: row.alicuota_pct,
    detraccionMinimoNoImponible: row.detraccion_minimo_no_imponible,
  };
}

function toRow(input: ContribucionPatronalInput) {
  return {
    tipo_empleador: input.tipoEmpleador,
    vigencia_desde: input.vigenciaDesde,
    vigencia_hasta: input.vigenciaHasta,
    alicuota_pct: input.alicuotaPct,
    detraccion_minimo_no_imponible: input.detraccionMinimoNoImponible,
  };
}

export async function listarContribucionesPatronales(): Promise<ContribucionPatronal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contribuciones_patronales")
    .select("id, tipo_empleador, vigencia_desde, vigencia_hasta, alicuota_pct, detraccion_minimo_no_imponible")
    .order("tipo_empleador")
    .order("vigencia_desde", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ContribucionPatronalRow[]).map(mapRow);
}

export async function obtenerContribucionPatronal(id: string): Promise<ContribucionPatronal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contribuciones_patronales")
    .select("id, tipo_empleador, vigencia_desde, vigencia_hasta, alicuota_pct, detraccion_minimo_no_imponible")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as ContribucionPatronalRow) : null;
}

export async function crearContribucionPatronal(
  input: ContribucionPatronalInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contribuciones_patronales")
    .insert(toRow(input))
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function actualizarContribucionPatronal(
  id: string,
  input: ContribucionPatronalInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("contribuciones_patronales").update(toRow(input)).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function eliminarContribucionPatronal(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("contribuciones_patronales").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
