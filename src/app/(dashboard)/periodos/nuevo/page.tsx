import { redirect } from "next/navigation";
import { esAdminOLiquidador, getCurrentProfile } from "@/lib/auth/current-profile";
import { listarEmpresas } from "@/lib/repos/empresas";
import { PeriodoForm } from "../periodo-form";
import { crearPeriodoAction } from "../actions";

export default async function NuevoPeriodoPage() {
  const profile = await getCurrentProfile();
  if (!esAdminOLiquidador(profile?.rol)) redirect("/periodos");

  const empresas = await listarEmpresas();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nuevo período</h1>
      <PeriodoForm action={crearPeriodoAction} empresas={empresas} submitLabel="Crear período" />
    </div>
  );
}
