import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { ContribucionesPatronalesForm } from "../../contribuciones-patronales-form";
import { crearContribucionPatronalAction } from "../../actions";

export default async function NuevaVigenciaContribucionPatronalPage() {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/parametros");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nueva vigencia — Contribuciones patronales</h1>
      <ContribucionesPatronalesForm action={crearContribucionPatronalAction} submitLabel="Crear vigencia" />
    </div>
  );
}
