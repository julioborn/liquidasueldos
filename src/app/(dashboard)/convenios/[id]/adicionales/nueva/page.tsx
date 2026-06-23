import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { AdicionalForm } from "../adicional-form";
import { crearAdicionalAction } from "../actions";

export default async function NuevoAdicionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect(`/convenios/${id}`);

  const convenio = await obtenerConvenio(id);
  if (!convenio) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nuevo adicional — {convenio.codigo}</h1>
      <AdicionalForm action={crearAdicionalAction.bind(null, id)} submitLabel="Crear adicional" />
    </div>
  );
}
