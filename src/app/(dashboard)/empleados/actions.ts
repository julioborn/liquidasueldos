"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { esCuilValido, normalizarCuil } from "@/lib/cuit";
import {
  actualizarEmpleado,
  cambiarEstadoEmpleado,
  crearEmpleado,
  type EmpleadoInput,
  type EstadoEmpleado,
} from "@/lib/repos/empleados";

export interface EmpleadoFormState {
  error?: string;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";

function campoOpcional(formData: FormData, nombre: string): string | null {
  const valor = String(formData.get(nombre) ?? "").trim();
  return valor || null;
}

function parseEmpleadoForm(formData: FormData): { data?: EmpleadoInput; error?: string } {
  const empresaId = String(formData.get("empresaId") ?? "").trim();
  const legajo = String(formData.get("legajo") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const cuilInput = String(formData.get("cuil") ?? "").trim();
  const fechaIngreso = String(formData.get("fechaIngreso") ?? "").trim();
  const modalidadContratacion = String(formData.get("modalidadContratacion") ?? "").trim() || "TIEMPO_INDETERMINADO";

  if (!empresaId) return { error: "Seleccioná la empresa." };
  if (!legajo) return { error: "El legajo es obligatorio." };
  if (!apellido) return { error: "El apellido es obligatorio." };
  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!esCuilValido(cuilInput)) return { error: "El CUIL no es válido." };
  if (!fechaIngreso) return { error: "La fecha de ingreso es obligatoria." };

  return {
    data: {
      empresaId,
      legajo,
      apellido,
      nombre,
      cuil: normalizarCuil(cuilInput),
      fechaNacimiento: campoOpcional(formData, "fechaNacimiento"),
      fechaIngreso,
      fechaEgreso: campoOpcional(formData, "fechaEgreso"),
      convenioId: campoOpcional(formData, "convenioId"),
      categoriaId: campoOpcional(formData, "categoriaId"),
      modalidadContratacion,
      cbu: campoOpcional(formData, "cbu"),
      banco: campoOpcional(formData, "banco"),
      domicilio: campoOpcional(formData, "domicilio"),
    },
  };
}

export async function crearEmpleadoAction(
  _prevState: EmpleadoFormState,
  formData: FormData
): Promise<EmpleadoFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseEmpleadoForm(formData);
  if (error) return { error };

  const result = await crearEmpleado(data!);
  if ("error" in result) return { error: result.error };

  revalidatePath("/empleados");
  redirect("/empleados");
}

export async function actualizarEmpleadoAction(
  id: string,
  _prevState: EmpleadoFormState,
  formData: FormData
): Promise<EmpleadoFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseEmpleadoForm(formData);
  if (error) return { error };

  const result = await actualizarEmpleado(id, data!);
  if (result.error) return { error: result.error };

  revalidatePath("/empleados");
  redirect("/empleados");
}

export async function cambiarEstadoEmpleadoAction(formData: FormData): Promise<void> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return;

  const id = String(formData.get("id") ?? "");
  const estadoActual = String(formData.get("estado") ?? "") as EstadoEmpleado;
  if (!id) return;

  const nuevoEstado: EstadoEmpleado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";
  await cambiarEstadoEmpleado(id, nuevoEstado);
  revalidatePath("/empleados");
}
