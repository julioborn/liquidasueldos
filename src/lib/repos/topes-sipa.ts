import { createClient } from "@/lib/supabase/server";

export interface TopeSipa {
  id: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  baseMin: number;
  baseMax: number;
}

export interface TopeSipaInput {
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  baseMin: number;
  baseMax: number;
}

interface TopeSipaRow {
  id: string;
  vigencia_desde: string;
  vigencia_hasta: string | null;
  base_min: number;
  base_max: number;
}

function mapRow(row: TopeSipaRow): TopeSipa {
  return {
    id: row.id,
    vigenciaDesde: row.vigencia_desde,
    vigenciaHasta: row.vigencia_hasta,
    baseMin: row.base_min,
    baseMax: row.base_max,
  };
}

function toRow(input: TopeSipaInput) {
  return {
    vigencia_desde: input.vigenciaDesde,
    vigencia_hasta: input.vigenciaHasta,
    base_min: input.baseMin,
    base_max: input.baseMax,
  };
}

export async function listarTopesSipa(): Promise<TopeSipa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topes_sipa")
    .select("id, vigencia_desde, vigencia_hasta, base_min, base_max")
    .order("vigencia_desde", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as TopeSipaRow[]).map(mapRow);
}

export async function obtenerTopeSipa(id: string): Promise<TopeSipa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topes_sipa")
    .select("id, vigencia_desde, vigencia_hasta, base_min, base_max")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as TopeSipaRow) : null;
}

export async function crearTopeSipa(input: TopeSipaInput): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("topes_sipa").insert(toRow(input)).select("id").single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function actualizarTopeSipa(id: string, input: TopeSipaInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("topes_sipa").update(toRow(input)).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function eliminarTopeSipa(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("topes_sipa").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}
