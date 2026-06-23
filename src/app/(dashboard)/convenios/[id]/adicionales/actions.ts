"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { valoresDeFormulario } from "@/lib/form-values";
import {
  actualizarAdicionalConvenio,
  crearAdicionalConvenio,
  eliminarAdicionalConvenio,
  type AdicionalConvenioInput,
} from "@/lib/repos/adicionales-convenio";

export interface AdicionalFormState {
  error?: string;
  values?: Record<string, string>;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";

function parseAdicionalForm(formData: FormData): { data?: AdicionalConvenioInput; error?: string } {
  const codigo = String(formData.get("codigo") ?? "").trim().toUpperCase();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const vigenciaDesde = String(formData.get("vigenciaDesde") ?? "").trim();
  const vigenciaHastaRaw = String(formData.get("vigenciaHasta") ?? "").trim();
  const vigenciaHasta = vigenciaHastaRaw || null;
  const importeRaw = String(formData.get("importe") ?? "").trim();
  const importe = Number(importeRaw);

  if (!codigo) return { error: "El código es obligatorio (ej. ASISTENCIA_PERFECTA)." };
  if (!descripcion) return { error: "La descripción es obligatoria." };
  if (!vigenciaDesde) return { error: "La vigencia desde es obligatoria." };
  if (vigenciaHasta && vigenciaHasta < vigenciaDesde) {
    return { error: "La vigencia hasta no puede ser anterior a la vigencia desde." };
  }
  if (!Number.isFinite(importe)) return { error: "El importe debe ser numérico." };

  return { data: { codigo, descripcion, vigenciaDesde, vigenciaHasta, importe } };
}

export async function crearAdicionalAction(
  convenioId: string,
  _prevState: AdicionalFormState,
  formData: FormData
): Promise<AdicionalFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseAdicionalForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await crearAdicionalConvenio(convenioId, data!);
  if ("error" in result) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath(`/convenios/${convenioId}`);
  redirect(`/convenios/${convenioId}`);
}

export async function actualizarAdicionalAction(
  convenioId: string,
  adicionalId: string,
  _prevState: AdicionalFormState,
  formData: FormData
): Promise<AdicionalFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseAdicionalForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await actualizarAdicionalConvenio(adicionalId, data!);
  if (result.error) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath(`/convenios/${convenioId}`);
  redirect(`/convenios/${convenioId}`);
}

export async function eliminarAdicionalAction(
  adicionalId: string,
  convenioId: string,
  _prevState: AdicionalFormState,
  _formData: FormData
): Promise<AdicionalFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const result = await eliminarAdicionalConvenio(adicionalId);
  if (result.error) return { error: result.error };

  revalidatePath(`/convenios/${convenioId}`);
  return {};
}
