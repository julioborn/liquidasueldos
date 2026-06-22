import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { TopesSipaForm } from "../../topes-sipa-form";
import { crearTopeSipaAction } from "../../actions";

export default async function NuevaVigenciaTopeSipaPage() {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/parametros");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nueva vigencia — Topes SIPA</h1>
      <TopesSipaForm action={crearTopeSipaAction} submitLabel="Crear vigencia" />
    </div>
  );
}
