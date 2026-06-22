import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { obtenerCategoria } from "@/lib/repos/categorias-convenio";
import { CategoriaForm } from "../../categoria-form";
import { actualizarCategoriaAction } from "../../actions";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string; categoriaId: string }>;
}) {
  const { id, categoriaId } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect(`/convenios/${id}`);

  const [convenio, categoria] = await Promise.all([obtenerConvenio(id), obtenerCategoria(categoriaId)]);
  if (!convenio || !categoria || categoria.convenioId !== id) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar categoría — {convenio.codigo}</h1>
      <CategoriaForm
        action={actualizarCategoriaAction.bind(null, id, categoriaId)}
        categoria={categoria}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
