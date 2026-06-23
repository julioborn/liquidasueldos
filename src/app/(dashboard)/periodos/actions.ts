"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { esAdminOLiquidador, getCurrentProfile } from "@/lib/auth/current-profile";
import { valoresDeFormulario } from "@/lib/form-values";
import {
  cambiarEstadoPeriodo,
  crearPeriodo,
  type EstadoPeriodo,
  type PeriodoInput,
  type TipoPeriodo,
} from "@/lib/repos/periodos";

export interface PeriodoFormState {
  error?: string;
  values?: Record<string, string>;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";
const TIPOS_VALIDOS: TipoPeriodo[] = ["MENSUAL", "SAC_1", "SAC_2", "VACACIONES", "FINAL", "RETROACTIVO"];

function parsePeriodoForm(formData: FormData): { data?: PeriodoInput; error?: string } {
  const empresaId = String(formData.get("empresaId") ?? "").trim();
  const anio = Number(formData.get("anio"));
  const mes = Number(formData.get("mes"));
  const tipo = String(formData.get("tipo") ?? "MENSUAL") as TipoPeriodo;
  const fechaPagoRaw = String(formData.get("fechaPago") ?? "").trim();

  if (!empresaId) return { error: "Seleccioná la empresa." };
  if (!Number.isInteger(anio) || anio < 2000) return { error: "El año no es válido." };
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) return { error: "El mes debe estar entre 1 y 12." };
  if (!TIPOS_VALIDOS.includes(tipo)) return { error: "El tipo de período no es válido." };

  return { data: { empresaId, anio, mes, tipo, fechaPago: fechaPagoRaw || null } };
}

export async function crearPeriodoAction(
  _prevState: PeriodoFormState,
  formData: FormData
): Promise<PeriodoFormState> {
  const profile = await getCurrentProfile();
  if (!esAdminOLiquidador(profile?.rol)) return { error: SIN_PERMISOS };

  const { data, error } = parsePeriodoForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await crearPeriodo(data!);
  if ("error" in result) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/periodos");
  redirect(`/periodos/${result.id}`);
}

export async function cambiarEstadoPeriodoAction(formData: FormData): Promise<void> {
  const profile = await getCurrentProfile();
  const id = String(formData.get("id") ?? "");
  const estado = String(formData.get("estado") ?? "") as EstadoPeriodo;
  if (!id || !estado) return;

  if (estado === "CERRADO") {
    if (profile?.rol !== "administrador") return;
  } else if (!esAdminOLiquidador(profile?.rol)) {
    return;
  }

  await cambiarEstadoPeriodo(id, estado);
  revalidatePath("/periodos");
  revalidatePath(`/periodos/${id}`);
}
