import { createClient } from "@/lib/supabase/server";

export type TipoPeriodo = "MENSUAL" | "SAC_1" | "SAC_2" | "VACACIONES" | "FINAL" | "RETROACTIVO";
export type EstadoPeriodo = "ABIERTO" | "CALCULADO" | "CONFIRMADO" | "CERRADO";

export interface Periodo {
  id: string;
  empresaId: string;
  empresaNombre: string;
  anio: number;
  mes: number;
  tipo: TipoPeriodo;
  estado: EstadoPeriodo;
  fechaPago: string | null;
}

export interface PeriodoInput {
  empresaId: string;
  anio: number;
  mes: number;
  tipo: TipoPeriodo;
  fechaPago: string | null;
}

interface PeriodoRow {
  id: string;
  empresa_id: string;
  anio: number;
  mes: number;
  tipo: TipoPeriodo;
  estado: EstadoPeriodo;
  fecha_pago: string | null;
  empresas: { razon_social: string } | null;
}

const SELECT = "id, empresa_id, anio, mes, tipo, estado, fecha_pago, empresas(razon_social)";

function mapRow(row: PeriodoRow): Periodo {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    empresaNombre: row.empresas?.razon_social ?? "—",
    anio: row.anio,
    mes: row.mes,
    tipo: row.tipo,
    estado: row.estado,
    fechaPago: row.fecha_pago,
  };
}

export async function listarPeriodos(): Promise<Periodo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("periodos")
    .select(SELECT)
    .order("anio", { ascending: false })
    .order("mes", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as unknown as PeriodoRow[]).map(mapRow);
}

export async function obtenerPeriodo(id: string): Promise<Periodo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("periodos").select(SELECT).eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as unknown as PeriodoRow) : null;
}

export async function crearPeriodo(input: PeriodoInput): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("periodos")
    .insert({
      empresa_id: input.empresaId,
      anio: input.anio,
      mes: input.mes,
      tipo: input.tipo,
      fecha_pago: input.fechaPago,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un período para esa empresa, año, mes y tipo." };
    return { error: error.message };
  }
  return { id: data.id };
}

export async function cambiarEstadoPeriodo(
  id: string,
  estado: EstadoPeriodo
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("periodos").update({ estado }).eq("id", id);
  if (error) return { error: error.message };
  return {};
}
