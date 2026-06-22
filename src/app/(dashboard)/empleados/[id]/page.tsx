import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { listarEmpresas } from "@/lib/repos/empresas";
import { listarConvenios } from "@/lib/repos/convenios";
import { listarTodasLasCategorias } from "@/lib/repos/categorias-convenio";
import { obtenerEmpleado } from "@/lib/repos/empleados";
import { EmpleadoForm } from "../empleado-form";
import { actualizarEmpleadoAction } from "../actions";

export default async function EditarEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/empleados");

  const [empleado, empresas, convenios, categorias] = await Promise.all([
    obtenerEmpleado(id),
    listarEmpresas(),
    listarConvenios(),
    listarTodasLasCategorias(),
  ]);
  if (!empleado) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar empleado</h1>
      <EmpleadoForm
        action={actualizarEmpleadoAction.bind(null, id)}
        empresas={empresas}
        convenios={convenios}
        categorias={categorias}
        empleado={empleado}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
