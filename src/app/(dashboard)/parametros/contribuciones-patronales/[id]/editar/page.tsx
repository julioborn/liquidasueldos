import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerContribucionPatronal } from "@/lib/repos/contribuciones-patronales";
import { ContribucionesPatronalesForm } from "../../../contribuciones-patronales-form";
import { actualizarContribucionPatronalAction } from "../../../actions";

export default async function EditarVigenciaContribucionPatronalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/parametros");

  const contribucion = await obtenerContribucionPatronal(id);
  if (!contribucion) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar vigencia — Contribuciones patronales</h1>
      <ContribucionesPatronalesForm
        action={actualizarContribucionPatronalAction.bind(null, id)}
        contribucion={contribucion}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
