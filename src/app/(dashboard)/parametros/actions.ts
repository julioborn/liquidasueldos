"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { valoresDeFormulario } from "@/lib/form-values";
import { porcentajeAFraccion } from "@/lib/porcentaje";
import {
  actualizarAporteTrabajador,
  crearAporteTrabajador,
  eliminarAporteTrabajador,
  type AporteTrabajadorInput,
} from "@/lib/repos/aportes-trabajador";
import {
  actualizarContribucionPatronal,
  crearContribucionPatronal,
  eliminarContribucionPatronal,
  type ContribucionPatronalInput,
} from "@/lib/repos/contribuciones-patronales";
import {
  actualizarTopeSipa,
  crearTopeSipa,
  eliminarTopeSipa,
  type TopeSipaInput,
} from "@/lib/repos/topes-sipa";

export interface ParametroFormState {
  error?: string;
  values?: Record<string, string>;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";

function parseVigencia(formData: FormData): { desde?: string; hasta: string | null; error?: string } {
  const desde = String(formData.get("vigenciaDesde") ?? "").trim();
  const hastaRaw = String(formData.get("vigenciaHasta") ?? "").trim();
  const hasta = hastaRaw || null;

  if (!desde) return { hasta, error: "La vigencia desde es obligatoria." };
  if (hasta && hasta < desde) return { hasta, error: "La vigencia hasta no puede ser anterior a la vigencia desde." };

  return { desde, hasta };
}

function parsePct(formData: FormData, nombre: string): number | null {
  const raw = String(formData.get(nombre) ?? "").trim();
  if (raw === "") return null;
  const valor = Number(raw);
  return Number.isFinite(valor) ? valor : null;
}

function parseMonto(formData: FormData, nombre: string): number {
  const raw = String(formData.get(nombre) ?? "").trim();
  if (raw === "") return 0;
  const valor = Number(raw);
  return Number.isFinite(valor) ? valor : 0;
}

// ---- Aportes del trabajador ----

function parseAporteTrabajadorForm(formData: FormData): { data?: AporteTrabajadorInput; error?: string } {
  const { desde, hasta, error } = parseVigencia(formData);
  if (error) return { error };

  const jubilacionPct = parsePct(formData, "jubilacionPct");
  const ley19032Pct = parsePct(formData, "ley19032Pct");
  const obraSocialPct = parsePct(formData, "obraSocialPct");
  if (jubilacionPct === null || ley19032Pct === null || obraSocialPct === null) {
    return { error: "Las tres alícuotas son obligatorias y deben ser numéricas." };
  }

  return {
    data: {
      vigenciaDesde: desde!,
      vigenciaHasta: hasta,
      jubilacionPct: porcentajeAFraccion(jubilacionPct),
      ley19032Pct: porcentajeAFraccion(ley19032Pct),
      obraSocialPct: porcentajeAFraccion(obraSocialPct),
    },
  };
}

export async function crearAporteTrabajadorAction(
  _prevState: ParametroFormState,
  formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseAporteTrabajadorForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await crearAporteTrabajador(data!);
  if ("error" in result) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/parametros");
  redirect("/parametros");
}

export async function actualizarAporteTrabajadorAction(
  id: string,
  _prevState: ParametroFormState,
  formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseAporteTrabajadorForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await actualizarAporteTrabajador(id, data!);
  if (result.error) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/parametros");
  redirect("/parametros");
}

export async function eliminarAporteTrabajadorAction(
  id: string,
  _prevState: ParametroFormState,
  _formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const result = await eliminarAporteTrabajador(id);
  if (result.error) return { error: result.error };

  revalidatePath("/parametros");
  return {};
}

// ---- Topes SIPA ----

function parseTopeSipaForm(formData: FormData): { data?: TopeSipaInput; error?: string } {
  const { desde, hasta, error } = parseVigencia(formData);
  if (error) return { error };

  return {
    data: {
      vigenciaDesde: desde!,
      vigenciaHasta: hasta,
      baseMin: parseMonto(formData, "baseMin"),
      baseMax: parseMonto(formData, "baseMax"),
    },
  };
}

export async function crearTopeSipaAction(
  _prevState: ParametroFormState,
  formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseTopeSipaForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await crearTopeSipa(data!);
  if ("error" in result) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/parametros");
  redirect("/parametros");
}

export async function actualizarTopeSipaAction(
  id: string,
  _prevState: ParametroFormState,
  formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseTopeSipaForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await actualizarTopeSipa(id, data!);
  if (result.error) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/parametros");
  redirect("/parametros");
}

export async function eliminarTopeSipaAction(
  id: string,
  _prevState: ParametroFormState,
  _formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const result = await eliminarTopeSipa(id);
  if (result.error) return { error: result.error };

  revalidatePath("/parametros");
  return {};
}

// ---- Contribuciones patronales ----

function parseContribucionPatronalForm(
  formData: FormData
): { data?: ContribucionPatronalInput; error?: string } {
  const tipoEmpleador = String(formData.get("tipoEmpleador") ?? "").trim();
  const { desde, hasta, error } = parseVigencia(formData);
  if (error) return { error };
  if (!tipoEmpleador) return { error: "El tipo de empleador es obligatorio (debe coincidir con el de la empresa)." };

  const alicuotaPct = parsePct(formData, "alicuotaPct");
  if (alicuotaPct === null) return { error: "La alícuota es obligatoria y debe ser numérica." };

  return {
    data: {
      tipoEmpleador,
      vigenciaDesde: desde!,
      vigenciaHasta: hasta,
      alicuotaPct: porcentajeAFraccion(alicuotaPct),
      detraccionMinimoNoImponible: parseMonto(formData, "detraccionMinimoNoImponible"),
    },
  };
}

export async function crearContribucionPatronalAction(
  _prevState: ParametroFormState,
  formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseContribucionPatronalForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await crearContribucionPatronal(data!);
  if ("error" in result) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/parametros");
  redirect("/parametros");
}

export async function actualizarContribucionPatronalAction(
  id: string,
  _prevState: ParametroFormState,
  formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseContribucionPatronalForm(formData);
  if (error) return { error, values: valoresDeFormulario(formData) };

  const result = await actualizarContribucionPatronal(id, data!);
  if (result.error) return { error: result.error, values: valoresDeFormulario(formData) };

  revalidatePath("/parametros");
  redirect("/parametros");
}

export async function eliminarContribucionPatronalAction(
  id: string,
  _prevState: ParametroFormState,
  _formData: FormData
): Promise<ParametroFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const result = await eliminarContribucionPatronal(id);
  if (result.error) return { error: result.error };

  revalidatePath("/parametros");
  return {};
}
