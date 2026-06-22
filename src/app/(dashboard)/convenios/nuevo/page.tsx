import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { ConvenioForm } from "../convenio-form";
import { crearConvenioAction } from "../actions";

export default async function NuevoConvenioPage() {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/convenios");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nuevo convenio</h1>
      <ConvenioForm action={crearConvenioAction} submitLabel="Crear convenio" />
    </div>
  );
}
