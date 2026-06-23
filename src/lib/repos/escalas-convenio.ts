import { createClient } from "@/lib/supabase/server";
import { TablaParametrica, type FechaISO, type Cct345_2002 } from "@/motor";

const CATEGORIAS_MOTOR = ["ENCARGADO", "ADMINISTRATIVO", "OPERARIO"] as const;

export interface EscalaConvenioFila {
  id: string;
  convenioId: string;
  categoriaId: string;
  categoriaCodigo: string;
  categoriaNombre: string;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  basico: number;
}

interface EscalaConvenioRow {
  id: string;
  convenio_id: string;
  categoria_id: string;
  vigencia_desde: string;
  vigencia_hasta: string | null;
  basico: number;
  categorias_convenio: { codigo: string; nombre: string } | null;
}

const SELECT =
  "id, convenio_id, categoria_id, vigencia_desde, vigencia_hasta, basico, categorias_convenio(codigo, nombre)";

function mapRow(row: EscalaConvenioRow): EscalaConvenioFila {
  return {
    id: row.id,
    convenioId: row.convenio_id,
    categoriaId: row.categoria_id,
    categoriaCodigo: row.categorias_convenio?.codigo ?? "",
    categoriaNombre: row.categorias_convenio?.nombre ?? "",
    vigenciaDesde: row.vigencia_desde,
    vigenciaHasta: row.vigencia_hasta,
    basico: row.basico,
  };
}

export async function listarEscalas(convenioId: string): Promise<EscalaConvenioFila[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("escalas_convenio")
    .select(SELECT)
    .eq("convenio_id", convenioId)
    .order("vigencia_desde", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as unknown as EscalaConvenioRow[]).map(mapRow);
}

export async function obtenerVigenciaEscala(
  convenioId: string,
  vigenciaDesde: string
): Promise<EscalaConvenioFila[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("escalas_convenio")
    .select(SELECT)
    .eq("convenio_id", convenioId)
    .eq("vigencia_desde", vigenciaDesde);

  if (error) throw new Error(error.message);
  return (data as unknown as EscalaConvenioRow[]).map(mapRow);
}

export async function crearVigenciaEscala(
  convenioId: string,
  vigenciaDesde: string,
  vigenciaHasta: string | null,
  valores: Array<{ categoriaId: string; basico: number }>
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const filas = valores.map((v) => ({
    convenio_id: convenioId,
    categoria_id: v.categoriaId,
    vigencia_desde: vigenciaDesde,
    vigencia_hasta: vigenciaHasta,
    basico: v.basico,
  }));
  const { error } = await supabase.from("escalas_convenio").insert(filas);
  if (error) return { error: error.message };
  return {};
}

export async function actualizarVigenciaEscala(
  convenioId: string,
  vigenciaDesde: string,
  vigenciaHasta: string | null,
  valores: Array<{ categoriaId: string; basico: number }>
): Promise<{ error?: string }> {
  const supabase = await createClient();
  for (const v of valores) {
    const { error } = await supabase
      .from("escalas_convenio")
      .update({ vigencia_hasta: vigenciaHasta, basico: v.basico })
      .eq("convenio_id", convenioId)
      .eq("categoria_id", v.categoriaId)
      .eq("vigencia_desde", vigenciaDesde);
    if (error) return { error: error.message };
  }
  return {};
}

export async function eliminarVigenciaEscala(
  convenioId: string,
  vigenciaDesde: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("escalas_convenio")
    .delete()
    .eq("convenio_id", convenioId)
    .eq("vigencia_desde", vigenciaDesde);
  if (error) return { error: error.message };
  return {};
}

/**
 * Básicos por categoría vigentes a una fecha, en el formato que espera el
 * motor. Valida que las 3 categorías que el motor conoce (ENCARGADO,
 * ADMINISTRATIVO, OPERARIO) tengan básico cargado para esa vigencia — si
 * falta alguna, prefiere romper con un mensaje claro a calcular con NaN.
 */
export async function resolverBasicosConvenio(
  convenioId: string,
  fecha: FechaISO
): Promise<Cct345_2002.EscalaConvenio["basicos"]> {
  const filas = await listarEscalas(convenioId);

  const grupos = new Map<string, { desde: string; hasta: string | null; valores: Partial<Record<string, number>> }>();
  for (const fila of filas) {
    const key = `${fila.vigenciaDesde}|${fila.vigenciaHasta ?? ""}`;
    if (!grupos.has(key)) grupos.set(key, { desde: fila.vigenciaDesde, hasta: fila.vigenciaHasta, valores: {} });
    grupos.get(key)!.valores[fila.categoriaCodigo] = fila.basico;
  }

  const tabla = new TablaParametrica<Partial<Record<string, number>>>("escala_basicos");
  for (const grupo of grupos.values()) {
    tabla.agregar(grupo.desde, grupo.hasta, grupo.valores);
  }

  const valores = tabla.enFecha(fecha);
  for (const categoria of CATEGORIAS_MOTOR) {
    if (valores[categoria] === undefined) {
      throw new Error(`Falta el básico de la categoría ${categoria} en la escala vigente al ${fecha}.`);
    }
  }
  return valores as Cct345_2002.EscalaConvenio["basicos"];
}
