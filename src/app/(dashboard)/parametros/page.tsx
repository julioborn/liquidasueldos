import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { listarAportesTrabajador } from "@/lib/repos/aportes-trabajador";
import { listarTopesSipa } from "@/lib/repos/topes-sipa";
import { listarContribucionesPatronales } from "@/lib/repos/contribuciones-patronales";
import { fraccionAPorcentaje } from "@/lib/porcentaje";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EliminarConfirmForm } from "@/components/eliminar-confirm-form";
import {
  eliminarAporteTrabajadorAction,
  eliminarContribucionPatronalAction,
  eliminarTopeSipaAction,
} from "./actions";

function formatPct(pct: number): string {
  return `${fraccionAPorcentaje(pct)}%`;
}

function formatMonto(monto: number): string {
  return monto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
}

export default async function ParametrosPage() {
  const [aportes, topes, contribuciones, profile] = await Promise.all([
    listarAportesTrabajador(),
    listarTopesSipa(),
    listarContribucionesPatronales(),
    getCurrentProfile(),
  ]);
  const esAdmin = profile?.rol === "administrador";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-medium">Parámetros normativos nacionales</h1>
        <p className="text-sm text-muted-foreground">
          Tablas con vigencia por fecha. Un cambio de alícuota o tope es un alta de registro, no un cambio de código.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Aportes del trabajador</h2>
          {esAdmin && (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/parametros/aportes-trabajador/nueva">Nueva vigencia</Link>}
            />
          )}
        </div>
        {aportes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay vigencias cargadas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                <TableHead>Jubilación</TableHead>
                <TableHead>PAMI</TableHead>
                <TableHead>Obra social</TableHead>
                {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {aportes.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.vigenciaDesde}</TableCell>
                  <TableCell>{a.vigenciaHasta ?? "—"}</TableCell>
                  <TableCell>{formatPct(a.jubilacionPct)}</TableCell>
                  <TableCell>{formatPct(a.ley19032Pct)}</TableCell>
                  <TableCell>{formatPct(a.obraSocialPct)}</TableCell>
                  {esAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={<Link href={`/parametros/aportes-trabajador/${a.id}/editar`}>Editar</Link>}
                        />
                        <EliminarConfirmForm
                          action={eliminarAporteTrabajadorAction.bind(null, a.id)}
                          confirmMessage="¿Eliminar esta vigencia de aportes del trabajador?"
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Topes base imponible (SIPA)</h2>
          {esAdmin && (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/parametros/topes-sipa/nueva">Nueva vigencia</Link>}
            />
          )}
        </div>
        {topes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay vigencias cargadas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                <TableHead>Base mínima</TableHead>
                <TableHead>Base máxima</TableHead>
                {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {topes.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.vigenciaDesde}</TableCell>
                  <TableCell>{t.vigenciaHasta ?? "—"}</TableCell>
                  <TableCell>{formatMonto(t.baseMin)}</TableCell>
                  <TableCell>{t.baseMax === 0 ? "Sin tope" : formatMonto(t.baseMax)}</TableCell>
                  {esAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={<Link href={`/parametros/topes-sipa/${t.id}/editar`}>Editar</Link>}
                        />
                        <EliminarConfirmForm
                          action={eliminarTopeSipaAction.bind(null, t.id)}
                          confirmMessage="¿Eliminar esta vigencia de topes SIPA?"
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Contribuciones patronales (Dec. 814/01)</h2>
          {esAdmin && (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/parametros/contribuciones-patronales/nueva">Nueva vigencia</Link>}
            />
          )}
        </div>
        {contribuciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay vigencias cargadas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de empleador</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                <TableHead>Alícuota</TableHead>
                <TableHead>Detracción</TableHead>
                {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {contribuciones.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.tipoEmpleador}</TableCell>
                  <TableCell>{c.vigenciaDesde}</TableCell>
                  <TableCell>{c.vigenciaHasta ?? "—"}</TableCell>
                  <TableCell>{formatPct(c.alicuotaPct)}</TableCell>
                  <TableCell>{formatMonto(c.detraccionMinimoNoImponible)}</TableCell>
                  {esAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href={`/parametros/contribuciones-patronales/${c.id}/editar`}>Editar</Link>
                          }
                        />
                        <EliminarConfirmForm
                          action={eliminarContribucionPatronalAction.bind(null, c.id)}
                          confirmMessage="¿Eliminar esta vigencia de contribuciones patronales?"
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
