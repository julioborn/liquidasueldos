import Link from "next/link";
import { notFound } from "next/navigation";
import { esAdminOLiquidador, getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerPeriodo } from "@/lib/repos/periodos";
import { listarEmpleadosActivosPorEmpresa } from "@/lib/repos/empleados";
import { listarNovedadesPorPeriodo } from "@/lib/repos/novedades";
import { listarLiquidacionesPorPeriodo } from "@/lib/repos/liquidaciones";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cambiarEstadoPeriodoAction } from "../actions";
import { guardarNovedadAction } from "./novedades-actions";
import { calcularLiquidacionesAction } from "./liquidaciones-actions";
import { CalcularLiquidacionesButton } from "./calcular-liquidaciones-button";

function formatMonto(monto: number): string {
  return monto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
}

const TIPO_LABEL: Record<string, string> = {
  MENSUAL: "Mensual",
  SAC_1: "SAC 1er semestre",
  SAC_2: "SAC 2do semestre",
  VACACIONES: "Vacaciones",
  FINAL: "Liquidación final",
  RETROACTIVO: "Ajuste retroactivo",
};

export default async function PeriodoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [periodo, profile] = await Promise.all([obtenerPeriodo(id), getCurrentProfile()]);
  if (!periodo) notFound();

  const [empleados, novedades, liquidaciones] = await Promise.all([
    listarEmpleadosActivosPorEmpresa(periodo.empresaId),
    listarNovedadesPorPeriodo(periodo.id),
    listarLiquidacionesPorPeriodo(periodo.id),
  ]);
  const novedadPorEmpleado = new Map(novedades.map((n) => [n.empleadoId, n]));

  const puedeEscribir = esAdminOLiquidador(profile?.rol);
  const esAdmin = profile?.rol === "administrador";
  const periodoEditable = puedeEscribir && periodo.estado === "ABIERTO";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium">
              {periodo.empresaNombre} — {String(periodo.mes).padStart(2, "0")}/{periodo.anio}
            </h1>
            <Badge>{periodo.estado}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{TIPO_LABEL[periodo.tipo] ?? periodo.tipo}</p>
        </div>
        <div className="flex gap-2">
          {puedeEscribir && periodo.estado === "CALCULADO" && (
            <form action={cambiarEstadoPeriodoAction}>
              <input type="hidden" name="id" value={periodo.id} />
              <input type="hidden" name="estado" value="CONFIRMADO" />
              <Button type="submit" variant="outline">
                Confirmar período
              </Button>
            </form>
          )}
          {esAdmin && (periodo.estado === "CALCULADO" || periodo.estado === "CONFIRMADO") && (
            <form action={cambiarEstadoPeriodoAction}>
              <input type="hidden" name="id" value={periodo.id} />
              <input type="hidden" name="estado" value="CERRADO" />
              <Button type="submit" variant="outline">
                Cerrar período
              </Button>
            </form>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-medium">Novedades</h2>
        {empleados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta empresa no tiene empleados activos.</p>
        ) : (
          <div className="flex flex-col divide-y rounded-lg border">
            {empleados.map((empleado) => {
              const novedad = novedadPorEmpleado.get(empleado.id);
              return (
                <form
                  key={empleado.id}
                  action={guardarNovedadAction.bind(null, periodo.id, empleado.id)}
                  className="flex flex-wrap items-end gap-3 p-3"
                >
                  <div className="min-w-[12rem]">
                    <p className="text-sm font-medium">
                      {empleado.apellido}, {empleado.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">Legajo {empleado.legajo}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`dias-${empleado.id}`} className="text-xs text-muted-foreground">
                      Días trab.
                    </label>
                    <Input
                      id={`dias-${empleado.id}`}
                      name="diasTrabajados"
                      type="number"
                      min={0}
                      max={31}
                      defaultValue={novedad?.diasTrabajados ?? 30}
                      disabled={!periodoEditable}
                      className="w-20"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`he50-${empleado.id}`} className="text-xs text-muted-foreground">
                      HE 50%
                    </label>
                    <Input
                      id={`he50-${empleado.id}`}
                      name="horasExtra50"
                      type="number"
                      min={0}
                      defaultValue={novedad?.horasExtra50 ?? 0}
                      disabled={!periodoEditable}
                      className="w-20"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`he100-${empleado.id}`} className="text-xs text-muted-foreground">
                      HE 100%
                    </label>
                    <Input
                      id={`he100-${empleado.id}`}
                      name="horasExtra100"
                      type="number"
                      min={0}
                      defaultValue={novedad?.horasExtra100 ?? 0}
                      disabled={!periodoEditable}
                      className="w-20"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      name="asistenciaPerfecta"
                      defaultChecked={novedad?.asistenciaPerfecta ?? false}
                      disabled={!periodoEditable}
                    />
                    Asist. perfecta
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      name="manejoFondos"
                      defaultChecked={novedad?.manejoFondos ?? false}
                      disabled={!periodoEditable}
                    />
                    Manejo fondos
                  </label>
                  {periodoEditable && (
                    <Button type="submit" variant="outline" size="sm">
                      Guardar
                    </Button>
                  )}
                </form>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Liquidaciones</h2>
          {puedeEscribir && periodo.estado !== "CERRADO" && (
            <CalcularLiquidacionesButton action={calcularLiquidacionesAction.bind(null, periodo.id)} />
          )}
        </div>

        {liquidaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no se calcularon liquidaciones para este período.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Legajo</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Remunerativo</TableHead>
                <TableHead>Descuentos</TableHead>
                <TableHead className="text-right">Neto</TableHead>
                <TableHead className="text-right">Recibo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liquidaciones.map((liq) => (
                <TableRow key={liq.id}>
                  <TableCell>{liq.empleadoLegajo}</TableCell>
                  <TableCell>{liq.empleadoNombre}</TableCell>
                  <TableCell>{formatMonto(liq.totalRemunerativo)}</TableCell>
                  <TableCell>{formatMonto(liq.totalDescuentos)}</TableCell>
                  <TableCell className="text-right">{formatMonto(liq.neto)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/liquidaciones/${liq.id}`} className="text-sm underline">
                      Ver recibo
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
