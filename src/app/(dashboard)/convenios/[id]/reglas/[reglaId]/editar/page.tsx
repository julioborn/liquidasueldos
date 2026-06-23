import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { obtenerReglaConvenio } from "@/lib/repos/reglas-convenio";
import { ReglaForm } from "../../regla-form";
import { actualizarReglaAction } from "../../actions";

export default async function EditarReglaPage({
  params,
}: {
  params: Promise<{ id: string; reglaId: string }>;
}) {
  const { id, reglaId } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect(`/convenios/${id}`);

  const [convenio, regla] = await Promise.all([obtenerConvenio(id), obtenerReglaConvenio(reglaId)]);
  if (!convenio || !regla || regla.convenioId !== id) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar vigencia de reglas — {convenio.codigo}</h1>
      <ReglaForm action={actualizarReglaAction.bind(null, id, reglaId)} regla={regla} submitLabel="Guardar cambios" />
    </div>
  );
}
