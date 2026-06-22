import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { listarCategorias } from "@/lib/repos/categorias-convenio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { eliminarCategoriaAction } from "./categorias/actions";
import { EliminarCategoriaForm } from "./categorias/eliminar-categoria-form";

export default async function ConvenioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [convenio, categorias, profile] = await Promise.all([
    obtenerConvenio(id),
    listarCategorias(id),
    getCurrentProfile(),
  ]);
  if (!convenio) notFound();
  const esAdmin = profile?.rol === "administrador";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium">
              {convenio.codigo} — {convenio.nombre}
            </h1>
            <Badge variant={convenio.activo ? "default" : "secondary"}>
              {convenio.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          {convenio.jurisdiccion && <p className="text-sm text-muted-foreground">{convenio.jurisdiccion}</p>}
        </div>
        {esAdmin && (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/convenios/${convenio.id}/editar`}>Editar convenio</Link>}
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Categorías</h2>
          {esAdmin && (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={`/convenios/${convenio.id}/categorias/nueva`}>Nueva categoría</Link>}
            />
          )}
        </div>

        {categorias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay categorías cargadas para este convenio.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>{categoria.orden}</TableCell>
                  <TableCell>{categoria.codigo}</TableCell>
                  <TableCell>{categoria.nombre}</TableCell>
                  {esAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href={`/convenios/${convenio.id}/categorias/${categoria.id}/editar`}>
                              Editar
                            </Link>
                          }
                        />
                        <EliminarCategoriaForm
                          action={eliminarCategoriaAction.bind(null, categoria.id, convenio.id)}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
