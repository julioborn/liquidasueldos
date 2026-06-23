import { createClient } from "@/lib/supabase/server";

export type EstadoEmpleado = "ACTIVO" | "INACTIVO";

export interface Empleado {
  id: string;
  empresaId: string;
  empresaNombre: string;
  legajo: string;
  apellido: string;
  nombre: string;
  cuil: string;
  fechaNacimiento: string | null;
  fechaIngreso: string;
  fechaEgreso: string | null;
  convenioId: string | null;
  convenioCodigo: string | null;
  categoriaId: string | null;
  categoriaNombre: string | null;
  modalidadContratacion: string;
  cbu: string | null;
  banco: string | null;
  domicilio: string | null;
  estado: EstadoEmpleado;
}

export interface EmpleadoInput {
  empresaId: string;
  legajo: string;
  apellido: string;
  nombre: string;
  cuil: string;
  fechaNacimiento: string | null;
  fechaIngreso: string;
  fechaEgreso: string | null;
  convenioId: string | null;
  categoriaId: string | null;
  modalidadContratacion: string;
  cbu: string | null;
  banco: string | null;
  domicilio: string | null;
}

interface EmpleadoRow {
  id: string;
  empresa_id: string;
  legajo: string;
  apellido: string;
  nombre: string;
  cuil: string;
  fecha_nacimiento: string | null;
  fecha_ingreso: string;
  fecha_egreso: string | null;
  convenio_id: string | null;
  categoria_id: string | null;
  modalidad_contratacion: string;
  cbu: string | null;
  banco: string | null;
  domicilio: string | null;
  estado: EstadoEmpleado;
  empresas: { razon_social: string } | null;
  convenios: { codigo: string } | null;
  categorias_convenio: { nombre: string } | null;
}

const SELECT_CON_JOINS =
  "id, empresa_id, legajo, apellido, nombre, cuil, fecha_nacimiento, fecha_ingreso, fecha_egreso, " +
  "convenio_id, categoria_id, modalidad_contratacion, cbu, banco, domicilio, estado, " +
  "empresas(razon_social), convenios(codigo), categorias_convenio(nombre)";

function mapRow(row: EmpleadoRow): Empleado {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    empresaNombre: row.empresas?.razon_social ?? "—",
    legajo: row.legajo,
    apellido: row.apellido,
    nombre: row.nombre,
    cuil: row.cuil,
    fechaNacimiento: row.fecha_nacimiento,
    fechaIngreso: row.fecha_ingreso,
    fechaEgreso: row.fecha_egreso,
    convenioId: row.convenio_id,
    convenioCodigo: row.convenios?.codigo ?? null,
    categoriaId: row.categoria_id,
    categoriaNombre: row.categorias_convenio?.nombre ?? null,
    modalidadContratacion: row.modalidad_contratacion,
    cbu: row.cbu,
    banco: row.banco,
    domicilio: row.domicilio,
    estado: row.estado,
  };
}

function toRow(input: EmpleadoInput) {
  return {
    empresa_id: input.empresaId,
    legajo: input.legajo,
    apellido: input.apellido,
    nombre: input.nombre,
    cuil: input.cuil,
    fecha_nacimiento: input.fechaNacimiento,
    fecha_ingreso: input.fechaIngreso,
    fecha_egreso: input.fechaEgreso,
    convenio_id: input.convenioId,
    categoria_id: input.categoriaId,
    modalidad_contratacion: input.modalidadContratacion,
    cbu: input.cbu,
    banco: input.banco,
    domicilio: input.domicilio,
  };
}

export async function listarEmpleados(): Promise<Empleado[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empleados")
    .select(SELECT_CON_JOINS)
    .order("apellido")
    .order("nombre");

  if (error) throw new Error(error.message);
  return (data as unknown as EmpleadoRow[]).map(mapRow);
}

/** Empleados activos de una empresa, para cargar novedades de un período. */
export async function listarEmpleadosActivosPorEmpresa(empresaId: string): Promise<Empleado[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empleados")
    .select(SELECT_CON_JOINS)
    .eq("empresa_id", empresaId)
    .eq("estado", "ACTIVO")
    .order("apellido")
    .order("nombre");

  if (error) throw new Error(error.message);
  return (data as unknown as EmpleadoRow[]).map(mapRow);
}

export async function obtenerEmpleado(id: string): Promise<Empleado | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empleados")
    .select(SELECT_CON_JOINS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as unknown as EmpleadoRow) : null;
}

export async function crearEmpleado(input: EmpleadoInput): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("empleados").insert(toRow(input)).select("id").single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un empleado con ese legajo en esta empresa." };
    return { error: error.message };
  }
  return { id: data.id };
}

export async function actualizarEmpleado(id: string, input: EmpleadoInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("empleados").update(toRow(input)).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un empleado con ese legajo en esta empresa." };
    return { error: error.message };
  }
  return {};
}

export async function cambiarEstadoEmpleado(id: string, estado: EstadoEmpleado): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("empleados").update({ estado }).eq("id", id);
  if (error) return { error: error.message };
  return {};
}
