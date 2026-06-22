import { createClient } from "@/lib/supabase/server";

export interface AporteTrabajador {
  id: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  jubilacionPct: number;
  ley19032Pct: number;
  obraSocialPct: number;
}

export interface AporteTrabajadorInput {
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  jubilacionPct: number;
  ley19032Pct: number;
  obraSocialPct: number;
}

interface AporteTrabajadorRow {
  id: string;
  vigencia_desde: string;
  vigencia_hasta: string | null;
  jubilacion_pct: number;
  ley19032_pct: number;
  obra_social_pct: number;
}

function mapRow(row: AporteTrabajadorRow): AporteTrabajador {
  return {
    id: row.id,
    vigenciaDesde: row.vigencia_desde,
    vigenciaHasta: row.vigencia_hasta,
    jubilacionPct: row.jubilacion_pct,
    ley19032Pct: row.ley19032_pct,
    obraSocialPct: row.obra_social_pct,
  };
}

function toRow(input: AporteTrabajadorInput) {
  return {
    vigencia_desde: input.vigenciaDesde,
    vigencia_hasta: input.vigenciaHasta,
    jubilacion_pct: input.jubilacionPct,
    ley19032_pct: input.ley19032Pct,
    obra_social_pct: input.obraSocialPct,
  };
}

export async function listarAportesTrabajador(): Promise<AporteTrabajador[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("aportes_trabajador")
    .select("id, vigencia_desde, vigencia_hasta, jubilacion_pct, ley19032_pct, obra_social_pct")
    .order("vigencia_desde", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as AporteTrabajadorRow[]).map(mapRow);
}

export async function obtenerAporteTrabajador(id: string): Promise<AporteTrabajador | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("aportes_trabajador")
    .select("id, vigencia_desde, vigencia_hasta, jubilacion_pct, ley19032_pct, obra_social_pct")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as AporteTrabajadorRow) : null;
}

export async function crearAporteTrabajador(
  input: AporteTrabajadorInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("aportes_trabajador").insert(toRow(input)).select("id").single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function actualizarAporteTrabajador(
  id: string,
  input: AporteTrabajadorInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("aportes_trabajador").update(toRow(input)).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function eliminarAporteTrabajador(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("aportes_trabajador").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
