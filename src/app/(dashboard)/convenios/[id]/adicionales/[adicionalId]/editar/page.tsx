import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { obtenerAdicionalConvenio } from "@/lib/repos/adicionales-convenio";
import { AdicionalForm } from "../../adicional-form";
import { actualizarAdicionalAction } from "../../actions";

export default async function EditarAdicionalPage({
  params,
}: {
  params: Promise<{ id: string; adicionalId: string }>;
}) {
  const { id, adicionalId } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect(`/convenios/${id}`);

  const [convenio, adicional] = await Promise.all([obtenerConvenio(id), obtenerAdicionalConvenio(adicionalId)]);
  if (!convenio || !adicional || adicional.convenioId !== id) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar adicional — {convenio.codigo}</h1>
      <AdicionalForm
        action={actualizarAdicionalAction.bind(null, id, adicionalId)}
        adicional={adicional}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
