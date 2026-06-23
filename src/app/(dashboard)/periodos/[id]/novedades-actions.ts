"use server";

import { revalidatePath } from "next/cache";
import { esAdminOLiquidador, getCurrentProfile } from "@/lib/auth/current-profile";
import { guardarNovedad } from "@/lib/repos/novedades";

function numeroEnRango(valor: FormDataEntryValue | null, min: number, max: number, porDefecto: number): number {
  const n = Number(valor);
  if (!Number.isFinite(n)) return porDefecto;
  return Math.min(max, Math.max(min, n));
}

export async function guardarNovedadAction(periodoId: string, empleadoId: string, formData: FormData): Promise<void> {
  const profile = await getCurrentProfile();
  if (!esAdminOLiquidador(profile?.rol)) return;

  await guardarNovedad(periodoId, empleadoId, {
    diasTrabajados: numeroEnRango(formData.get("diasTrabajados"), 0, 31, 30),
    horasExtra50: numeroEnRango(formData.get("horasExtra50"), 0, 999, 0),
    horasExtra100: numeroEnRango(formData.get("horasExtra100"), 0, 999, 0),
    asistenciaPerfecta: formData.get("asistenciaPerfecta") === "on",
    manejoFondos: formData.get("manejoFondos") === "on",
    observaciones: null,
  });

  revalidatePath(`/periodos/${periodoId}`);
}
