import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { obtenerConvenio } from "@/lib/repos/convenios";
import { listarCategorias } from "@/lib/repos/categorias-convenio";
import { listarEscalas } from "@/lib/repos/escalas-convenio";
import { listarReglasConvenio } from "@/lib/repos/reglas-convenio";
import { listarAdicionalesConvenio } from "@/lib/repos/adicionales-convenio";
import { fraccionAPorcentaje } from "@/lib/porcentaje";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EliminarConfirmForm } from "@/components/eliminar-confirm-form";
import { eliminarCategoriaAction } from "./categorias/actions";
import { eliminarVigenciaEscalaAction } from "./escala/actions";
import { eliminarReglaAction } from "./reglas/actions";
import { eliminarAdicionalAction } from "./adicionales/actions";

function formatMonto(monto: number): string {
  return monto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
}

export default async function ConvenioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [convenio, categorias, escalas, reglas, adicionales, profile] = await Promise.all([
    obtenerConvenio(id),
    listarCategorias(id),
    listarEscalas(id),
    listarReglasConvenio(id),
    listarAdicionalesConvenio(id),
    getCurrentProfile(),
  ]);
  if (!convenio) notFound();
  const esAdmin = profile?.rol === "administrador";

  const vigenciasEscala = new Map<
    string,
    { vigenciaDesde: string; vigenciaHasta: string | null; porCategoria: Map<string, number> }
  >();
  for (const fila of escalas) {
    if (!vigenciasEscala.has(fila.vigenciaDesde)) {
      vigenciasEscala.set(fila.vigenciaDesde, {
        vigenciaDesde: fila.vigenciaDesde,
        vigenciaHasta: fila.vigenciaHasta,
        porCategoria: new Map(),
      });
    }
    vigenciasEscala.get(fila.vigenciaDesde)!.porCategoria.set(fila.categoriaCodigo, fila.basico);
  }
  const filasEscalaOrdenadas = [...vigenciasEscala.values()].sort((a, b) => (a.vigenciaDesde < b.vigenciaDesde ? 1 : -1));

  return (
    <div className="space-y-10">
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

      <section className="space-y-3">
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
                        <EliminarConfirmForm
                          action={eliminarCategoriaAction.bind(null, categoria.id, convenio.id)}
                          confirmMessage="¿Eliminar esta categoría?"
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
          <h2 className="text-base font-medium">Escala (básico por categoría)</h2>
          {esAdmin && (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={`/convenios/${convenio.id}/escala/nueva`}>Nueva escala</Link>}
            />
          )}
        </div>

        {filasEscalaOrdenadas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay escala cargada para este convenio.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                {categorias.map((categoria) => (
                  <TableHead key={categoria.id}>{categoria.codigo}</TableHead>
                ))}
                {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filasEscalaOrdenadas.map((vigencia) => (
                <TableRow key={vigencia.vigenciaDesde}>
                  <TableCell>{vigencia.vigenciaDesde}</TableCell>
                  <TableCell>{vigencia.vigenciaHasta ?? "—"}</TableCell>
                  {categorias.map((categoria) => (
                    <TableCell key={categoria.id}>
                      {vigencia.porCategoria.has(categoria.codigo)
                        ? formatMonto(vigencia.porCategoria.get(categoria.codigo)!)
                        : "—"}
                    </TableCell>
                  ))}
                  {esAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href={`/convenios/${convenio.id}/escala/${vigencia.vigenciaDesde}/editar`}>
                              Editar
                            </Link>
                          }
                        />
                        <EliminarConfirmForm
                          action={eliminarVigenciaEscalaAction.bind(null, convenio.id, vigencia.vigenciaDesde)}
                          confirmMessage="¿Eliminar esta vigencia completa de la escala (todas las categorías)?"
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
          <h2 className="text-base font-medium">Reglas estructurales</h2>
          {esAdmin && (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={`/convenios/${convenio.id}/reglas/nueva`}>Nueva vigencia</Link>}
            />
          )}
        </div>

        {reglas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay reglas cargadas para este convenio.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                <TableHead>Hs. mensuales</TableHead>
                <TableHead>Antigüedad</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>HE 50%/100%</TableHead>
                <TableHead>Cuota solidaria</TableHead>
                {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reglas.map((regla) => (
                <TableRow key={regla.id}>
                  <TableCell>{regla.vigenciaDesde}</TableCell>
                  <TableCell>{regla.vigenciaHasta ?? "—"}</TableCell>
                  <TableCell>{regla.horasMensuales}</TableCell>
                  <TableCell>{fraccionAPorcentaje(regla.antiguedadPctAnio)}% / año</TableCell>
                  <TableCell>{regla.antiguedadBase}</TableCell>
                  <TableCell>
                    {regla.he50Factor}x / {regla.he100Factor}x
                  </TableCell>
                  <TableCell>{fraccionAPorcentaje(regla.cuotaSolidariaPct)}%</TableCell>
                  {esAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={<Link href={`/convenios/${convenio.id}/reglas/${regla.id}/editar`}>Editar</Link>}
                        />
                        <EliminarConfirmForm
                          action={eliminarReglaAction.bind(null, regla.id, convenio.id)}
                          confirmMessage="¿Eliminar esta vigencia de reglas?"
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
          <h2 className="text-base font-medium">Adicionales</h2>
          {esAdmin && (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={`/convenios/${convenio.id}/adicionales/nueva`}>Nuevo adicional</Link>}
            />
          )}
        </div>

        {adicionales.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay adicionales cargados para este convenio.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                <TableHead>Importe</TableHead>
                {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {adicionales.map((adicional) => (
                <TableRow key={adicional.id}>
                  <TableCell>{adicional.codigo}</TableCell>
                  <TableCell>{adicional.descripcion}</TableCell>
                  <TableCell>{adicional.vigenciaDesde}</TableCell>
                  <TableCell>{adicional.vigenciaHasta ?? "—"}</TableCell>
                  <TableCell>{formatMonto(adicional.importe)}</TableCell>
                  {esAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href={`/convenios/${convenio.id}/adicionales/${adicional.id}/editar`}>
                              Editar
                            </Link>
                          }
                        />
                        <EliminarConfirmForm
                          action={eliminarAdicionalAction.bind(null, adicional.id, convenio.id)}
                          confirmMessage="¿Eliminar este adicional?"
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
