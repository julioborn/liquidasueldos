import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { listarConvenios } from "@/lib/repos/convenios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cambiarEstadoConvenioAction } from "./actions";

export default async function ConveniosPage() {
  const [convenios, profile] = await Promise.all([listarConvenios(), getCurrentProfile()]);
  const esAdmin = profile?.rol === "administrador";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Convenios colectivos (CCT)</h1>
          <p className="text-sm text-muted-foreground">
            Escalas de básicos por categoría, adicionales y cuotas sindicales, con vigencias.
          </p>
        </div>
        {esAdmin && (
          <Button nativeButton={false} render={<Link href="/convenios/nuevo">Nuevo convenio</Link>} />
        )}
      </div>

      {convenios.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay convenios cargados.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Jurisdicción</TableHead>
              <TableHead>Estado</TableHead>
              {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {convenios.map((convenio) => (
              <TableRow key={convenio.id}>
                <TableCell>
                  <Link href={`/convenios/${convenio.id}`} className="hover:underline">
                    {convenio.codigo}
                  </Link>
                </TableCell>
                <TableCell>{convenio.nombre}</TableCell>
                <TableCell>{convenio.jurisdiccion ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={convenio.activo ? "default" : "secondary"}>
                    {convenio.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                {esAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/convenios/${convenio.id}/editar`}>Editar</Link>}
                      />
                      <form action={cambiarEstadoConvenioAction}>
                        <input type="hidden" name="id" value={convenio.id} />
                        <input type="hidden" name="activo" value={String(convenio.activo)} />
                        <Button type="submit" variant="outline" size="sm">
                          {convenio.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
