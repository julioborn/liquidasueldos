import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerTopeSipa } from "@/lib/repos/topes-sipa";
import { TopesSipaForm } from "../../../topes-sipa-form";
import { actualizarTopeSipaAction } from "../../../actions";

export default async function EditarVigenciaTopeSipaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/parametros");

  const tope = await obtenerTopeSipa(id);
  if (!tope) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar vigencia — Topes SIPA</h1>
      <TopesSipaForm action={actualizarTopeSipaAction.bind(null, id)} tope={tope} submitLabel="Guardar cambios" />
    </div>
  );
}
