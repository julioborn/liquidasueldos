import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { listarEmpresas } from "@/lib/repos/empresas";
import { formatearCuit } from "@/lib/cuit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cambiarEstadoEmpresaAction } from "./actions";

export default async function EmpresasPage() {
  const [empresas, profile] = await Promise.all([listarEmpresas(), getCurrentProfile()]);
  const esAdmin = profile?.rol === "administrador";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Empresas clientes</h1>
          <p className="text-sm text-muted-foreground">
            Razón social, CUIT, domicilio, actividad, ART y parámetros de Dec. 814/01.
          </p>
        </div>
        {esAdmin && (
          <Button nativeButton={false} render={<Link href="/empresas/nueva">Nueva empresa</Link>} />
        )}
      </div>

      {empresas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay empresas cargadas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razón social</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead>Actividad</TableHead>
              <TableHead>Estado</TableHead>
              {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell>{empresa.razonSocial}</TableCell>
                <TableCell>{formatearCuit(empresa.cuit)}</TableCell>
                <TableCell>{empresa.actividad ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={empresa.activa ? "default" : "secondary"}>
                    {empresa.activa ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                {esAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/empresas/${empresa.id}`}>Editar</Link>}
                      />
                      <form action={cambiarEstadoEmpresaAction}>
                        <input type="hidden" name="id" value={empresa.id} />
                        <input type="hidden" name="activa" value={String(empresa.activa)} />
                        <Button type="submit" variant="outline" size="sm">
                          {empresa.activa ? "Desactivar" : "Activar"}
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
