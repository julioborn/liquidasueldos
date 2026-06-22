import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerEmpresa } from "@/lib/repos/empresas";
import { EmpresaForm } from "../empresa-form";
import { actualizarEmpresaAction } from "../actions";

export default async function EditarEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (profile?.rol !== "administrador") redirect("/empresas");

  const empresa = await obtenerEmpresa(id);
  if (!empresa) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Editar empresa</h1>
      <EmpresaForm action={actualizarEmpresaAction.bind(null, id)} empresa={empresa} submitLabel="Guardar cambios" />
    </div>
  );
}
