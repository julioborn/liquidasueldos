import { createClient } from "@/lib/supabase/server";

export interface CategoriaConvenio {
  id: string;
  convenioId: string;
  codigo: string;
  nombre: string;
  orden: number;
}

export interface CategoriaConvenioInput {
  codigo: string;
  nombre: string;
  orden: number;
}

interface CategoriaConvenioRow {
  id: string;
  convenio_id: string;
  codigo: string;
  nombre: string;
  orden: number;
}

function mapRow(row: CategoriaConvenioRow): CategoriaConvenio {
  return {
    id: row.id,
    convenioId: row.convenio_id,
    codigo: row.codigo,
    nombre: row.nombre,
    orden: row.orden,
  };
}

export async function listarCategorias(convenioId: string): Promise<CategoriaConvenio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias_convenio")
    .select("id, convenio_id, codigo, nombre, orden")
    .eq("convenio_id", convenioId)
    .order("orden")
    .order("codigo");

  if (error) throw new Error(error.message);
  return (data as CategoriaConvenioRow[]).map(mapRow);
}

/** Todas las categorías de todos los convenios, para filtrar convenio→categoría sin N+1 queries. */
export async function listarTodasLasCategorias(): Promise<CategoriaConvenio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias_convenio")
    .select("id, convenio_id, codigo, nombre, orden")
    .order("convenio_id")
    .order("orden")
    .order("codigo");

  if (error) throw new Error(error.message);
  return (data as CategoriaConvenioRow[]).map(mapRow);
}

export async function obtenerCategoria(id: string): Promise<CategoriaConvenio | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias_convenio")
    .select("id, convenio_id, codigo, nombre, orden")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as CategoriaConvenioRow) : null;
}

export async function crearCategoria(
  convenioId: string,
  input: CategoriaConvenioInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias_convenio")
    .insert({ convenio_id: convenioId, ...input })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una categoría con ese código en este convenio." };
    return { error: error.message };
  }
  return { id: data.id };
}

export async function actualizarCategoria(
  id: string,
  input: CategoriaConvenioInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("categorias_convenio").update(input).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una categoría con ese código en este convenio." };
    return { error: error.message };
  }
  return {};
}

export async function eliminarCategoria(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("categorias_convenio").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return { error: "No se puede eliminar: hay empleados o escalas que usan esta categoría." };
    }
    return { error: error.message };
  }
  return {};
}
