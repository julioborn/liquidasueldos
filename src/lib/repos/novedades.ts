import { createClient } from "@/lib/supabase/server";

export interface Novedad {
  id: string;
  periodoId: string;
  empleadoId: string;
  diasTrabajados: number;
  horasExtra50: number;
  horasExtra100: number;
  asistenciaPerfecta: boolean;
  manejoFondos: boolean;
  observaciones: string | null;
}

export interface NovedadInput {
  diasTrabajados: number;
  horasExtra50: number;
  horasExtra100: number;
  asistenciaPerfecta: boolean;
  manejoFondos: boolean;
  observaciones: string | null;
}

interface NovedadRow {
  id: string;
  periodo_id: string;
  empleado_id: string;
  dias_trabajados: number;
  horas_extra_50: number;
  horas_extra_100: number;
  asistencia_perfecta: boolean;
  manejo_fondos: boolean;
  observaciones: string | null;
}

const SELECT =
  "id, periodo_id, empleado_id, dias_trabajados, horas_extra_50, horas_extra_100, " +
  "asistencia_perfecta, manejo_fondos, observaciones";

function mapRow(row: NovedadRow): Novedad {
  return {
    id: row.id,
    periodoId: row.periodo_id,
    empleadoId: row.empleado_id,
    diasTrabajados: row.dias_trabajados,
    horasExtra50: row.horas_extra_50,
    horasExtra100: row.horas_extra_100,
    asistenciaPerfecta: row.asistencia_perfecta,
    manejoFondos: row.manejo_fondos,
    observaciones: row.observaciones,
  };
}

export async function listarNovedadesPorPeriodo(periodoId: string): Promise<Novedad[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("novedades").select(SELECT).eq("periodo_id", periodoId);

  if (error) throw new Error(error.message);
  return (data as unknown as NovedadRow[]).map(mapRow);
}

export async function guardarNovedad(
  periodoId: string,
  empleadoId: string,
  input: NovedadInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("novedades").upsert(
    {
      periodo_id: periodoId,
      empleado_id: empleadoId,
      dias_trabajados: input.diasTrabajados,
      horas_extra_50: input.horasExtra50,
      horas_extra_100: input.horasExtra100,
      asistencia_perfecta: input.asistenciaPerfecta,
      manejo_fondos: input.manejoFondos,
      observaciones: input.observaciones,
    },
    { onConflict: "periodo_id,empleado_id" }
  );

  if (error) return { error: error.message };
  return {};
}
