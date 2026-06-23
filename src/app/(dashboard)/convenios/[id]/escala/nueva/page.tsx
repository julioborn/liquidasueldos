import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { listarCategorias } from "@/lib/repos/categorias-convenio";
import { EscalaForm } from "../escala-form";
import { crearVigenciaEscalaAction } from "../actions";

export default async function NuevaEscalaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect(`/convenios/${id}`);

  const [convenio, categorias] = await Promise.all([obtenerConvenio(id), listarCategorias(id)]);
  if (!convenio) notFound();

  if (categorias.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-medium">Nueva escala — {convenio.codigo}</h1>
        <p className="text-sm text-muted-foreground">
          Este convenio todavía no tiene categorías cargadas. Cargá al menos una antes de definir la escala.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nueva escala — {convenio.codigo}</h1>
      <EscalaForm
        action={crearVigenciaEscalaAction.bind(null, id)}
        categorias={categorias}
        submitLabel="Crear vigencia"
      />
    </div>
  );
}
