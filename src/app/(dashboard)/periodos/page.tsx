import Link from "next/link";
import { esAdminOLiquidador, getCurrentProfile } from "@/lib/auth/current-profile";
import { listarPeriodos } from "@/lib/repos/periodos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TIPO_LABEL: Record<string, string> = {
  MENSUAL: "Mensual",
  SAC_1: "SAC 1er semestre",
  SAC_2: "SAC 2do semestre",
  VACACIONES: "Vacaciones",
  FINAL: "Liquidación final",
  RETROACTIVO: "Ajuste retroactivo",
};

const ESTADO_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ABIERTO: "outline",
  CALCULADO: "secondary",
  CONFIRMADO: "secondary",
  CERRADO: "default",
};

export default async function PeriodosPage() {
  const [periodos, profile] = await Promise.all([listarPeriodos(), getCurrentProfile()]);
  const puedeEscribir = esAdminOLiquidador(profile?.rol);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Períodos</h1>
          <p className="text-sm text-muted-foreground">
            Selección de empresa y período a liquidar. Carga de novedades y ejecución del motor de cálculo.
          </p>
        </div>
        {puedeEscribir && (
          <Button nativeButton={false} render={<Link href="/periodos/nuevo">Nuevo período</Link>} />
        )}
      </div>

      {periodos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay períodos cargados.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periodos.map((periodo) => (
              <TableRow key={periodo.id}>
                <TableCell>{periodo.empresaNombre}</TableCell>
                <TableCell>
                  <Link href={`/periodos/${periodo.id}`} className="hover:underline">
                    {String(periodo.mes).padStart(2, "0")}/{periodo.anio}
                  </Link>
                </TableCell>
                <TableCell>{TIPO_LABEL[periodo.tipo] ?? periodo.tipo}</TableCell>
                <TableCell>
                  <Badge variant={ESTADO_VARIANT[periodo.estado] ?? "outline"}>{periodo.estado}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
