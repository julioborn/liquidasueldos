import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { listarCategorias } from "@/lib/repos/categorias-convenio";
import { obtenerVigenciaEscala } from "@/lib/repos/escalas-convenio";
import { EscalaForm } from "../../escala-form";
import { actualizarVigenciaEscalaAction } from "../../actions";

export default async function EditarEscalaPage({
  params,
}: {
  params: Promise<{ id: string; vigenciaDesde: string }>;
}) {
  const { id, vigenciaDesde } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect(`/convenios/${id}`);

  const [convenio, categorias, filas] = await Promise.all([
    obtenerConvenio(id),
    listarCategorias(id),
    obtenerVigenciaEscala(id, vigenciaDesde),
  ]);
  if (!convenio || filas.length === 0) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">
        Editar escala — {convenio.codigo} (vigente desde {vigenciaDesde})
      </h1>
      <EscalaForm
        action={actualizarVigenciaEscalaAction.bind(null, id, vigenciaDesde)}
        categorias={categorias}
        filasExistentes={filas}
        vigenciaDesdeFija={vigenciaDesde}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
