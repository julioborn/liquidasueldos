import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { listarEmpresas } from "@/lib/repos/empresas";
import { listarConvenios } from "@/lib/repos/convenios";
import { listarTodasLasCategorias } from "@/lib/repos/categorias-convenio";
import { EmpleadoForm } from "../empleado-form";
import { crearEmpleadoAction } from "../actions";

export default async function NuevoEmpleadoPage() {
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/empleados");

  const [empresas, convenios, categorias] = await Promise.all([
    listarEmpresas(),
    listarConvenios(),
    listarTodasLasCategorias(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nuevo empleado</h1>
      <EmpleadoForm
        action={crearEmpleadoAction}
        empresas={empresas}
        convenios={convenios}
        categorias={categorias}
        submitLabel="Crear empleado"
      />
    </div>
  );
}
