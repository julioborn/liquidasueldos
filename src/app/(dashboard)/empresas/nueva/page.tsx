import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { EmpresaForm } from "../empresa-form";
import { crearEmpresaAction } from "../actions";

export default async function NuevaEmpresaPage() {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/empresas");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nueva empresa</h1>
      <EmpresaForm action={crearEmpresaAction} submitLabel="Crear empresa" />
    </div>
  );
}
