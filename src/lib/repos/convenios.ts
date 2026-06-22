import { createClient } from "@/lib/supabase/server";

export interface Convenio {
  id: string;
  codigo: string;
  nombre: string;
  jurisdiccion: string | null;
  activo: boolean;
}

export interface ConvenioInput {
  codigo: string;
  nombre: string;
  jurisdiccion: string | null;
}

interface ConvenioRow {
  id: string;
  codigo: string;
  nombre: string;
  jurisdiccion: string | null;
  activo: boolean;
}

function mapRow(row: ConvenioRow): Convenio {
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    jurisdiccion: row.jurisdiccion,
    activo: row.activo,
  };
}

export async function listarConvenios(): Promise<Convenio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("convenios")
    .select("id, codigo, nombre, jurisdiccion, activo")
    .order("codigo");

  if (error) throw new Error(error.message);
  return (data as ConvenioRow[]).map(mapRow);
}

export async function obtenerConvenio(id: string): Promise<Convenio | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("convenios")
    .select("id, codigo, nombre, jurisdiccion, activo")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as ConvenioRow) : null;
}

export async function crearConvenio(input: ConvenioInput): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("convenios").insert(input).select("id").single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un convenio con ese código." };
    return { error: error.message };
  }
  return { id: data.id };
}

export async function actualizarConvenio(id: string, input: ConvenioInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("convenios").update(input).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un convenio con ese código." };
    return { error: error.message };
  }
  return {};
}

export async function cambiarEstadoConvenio(id: string, activo: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("convenios").update({ activo }).eq("id", id);
  if (error) return { error: error.message };
  return {};
}
