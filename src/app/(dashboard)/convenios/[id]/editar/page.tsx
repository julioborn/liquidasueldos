import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { ConvenioForm } from "../../convenio-form";
import { actualizarConvenioAction } from "../../actions";

export default async function EditarConvenioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/convenios");

  const convenio = await obtenerConvenio(id);
  if (!convenio) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar convenio</h1>
      <ConvenioForm
        action={actualizarConvenioAction.bind(null, id)}
        convenio={convenio}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
