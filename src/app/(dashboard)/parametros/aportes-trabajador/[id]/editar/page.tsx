import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerAporteTrabajador } from "@/lib/repos/aportes-trabajador";
import { AportesTrabajadorForm } from "../../../aportes-trabajador-form";
import { actualizarAporteTrabajadorAction } from "../../../actions";

export default async function EditarVigenciaAporteTrabajadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/parametros");

  const aporte = await obtenerAporteTrabajador(id);
  if (!aporte) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar vigencia — Aportes del trabajador</h1>
      <AportesTrabajadorForm
        action={actualizarAporteTrabajadorAction.bind(null, id)}
        aporte={aporte}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
