import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { listarCategorias } from "@/lib/repos/categorias-convenio";
import { CategoriaForm } from "../categoria-form";
import { crearCategoriaAction } from "../actions";

export default async function NuevaCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect(`/convenios/${id}`);

  const convenio = await obtenerConvenio(id);
  if (!convenio) notFound();
  const categorias = await listarCategorias(id);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nueva categoría — {convenio.codigo}</h1>
      <CategoriaForm
        action={crearCategoriaAction.bind(null, id)}
        ordenSugerido={categorias.length}
        submitLabel="Crear categoría"
      />
    </div>
  );
}
