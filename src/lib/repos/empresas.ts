import { createClient } from "@/lib/supabase/server";

export interface Empresa {
  id: string;
  razonSocial: string;
  cuit: string;
  domicilio: string | null;
  actividad: string | null;
  artCompania: string | null;
  artNumeroContrato: string | null;
  tipoEmpleador: string;
  activa: boolean;
}

export interface EmpresaInput {
  razonSocial: string;
  cuit: string;
  domicilio: string | null;
  actividad: string | null;
  artCompania: string | null;
  artNumeroContrato: string | null;
  tipoEmpleador: string;
}

interface EmpresaRow {
  id: string;
  razon_social: string;
  cuit: string;
  domicilio: string | null;
  actividad: string | null;
  art_compania: string | null;
  art_numero_contrato: string | null;
  tipo_empleador: string;
  activa: boolean;
}

function mapRow(row: EmpresaRow): Empresa {
  return {
    id: row.id,
    razonSocial: row.razon_social,
    cuit: row.cuit,
    domicilio: row.domicilio,
    actividad: row.actividad,
    artCompania: row.art_compania,
    artNumeroContrato: row.art_numero_contrato,
    tipoEmpleador: row.tipo_empleador,
    activa: row.activa,
  };
}

function toRow(input: EmpresaInput) {
  return {
    razon_social: input.razonSocial,
    cuit: input.cuit,
    domicilio: input.domicilio,
    actividad: input.actividad,
    art_compania: input.artCompania,
    art_numero_contrato: input.artNumeroContrato,
    tipo_empleador: input.tipoEmpleador,
  };
}

export async function listarEmpresas(): Promise<Empresa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select("id, razon_social, cuit, domicilio, actividad, art_compania, art_numero_contrato, tipo_empleador, activa")
    .order("razon_social");

  if (error) throw new Error(error.message);
  return (data as EmpresaRow[]).map(mapRow);
}

export async function obtenerEmpresa(id: string): Promise<Empresa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select("id, razon_social, cuit, domicilio, actividad, art_compania, art_numero_contrato, tipo_empleador, activa")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as EmpresaRow) : null;
}

export async function crearEmpresa(input: EmpresaInput): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("empresas").insert(toRow(input)).select("id").single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una empresa con ese CUIT." };
    return { error: error.message };
  }
  return { id: data.id };
}

export async function actualizarEmpresa(id: string, input: EmpresaInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("empresas").update(toRow(input)).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una empresa con ese CUIT." };
    return { error: error.message };
  }
  return {};
}

export async function cambiarEstadoEmpresa(id: string, activa: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("empresas").update({ activa }).eq("id", id);
  if (error) return { error: error.message };
  return {};
}
