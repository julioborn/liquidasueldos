import { notFound } from "next/navigation";
import { obtenerLiquidacionDetalle } from "@/lib/repos/liquidaciones";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TIPO_LABEL: Record<string, string> = {
  REMUNERATIVO: "Remunerativo",
  NO_REMUNERATIVO: "No remunerativo",
  DEDUCCION: "Deducción",
  INFORMATIVO: "Informativo",
};

function formatMonto(monto: number): string {
  return monto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
}

export default async function LiquidacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const liquidacion = await obtenerLiquidacionDetalle(id);
  if (!liquidacion) notFound();

  const haberes = liquidacion.lineas.filter((l) => l.tipo !== "DEDUCCION");
  const deducciones = liquidacion.lineas.filter((l) => l.tipo === "DEDUCCION");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-medium">{liquidacion.empleadoNombre}</h1>
          <p className="text-sm text-muted-foreground">
            Legajo {liquidacion.empleadoLegajo} — {liquidacion.empresaNombre}
          </p>
          <p className="text-sm text-muted-foreground">
            Período {String(liquidacion.periodoMes).padStart(2, "0")}/{liquidacion.periodoAnio}
          </p>
        </div>
        <Badge variant={liquidacion.estado === "CONFIRMADA" ? "default" : "secondary"}>{liquidacion.estado}</Badge>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Haberes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Valor unit.</TableHead>
              <TableHead className="text-right">Importe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {haberes.map((linea) => (
              <TableRow key={linea.id}>
                <TableCell>{linea.conceptoCodigo}</TableCell>
                <TableCell>{linea.descripcion}</TableCell>
                <TableCell>{TIPO_LABEL[linea.tipo] ?? linea.tipo}</TableCell>
                <TableCell>{linea.cantidad}</TableCell>
                <TableCell>{formatMonto(linea.valorUnitario)}</TableCell>
                <TableCell className="text-right">{formatMonto(linea.importe)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {deducciones.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Deducciones</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Base</TableHead>
                <TableHead className="text-right">Importe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deducciones.map((linea) => (
                <TableRow key={linea.id}>
                  <TableCell>{linea.conceptoCodigo}</TableCell>
                  <TableCell>{linea.descripcion}</TableCell>
                  <TableCell>{linea.cantidad}%</TableCell>
                  <TableCell>{formatMonto(linea.valorUnitario)}</TableCell>
                  <TableCell className="text-right">{formatMonto(linea.importe)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      <section className="space-y-1 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total remunerativo</span>
          <span>{formatMonto(liquidacion.totalRemunerativo)}</span>
        </div>
        {liquidacion.totalNoRemunerativo !== 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total no remunerativo</span>
            <span>{formatMonto(liquidacion.totalNoRemunerativo)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total descuentos</span>
          <span>{formatMonto(liquidacion.totalDescuentos)}</span>
        </div>
        <div className="flex justify-between text-base font-medium">
          <span>Neto a cobrar</span>
          <span>{formatMonto(liquidacion.neto)}</span>
        </div>
      </section>
    </div>
  );
}
