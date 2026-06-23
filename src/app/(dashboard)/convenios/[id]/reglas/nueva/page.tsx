import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { ReglaForm } from "../regla-form";
import { crearReglaAction } from "../actions";

export default async function NuevaReglaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect(`/convenios/${id}`);

  const convenio = await obtenerConvenio(id);
  if (!convenio) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Nueva vigencia de reglas — {convenio.codigo}</h1>
      <ReglaForm action={crearReglaAction.bind(null, id)} submitLabel="Crear vigencia" />
    </div>
  );
}
