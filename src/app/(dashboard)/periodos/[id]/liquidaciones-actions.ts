"use server";

import { revalidatePath } from "next/cache";
import { esAdminOLiquidador, getCurrentProfile } from "@/lib/auth/current-profile";
import { ejecutarLiquidacionPeriodo } from "@/lib/repos/liquidaciones";

export interface ResumenFormState {
  mensaje?: string;
  errores?: Array<{ empleadoId: string; nombre: string; error: string }>;
}

export async function calcularLiquidacionesAction(
  periodoId: string,
  _prevState: ResumenFormState,
  _formData: FormData
): Promise<ResumenFormState> {
  const profile = await getCurrentProfile();
  if (!esAdminOLiquidador(profile?.rol)) return { mensaje: "No tenés permisos para hacer esto." };

  const resultado = await ejecutarLiquidacionPeriodo(periodoId, profile?.id ?? null);
  if ("error" in resultado) return { mensaje: resultado.error };

  revalidatePath(`/periodos/${periodoId}`);
  return {
    mensaje: `Se calcularon ${resultado.calculados} liquidaciones.`,
    errores: resultado.errores.length > 0 ? resultado.errores : undefined,
  };
}
