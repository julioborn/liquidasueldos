"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { valoresDeFormulario } from "@/lib/form-values";
import { porcentajeAFraccion } from "@/lib/porcentaje";
import {
  actualizarReglaConvenio,
  crearReglaConvenio,
  eliminarReglaConvenio,
  type AntiguedadBase,
  type ReglaConvenioInput,
} from "@/lib/repos/reglas-convenio";

export interface ReglaFormState {
  error?: string;
  values?: Record<string, string>;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";

function parseReglaForm(formData: FormData): { data?: ReglaConvenioInput; error?: string } {
  const vigenciaDesde = String(formData.get("vigenciaDesde") ?? "").trim();
  const vigenciaHastaRaw = String(formData.get("vigenciaHasta") ?? "").trim();
  const vigenciaHasta = vigenciaHastaRaw || null;
  const antiguedadBase = String(formData.get("antiguedadBase") ?? "") as AntiguedadBase;

  if (!vigenciaDesde) return { error: "La vigencia desde es obligatoria." };
  if (vigenciaHasta && vigenciaHasta < vigenciaDesde) {
    return { error: "La vigencia hasta no puede ser anterior a la vigencia desde." };
  }
  if (antiguedadBase !== "BASICO" && antiguedadBase !== "BRUTO") {
    return { error: "La base de antigüedad debe ser BASICO o BRUTO." };
  }

  const horasMensuales = Number(formData.get("horasMensuales"));
  const antiguedadPct = Number(formData.get("antiguedadPctAnio"));
  const he50Factor = Number(formData.get("he50Factor"));
  const he100Factor = Number(formData.get("he100Factor"));
  const cuotaSolidariaPct = Number(formData.get("cuotaSolidariaPct"));

  if (
    !Number.isFinite(horasMensuales) ||
    !Number.isFinite(antiguedadPct) ||
    !Number.isFinite(he50Factor) ||
    !Number.isFinite(he100Factor) ||
    !Number.isFinite(cuotaSolidariaPct)
  ) {
    return { error: "Todos los valores numéricos son obligatorios." };
  }

  return {
    data: {
      vigenciaDesde,
      vigenciaHasta,
      horasMensuales,
      antiguedadPctAnio: porcentajeAFraccion(antiguedadPct),
      antiguedadBase,
      he50Factor,
      he100Factor,
      cuotaSolidariaPct: porcentajeAFraccion(cuotaSolidariaPct),
    },
  };
}

export async function crearReglaAction(
  convenioId: string,
  _prevState: ReglaFormState,
  formData: FormData
): Promise<ReglaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseReglaForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await crearReglaConvenio(convenioId, data!);
  if ("error" in result) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath(`/convenios/${convenioId}`);
  redirect(`/convenios/${convenioId}`);
}

export async function actualizarReglaAction(
  convenioId: string,
  reglaId: string,
  _prevState: ReglaFormState,
  formData: FormData
): Promise<ReglaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseReglaForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await actualizarReglaConvenio(reglaId, data!);
  if (result.error) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath(`/convenios/${convenioId}`);
  redirect(`/convenios/${convenioId}`);
}

export async function eliminarReglaAction(
  reglaId: string,
  convenioId: string,
  _prevState: ReglaFormState,
  _formData: FormData
): Promise<ReglaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const result = await eliminarReglaConvenio(reglaId);
  if (result.error) return { error: result.error };

  revalidatePath(`/convenios/${convenioId}`);
  return {};
}
