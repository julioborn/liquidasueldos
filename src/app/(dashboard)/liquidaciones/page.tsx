import Link from "next/link";

export default function LiquidacionesPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-lg font-medium">Liquidaciones</h1>
      <p className="text-sm text-muted-foreground">
        Las liquidaciones se calculan desde el detalle de cada período. Entrá a{" "}
        <Link href="/periodos" className="underline">
          Períodos
        </Link>
        , elegí uno y usá &quot;Calcular liquidaciones&quot; después de cargar las novedades.
      </p>
    </div>
  );
}
