import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { AportesTrabajadorForm } from "../../aportes-trabajador-form";
import { crearAporteTrabajadorAction } from "../../actions";

export default async function NuevaVigenciaAporteTrabajadorPage() {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/parametros");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nueva vigencia — Aportes del trabajador</h1>
      <AportesTrabajadorForm action={crearAporteTrabajadorAction} submitLabel="Crear vigencia" />
    </div>
  );
}
