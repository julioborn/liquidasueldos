"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { esCuitValido, normalizarCuit } from "@/lib/cuit";
import {
  actualizarEmpresa,
  cambiarEstadoEmpresa,
  crearEmpresa,
  type EmpresaInput,
} from "@/lib/repos/empresas";

export interface EmpresaFormState {
  error?: string;
}

const SIN_PERMISOS = "No tenés permisos para hacer esto.";

function parseEmpresaForm(formData: FormData): { data?: EmpresaInput; error?: string } {
  const razonSocial = String(formData.get("razonSocial") ?? "").trim();
  const cuitInput = String(formData.get("cuit") ?? "").trim();
  const domicilio = String(formData.get("domicilio") ?? "").trim();
  const actividad = String(formData.get("actividad") ?? "").trim();
  const artCompania = String(formData.get("artCompania") ?? "").trim();
  const artNumeroContrato = String(formData.get("artNumeroContrato") ?? "").trim();
  const tipoEmpleador = String(formData.get("tipoEmpleador") ?? "").trim() || "GENERAL";

  if (!razonSocial) return { error: "La razón social es obligatoria." };
  if (!esCuitValido(cuitInput)) return { error: "El CUIT no es válido." };

  return {
    data: {
      razonSocial,
      cuit: normalizarCuit(cuitInput),
      domicilio: domicilio || null,
      actividad: actividad || null,
      artCompania: artCompania || null,
      artNumeroContrato: artNumeroContrato || null,
      tipoEmpleador,
    },
  };
}

export async function crearEmpresaAction(
  _prevState: EmpresaFormState,
  formData: FormData
): Promise<EmpresaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseEmpresaForm(formData);
  if (error) return { error };

  const result = await crearEmpresa(data!);
  if ("error" in result) return { error: result.error };

  revalidatePath("/empresas");
  redirect("/empresas");
}

export async function actualizarEmpresaAction(
  id: string,
  _prevState: EmpresaFormState,
  formData: FormData
): Promise<EmpresaFormState> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return { error: SIN_PERMISOS };

  const { data, error } = parseEmpresaForm(formData);
  if (error) return { error };

  const result = await actualizarEmpresa(id, data!);
  if (result.error) return { error: result.error };

  revalidatePath("/empresas");
  redirect("/empresas");
}

export async function cambiarEstadoEmpresaAction(formData: FormData): Promise<void> {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") return;

  const id = String(formData.get("id") ?? "");
  const activa = formData.get("activa") === "true";
  if (!id) return;

  await cambiarEstadoEmpresa(id, !activa);
  revalidatePath("/empresas");
}
