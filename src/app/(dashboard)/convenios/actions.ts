"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { valoresDeFormulario } from "@/lib/form-values";
import {
  actualizarConvenio,
  cambiarEstadoConvenio,
  crearConvenio,
  type ConvenioInput,
} from "@/lib/repos/convenios";

export interface ConvenioFormState {
  error?: string;
  values?: Record<string, string>;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";

function parseConvenioForm(formData: FormData): { data?: ConvenioInput; error?: string } {
  const codigo = String(formData.get("codigo") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const jurisdiccion = String(formData.get("jurisdiccion") ?? "").trim();

  if (!codigo) return { error: "El código es obligatorio (ej. 345/2002)." };
  if (!nombre) return { error: "El nombre es obligatorio." };

  return { data: { codigo, nombre, jurisdiccion: jurisdiccion || null } };
}

export async function crearConvenioAction(
  _prevState: ConvenioFormState,
  formData: FormData
): Promise<ConvenioFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseConvenioForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await crearConvenio(data!);
  if ("error" in result) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/convenios");
  redirect("/convenios");
}

export async function actualizarConvenioAction(
  id: string,
  _prevState: ConvenioFormState,
  formData: FormData
): Promise<ConvenioFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseConvenioForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await actualizarConvenio(id, data!);
  if (result.error) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/convenios");
  revalidatePath(`/convenios/${id}`);
  redirect("/convenios");
}

export async function cambiarEstadoConvenioAction(formData: FormData): Promise<void> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return;

  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";
  if (!id) return;

  await cambiarEstadoConvenio(id, !activo);
  revalidatePath("/convenios");
  revalidatePath(`/convenios/${id}`);
}
