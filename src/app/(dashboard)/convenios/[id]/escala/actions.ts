"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { valoresDeFormulario } from "@/lib/form-values";
import {
  actualizarVigenciaEscala,
  crearVigenciaEscala,
  eliminarVigenciaEscala,
} from "@/lib/repos/escalas-convenio";

export interface EscalaFormState {
  error?: string;
  values?: Record<string, string>;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";
const PREFIJO_BASICO = "basico_";

function parseVigenciaYBasicos(
  formData: FormData
): { vigenciaDesde?: string; vigenciaHasta: string | null; valores?: Array<{ categoriaId: string; basico: number }>; error?: string } {
  const vigenciaDesde = String(formData.get("vigenciaDesde") ?? "").trim();
  const vigenciaHastaRaw = String(formData.get("vigenciaHasta") ?? "").trim();
  const vigenciaHasta = vigenciaHastaRaw || null;

  if (!vigenciaDesde) return { vigenciaHasta, error: "La vigencia desde es obligatoria." };
  if (vigenciaHasta && vigenciaHasta < vigenciaDesde) {
    return { vigenciaHasta, error: "La vigencia hasta no puede ser anterior a la vigencia desde." };
  }

  const valores: Array<{ categoriaId: string; basico: number }> = [];
  for (const [nombre, valor] of formData.entries()) {
    if (!nombre.startsWith(PREFIJO_BASICO)) continue;
    const categoriaId = nombre.slice(PREFIJO_BASICO.length);
    const basico = Number(String(valor).trim());
    if (!Number.isFinite(basico)) {
      return { vigenciaHasta, error: "Todos los básicos deben ser numéricos." };
    }
    valores.push({ categoriaId, basico });
  }

  if (valores.length === 0) return { vigenciaHasta, error: "No hay categorías para cargar." };

  return { vigenciaDesde, vigenciaHasta, valores };
}

export async function crearVigenciaEscalaAction(
  convenioId: string,
  _prevState: EscalaFormState,
  formData: FormData
): Promise<EscalaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { vigenciaDesde, vigenciaHasta, valores, error } = parseVigenciaYBasicos(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await crearVigenciaEscala(convenioId, vigenciaDesde!, vigenciaHasta, valores!);
  if (result.error) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath(`/convenios/${convenioId}`);
  redirect(`/convenios/${convenioId}`);
}

export async function actualizarVigenciaEscalaAction(
  convenioId: string,
  vigenciaDesdeOriginal: string,
  _prevState: EscalaFormState,
  formData: FormData
): Promise<EscalaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { vigenciaHasta, valores, error } = parseVigenciaYBasicos(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await actualizarVigenciaEscala(convenioId, vigenciaDesdeOriginal, vigenciaHasta, valores!);
  if (result.error) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath(`/convenios/${convenioId}`);
  redirect(`/convenios/${convenioId}`);
}

export async function eliminarVigenciaEscalaAction(
  convenioId: string,
  vigenciaDesde: string,
  _prevState: EscalaFormState,
  _formData: FormData
): Promise<EscalaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const result = await eliminarVigenciaEscala(convenioId, vigenciaDesde);
  if (result.error) return { error: result.error };

  revalidatePath(`/convenios/${convenioId}`);
  return {};
}
