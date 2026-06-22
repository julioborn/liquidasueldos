import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { listarEmpleados } from "@/lib/repos/empleados";
import { formatearCuil } from "@/lib/cuit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cambiarEstadoEmpleadoAction } from "./actions";

export default async function EmpleadosPage() {
  const [empleados, profile] = await Promise.all([listarEmpleados(), getCurrentProfile()]);
  const esAdmin = profile?.rol === "administrador";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Empleados</h1>
          <p className="text-sm text-muted-foreground">
            Legajo, datos personales, CUIL, fecha de ingreso, categoría, convenio, datos bancarios.
          </p>
        </div>
        {esAdmin && (
          <Button nativeButton={false} render={<Link href="/empleados/nuevo">Nuevo empleado</Link>} />
        )}
      </div>

      {empleados.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay empleados cargados.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Legajo</TableHead>
              <TableHead>Apellido y nombre</TableHead>
              <TableHead>CUIL</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Convenio / Categoría</TableHead>
              <TableHead>Estado</TableHead>
              {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.map((empleado) => (
              <TableRow key={empleado.id}>
                <TableCell>{empleado.legajo}</TableCell>
                <TableCell>
                  {empleado.apellido}, {empleado.nombre}
                </TableCell>
                <TableCell>{formatearCuil(empleado.cuil)}</TableCell>
                <TableCell>{empleado.empresaNombre}</TableCell>
                <TableCell>
                  {empleado.convenioCodigo
                    ? `${empleado.convenioCodigo} — ${empleado.categoriaNombre ?? "sin categoría"}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={empleado.estado === "ACTIVO" ? "default" : "secondary"}>
                    {empleado.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                {esAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/empleados/${empleado.id}`}>Editar</Link>}
                      />
                      <form action={cambiarEstadoEmpleadoAction}>
                        <input type="hidden" name="id" value={empleado.id} />
                        <input type="hidden" name="estado" value={empleado.estado} />
                        <Button type="submit" variant="outline" size="sm">
                          {empleado.estado === "ACTIVO" ? "Desactivar" : "Activar"}
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
