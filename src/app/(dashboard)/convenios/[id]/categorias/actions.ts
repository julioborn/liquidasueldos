"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  type CategoriaConvenioInput,
} from "@/lib/repos/categorias-convenio";

export interface CategoriaFormState {
  error?: string;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";

function parseCategoriaForm(formData: FormData): { data?: CategoriaConvenioInput; error?: string } {
  const codigo = String(formData.get("codigo") ?? "").trim().toUpperCase();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const ordenRaw = String(formData.get("orden") ?? "").trim();
  const orden = ordenRaw === "" ? 0 : Number(ordenRaw);

  if (!codigo) return { error: "El código es obligatorio (ej. OPERARIO)." };
  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!Number.isInteger(orden)) return { error: "El orden debe ser un número entero." };

  return { data: { codigo, nombre, orden } };
}

export async function crearCategoriaAction(
  convenioId: string,
  _prevState: CategoriaFormState,
  formData: FormData
): Promise<CategoriaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseCategoriaForm(formData);
  if (error) return { error };

  const result = await crearCategoria(convenioId, data!);
  if ("error" in result) return { error: result.error };

  revalidatePath(`/convenios/${convenioId}`);
  redirect(`/convenios/${convenioId}`);
}

export async function actualizarCategoriaAction(
  convenioId: string,
  categoriaId: string,
  _prevState: CategoriaFormState,
  formData: FormData
): Promise<CategoriaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseCategoriaForm(formData);
  if (error) return { error };

  const result = await actualizarCategoria(categoriaId, data!);
  if (result.error) return { error: result.error };

  revalidatePath(`/convenios/${convenioId}`);
  redirect(`/convenios/${convenioId}`);
}

export async function eliminarCategoriaAction(
  categoriaId: string,
  convenioId: string,
  _prevState: CategoriaFormState,
  _formData: FormData
): Promise<CategoriaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const result = await eliminarCategoria(categoriaId);
  if (result.error) return { error: result.error };

  revalidatePath(`/convenios/${convenioId}`);
  return {};
}
